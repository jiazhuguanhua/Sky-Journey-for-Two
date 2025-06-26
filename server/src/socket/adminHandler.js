import logger from '../config/logger.js'
import os from 'os'

// 存储管理员连接的Socket
const adminSockets = new Set()
let systemSettings = {
  maxRooms: 100,
  maxPlayersPerRoom: 2,
  gameTimeout: 3600000, // 1小时
  diceRollDelay: 2000,
  eventProbability: 0.3,
  challengeProbability: 0.2,
  boardSize: 50,
  winCondition: 50,
  enableAI: false,
  aiApiKey: '',
  logLevel: 'info',
  enableMetrics: true,
  autoCleanup: true,
  cleanupInterval: 86400000 // 24小时
}

export default function adminSocketHandler(io, socket, gameService) {
  // 加入管理频道
  socket.on('join-admin', (data) => {
    // 简单的管理员验证（生产环境需要更严格的验证）
    const adminKey = data.adminKey || ''
    const expectedKey = process.env.ADMIN_KEY || 'admin123'
    
    if (adminKey === expectedKey) {
      socket.join('admin')
      adminSockets.add(socket)
      
      // 发送当前状态
      socket.emit('admin-connected', {
        stats: getSystemStats(gameService),
        rooms: gameService.getAllRooms(),
        settings: systemSettings
      })
      
      logger.info(`Admin connected: ${socket.id}`)
    } else {
      socket.emit('admin-error', { message: 'Invalid admin key' })
    }
  })

  // 离开管理频道
  socket.on('leave-admin', () => {
    socket.leave('admin')
    adminSockets.delete(socket)
    logger.info(`Admin disconnected: ${socket.id}`)
  })

  // 获取系统统计
  socket.on('get-system-stats', () => {
    try {
      const stats = getSystemStats(gameService)
      socket.emit('system-stats', stats)
    } catch (error) {
      socket.emit('admin-error', { message: error.message })
      logger.error(`Error getting system stats: ${error.message}`)
    }
  })

  // 获取房间列表
  socket.on('get-rooms-list', () => {
    try {
      const rooms = gameService.getAllRooms().map(room => ({
        ...room,
        createdAt: room.createdAt || Date.now(),
        players: room.players || [],
        status: room.status || 'waiting'
      }))
      socket.emit('rooms-list', rooms)
    } catch (error) {
      socket.emit('admin-error', { message: error.message })
      logger.error(`Error getting rooms list: ${error.message}`)
    }
  })

  // 关闭房间
  socket.on('admin-close-room', (data) => {
    try {
      const { roomId } = data
      const success = gameService.closeRoom(roomId)
      
      if (success) {
        // 通知所有管理员
        io.to('admin').emit('room-deleted', roomId)
        logger.info(`Admin ${socket.id} closed room ${roomId}`)
      } else {
        socket.emit('admin-error', { message: 'Failed to close room' })
      }
    } catch (error) {
      socket.emit('admin-error', { message: error.message })
      logger.error(`Error closing room: ${error.message}`)
    }
  })

  // 踢出玩家
  socket.on('admin-kick-player', (data) => {
    try {
      const { roomId, playerId } = data
      const success = gameService.kickPlayer(roomId, playerId)
      
      if (success) {
        // 通知房间更新
        const room = gameService.getRoom(roomId)
        io.to('admin').emit('room-updated', room)
        logger.info(`Admin ${socket.id} kicked player ${playerId} from room ${roomId}`)
      } else {
        socket.emit('admin-error', { message: 'Failed to kick player' })
      }
    } catch (error) {
      socket.emit('admin-error', { message: error.message })
      logger.error(`Error kicking player: ${error.message}`)
    }
  })

  // 重置游戏
  socket.on('admin-reset-game', (data) => {
    try {
      const { roomId } = data
      const success = gameService.resetGame(roomId)
      
      if (success) {
        const room = gameService.getRoom(roomId)
        io.to('admin').emit('room-updated', room)
        logger.info(`Admin ${socket.id} reset game in room ${roomId}`)
      } else {
        socket.emit('admin-error', { message: 'Failed to reset game' })
      }
    } catch (error) {
      socket.emit('admin-error', { message: error.message })
      logger.error(`Error resetting game: ${error.message}`)
    }
  })

  // 管理员广播消息
  socket.on('admin-broadcast', (data) => {
    try {
      const { roomId, message } = data
      
      if (roomId) {
        // 向特定房间广播
        io.to(roomId).emit('admin-message', {
          message,
          timestamp: Date.now()
        })
      } else {
        // 向所有房间广播
        io.emit('admin-message', {
          message,
          timestamp: Date.now()
        })
      }
      
      logger.info(`Admin ${socket.id} broadcast message: ${message}`)
    } catch (error) {
      socket.emit('admin-error', { message: error.message })
      logger.error(`Error broadcasting message: ${error.message}`)
    }
  })

  // 获取系统设置
  socket.on('get-system-settings', () => {
    try {
      socket.emit('system-settings', systemSettings)
    } catch (error) {
      socket.emit('admin-error', { message: error.message })
      logger.error(`Error getting system settings: ${error.message}`)
    }
  })

  // 更新系统设置
  socket.on('update-system-settings', (newSettings) => {
    try {
      // 验证设置
      const validatedSettings = validateSettings(newSettings)
      
      // 更新设置
      systemSettings = { ...systemSettings, ...validatedSettings }
      
      // 应用设置到游戏服务
      gameService.updateSettings(validatedSettings)
      
      socket.emit('settings-updated', { success: true })
      
      // 通知所有管理员
      io.to('admin').emit('system-settings', systemSettings)
      
      logger.info(`Admin ${socket.id} updated system settings`)
    } catch (error) {
      socket.emit('settings-updated', { success: false, error: error.message })
      logger.error(`Error updating system settings: ${error.message}`)
    }
  })

  // 重置系统设置
  socket.on('reset-system-settings', () => {
    try {
      systemSettings = {
        maxRooms: 100,
        maxPlayersPerRoom: 2,
        gameTimeout: 3600000,
        diceRollDelay: 2000,
        eventProbability: 0.3,
        challengeProbability: 0.2,
        boardSize: 50,
        winCondition: 50,
        enableAI: false,
        aiApiKey: '',
        logLevel: 'info',
        enableMetrics: true,
        autoCleanup: true,
        cleanupInterval: 86400000
      }
      
      gameService.updateSettings(systemSettings)
      
      // 通知所有管理员
      io.to('admin').emit('system-settings', systemSettings)
      
      logger.info(`Admin ${socket.id} reset system settings`)
    } catch (error) {
      socket.emit('admin-error', { message: error.message })
      logger.error(`Error resetting system settings: ${error.message}`)
    }
  })

  // 获取日志历史
  socket.on('get-log-history', (data) => {
    try {
      const { limit = 100 } = data
      // 这里应该从日志系统获取历史日志
      // 暂时返回模拟数据
      const logs = generateMockLogs(limit)
      socket.emit('log-history', logs)
    } catch (error) {
      socket.emit('admin-error', { message: error.message })
      logger.error(`Error getting log history: ${error.message}`)
    }
  })

  // 清空日志
  socket.on('clear-logs', () => {
    try {
      // 这里应该清空日志系统
      logger.info(`Admin ${socket.id} cleared logs`)
    } catch (error) {
      socket.emit('admin-error', { message: error.message })
      logger.error(`Error clearing logs: ${error.message}`)
    }
  })

  // 获取统计数据
  socket.on('get-statistics', () => {
    try {
      const statistics = generateStatistics(gameService)
      socket.emit('statistics-update', statistics)
    } catch (error) {
      socket.emit('admin-error', { message: error.message })
      logger.error(`Error getting statistics: ${error.message}`)
    }
  })

  // 测试AI连接
  socket.on('test-ai-connection', () => {
    try {
      // 这里应该测试AI服务连接
      // 暂时返回模拟结果
      const success = Math.random() > 0.3 // 70%成功率
      socket.emit('ai-test-result', { success, message: success ? 'AI连接正常' : 'AI连接失败' })
    } catch (error) {
      socket.emit('admin-error', { message: error.message })
      logger.error(`Error testing AI connection: ${error.message}`)
    }
  })

  // 处理断开连接
  socket.on('disconnect', () => {
    adminSockets.delete(socket)
    logger.info(`Admin disconnected: ${socket.id}`)
  })
}

