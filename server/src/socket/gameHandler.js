import logger from '../config/logger.js'

export default function gameSocketHandler(io, socket, gameService) {
  // 创建房间
  socket.on('create-room', (data) => {
    try {
      const { roomId, room } = gameService.createRoom(socket.id, data.playerInfo)
      
      socket.join(roomId)
      socket.emit('room-created', { roomId, room })
      
      logger.info(`Room ${roomId} created by ${socket.id}`)
    } catch (error) {
      socket.emit('error', { message: error.message })
      logger.error(`Error creating room: ${error.message}`)
    }
  })

  // 加入房间
  socket.on('join-room', (data) => {
    try {
      const { roomId, playerInfo } = data
      const room = gameService.joinRoom(roomId, socket.id, playerInfo)
      
      socket.join(roomId)
      socket.emit('room-joined', { roomId, room })
      
      // 通知房间内其他玩家
      socket.to(roomId).emit('player-joined', {
        playerId: socket.id,
        playerInfo: playerInfo
      })
      
      // 如果房间满了，可以开始游戏
      if (Object.keys(room.players).length === 2) {
        io.to(roomId).emit('room-ready')
      }
      
      logger.info(`Player ${socket.id} joined room ${roomId}`)
    } catch (error) {
      socket.emit('error', { message: error.message })
      logger.error(`Error joining room: ${error.message}`)
    }
  })

  // 离开房间
  socket.on('leave-room', () => {
    try {
      const roomId = gameService.leaveRoom(socket.id)
      if (roomId) {
        socket.leave(roomId)
        socket.to(roomId).emit('player-left', { playerId: socket.id })
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

  // 向管理面板广播消息
  function broadcastToAdmin(event, data) {
    io.to('admin').emit(event, {
      timestamp: new Date(),
      ...data
    })
  }
}
