import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { useSocket } from '../contexts/SocketContext'
import GameBoard from './GameBoard/GameBoard'
import DiceComponent from './Game/DiceComponent'
import EventModal from './Game/EventModal'
import ChallengeModal from './Game/ChallengeModal'
import VictoryModal from './Game/VictoryModal'
import PlayerInfo from './Game/PlayerInfo'
import GameStatus from './Game/GameStatus'
import './GameContainer.css'

function GameContainer() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { 
    gameStatus, 
    currentPlayer, 
    players, 
    currentEvent, 
    ultimateChallenge, 
    winner,
    showVictory,
    gameMode,
    dispatch 
  } = useGame()
  
  const { rollDiceOffline } = useSocket()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 检查游戏状态
    if (!gameMode) {
      navigate('/')
      return
    }

    if (roomId && gameMode === 'online') {
      dispatch({ type: 'SET_ROOM_ID', payload: roomId })
    }

    setIsLoading(false)
  }, [gameMode, roomId, navigate, dispatch])

  useEffect(() => {
    // 如果是离线模式，设置第一个玩家为活跃状态
    if (gameMode === 'offline' && gameStatus === 'playing') {
      dispatch({ 
        type: 'UPDATE_PLAYER', 
        playerId: 'player1', 
        payload: { isActive: true } 
      })
    }
  }, [gameMode, gameStatus, dispatch])

  const handleDiceRoll = () => {
    if (gameMode === 'offline') {
      rollDiceOffline()
    } else {
      // 在线模式通过 Socket 处理
      // socket.emit('roll-dice')
    }
  }

  const handleEventComplete = () => {
    dispatch({ type: 'CLEAR_EVENT' })
    // 检查是否需要切换回合
    setTimeout(() => {
      dispatch({ type: 'NEXT_TURN' })
    }, 500)
  }

  const handleChallengeComplete = (success) => {
    dispatch({ type: 'CLEAR_CHALLENGE' })
    if (success) {
      // 挑战成功，游戏继续
      dispatch({ type: 'NEXT_TURN' })
    } else {
      // 挑战失败，对手获胜
      const opponent = currentPlayer === 'player1' ? 'player2' : 'player1'
      dispatch({ type: 'SET_WINNER', payload: opponent })
    }
  }

  const handleRestart = () => {
    dispatch({ type: 'RESET_GAME' })
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="game-loading">
        <div className="loading-spinner"></div>
        <p>加载游戏中...</p>
      </div>
    )
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-info">
          <h1>Sky Journey for Two</h1>
          <GameStatus />
        </div>
        
        <div className="players-info">
          <PlayerInfo player={players.player1} isActive={currentPlayer === 'player1'} />
          <PlayerInfo player={players.player2} isActive={currentPlayer === 'player2'} />
        </div>
      </div>

      <div className="game-main">
        <div className="board-container">
          <GameBoard />
        </div>

        <div className="game-controls">
          <DiceComponent 
            onRoll={handleDiceRoll}
            disabled={gameStatus !== 'playing'}
          />
        </div>
      </div>

      {/* 模态框 */}
      {currentEvent && (
        <EventModal 
          event={currentEvent}
          onComplete={handleEventComplete}
        />
      )}

      {ultimateChallenge && (
        <ChallengeModal
          challenge={ultimateChallenge}
          onComplete={handleChallengeComplete}
        />
      )}

      {showVictory && winner && (
        <VictoryModal
          winner={winner}
          players={players}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}

export default GameContainer