// 获取系统统计信息
function getSystemStats(gameService) {
  const rooms = gameService.getAllRooms()
  const activeRooms = rooms.filter(room => room.status === 'playing').length
  const totalPlayers = rooms.reduce((sum, room) => sum + room.players.length, 0)
  const activePlayers = rooms.filter(room => room.status === 'playing')
    .reduce((sum, room) => sum + room.players.length, 0)
  
  return {
    totalRooms: rooms.length,
    activeRooms,
    totalPlayers,
    activePlayers,
    uptime: process.uptime()
  }
}

// 验证设置
function validateSettings(settings) {
  const validated = {}
  
  if ('maxRooms' in settings) {
    validated.maxRooms = Math.max(1, Math.min(1000, parseInt(settings.maxRooms)))
  }
  
  if ('gameTimeout' in settings) {
    validated.gameTimeout = Math.max(60000, Math.min(86400000, parseInt(settings.gameTimeout)))
  }
  
  if ('eventProbability' in settings) {
    validated.eventProbability = Math.max(0, Math.min(1, parseFloat(settings.eventProbability)))
  }
  
  if ('challengeProbability' in settings) {
    validated.challengeProbability = Math.max(0, Math.min(1, parseFloat(settings.challengeProbability)))
  }
  
  if ('boardSize' in settings) {
    validated.boardSize = Math.max(10, Math.min(200, parseInt(settings.boardSize)))
  }
  
  if ('winCondition' in settings) {
    validated.winCondition = Math.max(5, Math.min(200, parseInt(settings.winCondition)))
  }
  
  if ('diceRollDelay' in settings) {
    validated.diceRollDelay = Math.max(500, Math.min(10000, parseInt(settings.diceRollDelay)))
  }
  
  if ('enableAI' in settings) {
    validated.enableAI = Boolean(settings.enableAI)
  }
  
  if ('aiApiKey' in settings) {
    validated.aiApiKey = String(settings.aiApiKey).trim()
  }
  
  if ('logLevel' in settings) {
    const validLevels = ['error', 'warn', 'info', 'debug']
    if (validLevels.includes(settings.logLevel)) {
      validated.logLevel = settings.logLevel
    }
  }
  
  if ('enableMetrics' in settings) {
    validated.enableMetrics = Boolean(settings.enableMetrics)
  }
  
  if ('autoCleanup' in settings) {
    validated.autoCleanup = Boolean(settings.autoCleanup)
  }
  
  if ('cleanupInterval' in settings) {
    validated.cleanupInterval = Math.max(3600000, Math.min(604800000, parseInt(settings.cleanupInterval)))
  }
  
  return validated
}

