import React, { createContext, useContext, useReducer } from 'react'

const GameContext = createContext()

const initialState = {
  // 游戏基本状态
  gameMode: null, // 'offline' | 'online'
  roomId: null,
  isHost: false,
  gameStatus: 'waiting', // 'waiting' | 'playing' | 'finished'
  
  // 玩家信息
  players: {
    player1: {
      id: 'player1',
      name: '',
      gender: 'male',
      avatar: '👨',
      position: 0,
      isActive: false,
      color: '#4A90E2'
    },
    player2: {
      id: 'player2',
      name: '',
      gender: 'female',
      avatar: '👩',
      position: 0,
      isActive: false,
      color: '#FF6B8A'
    }
  },
  
  // 游戏状态
  currentPlayer: 'player1',
  diceValue: null,
  isRolling: false,
  
  // 事件系统
  currentEvent: null,
  eventHistory: [],
  
  // 挑战系统
  ultimateChallenge: null,
  challengeTimeLeft: 0,
  
  // 游戏设置
  boardSize: 20,
  eventPositions: [3, 7, 11, 15, 18],
  
  // 胜利状态
  winner: null,
  showVictory: false
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_GAME_MODE':
      return { ...state, gameMode: action.payload }
    
    case 'SET_ROOM_ID':
      return { ...state, roomId: action.payload }
    
    case 'SET_HOST':
      return { ...state, isHost: action.payload }
    
    case 'UPDATE_PLAYER':
      return {
        ...state,
        players: {
          ...state.players,
          [action.playerId]: {
            ...state.players[action.playerId],
            ...action.payload
          }
        }
      }
    
    case 'SET_CURRENT_PLAYER':
      return { ...state, currentPlayer: action.payload }
    
    case 'SET_DICE_VALUE':
      return { ...state, diceValue: action.payload }
    
    case 'SET_ROLLING':
      return { ...state, isRolling: action.payload }
    
    case 'MOVE_PLAYER':
      const player = state.players[action.playerId]
      const newPosition = Math.min(player.position + action.steps, state.boardSize - 1)
      
      return {
        ...state,
        players: {
          ...state.players,
          [action.playerId]: {
            ...player,
            position: newPosition
          }
        }
      }
    
    case 'SET_EVENT':
      return { 
        ...state, 
        currentEvent: action.payload,
        eventHistory: [...state.eventHistory, action.payload]
      }
    
    case 'CLEAR_EVENT':
      return { ...state, currentEvent: null }
    
    case 'SET_ULTIMATE_CHALLENGE':
      return { 
        ...state, 
        ultimateChallenge: action.payload,
        challengeTimeLeft: 60
      }
    
    case 'UPDATE_CHALLENGE_TIME':
      return { ...state, challengeTimeLeft: action.payload }
    
    case 'CLEAR_CHALLENGE':
      return { 
        ...state, 
        ultimateChallenge: null,
        challengeTimeLeft: 0
      }
    
    case 'SET_WINNER':
      return { 
        ...state, 
        winner: action.payload,
        gameStatus: 'finished',
        showVictory: true
      }
    
    case 'SET_GAME_STATUS':
      return { ...state, gameStatus: action.payload }
    
    case 'NEXT_TURN':
      const nextPlayer = state.currentPlayer === 'player1' ? 'player2' : 'player1'
      return {
        ...state,
        currentPlayer: nextPlayer,
        diceValue: null,
        players: {
          ...state.players,
          [state.currentPlayer]: {
            ...state.players[state.currentPlayer],
            isActive: false
          },
          [nextPlayer]: {
            ...state.players[nextPlayer],
            isActive: true
          }
        }
      }
    
    case 'RESET_GAME':
      return {
        ...initialState,
        gameMode: state.gameMode,
        roomId: state.roomId,
        isHost: state.isHost,
        players: {
          player1: {
            ...initialState.players.player1,
            name: state.players.player1.name,
            gender: state.players.player1.gender,
            avatar: state.players.player1.avatar
          },
          player2: {
            ...initialState.players.player2,
            name: state.players.player2.name,
            gender: state.players.player2.gender,
            avatar: state.players.player2.avatar
          }
        }
      }
    
    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  
  const value = {
    ...state,
    dispatch
  }
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
