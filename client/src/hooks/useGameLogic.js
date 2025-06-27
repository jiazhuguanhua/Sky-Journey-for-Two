import { useEffect } from 'react'
import { useGame } from '../context/GameContext'
import { useAudio } from '../context/AudioContext'

export const useGameLogic = () => {
  const { state, dispatch } = useGame()
  const audioManager = useAudio()

  // 任务倒计时
  useEffect(() => {
    if (state.isTaskActive && state.isTimerStarted && state.taskTimeLeft > 0 && state.currentTask?.category === 'dare') {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_TASK_TIME_LEFT', payload: state.taskTimeLeft - 1 })
      }, 1000)
      return () => clearTimeout(timer)
    } else if (state.taskTimeLeft === 0 && state.isTaskActive && state.isTimerStarted && state.currentTask?.category === 'dare') {
      dispatch({ type: 'SET_SHOW_TIMER_ANIMATION', payload: true })
      setTimeout(() => {
        dispatch({ type: 'SET_SHOW_TIMER_ANIMATION', payload: false })
        dispatch({ type: 'SET_IS_TASK_ACTIVE', payload: false })
        dispatch({ type: 'SET_CURRENT_TASK', payload: null })
        dispatch({ type: 'SET_IS_TIMER_STARTED', payload: false })
        switchPlayer()
      }, 2000)
    }
  }, [state.taskTimeLeft, state.isTaskActive, state.isTimerStarted, state.currentTask])

  // 检查任务格
  useEffect(() => {
    if (state.justMoved && !state.isTaskActive && !state.currentTask && !state.gameState.winner) {
      const currentPlayerKey = state.gameState.currentPlayer
      const currentPos = state.players[currentPlayerKey]?.position
      const targetPosition = state.boardPositions[currentPos]
      
      if (targetPosition && targetPosition.hasTask && state.gameState.boardTasks?.[currentPos]) {
        dispatch({ type: 'SET_SHOW_TASK_CONGRATS', payload: true })
        setTimeout(() => {
          dispatch({ type: 'SET_SHOW_TASK_CONGRATS', payload: false })
          dispatch({ type: 'SET_SHOW_TASK_TYPE_SELECT', payload: true })
        }, 1200)
      }
      
      dispatch({ type: 'SET_JUST_MOVED', payload: false })
    }
  }, [state.justMoved, state.players, state.gameState, state.isTaskActive, state.currentTask, state.boardPositions])

  const rollDice = () => {
    if (!state.gameState.canRoll || state.gameState.isRolling) return
    
    audioManager.playDiceSound()
    dispatch({ type: 'UPDATE_GAME_STATE', payload: { isRolling: true, canRoll: false } })
    
    let rollCount = 0
    const rollInterval = setInterval(() => {
      const newValue = Math.floor(Math.random() * 6) + 1
      dispatch({ type: 'UPDATE_GAME_STATE', payload: { diceValue: newValue } })
      rollCount++
      
      if (rollCount >= 10) {
        clearInterval(rollInterval)
        const finalValue = Math.floor(Math.random() * 6) + 1
        
        setTimeout(() => {
          dispatch({ type: 'UPDATE_GAME_STATE', payload: { isRolling: false, diceValue: finalValue } })
          movePlayer(finalValue)
        }, 200)
      }
    }, 100)
  }

  const movePlayer = (steps) => {
    const currentPlayerKey = state.gameState.currentPlayer
    const currentPos = state.players[currentPlayerKey].position
    const finalPos = Math.min(currentPos + steps, state.gameState.totalPositions - 1)
    
    audioManager.playButtonSound()
    
    let currentStep = 0
    const moveInterval = setInterval(() => {
      if (currentStep >= steps || currentPos + currentStep >= state.gameState.totalPositions - 1) {
        clearInterval(moveInterval)
        
        dispatch({ 
          type: 'UPDATE_PLAYERS', 
          payload: { 
            [currentPlayerKey]: { ...state.players[currentPlayerKey], position: finalPos } 
          } 
        })
        
        if (finalPos >= state.gameState.totalPositions - 1) {
          dispatch({ type: 'UPDATE_GAME_STATE', payload: { winner: currentPlayerKey } })
          dispatch({ type: 'SET_GAME_PHASE', payload: 'finished' })
          return
        }
        
        dispatch({ type: 'SET_JUST_MOVED', payload: true })
        
        const targetPosition = state.boardPositions[finalPos]
        if (!targetPosition || !targetPosition.hasTask) {
          setTimeout(() => {
            switchPlayer()
          }, 300)
        }
        return
      }
      
      currentStep++
      const nextPos = Math.min(currentPos + currentStep, state.gameState.totalPositions - 1)
      dispatch({ 
        type: 'UPDATE_PLAYERS', 
        payload: { 
          [currentPlayerKey]: { ...state.players[currentPlayerKey], position: nextPos } 
        } 
      })
      
      audioManager.playButtonSound()
    }, 400)
  }

  const switchPlayer = () => {
    dispatch({ 
      type: 'UPDATE_GAME_STATE', 
      payload: {
        currentPlayer: state.gameState.currentPlayer === 'player1' ? 'player2' : 'player1',
        turn: state.gameState.turn + 1,
        canRoll: true,
        selectedTaskCategory: null
      }
    })
  }

  const selectTaskCategory = (category) => {
    audioManager.playButtonSound()
    dispatch({ 
      type: 'UPDATE_GAME_STATE', 
      payload: { selectedTaskCategory: category } 
    })
    dispatch({ type: 'SET_SHOW_TASK_TYPE_SELECT', payload: false })
    
    const currentPlayerKey = state.gameState.currentPlayer
    const currentPos = state.players[currentPlayerKey].position
    const cellTasks = state.gameState.boardTasks[currentPos]
    
    if (cellTasks) {
      const taskText = cellTasks[category]
      
      dispatch({ 
        type: 'SET_CURRENT_TASK', 
        payload: {
          text: taskText,
          category: category,
          duration: 60
        }
      })
      dispatch({ type: 'SET_TASK_TIME_LEFT', payload: category === 'dare' ? 60 : 0 })
      dispatch({ type: 'SET_IS_TASK_ACTIVE', payload: true })
      dispatch({ type: 'SET_IS_TIMER_STARTED', payload: false })
    }
  }

  const startTimer = () => {
    if (state.currentTask?.category === 'dare') {
      audioManager.playButtonSound()
      dispatch({ type: 'SET_IS_TIMER_STARTED', payload: true })
    }
  }

  const completeTask = () => {
    audioManager.playButtonSound()
    dispatch({ type: 'SET_SHOW_COMPLETE_ANIMATION', payload: true })
    setTimeout(() => {
      dispatch({ type: 'SET_SHOW_COMPLETE_ANIMATION', payload: false })
      dispatch({ type: 'SET_IS_TASK_ACTIVE', payload: false })
      dispatch({ type: 'SET_CURRENT_TASK', payload: null })
      dispatch({ type: 'SET_IS_TIMER_STARTED', payload: false })
      switchPlayer()
    }, 1500)
  }

  const drinkAndSkip = () => {
    audioManager.playDiceSound()
    dispatch({ type: 'SET_SHOW_SKIP_ANIMATION', payload: true })
    setTimeout(() => {
      dispatch({ type: 'SET_SHOW_SKIP_ANIMATION', payload: false })
      dispatch({ type: 'SET_IS_TASK_ACTIVE', payload: false })
      dispatch({ type: 'SET_CURRENT_TASK', payload: null })
      dispatch({ type: 'SET_IS_TIMER_STARTED', payload: false })
      switchPlayer()
    }, 1500)
  }

  const changeTask = () => {
    // TODO: 实现换任务逻辑
    audioManager.playButtonSound()
  }

  return {
    rollDice,
    movePlayer,
    switchPlayer,
    selectTaskCategory,
    startTimer,
    completeTask,
    drinkAndSkip,
    changeTask
  }
}
