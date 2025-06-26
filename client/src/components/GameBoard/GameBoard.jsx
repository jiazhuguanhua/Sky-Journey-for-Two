import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../../contexts/GameContext'
import './GameBoard.css'

function GameBoard() {
  const { players, boardSize, eventPositions, diceValue, currentPlayer, dispatch } = useGame()
  const [animatingPlayer, setAnimatingPlayer] = useState(null)

  // 生成棋盘路径
  const generateBoardPath = () => {
    const path = []
    const cols = 6
    const rows = Math.ceil(boardSize / cols)
    
    for (let row = 0; row < rows; row++) {
      if (row % 2 === 0) {
        // 从左到右
        for (let col = 0; col < cols && path.length < boardSize; col++) {
          path.push({ row, col, index: path.length })
        }
      } else {
        // 从右到左
        for (let col = cols - 1; col >= 0 && path.length < boardSize; col--) {
          path.push({ row, col, index: path.length })
        }
      }
    }
    
    return path
  }

  const boardPath = generateBoardPath()

  // 处理棋子移动
  useEffect(() => {
    if (diceValue && currentPlayer) {
      setAnimatingPlayer(currentPlayer)
      
      // 移动棋子
      setTimeout(() => {
        dispatch({
          type: 'MOVE_PLAYER',
          playerId: currentPlayer,
          steps: diceValue
        })
        
        // 检查是否到达终点
        const newPosition = Math.min(players[currentPlayer].position + diceValue, boardSize - 1)
        if (newPosition === boardSize - 1) {
          setTimeout(() => {
            dispatch({ type: 'SET_WINNER', payload: currentPlayer })
          }, 1000)
          return
        }
        
        // 检查是否触发事件
        if (eventPositions.includes(newPosition)) {
          setTimeout(() => {
            triggerRandomEvent()
          }, 1000)
        } else {
          // 正常切换回合
          setTimeout(() => {
            dispatch({ type: 'NEXT_TURN' })
          }, 1000)
        }
        
        setAnimatingPlayer(null)
      }, 1000)
    }
  }, [diceValue, currentPlayer, dispatch, players, boardSize, eventPositions])

  const triggerRandomEvent = () => {
    const eventTypes = ['truth', 'dare']
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    
    const events = {
      truth: [
        "说出你最喜欢对方的三个特质",
        "分享一个只有对方知道的小秘密",
        "说出你们第一次见面时的感受",
        "描述你理想中的约会场景",
        "说出你最感谢对方为你做的一件事"
      ],
      dare: [
        "给对方一个温暖的拥抱",
        "说一句最想对对方说的话",
        "模仿对方最可爱的表情",
        "为对方唱一首歌",
        "计划下次约会的地点和活动"
      ]
    }
    
    const randomEvent = events[eventType][Math.floor(Math.random() * events[eventType].length)]
    
    dispatch({
      type: 'SET_EVENT',
      payload: {
        type: eventType,
        content: randomEvent,
        player: currentPlayer
      }
    })
  }

  const getGridPosition = (position) => {
    if (position >= boardPath.length) position = boardPath.length - 1
    const cell = boardPath[position]
    return {
      gridColumn: cell.col + 1,
      gridRow: cell.row + 1
    }
  }

  const getCellType = (index) => {
    if (index === 0) return 'start'
    if (index === boardSize - 1) return 'end'
    if (eventPositions.includes(index)) return 'event'
    return 'normal'
  }

  const getCellEmoji = (type) => {
    switch (type) {
      case 'start': return '🚀'
      case 'end': return '🏆'
      case 'event': return '💝'
      default: return ''
    }
  }

  return (
    <div className="game-board">
      <div className="board-grid" style={{ 
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridTemplateRows: `repeat(${Math.ceil(boardSize / 6)}, 1fr)`
      }}>
        {boardPath.map((cell, index) => {
          const cellType = getCellType(index)
          const playersOnCell = Object.entries(players).filter(
            ([_, player]) => player.position === index
          )
          
          return (
            <div 
              key={index} 
              className={`board-cell ${cellType}`}
              style={{ gridColumn: cell.col + 1, gridRow: cell.row + 1 }}
            >
              <div className="cell-number">{index}</div>
              <div className="cell-emoji">{getCellEmoji(cellType)}</div>
              
              {/* 玩家棋子 */}
              <div className="players-on-cell">
                {playersOnCell.map(([playerId, player]) => (
                  <motion.div
                    key={playerId}
                    className={`player-piece ${playerId} ${animatingPlayer === playerId ? 'animating' : ''}`}
                    style={{ 
                      backgroundColor: player.color,
                      transform: playersOnCell.length > 1 && playerId === 'player2' ? 'translateX(15px)' : ''
                    }}
                    animate={animatingPlayer === playerId ? {
                      scale: [1, 1.3, 1],
                      rotate: [0, 180, 360]
                    } : {}}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    {player.avatar}
                  </motion.div>
                ))}
              </div>
              
              {/* 特殊效果 */}
              {cellType === 'event' && (
                <div className="cell-effect">
                  <div className="sparkle">✨</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 路径连接线 */}
      <svg className="board-path" viewBox="0 0 100 100" preserveAspectRatio="none">
        {boardPath.slice(0, -1).map((cell, index) => {
          const nextCell = boardPath[index + 1]
          const startX = (cell.col + 0.5) * (100 / 6)
          const startY = (cell.row + 0.5) * (100 / Math.ceil(boardSize / 6))
          const endX = (nextCell.col + 0.5) * (100 / 6)
          const endY = (nextCell.row + 0.5) * (100 / Math.ceil(boardSize / 6))
          
          return (
            <line
              key={index}
              x1={`${startX}%`}
              y1={`${startY}%`}
              x2={`${endX}%`}
              y2={`${endY}%`}
              stroke="rgba(255, 107, 138, 0.3)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )
        })}
      </svg>
    </div>
  )
}

export default GameBoard
