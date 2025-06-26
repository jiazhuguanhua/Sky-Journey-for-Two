import React, { useState } from 'react'
import { useSocket } from '../contexts/SocketContext'
import './PlayerSetup.css'

function PlayerSetup({ gameMode, onComplete, onBack, roomId }) {
  const { joinRoom } = useSocket()
  const [players, setPlayers] = useState({
    player1: {
      name: '',
      gender: 'male',
      avatar: '👨'
    },
    player2: {
      name: '',
      gender: 'female',
      avatar: '👩'
    }
  })

  const avatarOptions = {
    male: ['👨', '🧑', '👨‍💼', '👨‍🎓', '👨‍💻', '🤵', '👨‍🎨', '👨‍🔬'],
    female: ['👩', '👩‍💼', '👩‍🎓', '👩‍💻', '👰', '👩‍🎨', '👩‍🔬', '👸']
  }

  const handlePlayerUpdate = (playerId, field, value) => {
    setPlayers(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value,
        ...(field === 'gender' && { avatar: avatarOptions[value][0] })
      }
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!players.player1.name.trim() || (gameMode === 'offline' && !players.player2.name.trim())) {
      alert('请输入玩家昵称')
      return
    }

    if (gameMode === 'online' && roomId) {
      // 加入现有房间
      joinRoom(roomId, players.player1)
    } else {
      // 创建新游戏或离线游戏
      onComplete(players)
    }
  }

  return (
    <div className="player-setup">
      <div className="container">
        <div className="setup-header">
          <button className="back-btn" onClick={onBack}>
            ← 返回
          </button>
          <h2>角色设置</h2>
          <div className="mode-badge">
            {gameMode === 'offline' ? '📱 本地对战' : '🌐 在线对战'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          {/* Player 1 Setup */}
          <div className="player-card card">
            <div className="player-header">
              <h3>玩家 1 {gameMode === 'online' && '(你)'}</h3>
              <div className="player-avatar-display">
                {players.player1.avatar}
              </div>
            </div>

            <div className="form-group">
              <label>昵称</label>
              <input
                type="text"
                value={players.player1.name}
                onChange={(e) => handlePlayerUpdate('player1', 'name', e.target.value)}
                placeholder="输入你的昵称"
                maxLength={10}
                required
              />
            </div>

            <div className="form-group">
              <label>性别</label>
              <div className="gender-options">
                <button
                  type="button"
                  className={`gender-btn ${players.player1.gender === 'male' ? 'active' : ''}`}
                  onClick={() => handlePlayerUpdate('player1', 'gender', 'male')}
                >
                  👨 男生
                </button>
                <button
                  type="button"
                  className={`gender-btn ${players.player1.gender === 'female' ? 'active' : ''}`}
                  onClick={() => handlePlayerUpdate('player1', 'gender', 'female')}
                >
                  👩 女生
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>头像</label>
              <div className="avatar-grid">
                {avatarOptions[players.player1.gender].map(avatar => (
                  <button
                    key={avatar}
                    type="button"
                    className={`avatar-btn ${players.player1.avatar === avatar ? 'active' : ''}`}
                    onClick={() => handlePlayerUpdate('player1', 'avatar', avatar)}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Player 2 Setup (仅离线模式) */}
          {gameMode === 'offline' && (
            <div className="player-card card">
              <div className="player-header">
                <h3>玩家 2</h3>
                <div className="player-avatar-display">
                  {players.player2.avatar}
                </div>
              </div>

              <div className="form-group">
                <label>昵称</label>
                <input
                  type="text"
                  value={players.player2.name}
                  onChange={(e) => handlePlayerUpdate('player2', 'name', e.target.value)}
                  placeholder="输入TA的昵称"
                  maxLength={10}
                  required
                />
              </div>

              <div className="form-group">
                <label>性别</label>
                <div className="gender-options">
                  <button
                    type="button"
                    className={`gender-btn ${players.player2.gender === 'male' ? 'active' : ''}`}
                    onClick={() => handlePlayerUpdate('player2', 'gender', 'male')}
                  >
                    👨 男生
                  </button>
                  <button
                    type="button"
                    className={`gender-btn ${players.player2.gender === 'female' ? 'active' : ''}`}
                    onClick={() => handlePlayerUpdate('player2', 'gender', 'female')}
                  >
                    👩 女生
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>头像</label>
                <div className="avatar-grid">
                  {avatarOptions[players.player2.gender].map(avatar => (
                    <button
                      key={avatar}
                      type="button"
                      className={`avatar-btn ${players.player2.avatar === avatar ? 'active' : ''}`}
                      onClick={() => handlePlayerUpdate('player2', 'avatar', avatar)}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {gameMode === 'online' && roomId && (
            <div className="room-info card">
              <h3>房间信息</h3>
              <p>房间号: <strong>{roomId}</strong></p>
              <p>等待对方玩家加入...</p>
            </div>
          )}

          <div className="setup-actions">
            <button type="submit" className="btn btn-primary">
              {gameMode === 'offline' ? '开始游戏' : (roomId ? '加入房间' : '创建房间')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PlayerSetup
