import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

import gameSocketHandler from './src/socket/gameHandler.js'
import adminSocketHandler from './src/socket/adminHandler.js'
import gameRoutes from './src/routes/gameRoutes.js'
import adminRoutes from './src/routes/adminRoutes.js'
import logger from './src/config/logger.js'
import { GameService } from './src/services/GameService.js'

// ES模块路径解析
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

// 初始化游戏服务
const gameService = new GameService()

// 中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))
app.use(compression())
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// 路由
app.use('/api/game', gameRoutes)
app.use('/api/admin', adminRoutes)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    rooms: gameService.getRoomsCount(),
    players: gameService.getPlayersCount()
  })
})

// Socket.IO 处理
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`)
  
  // 游戏相关事件
  gameSocketHandler(io, socket, gameService)
  
  // 管理面板事件
  adminSocketHandler(io, socket, gameService)
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`)
    gameService.handlePlayerDisconnect(socket.id)
  })
})

// 错误处理
app.use((err, req, res, next) => {
  logger.error('Error:', err)
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

export default app
