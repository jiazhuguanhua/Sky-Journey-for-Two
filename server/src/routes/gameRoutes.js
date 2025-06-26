import express from 'express'
import logger from '../config/logger.js'

const router = express.Router()

// 健康检查
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'game-api',
    timestamp: new Date().toISOString() 
  })
})

// 获取游戏统计
router.get('/stats', (req, res) => {
  try {
    // 这里需要访问 gameService，可以通过中间件注入
    const stats = req.app.locals.gameService?.getGameStats() || {}
    res.json(stats)
  } catch (error) {
    logger.error('Error getting game stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 验证房间存在
router.get('/room/:roomId/exists', (req, res) => {
  try {
    const { roomId } = req.params
    const room = req.app.locals.gameService?.getRoom(roomId)
    
    res.json({ 
      exists: !!room,
      players: room ? Object.keys(room.players).length : 0,
      status: room?.gameState?.status || null
    })
  } catch (error) {
    logger.error('Error checking room existence:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 获取房间信息（公开信息）
router.get('/room/:roomId/info', (req, res) => {
  try {
    const { roomId } = req.params
    const room = req.app.locals.gameService?.getRoom(roomId)
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }
    
    // 只返回公开信息
    const publicInfo = {
      id: room.id,
      playerCount: Object.keys(room.players).length,
      status: room.gameState.status,
      isJoinable: room.gameState.status === 'waiting' && Object.keys(room.players).length < 2
    }
    
    res.json(publicInfo)
  } catch (error) {
    logger.error('Error getting room info:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
