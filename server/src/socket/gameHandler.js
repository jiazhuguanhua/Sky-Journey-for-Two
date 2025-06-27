import logger from '../config/logger.js'

// 房间状态管理
const roomHeartbeat = new Map() // 房间心跳检测
const playerSessions = new Map() // 玩家会话管理

export default function gameSocketHandler(io, socket, gameService) {
  // 玩家连接初始化
  socket.on('player-init', (data) => {
    try {
      const { deviceId, playerInfo } = data
      playerSessions.set(socket.id, {
        deviceId,
        playerInfo,
        connectedAt: new Date(),
        lastHeartbeat: new Date()
      })
      
      socket.emit('player-initialized', { 
        playerId: socket.id,
        serverTime: new Date()
      })
      
      logger.info(`Player initialized: ${socket.id} from device ${deviceId}`)
    } catch (error) {
      socket.emit('error', { message: error.message })
    }
  })

  // 创建房间 - 增强版
  socket.on('create-room', (data) => {
    try {
      const { roomConfig, playerInfo } = data
      const { roomId, room } = gameService.createRoom(socket.id, {
        ...playerInfo,
        isHost: true
      })
      
      // 房间配置
      room.config = {
        maxPlayers: 2,
        gameType: roomConfig?.gameType || 'couple',
        isPrivate: roomConfig?.isPrivate || false,
        password: roomConfig?.password || null,
        ...roomConfig
      }
      
      socket.join(roomId)
      
      // 设置房间心跳
      roomHeartbeat.set(roomId, setInterval(() => {
        checkRoomStatus(roomId)
      }, 30000)) // 30秒检查一次
      
      socket.emit('room-created', { 
        roomId, 
        room: sanitizeRoomForClient(room),
        isHost: true
      })
      
      // 广播房间列表更新
      broadcastRoomList()
      
      logger.info(`Enhanced room ${roomId} created by ${socket.id}`)
    } catch (error) {
      socket.emit('error', { message: error.message })
      logger.error(`Error creating room: ${error.message}`)
    }
  })

  // 加入房间 - 增强版
  socket.on('join-room', (data) => {
    try {
      const { roomId, playerInfo, password } = data
      const room = gameService.getRoom(roomId)
      
      if (!room) {
        throw new Error('房间不存在')
      }
      
      if (room.config?.isPrivate && room.config?.password !== password) {
        throw new Error('房间密码错误')
      }
      
      if (Object.keys(room.players).length >= room.config?.maxPlayers) {
        throw new Error('房间已满')
      }
      
      const updatedRoom = gameService.joinRoom(roomId, socket.id, playerInfo)
      
      socket.join(roomId)
      
      // 通知加入成功
      socket.emit('room-joined', { 
        roomId, 
        room: sanitizeRoomForClient(updatedRoom),
        isHost: false
      })
      
      // 通知房间内其他玩家
      socket.to(roomId).emit('player-joined', {
        playerId: socket.id,
        playerInfo: playerInfo,
        playerCount: Object.keys(updatedRoom.players).length
      })
      
      // 如果房间满了，通知可以开始游戏
      if (Object.keys(updatedRoom.players).length === updatedRoom.config?.maxPlayers) {
        io.to(roomId).emit('room-ready', { 
          canStart: true,
          message: '所有玩家已就绪，可以开始游戏！'
        })
      }
      
      // 广播房间列表更新
      broadcastRoomList()
      
      logger.info(`Player ${socket.id} joined room ${roomId}`)
    } catch (error) {
      socket.emit('error', { message: error.message })
      logger.error(`Error joining room: ${error.message}`)
    }
  })

  // 获取房间列表
  socket.on('get-room-list', () => {
    try {
      const publicRooms = gameService.getPublicRooms()
      socket.emit('room-list', {
        rooms: publicRooms.map(room => ({
          id: room.id,
          playerCount: Object.keys(room.players).length,
          maxPlayers: room.config?.maxPlayers || 2,
          gameType: room.config?.gameType || 'couple',
          status: room.status,
          createdAt: room.createdAt
        }))
      })
    } catch (error) {
      socket.emit('error', { message: error.message })
    }
  })

  // 心跳检测
  socket.on('heartbeat', () => {
    const session = playerSessions.get(socket.id)
    if (session) {
      session.lastHeartbeat = new Date()
    }
  })

  // 离开房间
  socket.on('leave-room', () => {
    try {
      const roomId = gameService.leaveRoom(socket.id)
      if (roomId) {
        socket.leave(roomId)
        
        // 通知房间内其他玩家
        socket.to(roomId).emit('player-left', { 
          playerId: socket.id,
          message: '玩家已离开房间'
        })
        
        // 检查房间状态
        const room = gameService.getRoom(roomId)
        if (room && Object.keys(room.players).length === 0) {
          // 房间空了，清理房间
          gameService.deleteRoom(roomId)
          const heartbeat = roomHeartbeat.get(roomId)
          if (heartbeat) {
            clearInterval(heartbeat)
            roomHeartbeat.delete(roomId)
          }
        }
        
        broadcastRoomList()
        logger.info(`Player ${socket.id} left room ${roomId}`)
      }
    } catch (error) {
      socket.emit('error', { message: error.message })
      logger.error(`Error leaving room: ${error.message}`)
    }
  })

  // 开始游戏
  socket.on('start-game', () => {
    try {
      const roomId = gameService.players.get(socket.id)
      if (!roomId) {
        throw new Error('Player not in any room')
      }

      const room = gameService.startGame(roomId)
      
      io.to(roomId).emit('game-started', {
        gameState: room.gameState,
        players: room.players
      })
      
      // 通知管理面板
      broadcastToAdmin('game-started', { roomId, room })
      
      logger.info(`Game started in room ${roomId}`)
    } catch (error) {
      socket.emit('error', { message: error.message })
      logger.error(`Error starting game: ${error.message}`)
    }
  })

  // 掷骰子
  socket.on('roll-dice', () => {
    try {
      const roomId = gameService.players.get(socket.id)
      if (!roomId) {
        throw new Error('Player not in any room')
      }

      const diceValue = gameService.rollDice(roomId, socket.id)
      
      io.to(roomId).emit('dice-rolled', {
        player: socket.id,
        value: diceValue
      })
      
      // 通知管理面板
      broadcastToAdmin('dice-rolled', { roomId, player: socket.id, value: diceValue })
      
      logger.info(`Player ${socket.id} rolled ${diceValue} in room ${roomId}`)
    } catch (error) {
      socket.emit('error', { message: error.message })
      logger.error(`Error rolling dice: ${error.message}`)
    }
  })

  // 移动玩家
  socket.on('move-player', (data) => {
    try {
      const roomId = gameService.players.get(socket.id)
      if (!roomId) {
        throw new Error('Player not in any room')
      }

      const result = gameService.movePlayer(roomId, socket.id, data.steps)
      
      io.to(roomId).emit('player-moved', {
        player: socket.id,
        steps: data.steps,
        result: result
      })
      
      // 处理不同的移动结果
      if (result.type === 'event') {
        io.to(roomId).emit('event-triggered', { event: result.event })
      } else if (result.type === 'win') {
        io.to(roomId).emit('game-won', result)
        broadcastToAdmin('game-won', { roomId, ...result })
      }
      
      logger.info(`Player ${socket.id} moved in room ${roomId}`)
    } catch (error) {
      socket.emit('error', { message: error.message })
      logger.error(`Error moving player: ${error.message}`)
    }
  })

  // 完成事件
  socket.on('complete-event', () => {
    try {
      const roomId = gameService.players.get(socket.id)
      if (!roomId) {
        throw new Error('Player not in any room')
      }

      const room = gameService.getRoom(roomId)
      if (room) {
        room.gameState.currentEvent = null
        
        io.to(roomId).emit('event-completed', { player: socket.id })
        
        // 自动进入下一回合
        setTimeout(() => {
          const turnResult = gameService.nextTurn(roomId)
          
          if (turnResult.type === 'challenge') {
            io.to(roomId).emit('challenge-triggered', { challenge: turnResult.challenge })
          } else {
            io.to(roomId).emit('turn-changed', { currentPlayer: turnResult.nextPlayer })
          }
          
          broadcastToAdmin('turn-changed', { roomId, ...turnResult })
        }, 1000)
      }
      
      logger.info(`Event completed by ${socket.id} in room ${roomId}`)
    } catch (error) {
      socket.emit('error', { message: error.message })
      logger.error(`Error completing event: ${error.message}`)
    }
  })

  // 完成挑战
  socket.on('complete-challenge', (data) => {
    try {
      const roomId = gameService.players.get(socket.id)
      if (!roomId) {
        throw new Error('Player not in any room')
      }

      const room = gameService.getRoom(roomId)
      if (room) {
        room.gameState.ultimateChallenge = null
        
        if (data.success) {
          // 挑战成功，继续游戏
          const turnResult = gameService.nextTurn(roomId)
          io.to(roomId).emit('challenge-completed', { 
            player: socket.id, 
            success: true 
          })
          io.to(roomId).emit('turn-changed', { currentPlayer: turnResult.nextPlayer })
        } else {
          // 挑战失败，对手获胜
          const players = Object.keys(room.players)
          const winner = players.find(id => id !== socket.id)
          const result = gameService.handleGameWin(roomId, winner)
          
          io.to(roomId).emit('challenge-completed', { 
            player: socket.id, 
            success: false 
          })
          io.to(roomId).emit('game-won', result)
          broadcastToAdmin('game-won', { roomId, ...result })
        }
      }
      
      logger.info(`Challenge completed by ${socket.id} in room ${roomId}`)
    } catch (error) {
      socket.emit('error', { message: error.message })
      logger.error(`Error completing challenge: ${error.message}`)
    }
  })

  // 下一回合
  socket.on('next-turn', () => {
    try {
      const roomId = gameService.players.get(socket.id)
      if (!roomId) {
        throw new Error('Player not in any room')
      }

      const result = gameService.nextTurn(roomId)
      
      if (result.type === 'challenge') {
        io.to(roomId).emit('challenge-triggered', { challenge: result.challenge })
      } else {
        io.to(roomId).emit('turn-changed', { currentPlayer: result.nextPlayer })
      }
      
      broadcastToAdmin('turn-changed', { roomId, ...result })
      
      logger.info(`Turn changed in room ${roomId}`)
    } catch (error) {
      socket.emit('error', { message: error.message })
      logger.error(`Error changing turn: ${error.message}`)
    }
  })

  // 获取房间信息
  socket.on('get-room-info', (data) => {
    try {
      const room = gameService.getRoom(data.roomId)
      if (room) {
        socket.emit('room-info', room)
      } else {
        socket.emit('error', { message: 'Room not found' })
      }
    } catch (error) {
      socket.emit('error', { message: error.message })
      logger.error(`Error getting room info: ${error.message}`)
    }
  })

  // 辅助函数 - 清理房间数据用于客户端
  function sanitizeRoomForClient(room) {
    return {
      id: room.id,
      players: room.players,
      status: room.status,
      gameState: room.gameState,
      config: {
        maxPlayers: room.config?.maxPlayers,
        gameType: room.config?.gameType,
        isPrivate: room.config?.isPrivate
        // 不包含密码等敏感信息
      },
      createdAt: room.createdAt
    }
  }

  // 检查房间状态
  function checkRoomStatus(roomId) {
    const room = gameService.getRoom(roomId)
    if (!room) {
      const heartbeat = roomHeartbeat.get(roomId)
      if (heartbeat) {
        clearInterval(heartbeat)
        roomHeartbeat.delete(roomId)
      }
      return
    }

    // 检查玩家连接状态
    const playerIds = Object.keys(room.players)
    const activePlayers = playerIds.filter(playerId => {
      const session = playerSessions.get(playerId)
      return session && (new Date() - session.lastHeartbeat) < 60000 // 1分钟超时
    })

    if (activePlayers.length === 0) {
      // 房间无活跃玩家，清理房间
      gameService.deleteRoom(roomId)
      const heartbeat = roomHeartbeat.get(roomId)
      if (heartbeat) {
        clearInterval(heartbeat)
        roomHeartbeat.delete(roomId)
      }
      broadcastRoomList()
      logger.info(`Room ${roomId} cleaned up due to inactivity`)
    }
  }

  // 广播房间列表
  function broadcastRoomList() {
    const publicRooms = gameService.getPublicRooms()
    io.emit('room-list-update', {
      rooms: publicRooms.map(room => ({
        id: room.id,
        playerCount: Object.keys(room.players).length,
        maxPlayers: room.config?.maxPlayers || 2,
        gameType: room.config?.gameType || 'couple',
        status: room.status,
        createdAt: room.createdAt
      }))
    })
  }

  // 广播给管理员
  function broadcastToAdmin(event, data) {
    io.to('admin-room').emit(event, data)
  }

  // 玩家断线处理
  socket.on('disconnect', () => {
    try {
      // 清理玩家会话
      playerSessions.delete(socket.id)
      
      // 离开房间
      const roomId = gameService.leaveRoom(socket.id)
      if (roomId) {
        socket.to(roomId).emit('player-disconnected', { 
          playerId: socket.id,
          message: '玩家已断线'
        })
        
        // 延迟检查房间状态，给玩家重连机会
        setTimeout(() => {
          checkRoomStatus(roomId)
        }, 10000) // 10秒后检查
      }
      
      broadcastRoomList()
      logger.info(`Player ${socket.id} disconnected`)
    } catch (error) {
      logger.error(`Error handling disconnect: ${error.message}`)
    }
  })
}
