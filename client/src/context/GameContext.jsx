import React, { createContext, useContext, useReducer } from 'react'
import { TASK_LIBRARIES } from '../data/taskLibrary'
import { createBoardPositions, assignTaskCells } from '../utils/gameUtils'

const GameContext = createContext()

const initialState = {
  gamePhase: 'home', // home, setup, playing, finished
  selectedTaskType: 'couple',
  taskRatio: 0.3,
  players: {
    player1: { name: '', avatar: '🤴', position: 0, color: '#FF6B9D' },
    player2: { name: '', avatar: '👸', position: 0, color: '#4ECDC4' }
  },
  gameState: {
    currentPlayer: 'player1',
    diceValue: null,
    isRolling: false,
    canRoll: true,
    winner: null,
    turn: 0,
    totalPositions: 40,
    selectedTaskCategory: null,
    boardTasks: null
  },
  boardPositions: createBoardPositions(0.3, 40),
  currentTask: null,
  taskTimeLeft: 0,
  isTaskActive: false,
  isTimerStarted: false,
  showTimerAnimation: false,
  showCompleteAnimation: false,
  showSkipAnimation: false,
  selectedCell: null,
  showTaskCongrats: false,
  showTaskTypeSelect: false,
  justMoved: false
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_GAME_PHASE':
      return { ...state, gamePhase: action.payload }
    
    case 'SET_SELECTED_TASK_TYPE':
      return { ...state, selectedTaskType: action.payload }
    
    case 'SET_TASK_RATIO':
      return { ...state, taskRatio: action.payload }
    
    case 'UPDATE_PLAYERS':
      return { ...state, players: { ...state.players, ...action.payload } }
    
    case 'UPDATE_GAME_STATE':
      return { ...state, gameState: { ...state.gameState, ...action.payload } }
    
    case 'SET_BOARD_POSITIONS':
      return { ...state, boardPositions: action.payload }
    
    case 'INITIALIZE_BOARD':
      const positions = createBoardPositions(state.taskRatio, 40)
      const positionsWithTasks = assignTaskCells(positions, state.taskRatio)
      const tasks = {}
      
      positionsWithTasks.forEach(position => {
        if (position.hasTask) {
          const truthTasks = TASK_LIBRARIES[state.selectedTaskType].tasks.truth
          const dareTasks = TASK_LIBRARIES[state.selectedTaskType].tasks.dare
          tasks[position.id] = {
            truth: truthTasks[Math.floor(Math.random() * truthTasks.length)],
            dare: dareTasks[Math.floor(Math.random() * dareTasks.length)]
          }
        }
      })
      
      return {
        ...state,
        boardPositions: positionsWithTasks,
        gameState: { ...state.gameState, boardTasks: tasks }
      }
    
    case 'SET_CURRENT_TASK':
      return { ...state, currentTask: action.payload }
    
    case 'SET_TASK_TIME_LEFT':
      return { ...state, taskTimeLeft: action.payload }
    
    case 'SET_IS_TASK_ACTIVE':
      return { ...state, isTaskActive: action.payload }
    
    case 'SET_IS_TIMER_STARTED':
      return { ...state, isTimerStarted: action.payload }
    
    case 'SET_SHOW_TIMER_ANIMATION':
      return { ...state, showTimerAnimation: action.payload }
    
    case 'SET_SHOW_COMPLETE_ANIMATION':
      return { ...state, showCompleteAnimation: action.payload }
    
    case 'SET_SHOW_SKIP_ANIMATION':
      return { ...state, showSkipAnimation: action.payload }
    
    case 'SET_SELECTED_CELL':
      return { ...state, selectedCell: action.payload }
    
    case 'SET_SHOW_TASK_CONGRATS':
      return { ...state, showTaskCongrats: action.payload }
    
    case 'SET_SHOW_TASK_TYPE_SELECT':
      return { ...state, showTaskTypeSelect: action.payload }
    
    case 'SET_JUST_MOVED':
      return { ...state, justMoved: action.payload }
    
    case 'RESET_GAME':
      return {
        ...initialState,
        selectedTaskType: state.selectedTaskType,
        taskRatio: state.taskRatio
      }
    
    default:
      return state
  }
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}
