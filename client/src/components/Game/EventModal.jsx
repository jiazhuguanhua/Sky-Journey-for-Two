import React from 'react'
import { motion } from 'framer-motion'
import './EventModal.css'

function EventModal({ event, onComplete }) {
  const getEventIcon = (type) => {
    return type === 'truth' ? '💭' : '🎭'
  }

  const getEventTitle = (type) => {
    return type === 'truth' ? '真心话时间' : '大冒险挑战'
  }

  const getEventColor = (type) => {
    return type === 'truth' ? 'var(--primary-blue)' : 'var(--primary-pink)'
  }

  return (
    <div className="event-modal-overlay">
      <motion.div 
        className="event-modal"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="event-header" style={{ backgroundColor: getEventColor(event.type) }}>
          <div className="event-icon">{getEventIcon(event.type)}</div>
          <h2>{getEventTitle(event.type)}</h2>
        </div>

        <div className="event-body">
          <div className="event-player">
            <p>挑战者：<span className="player-name">{event.player}</span></p>
          </div>

          <div className="event-content">
            <div className="event-text">
              {event.content}
            </div>
          </div>

          <div className="event-instructions">
            <p>
              {event.type === 'truth' 
                ? '诚实回答这个问题，让对方更了解你～' 
                : '勇敢接受挑战，为爱情加分！'
              }
            </p>
          </div>
        </div>

        <div className="event-actions">
          <motion.button
            className="btn btn-primary complete-btn"
            onClick={onComplete}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✅ 完成挑战
          </motion.button>
        </div>

        {/* 装饰性元素 */}
        <div className="event-decoration">
          {Array.from({ length: 6 }, (_, i) => (
            <motion.div
              key={i}
              className="floating-heart"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                y: [-10, 10, -10],
                rotate: [0, 360],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            >
              💕
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default EventModal
