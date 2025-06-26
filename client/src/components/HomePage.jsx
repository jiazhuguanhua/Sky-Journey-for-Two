import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { useSocket } from '../contexts/SocketContext'
import PlayerSetup from './PlayerSetup'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  const { dispatch } = useGame()
  const { createRoom, joinRoom } = useSocket()
  const [showSetup, setShowSetup] = useState(false)
  const [gameMode, setGameMode] = useState(null)
  const [roomId, setRoomId] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  const handleModeSelect = (mode) => {
    setGameMode(mode)
    dispatch({ type: 'SET_GAME_MODE', payload: mode })
    setShowSetup(true)
  }

  const handlePlayerSetupComplete = (players) => {
    dispatch({ type: 'UPDATE_PLAYER', playerId: 'player1', payload: players.player1 })
    dispatch({ type: 'UPDATE_PLAYER', playerId: 'player2', payload: players.player2 })

    if (gameMode === 'offline') {
      // 离线模式直接进入游戏
      dispatch({ type: 'SET_GAME_STATUS', payload: 'playing' })
      navigate('/game')
    } else {
      // 在线模式创建房间
      createRoom(players.player1)
    }
  }

  const handleJoinRoom = () => {
    if (!roomId.trim()) return
    setIsJoining(true)
    // 这里应该先验证房间是否存在，简化处理直接进入设置
    setGameMode('online')
    dispatch({ type: 'SET_GAME_MODE', payload: 'online' })
    setShowSetup(true)
  }

  const FloatingHearts = () => (
    <div className="floating-hearts">
      {Array.from({ length: 15 }, (_, i) => (
        <div
          key={i}
          className="heart"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            fontSize: `${Math.random() * 10 + 15}px`
          }}
        >
          💕
        </div>
      ))}
    </div>
  )

  if (showSetup) {
    return (
      <PlayerSetup
        gameMode={gameMode}
        onComplete={handlePlayerSetupComplete}
        onBack={() => setShowSetup(false)}
        roomId={roomId}
      />
    )
  }

  return (
    <div className="home-page">
      <FloatingHearts />
      
      <div className="container">
        <header className="home-header">
          <div className="logo">
            <span className="logo-icon">🛩️</span>
            <h1 className="logo-text gradient-text">Sky Journey for Two</h1>
            <span className="logo-icon">💕</span>
          </div>
          <p className="subtitle">专属情侣的浪漫飞行棋游戏</p>
        </header>

        <main className="home-main">
          <div className="game-modes">
            <div className="mode-card card" onClick={() => handleModeSelect('offline')}>
              <div className="mode-icon">📱</div>
              <h3>本地对战</h3>
              <p>在同一设备上与TA一起游戏</p>
              <div className="mode-features">
                <span>🎮 即时开始</span>
                <span>💝 亲密互动</span>
                <span>🎯 简单快捷</span>
              </div>
            </div>

            <div className="mode-card card" onClick={() => handleModeSelect('online')}>
              <div className="mode-icon">🌐</div>
              <h3>在线对战</h3>
              <p>跨设备与远方的TA实时游戏</p>
              <div className="mode-features">
                <span>📱 跨设备</span>
                <span>🔗 实时连接</span>
                <span>💌 远程陪伴</span>
              </div>
            </div>
          </div>

          <div className="join-room-section">
            <div className="divider">
              <span>或者</span>
            </div>
            
            <div className="join-room card">
              <h3>加入房间</h3>
              <div className="join-room-form">
                <input
                  type="text"
                  placeholder="输入房间号"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="room-input"
                />
                <button
                  className="btn btn-primary"
                  onClick={handleJoinRoom}
                  disabled={!roomId.trim() || isJoining}
                >
                  {isJoining ? <div className="loading" /> : '加入游戏'}
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="home-footer">
          <div className="features-preview">
            <div className="feature">
              <span className="feature-icon">🎲</span>
              <span>掷骰子移动</span>
            </div>
            <div className="feature">
              <span className="feature-icon">💭</span>
              <span>真心话大冒险</span>
            </div>
            <div className="feature">
              <span className="feature-icon">⏰</span>
              <span>终极挑战</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🏆</span>
              <span>胜利庆祝</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default HomePage
