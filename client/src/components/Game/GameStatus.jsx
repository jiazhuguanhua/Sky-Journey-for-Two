import React from 'react'
import { useGame } from '../../contexts/GameContext'
import './GameStatus.css'

function GameStatus() {
  const { gameStatus, gameMode, roomId, currentPlayer, players } = useGame()

  const getStatusText = () => {
    switch (gameStatus) {
      case 'waiting':
        return gameMode === 'online' ? '等待玩家加入...' : '准备开始游戏'
      case 'playing':
        return '游戏进行中'
      case 'finished':
        return '游戏结束'
      default:
        return '未知状态'
    }
  }

  const getStatusColor = () => {
    switch (gameStatus) {
      case 'waiting':
        return 'var(--accent-gold)'
      case 'playing':
        return 'var(--primary-blue)'
      case 'finished':
        return 'var(--primary-pink)'
      default:
        return 'var(--text-secondary)'
    }
  }

  return (
    <div className="game-status">
      <div className="status-row">
        <div className="status-item">
          <span className="status-label">状态:</span>
          <span 
            className="status-value"
            style={{ color: getStatusColor() }}
          >
            {getStatusText()}
          </span>
          <div 
            className="status-indicator"
            style={{ backgroundColor: getStatusColor() }}
          />
        </div>

        <div className="status-item">
          <span className="status-label">模式:</span>
          <span className="status-value">
            {gameMode === 'offline' ? '📱 本地对战' : '🌐 在线对战'}
          </span>
        </div>

        {roomId && (
          <div className="status-item">
            <span className="status-label">房间:</span>
            <span className="status-value room-id">{roomId}</span>
          </div>
        )}
      </div>

      {gameStatus === 'playing' && (
        <div className="current-turn">
          <span className="turn-label">当前回合:</span>
          <div className="turn-player">
            <div 
              className="turn-avatar"
              style={{ backgroundColor: players[currentPlayer]?.color }}
            >
              {players[currentPlayer]?.avatar}
            </div>
            <span className="turn-name">{players[currentPlayer]?.name}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameStatus
