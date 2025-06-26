import React from 'react'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'
import './VictoryModal.css'

function VictoryModal({ winner, players, onRestart }) {
  const winnerPlayer = players[winner]
  const loserPlayer = players[winner === 'player1' ? 'player2' : 'player1']

  return (
    <div className="victory-modal-overlay">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={200}
        gravity={0.1}
        colors={['#FF6B8A', '#4A90E2', '#FFD700', '#9B59B6', '#81C784']}
      />
      
      <motion.div 
        className="victory-modal"
        initial={{ scale: 0, opacity: 0, rotateY: -180 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 15,
          duration: 1 
        }}
      >
        <div className="victory-header">
          <motion.div 
            className="victory-icon"
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          >
            🏆
          </motion.div>
          <h1>恭喜获胜！</h1>
        </div>

        <div className="victory-content">
          <div className="winner-section">
            <motion.div 
              className="winner-avatar"
              style={{ backgroundColor: winnerPlayer?.color }}
              animate={{
                scale: [1, 1.2, 1],
                boxShadow: [
                  '0 0 20px rgba(255, 215, 0, 0.5)',
                  '0 0 40px rgba(255, 215, 0, 0.8)',
                  '0 0 20px rgba(255, 215, 0, 0.5)'
                ]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity
              }}
            >
              {winnerPlayer?.avatar}
            </motion.div>
            <h2>{winnerPlayer?.name}</h2>
            <p className="winner-text">在这场爱情飞行棋中获得胜利！</p>
          </div>

          <div className="celebration-text">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p>✨ 恭喜你成功抵达爱情的终点！</p>
              <p>💕 但这只是你们幸福旅程的开始...</p>
            </motion.div>
          </div>

          <div className="game-stats">
            <h3>游戏统计</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-icon">🎲</span>
                <span className="stat-label">总投掷次数</span>
                <span className="stat-value">-</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">💝</span>
                <span className="stat-label">触发事件</span>
                <span className="stat-value">-</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⏱️</span>
                <span className="stat-label">游戏时长</span>
                <span className="stat-value">-</span>
              </div>
            </div>
          </div>

          <div className="love-message">
            <div className="message-box">
              <h4>💌 爱情寄语</h4>
              <p>
                "在爱情的棋盘上，没有真正的输家。
                每一步都是你们共同的回忆，
                每一次相遇都是命运的安排。
                愿你们在现实中也能携手走向幸福的终点！"
              </p>
            </div>
          </div>
        </div>

        <div className="victory-actions">
          <motion.button
            className="btn btn-primary restart-btn"
            onClick={onRestart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎮 再来一局
          </motion.button>
        </div>

        {/* 装饰性效果 */}
        <div className="victory-decoration">
          {Array.from({ length: 12 }, (_, i) => (
            <motion.div
              key={i}
              className="floating-element"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                y: [-20, 20, -20],
                rotate: [0, 360],
                scale: [0.8, 1.2, 0.8],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            >
              {['💕', '✨', '🌟', '💖', '🎉'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>

        {/* 金色粒子效果 */}
        <div className="golden-particles">
          {Array.from({ length: 20 }, (_, i) => (
            <motion.div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`
              }}
              animate={{
                y: [-10, -100],
                opacity: [1, 0],
                scale: [1, 0]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default VictoryModal
