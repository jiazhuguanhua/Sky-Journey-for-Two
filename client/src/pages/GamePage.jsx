import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useGameLogic } from '../hooks/useGameLogic'
import GameBoard from '../components/GameBoard'
import PlayerSetup from '../components/PlayerSetup'
import VictoryPage from '../components/VictoryPage'
import TaskModal from '../components/TaskModal'
import AnimationOverlays from '../components/AnimationOverlays'
import '../styles/GamePage.css'

const GamePage = () => {
  const { state } = useGame()
  const navigate = useNavigate()
  
  // 如果没有选择任务类型，回到首页
  React.useEffect(() => {
    if (!state.selectedTaskType) {
      navigate('/')
    }
  }, [state.selectedTaskType, navigate])

  const renderGamePhase = () => {
    switch (state.gamePhase) {
      case 'setup':
        return <PlayerSetup />
      case 'playing':
        return <GameBoard />
      case 'finished':
        return <VictoryPage />
      default:
        return <PlayerSetup />
    }
  }

  return (
    <div className="game-page">
      {renderGamePhase()}
      
      {/* 任务弹窗 */}
      {state.isTaskActive && <TaskModal />}
      
      {/* 动画覆盖层 */}
      <AnimationOverlays />
    </div>
  )
}

export default GamePage
