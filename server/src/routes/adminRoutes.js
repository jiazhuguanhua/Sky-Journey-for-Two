import express from 'express'
import logger from '../config/logger.js'

const router = express.Router()

// 管理员验证中间件
const verifyAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey
  const expectedKey = process.env.ADMIN_KEY || 'admin123'
  
  if (adminKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  next()
}

// 所有管理员路由都需要验证
router.use(verifyAdmin)

// 获取详细统计
router.get('/stats', (req, res) => {
  try {
    const gameService = req.app.locals.gameService
    const stats = gameService.getGameStats()
    const rooms = gameService.getAllRooms()
    
    const detailedStats = {
      ...stats,
      rooms: rooms.map(room => ({
        id: room.id,
        playerCount: Object.keys(room.players).length,
        status: room.gameState.status,
        startTime: room.gameState.startTime,
        turnCount: room.gameState.turnCount,
        logs: room.logs.length
      }))
    }
    
    res.json(detailedStats)
  } catch (error) {
    logger.error('Error getting admin stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 获取所有房间详细信息
router.get('/rooms', (req, res) => {
  try {
    const gameService = req.app.locals.gameService
    const rooms = gameService.getAllRooms()
    res.json(rooms)
  } catch (error) {
    logger.error('Error getting rooms:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 获取特定房间详细信息
router.get('/rooms/:roomId', (req, res) => {
  try {
    const { roomId } = req.params
    const gameService = req.app.locals.gameService
    const room = gameService.getRoom(roomId)
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }
    
    res.json(room)
  } catch (error) {
    logger.error('Error getting room details:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 获取房间日志
router.get('/rooms/:roomId/logs', (req, res) => {
  try {
    const { roomId } = req.params
    const { limit = 50, offset = 0 } = req.query
    const gameService = req.app.locals.gameService
    const room = gameService.getRoom(roomId)
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }
    
    const logs = room.logs
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
      .reverse() // 最新的在前面
    
    res.json({
      logs,
      total: room.logs.length,
      offset: parseInt(offset),
      limit: parseInt(limit)
    })
  } catch (error) {
    logger.error('Error getting room logs:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 获取游戏设置
router.get('/settings', (req, res) => {
  try {
    const gameService = req.app.locals.gameService
    const settings = gameService.getGameSettings()
    res.json(settings)
  } catch (error) {
    logger.error('Error getting settings:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 更新游戏设置
router.put('/settings', (req, res) => {
  try {
    const gameService = req.app.locals.gameService
    const newSettings = gameService.updateGameSettings(req.body)
    
    logger.info('Settings updated by admin API', req.body)
    res.json(newSettings)
  } catch (error) {
    logger.error('Error updating settings:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 导出数据
router.get('/export/:type', (req, res) => {
  try {
    const { type } = req.params
    const gameService = req.app.locals.gameService
    let data = {}
    
    switch (type) {
      case 'logs':
        data = gameService.getAllRooms().map(room => ({
          roomId: room.id,
          logs: room.logs,
          gameState: room.gameState
        }))
        break
      case 'stats':
        data = gameService.getGameStats()
        break
      case 'rooms':
        data = gameService.getAllRooms()
        break
      default:
        return res.status(400).json({ error: 'Invalid export type' })
    }
    
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${new Date().toISOString()}.json"`)
    res.json(data)
    
    logger.info(`Data exported: ${type}`)
  } catch (error) {
    logger.error('Error exporting data:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
