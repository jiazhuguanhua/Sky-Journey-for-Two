import React from 'react'
import './PlayerInfo.css'

function PlayerInfo({ player, isActive }) {
  return (
    <div className={`player-info ${isActive ? 'active' : ''}`}>
      <div className="player-avatar" style={{ backgroundColor: player.color }}>
        {player.avatar}
      </div>
      
      <div className="player-details">
        <h3 className="player-name">{player.name}</h3>
        <div className="player-position">
          位置: <span className="position-number">{player.position}</span>
        </div>
        
        {isActive && (
          <div className="active-indicator">
            <span className="indicator-dot"></span>
            当前回合
          </div>
        )}
      </div>
      
      {isActive && (
        <div className="player-glow"></div>
      )}
    </div>
  )
}

export default PlayerInfo
