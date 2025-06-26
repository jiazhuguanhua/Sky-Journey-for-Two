import React, { createContext, useContext, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useGame } from './GameContext'

const SocketContext = createContext()

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

export function SocketProvider({ children }) {
  const socketRef = useRef(null)
  const { dispatch } = useGame()
  
  useEffect(() => {
    // 初始化 Socket 连接
    socketRef.current = io(SERVER_URL, {
      transports: ['websocket', 'polling']
    })
    
    const socket = socketRef.current
    
    // 连接事件
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id)
    })
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server')
    })
    
    // 房间事件
    socket.on('room-created', (data) => {
      dispatch({ type: 'SET_ROOM_ID', payload: data.roomId })
      dispatch({ type: 'SET_HOST', payload: true })
    })
    
    socket.on('room-joined', (data) => {
      dispatch({ type: 'SET_ROOM_ID', payload: data.roomId })
      dispatch({ type: 'SET_HOST', payload: false })
    })
    
    socket.on('player-joined', (data) => {
      dispatch({ 
        type: 'UPDATE_PLAYER', 
        playerId: data.playerId,
        payload: data.playerInfo 
      })
    })
    
    // 游戏事件
    socket.on('game-started', () => {
      dispatch({ type: 'SET_GAME_STATUS', payload: 'playing' })
      dispatch({ type: 'SET_CURRENT_PLAYER', payload: 'player1' })
    })
    
    socket.on('dice-rolled', (data) => {
      dispatch({ type: 'SET_DICE_VALUE', payload: data.value })
      dispatch({ type: 'SET_ROLLING', payload: false })
    })
    
    socket.on('player-moved', (data) => {
      dispatch({ 
        type: 'MOVE_PLAYER',
        playerId: data.playerId,
        steps: data.steps
      })
    })
    
    socket.on('event-triggered', (data) => {
      dispatch({ type: 'SET_EVENT', payload: data.event })
    })
    
    socket.on('challenge-triggered', (data) => {
      dispatch({ type: 'SET_ULTIMATE_CHALLENGE', payload: data.challenge })
    })
    
    socket.on('turn-changed', (data) => {
      dispatch({ type: 'SET_CURRENT_PLAYER', payload: data.currentPlayer })
    })
    
    socket.on('game-won', (data) => {
      dispatch({ type: 'SET_WINNER', payload: data.winner })
    })
    
    // 错误处理
    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
    
    return () => {
      socket.disconnect()
    }
  }, [dispatch])
  
  const socketActions = {
    // 房间管理
    createRoom: (playerInfo) => {
      socketRef.current?.emit('create-room', { playerInfo })
    },
    
    joinRoom: (roomId, playerInfo) => {
      socketRef.current?.emit('join-room', { roomId, playerInfo })
    },
    
    leaveRoom: () => {
      socketRef.current?.emit('leave-room')
    },
    
    // 游戏操作
    startGame: () => {
      socketRef.current?.emit('start-game')
    },
    
    rollDice: () => {
      socketRef.current?.emit('roll-dice')
    },
    
    movePlayer: (playerId, steps) => {
      socketRef.current?.emit('move-player', { playerId, steps })
    },
    
    completeEvent: () => {
      socketRef.current?.emit('complete-event')
    },
    
    completeChallenge: (success) => {
      socketRef.current?.emit('complete-challenge', { success })
    },
    
    nextTurn: () => {
      socketRef.current?.emit('next-turn')
    },
    
    // 离线模式处理（本地游戏逻辑）
    rollDiceOffline: () => {
      dispatch({ type: 'SET_ROLLING', payload: true })
      
      setTimeout(() => {
        const value = Math.floor(Math.random() * 6) + 1
        dispatch({ type: 'SET_DICE_VALUE', payload: value })
        dispatch({ type: 'SET_ROLLING', payload: false })
        return value
      }, 1000)
    }
  }
  
  const value = {
    socket: socketRef.current,
    ...socketActions
  }
  
  return (
    <SocketContext.Provider value={value}>
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