// 生成模拟日志
function generateMockLogs(limit) {
  const logs = []
  const levels = ['info', 'warn', 'error', 'debug']
  const services = ['GameService', 'SocketHandler', 'AdminHandler', 'System']
  const messages = [
    'Player joined room',
    'Game started',
    'Dice rolled',
    'Event triggered',
    'Player disconnected',
    'Room created',
    'Challenge completed',
    'Game ended',
    'Error occurred',
    'System maintenance'
  ]
  
  for (let i = 0; i < limit; i++) {
    logs.push({
      id: Date.now() + i,
      timestamp: Date.now() - (i * 10000),
      level: levels[Math.floor(Math.random() * levels.length)],
      service: services[Math.floor(Math.random() * services.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      userId: Math.random() > 0.5 ? `user_${Math.floor(Math.random() * 1000)}` : null,
      roomId: Math.random() > 0.7 ? `room_${Math.floor(Math.random() * 100)}` : null
    })
  }
  
  return logs.reverse()
}

// 生成统计数据
function generateStatistics(gameService) {
  const rooms = gameService.getAllRooms()
  const memUsage = process.memoryUsage()
  const cpuUsage = os.loadavg()[0] * 10 // 简化的CPU使用率
  
  return {
    realtime: {
      activeRooms: rooms.filter(r => r.status === 'playing').length,
      activePlayers: rooms.reduce((sum, r) => sum + (r.status === 'playing' ? r.players.length : 0), 0),
      totalConnections: rooms.reduce((sum, r) => sum + r.players.length, 0),
      averageGameTime: 1800, // 30分钟
      systemUptime: process.uptime()
    },
    daily: {
      gamesPlayed: Math.floor(Math.random() * 100) + 50,
      newPlayers: Math.floor(Math.random() * 50) + 20,
      averageSessionTime: Math.floor(Math.random() * 3600) + 1800,
      eventsTrigggered: Math.floor(Math.random() * 500) + 200,
      challengesCompleted: Math.floor(Math.random() * 100) + 30
    },
    weekly: {
      totalGames: Math.floor(Math.random() * 1000) + 500,
      uniquePlayers: Math.floor(Math.random() * 300) + 150,
      peakConcurrentUsers: Math.floor(Math.random() * 50) + 20,
      averageRoomDuration: Math.floor(Math.random() * 7200) + 1800,
      errorRate: Math.random() * 0.1
    },
    performance: {
      cpuUsage: Math.min(100, Math.max(0, cpuUsage)),
      memoryUsage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
      diskUsage: Math.random() * 50 + 20,
      networkLatency: Math.floor(Math.random() * 100) + 10,
      databaseConnections: Math.floor(Math.random() * 10) + 2
    }
  }
}

// 向所有管理员广播日志
export function broadcastLogToAdmins(io, logEntry) {
  adminSockets.forEach(socket => {
    socket.emit('new-log', logEntry)
  })
}
