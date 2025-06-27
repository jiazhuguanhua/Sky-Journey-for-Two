import { v4 as uuidv4 } from 'uuid'
import logger from '../config/logger.js'

export class GameService {
  constructor() {
    this.rooms = new Map()
    this.players = new Map()
    this.gameSettings = {
      boardSize: 20,
      eventPositions: [3, 7, 11, 15, 18],
      eventProbability: 0.7,
      challengeTimeout: 60,
      diceCooldown: 3,
      taskProbability: 70,
      soundVolume: 50,
      bgmTrack: 'romantic',
      aiProviders: {
        openai: {
          enabled: false,
          apiKey: process.env.OPENAI_API_KEY
        },
        local: {
          enabled: true
        }
      }
    }
    this.gameStats = {
      totalGames: 0,
      totalPlayers: 0,
      averageGameTime: 0,
      onlineUsers: 0,
      activeRooms: 0,
      tasksCompleted: 0
    }
  }

  // 生成短房间ID
  generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    // 确保ID唯一
    if (this.rooms.has(result)) {
      return this.generateRoomId()
    }
    
    return result
  }

  // 增强版创建房间
  createRoom(hostSocketId, playerInfo) {
    const roomId = this.generateRoomId()
    const room = {
      id: roomId,
      hostId: hostSocketId,
      players: {
        [hostSocketId]: {
          ...playerInfo,
          socketId: hostSocketId,
          position: 0,
          isActive: false,
          isHost: true,
          joinedAt: new Date()
        }
      },
      gameState: {
        status: 'waiting', // waiting, playing, finished
        currentPlayer: null,
        diceValue: null,
        currentEvent: null,
        ultimateChallenge: null,
        turn: 0,
        startTime: null,
        endTime: null
      },
      config: {
        maxPlayers: 2,
        gameType: 'couple',
        isPrivate: false,
        password: null,
        settings: { ...this.gameSettings }
      },
      createdAt: new Date(),
      lastActivity: new Date()
    }

    this.rooms.set(roomId, room)
    this.players.set(hostSocketId, roomId)
    
    // 更新统计
    this.updateStats()
    
    logger.info(`Room created: ${roomId} by ${hostSocketId}`)
    return { roomId, room }
  }

  // 获取房间
  getRoom(roomId) {
    return this.rooms.get(roomId)
  }

  // 获取公开房间列表
  getPublicRooms() {
    return Array.from(this.rooms.values()).filter(room => 
      !room.config?.isPrivate && room.gameState.status === 'waiting'
    )
  }

  // 删除房间
  deleteRoom(roomId) {
    const room = this.rooms.get(roomId)
    if (room) {
      // 清理玩家映射
      Object.keys(room.players).forEach(playerId => {
        this.players.delete(playerId)
      })
      
      this.rooms.delete(roomId)
      this.updateStats()
      logger.info(`Room deleted: ${roomId}`)
    }
  }

  // 更新统计数据
  updateStats() {
    this.gameStats.activeRooms = this.rooms.size
    this.gameStats.onlineUsers = this.players.size
  }

  // 更新游戏设置
  updateGameSettings(newSettings) {
    this.gameSettings = { ...this.gameSettings, ...newSettings }
    
    // 应用到所有活跃房间
    this.rooms.forEach(room => {
      room.config.settings = { ...room.config.settings, ...newSettings }
    })
    
    logger.info('Game settings updated:', newSettings)
  }

  // 房间管理
  joinRoom(roomId, socketId, playerInfo) {
    const room = this.rooms.get(roomId)
    if (!room) {
      throw new Error('Room not found')
    }

    if (Object.keys(room.players).length >= 2) {
      throw new Error('Room is full')
    }

    if (room.gameState.status !== 'waiting') {
      throw new Error('Game already started')
    }

    room.players[socketId] = {
      ...playerInfo,
      socketId: socketId,
      position: 0,
      isActive: false,
      joinedAt: new Date()
    }

    this.players.set(socketId, roomId)
    
    this.logGameEvent(roomId, 'player_joined', { socketId, playerInfo })
    logger.info(`Player ${socketId} joined room ${roomId}`)
    
    return room
  }

  leaveRoom(socketId) {
    const roomId = this.players.get(socketId)
    if (!roomId) return null

    const room = this.rooms.get(roomId)
    if (!room) return null

    delete room.players[socketId]
    this.players.delete(socketId)

    this.logGameEvent(roomId, 'player_left', { socketId })

    // 如果房间空了，删除房间
    if (Object.keys(room.players).length === 0) {
      this.rooms.delete(roomId)
      logger.info(`Room ${roomId} deleted (empty)`)
    }

    return roomId
  }

  // 游戏逻辑
  startGame(roomId) {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error('Room not found')

    if (Object.keys(room.players).length < 2) {
      throw new Error('Need 2 players to start')
    }

    room.gameState.status = 'playing'
    room.gameState.startTime = new Date()
    room.gameState.currentPlayer = Object.keys(room.players)[0]
    room.gameState.turnCount = 0

    // 设置第一个玩家为活跃状态
    Object.values(room.players).forEach(player => {
      player.isActive = player.socketId === room.gameState.currentPlayer
    })

    this.logGameEvent(roomId, 'game_started', { 
      players: Object.keys(room.players),
      startPlayer: room.gameState.currentPlayer 
    })
    
    this.gameStats.totalGames++
    
    return room
  }

  rollDice(roomId, socketId) {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error('Room not found')

    if (room.gameState.status !== 'playing') {
      throw new Error('Game not in progress')
    }

    if (room.gameState.currentPlayer !== socketId) {
      throw new Error('Not your turn')
    }

    const diceValue = Math.floor(Math.random() * 6) + 1
    room.gameState.diceValue = diceValue

    this.logGameEvent(roomId, 'dice_rolled', { 
      player: socketId, 
      value: diceValue,
      turn: room.gameState.turnCount
    })

    return diceValue
  }

  movePlayer(roomId, socketId, steps) {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error('Room not found')

    const player = room.players[socketId]
    if (!player) throw new Error('Player not found')

    const oldPosition = player.position
    const newPosition = Math.min(oldPosition + steps, room.settings.boardSize - 1)
    player.position = newPosition

    this.logGameEvent(roomId, 'player_moved', {
      player: socketId,
      from: oldPosition,
      to: newPosition,
      steps: steps
    })

    // 检查是否到达终点
    if (newPosition === room.settings.boardSize - 1) {
      return this.handleGameWin(roomId, socketId)
    }

    // 检查是否触发事件
    if (room.settings.eventPositions.includes(newPosition)) {
      const event = this.generateEvent(room, socketId)
      room.gameState.currentEvent = event
      
      this.logGameEvent(roomId, 'event_triggered', {
        player: socketId,
        position: newPosition,
        event: event
      })
      
      return { type: 'event', event }
    }

    return { type: 'move', newPosition }
  }

  nextTurn(roomId) {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error('Room not found')

    const playerIds = Object.keys(room.players)
    const currentIndex = playerIds.indexOf(room.gameState.currentPlayer)
    const nextIndex = (currentIndex + 1) % playerIds.length
    const nextPlayer = playerIds[nextIndex]

    // 更新玩家活跃状态
    Object.values(room.players).forEach(player => {
      player.isActive = player.socketId === nextPlayer
    })

    room.gameState.currentPlayer = nextPlayer
    room.gameState.diceValue = null
    room.gameState.currentEvent = null
    room.gameState.turnCount++

    this.logGameEvent(roomId, 'turn_changed', {
      from: playerIds[currentIndex],
      to: nextPlayer,
      turn: room.gameState.turnCount
    })

    // 检查是否需要触发终极挑战
    const currentPlayerPos = room.players[nextPlayer].position
    const otherPlayer = Object.values(room.players).find(p => p.socketId !== nextPlayer)
    const positionDiff = otherPlayer.position - currentPlayerPos

    if (positionDiff >= 5 && Math.random() < 0.3) {
      const challenge = this.generateUltimateChallenge(room)
      room.gameState.ultimateChallenge = challenge
      
      this.logGameEvent(roomId, 'challenge_triggered', {
        player: nextPlayer,
        challenge: challenge
      })
      
      return { type: 'challenge', challenge }
    }

    return { type: 'turn', nextPlayer }
  }

  handleGameWin(roomId, winnerId) {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error('Room not found')

    room.gameState.status = 'finished'
    room.gameState.winner = winnerId
    room.gameState.endTime = new Date()

    const gameTime = room.gameState.endTime - room.gameState.startTime
    
    this.logGameEvent(roomId, 'game_won', {
      winner: winnerId,
      gameTime: gameTime,
      turns: room.gameState.turnCount
    })

    // 更新统计
    this.updateGameStats(gameTime)

    return { winner: winnerId, gameTime, turns: room.gameState.turnCount }
  }

  // 事件生成
  generateEvent(room, playerId) {
    const eventTypes = ['truth', 'dare']
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    
    const events = {
      truth: [
        "说出你最喜欢对方的三个特质",
        "分享一个只有对方知道的小秘密",
        "说出你们第一次见面时的感受",
        "描述你理想中的约会场景",
        "说出你最感谢对方为你做的一件事",
        "如果可以重新认识对方，你希望在哪里遇见？",
        "说出一个你希望和对方一起完成的梦想",
        "分享一个让你想起对方的歌曲或电影"
      ],
      dare: [
        "给对方一个温暖的拥抱",
        "说一句最想对对方说的话",
        "模仿对方最可爱的表情",
        "为对方唱一首歌",
        "计划下次约会的地点和活动",
        "写一句情话给对方",
        "做一个对方最喜欢的手势",
        "分享一张你们的合照并说出拍摄时的心情"
      ]
    }
    
    const content = events[eventType][Math.floor(Math.random() * events[eventType].length)]
    
    return {
      id: uuidv4(),
      type: eventType,
      content: content,
      player: playerId,
      timestamp: new Date()
    }
  }

  generateUltimateChallenge(room) {
    const challenges = [
      "在60秒内说出对方10个优点",
      "用30秒时间表达你对这段感情的感谢",
      "回忆并分享你们在一起最开心的一天",
      "说出你对未来的憧憬，必须包含对方",
      "用一分钟时间为对方写一首小诗",
      "分享三个你希望和对方一起去的地方",
      "说出你认为你们关系中最珍贵的时刻"
    ]
    
    return {
      id: uuidv4(),
      content: challenges[Math.floor(Math.random() * challenges.length)],
      timeout: room.settings.challengeTimeout,
      timestamp: new Date()
    }
  }

  // 工具方法
  logGameEvent(roomId, event, data) {
    const room = this.rooms.get(roomId)
    if (!room) return

    const logEntry = {
      id: uuidv4(),
      timestamp: new Date(),
      event: event,
      data: data
    }

    room.logs.push(logEntry)
    
    // 保持最近100条日志
    if (room.logs.length > 100) {
      room.logs = room.logs.slice(-100)
    }

    logger.info('Game event', logEntry)
  }

  updateGameStats(gameTime) {
    const gameTimeMinutes = gameTime / (1000 * 60)
    this.gameStats.averageGameTime = 
      (this.gameStats.averageGameTime * (this.gameStats.totalGames - 1) + gameTimeMinutes) / 
      this.gameStats.totalGames
  }

  // 管理方法
  getAllRooms() {
    return Array.from(this.rooms.values()).map(room => ({
      ...room,
      playerCount: Object.keys(room.players).length,
      createdAt: room.createdAt || Date.now()
    }))
  }

  closeRoom(roomId) {
    try {
      if (this.rooms.has(roomId)) {
        const room = this.rooms.get(roomId)
        
        // 清理玩家数据
        Object.keys(room.players).forEach(playerId => {
          this.players.delete(playerId)
        })
        
        // 删除房间
        this.rooms.delete(roomId)
        
        logger.info(`Room ${roomId} closed by admin`)
        return true
      }
      return false
    } catch (error) {
      logger.error(`Error closing room ${roomId}:`, error)
      return false
    }
  }

  kickPlayer(roomId, playerId) {
    try {
      const room = this.rooms.get(roomId)
      if (room && room.players[playerId]) {
        // 移除玩家
        delete room.players[playerId]
        this.players.delete(playerId)
        
        // 如果是房主，转移房主权限
        if (room.hostId === playerId) {
          const remainingPlayers = Object.keys(room.players)
          if (remainingPlayers.length > 0) {
            room.hostId = remainingPlayers[0]
          } else {
            // 没有剩余玩家，删除房间
            this.rooms.delete(roomId)
          }
        }
        
        logger.info(`Player ${playerId} kicked from room ${roomId}`)
        return true
      }
      return false
    } catch (error) {
      logger.error(`Error kicking player ${playerId} from room ${roomId}:`, error)
      return false
    }
  }

  resetGame(roomId) {
    try {
      const room = this.rooms.get(roomId)
      if (room) {
        // 重置游戏状态
        room.gameState = {
          status: 'waiting',
          currentPlayer: null,
          diceValue: null,
          currentEvent: null,
          ultimateChallenge: null,
          round: 1,
          winner: null,
          gameStartTime: null,
          gameEndTime: null,
          eventHistory: [],
          challengeHistory: []
        }
        
        // 重置玩家位置
        Object.keys(room.players).forEach(playerId => {
          room.players[playerId].position = 0
          room.players[playerId].isActive = false
        })
        
        logger.info(`Game reset in room ${roomId}`)
        return true
      }
      return false
    } catch (error) {
      logger.error(`Error resetting game in room ${roomId}:`, error)
      return false
    }
  }

  getGameStats() {
    const rooms = Array.from(this.rooms.values())
    const totalPlayers = rooms.reduce((sum, room) => sum + Object.keys(room.players).length, 0)
    const activeRooms = rooms.filter(room => room.gameState.status === 'playing').length
    const waitingRooms = rooms.filter(room => room.gameState.status === 'waiting').length
    const finishedRooms = rooms.filter(room => room.gameState.status === 'finished').length
    
    return {
      totalRooms: rooms.length,
      activeRooms,
      waitingRooms,
      finishedRooms,
      totalPlayers,
      averagePlayersPerRoom: totalPlayers / Math.max(rooms.length, 1),
      ...this.gameStats
    }
  }

  getGameSettings() {
    return { ...this.gameSettings }
  }

  handlePlayerDisconnect(socketId) {
    const roomId = this.leaveRoom(socketId)
    if (roomId) {
      logger.info(`Player ${socketId} disconnected from room ${roomId}`)
    }
    return roomId
  }
}

export default GameService
