import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useGame } from './GameContext'

const SocketContext = createContext()

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

export function SocketProvider({ children }) {
  const socketRef = useRef(null)
  const { dispatch } = useGame()
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [roomList, setRoomList] = useState([])
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const heartbeatRef = useRef(null)
  
  useEffect(() => {
    // 生成设备ID
    let deviceId = localStorage.getItem('sky-journey-device-id')
    if (!deviceId) {
      deviceId = 'device-' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('sky-journey-device-id', deviceId)
    }
    
    // 初始化 Socket 连接
    socketRef.current = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 10
    })
    
    const socket = socketRef.current
    
    // 连接事件
    socket.on('connect', () => {
      console.log('🎮 Connected to server:', socket.id)
      setConnectionStatus('connected')
      setReconnectAttempts(0)
      
      // 发送初始化信息
      socket.emit('player-init', { 
        deviceId,
        timestamp: new Date()
      })
      
      // 开始心跳检测
      startHeartbeat()
      
      // 获取房间列表
      socket.emit('get-room-list')
    })
    
    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server')
      setConnectionStatus('disconnected')
      stopHeartbeat()
    })
    
    socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`)
      setConnectionStatus('connected')
      setReconnectAttempts(0)
    })
    
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`)
      setConnectionStatus('reconnecting')
      setReconnectAttempts(attemptNumber)
    })
    
    socket.on('reconnect_failed', () => {
      console.log('❌ Reconnection failed')
      setConnectionStatus('failed')
    })
    
    // 初始化响应
    socket.on('player-initialized', (data) => {
      console.log('🎯 Player initialized:', data.playerId)
      dispatch({ type: 'SET_PLAYER_ID', payload: data.playerId })
    })
    
    // 房间事件 - 增强版
    socket.on('room-created', (data) => {
      console.log('🏠 Room created:', data.roomId)
      dispatch({ type: 'SET_ROOM_ID', payload: data.roomId })
      dispatch({ type: 'SET_HOST', payload: data.isHost })
      dispatch({ type: 'SET_ROOM_DATA', payload: data.room })
    })
    
    socket.on('room-joined', (data) => {
      console.log('✅ Room joined:', data.roomId)
      dispatch({ type: 'SET_ROOM_ID', payload: data.roomId })
      dispatch({ type: 'SET_HOST', payload: data.isHost })
      dispatch({ type: 'SET_ROOM_DATA', payload: data.room })
    })
    
    socket.on('room-ready', (data) => {
      console.log('🎮 Room ready to start')
      dispatch({ type: 'SET_ROOM_READY', payload: true })
      dispatch({ type: 'SHOW_MESSAGE', payload: data.message })
    })
    
    socket.on('player-joined', (data) => {
      console.log('👥 Player joined:', data.playerId)
      dispatch({ 
        type: 'UPDATE_PLAYER', 
        playerId: data.playerId,
        payload: data.playerInfo 
      })
      dispatch({ 
        type: 'SHOW_MESSAGE', 
        payload: `玩家 ${data.playerInfo.name} 加入了房间` 
      })
    })
    
    socket.on('player-left', (data) => {
      console.log('👋 Player left:', data.playerId)
      dispatch({ type: 'REMOVE_PLAYER', payload: data.playerId })
      dispatch({ type: 'SHOW_MESSAGE', payload: data.message })
    })
    
    socket.on('player-disconnected', (data) => {
      console.log('📡 Player disconnected:', data.playerId)
      dispatch({ 
        type: 'SET_PLAYER_STATUS', 
        playerId: data.playerId,
        payload: 'disconnected'
      })
      dispatch({ type: 'SHOW_MESSAGE', payload: data.message })
    })
    
    // 房间列表
    socket.on('room-list', (data) => {
      setRoomList(data.rooms)
    })
    
    socket.on('room-list-update', (data) => {
      setRoomList(data.rooms)
    })

    // 游戏事件 - 增强同步
    socket.on('game-started', (data) => {
      console.log('🎮 Game started!')
      dispatch({ type: 'SET_GAME_STATUS', payload: 'playing' })
      dispatch({ type: 'SET_GAME_STATE', payload: data.gameState })
      dispatch({ type: 'SET_PLAYERS', payload: data.players })
      dispatch({ type: 'SET_CURRENT_PLAYER', payload: data.gameState.currentPlayer })
    })
    
    socket.on('dice-rolled', (data) => {
      console.log(`🎲 ${data.player} rolled: ${data.value}`)
      dispatch({ type: 'SET_DICE_VALUE', payload: data.value })
      dispatch({ type: 'SET_ROLLING', payload: false })
      dispatch({ type: 'SET_LAST_ROLL', payload: { player: data.player, value: data.value } })
    })
    
    socket.on('player-moved', (data) => {
      console.log(`🚶 Player ${data.playerId} moved ${data.steps} steps`)
      dispatch({ 
        type: 'MOVE_PLAYER',
        playerId: data.playerId,
        steps: data.steps,
        newPosition: data.newPosition
      })
    })
    
    socket.on('event-triggered', (data) => {
      console.log('🎪 Event triggered:', data.event.type)
      dispatch({ type: 'SET_EVENT', payload: data.event })
    })
    
    socket.on('task-completed', (data) => {
      console.log('✅ Task completed by:', data.playerId)
      dispatch({ type: 'COMPLETE_TASK', payload: data })
    })
    
    socket.on('challenge-triggered', (data) => {
      console.log('⚡ Ultimate challenge triggered!')
      dispatch({ type: 'SET_ULTIMATE_CHALLENGE', payload: data.challenge })
    })
    
    socket.on('turn-changed', (data) => {
      console.log('🔄 Turn changed to:', data.currentPlayer)
      dispatch({ type: 'SET_CURRENT_PLAYER', payload: data.currentPlayer })
    })
    
    socket.on('game-won', (data) => {
      console.log('🏆 Game won by:', data.winner)
      dispatch({ type: 'SET_WINNER', payload: data.winner })
      dispatch({ type: 'SET_GAME_STATUS', payload: 'finished' })
    })

    // 错误处理
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error)
      dispatch({ 
        type: 'SHOW_ERROR', 
        payload: error.message || '连接出现问题，请重试' 
      })
    })
    
    return () => {
      stopHeartbeat()
      socket.disconnect()
    }
  }, [dispatch])
  
  // 心跳检测
  const startHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
    }
    
    heartbeatRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('heartbeat')
      }
    }, 30000) // 每30秒发送心跳
  }
  
  const stopHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
  }
  
  const socketActions = {
    // 连接状态
    getConnectionStatus: () => connectionStatus,
    getReconnectAttempts: () => reconnectAttempts,
    
    // 房间管理 - 增强版
    createRoom: (playerInfo, roomConfig = {}) => {
      if (!socketRef.current?.connected) {
        throw new Error('未连接到服务器')
      }
      socketRef.current.emit('create-room', { 
        playerInfo, 
        roomConfig: {
          gameType: 'couple',
          isPrivate: false,
          ...roomConfig
        }
      })
    },
    
    joinRoom: (roomId, playerInfo, password = null) => {
      if (!socketRef.current?.connected) {
        throw new Error('未连接到服务器')
      }
      socketRef.current.emit('join-room', { 
        roomId: roomId.toUpperCase(), 
        playerInfo,
        password
      })
    },
    
    leaveRoom: () => {
      socketRef.current?.emit('leave-room')
    },
    
    getRoomList: () => {
      socketRef.current?.emit('get-room-list')
      return roomList
    },
    
    // 游戏操作 - 增强同步
    startGame: () => {
      socketRef.current?.emit('start-game')
    },
    
    rollDice: () => {
      if (!socketRef.current?.connected) {
        throw new Error('未连接到服务器')
      }
      socketRef.current.emit('roll-dice')
    },
    
    movePlayer: (playerId, steps) => {
      socketRef.current?.emit('move-player', { playerId, steps })
    },
    
    completeTask: (taskId, result) => {
      socketRef.current?.emit('complete-task', { taskId, result })
    },
    
    skipTask: (taskId, reason = 'skipped') => {
      socketRef.current?.emit('skip-task', { taskId, reason })
    },
    
    triggerUltimateChallenge: () => {
      socketRef.current?.emit('trigger-ultimate-challenge')
    },
    
    endTurn: () => {
      socketRef.current?.emit('end-turn')
    },
    
    // 聊天功能
    sendMessage: (message) => {
      socketRef.current?.emit('chat-message', { message, timestamp: new Date() })
    },
    
    // 游戏设置同步
    updateGameSettings: (settings) => {
      socketRef.current?.emit('update-game-settings', settings)
    },
    
    // 强制重连
    forceReconnect: () => {
      socketRef.current?.disconnect()
      socketRef.current?.connect()
    }
  }
  
  return (
    <SocketContext.Provider value={{ 
      socket: socketRef.current, 
      ...socketActions,
      connectionStatus,
      reconnectAttempts,
      roomList
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
