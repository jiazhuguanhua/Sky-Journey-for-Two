import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './ChallengeModal.css'

function ChallengeModal({ challenge, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(60)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    let interval = null
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // 时间到，挑战失败
      onComplete(false)
    }
    
    return () => clearInterval(interval)
  }, [isActive, timeLeft, onComplete])

  const handleSuccess = () => {
    setIsActive(false)
    onComplete(true)
  }

  const handleFail = () => {
    setIsActive(false)
    onComplete(false)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (timeLeft > 30) return 'var(--primary-blue)'
    if (timeLeft > 10) return 'var(--accent-gold)'
    return 'var(--primary-pink)'
  }

  return (
    <div className="challenge-modal-overlay">
      <motion.div 
        className="challenge-modal"
        initial={{ scale: 0, opacity: 0, rotateY: -90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        exit={{ scale: 0, opacity: 0, rotateY: 90 }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
      >
        <div className="challenge-header">
          <div className="challenge-icon">⚡</div>
          <h2>终极挑战</h2>
          <div className="challenge-subtitle">落后者的逆转机会</div>
        </div>

        <div className="timer-section">
          <motion.div 
            className="timer-circle"
            style={{ borderColor: getTimerColor() }}
            animate={{
              scale: timeLeft <= 10 ? [1, 1.1, 1] : 1,
              rotate: timeLeft <= 10 ? [0, 5, -5, 0] : 0
            }}
            transition={{
              duration: 1,
              repeat: timeLeft <= 10 ? Infinity : 0
            }}
          >
            <div className="timer-text" style={{ color: getTimerColor() }}>
              {formatTime(timeLeft)}
            </div>
            <div className="timer-label">剩余时间</div>
          </motion.div>
          
          <motion.div 
            className="timer-progress"
            style={{
              background: `conic-gradient(${getTimerColor()} ${(60 - timeLeft) * 6}deg, rgba(255,255,255,0.2) 0deg)`
            }}
          />
        </div>

        <div className="challenge-body">
          <div className="challenge-content">
            <div className="challenge-text">
              {challenge?.content || "在剩余时间内完成你们的专属挑战，证明你们的默契！"}
            </div>
          </div>

          <div className="challenge-instructions">
            <div className="instruction-item">
              <span className="instruction-icon">🎯</span>
              <span>在倒计时结束前完成挑战</span>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">💕</span>
              <span>成功完成可以继续游戏</span>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">⏰</span>
              <span>时间到或失败则对手获胜</span>
            </div>
          </div>
        </div>

        <div className="challenge-actions">
          <motion.button
            className="btn btn-success"
            onClick={handleSuccess}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!isActive}
          >
            ✅ 挑战成功
          </motion.button>
          
          <motion.button
            className="btn btn-fail"
            onClick={handleFail}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!isActive}
          >
            ❌ 挑战失败
          </motion.button>
        </div>

        {/* 紧急状态效果 */}
        {timeLeft <= 10 && (
          <div className="emergency-overlay">
            <motion.div
              className="emergency-flash"
              animate={{
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity
              }}
            />
          </div>
        )}

        {/* 装饰性效果 */}
        <div className="challenge-decoration">
          {Array.from({ length: 8 }, (_, i) => (
            <motion.div
              key={i}
              className="floating-spark"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 360],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            >
              ⚡
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default ChallengeModal
