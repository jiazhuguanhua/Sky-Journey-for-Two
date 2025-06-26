import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../../contexts/GameContext'
import './DiceComponent.css'

function DiceComponent({ onRoll, disabled }) {
  const { diceValue, isRolling, currentPlayer, players } = useGame()
  const [lastRoll, setLastRoll] = useState(null)

  const dicefaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

  const handleRoll = () => {
    if (disabled || isRolling) return
    
    setLastRoll(diceValue)
    onRoll()
  }

  const currentPlayerInfo = players[currentPlayer]

  return (
    <div className="dice-container">
      <div className="current-player-info">
        <div className="player-avatar" style={{ backgroundColor: currentPlayerInfo?.color }}>
          {currentPlayerInfo?.avatar}
        </div>
        <div className="player-details">
          <h3>{currentPlayerInfo?.name || '玩家'}</h3>
          <p>轮到你了！</p>
        </div>
      </div>

      <motion.div 
        className={`dice ${isRolling ? 'rolling' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleRoll}
        whileHover={!disabled && !isRolling ? { scale: 1.05 } : {}}
        whileTap={!disabled && !isRolling ? { scale: 0.95 } : {}}
        animate={isRolling ? {
          rotateX: [0, 360, 720],
          rotateY: [0, 360, 720],
          scale: [1, 1.2, 1]
        } : {}}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        <div className="dice-face">
          {isRolling ? '🎲' : (diceValue ? dicefaces[diceValue - 1] : '🎲')}
        </div>
        
        {diceValue && !isRolling && (
          <motion.div 
            className="dice-number"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {diceValue}
          </motion.div>
        )}
      </motion.div>

      <button 
        className={`roll-button btn ${disabled || isRolling ? 'btn-disabled' : 'btn-primary'}`}
        onClick={handleRoll}
        disabled={disabled || isRolling}
      >
        {isRolling ? (
          <>
            <div className="loading" />
            投掷中...
          </>
        ) : (
          <>
            🎲 掷骰子
          </>
        )}
      </button>

      {lastRoll && diceValue !== lastRoll && (
        <div className="roll-history">
          <p>上次投掷: {lastRoll}</p>
        </div>
      )}

      <div className="dice-instructions">
        <p>点击骰子或按钮投掷</p>
        <p>获得 1-6 点数移动棋子</p>
      </div>
    </div>
  )
}

export default DiceComponent
