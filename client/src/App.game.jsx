import React, { useState, useEffect } from 'react'

// 任务库
const TASKS = {
  truth: [
    "说出你最喜欢对方的三个特质",
    "分享一个只告诉过对方的秘密",
    "描述你们第一次见面的感受",
    "说出你觉得对方最可爱的时刻",
    "如果可以回到过去，你最想和对方重温哪一天？",
    "你最喜欢对方的哪个习惯？",
    "说出一个你希望和对方一起完成的梦想",
  ],
  dare: [
    "给对方一个30秒的拥抱",
    "用对方的语气说一句肉麻的话",
    "模仿对方的一个小动作",
    "唱一首歌给对方听",
    "说三句赞美对方的话",
    "做一个搞笑的表情让对方笑",
    "给对方按摩肩膀1分钟",
  ]
}

// 简化的游戏状态管理
const useGameState = () => {
  const [gameState, setGameState] = useState({
    mode: null, // 'offline' | 'online'
    currentPlayer: 1,
    players: {
      1: { name: '玩家1', position: 0, avatar: '👨' },
      2: { name: '玩家2', position: 0, avatar: '👩' }
    },
    diceValue: null,
    gameStarted: false,
    showTask: false,
    currentTask: null,
    taskType: null,
    canRollDice: true,
    showVictory: false,
    winner: null
  })

  return { gameState, setGameState }
}

// 任务弹窗组件
function TaskModal({ task, taskType, playerName, onComplete, onClose }) {
  const [timeLeft, setTimeLeft] = useState(60)
  
  useEffect(() => {
    if (taskType === 'dare') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [taskType])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease-in'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
        padding: '40px',
        borderRadius: '25px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        transform: 'scale(1)',
        animation: 'slideIn 0.3s ease-out'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '20px'
        }}>
          {taskType === 'truth' ? '💭' : '🎪'}
        </div>
        
        <h3 style={{
          color: taskType === 'truth' ? '#4A90E2' : '#FF6B8A',
          marginBottom: '20px',
          fontSize: '1.5rem'
        }}>
          {taskType === 'truth' ? '真心话' : '大冒险'}
        </h3>
        
        <div style={{
          background: taskType === 'truth' ? 'rgba(74,144,226,0.1)' : 'rgba(255,107,138,0.1)',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px',
          border: `2px solid ${taskType === 'truth' ? '#4A90E2' : '#FF6B8A'}`
        }}>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: 0 }}>
            <strong>{playerName}</strong>，你的任务是：
          </p>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '15px 0', color: '#2C3E50' }}>
            {task}
          </p>
        </div>

        {taskType === 'dare' && (
          <div style={{
            background: timeLeft > 10 ? '#2ecc71' : '#e74c3c',
            color: 'white',
            padding: '15px',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '20px auto',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}>
            {timeLeft}s
          </div>
        )}

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            style={{
              background: 'linear-gradient(45deg, #2ecc71, #27ae60)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(46,204,113,0.3)',
              transition: 'all 0.3s ease'
            }}
            onClick={onComplete}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            ✅ 完成任务
          </button>
          
          <button
            style={{
              background: 'linear-gradient(45deg, #95a5a6, #7f8c8d)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(149,165,166,0.3)',
              transition: 'all 0.3s ease'
            }}
            onClick={onClose}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🔄 换一个
          </button>
        </div>
      </div>
    </div>
  )
}

// 胜利动画组件
function VictoryModal({ winner, onRestart, onExit }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(45deg, rgba(255,107,138,0.9), rgba(74,144,226,0.9))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'victoryFadeIn 0.5s ease-in'
    }}>
      <div style={{
        background: 'white',
        padding: '50px',
        borderRadius: '30px',
        textAlign: 'center',
        boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
        transform: 'scale(1)',
        animation: 'victoryBounce 0.6s ease-out'
      }}>
        <div style={{
          fontSize: '5rem',
          marginBottom: '20px',
          animation: 'bounce 2s infinite'
        }}>
          🏆
        </div>
        
        <h1 style={{
          background: 'linear-gradient(45deg, #FF6B8A, #4A90E2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '3rem',
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          恭喜获胜！
        </h1>
        
        <div style={{
          background: 'linear-gradient(135deg, #FFE5F1, #E8F4FD)',
          padding: '20px',
          borderRadius: '20px',
          marginBottom: '30px'
        }}>
          <p style={{ fontSize: '1.5rem', margin: 0, color: '#2C3E50' }}>
            🎉 <strong>{winner.name}</strong> 率先到达终点！
          </p>
          <p style={{ fontSize: '1rem', margin: '10px 0 0', color: '#7f8c8d' }}>
            在爱情的旅程中，你们都是赢家 💕
          </p>
        </div>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button
            style={{
              background: 'linear-gradient(45deg, #FF6B8A, #FF8FA3)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontSize: '18px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 6px 20px rgba(255,107,138,0.4)',
              transition: 'all 0.3s ease'
            }}
            onClick={onRestart}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🔄 再来一局
          </button>
          
          <button
            style={{
              background: 'linear-gradient(45deg, #4A90E2, #67A3E8)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontSize: '18px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 6px 20px rgba(74,144,226,0.4)',
              transition: 'all 0.3s ease'
            }}
            onClick={onExit}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🏠 返回主页
          </button>
        </div>
      </div>
    </div>
  )
}
function HomePage({ onStartGame }) {
  const [showSetup, setShowSetup] = useState(false)
  const [gameMode, setGameMode] = useState(null)
  const [playerNames, setPlayerNames] = useState({ player1: '', player2: '' })

  const handleModeSelect = (mode) => {
    setGameMode(mode)
    setShowSetup(true)
  }

  const handleStartGame = () => {
    if (playerNames.player1 && playerNames.player2) {
      onStartGame(gameMode, playerNames)
    } else {
      alert('请输入玩家姓名')
    }
  }

// 主页组件
function HomePage({ onStartGame }) {
  const [showSetup, setShowSetup] = useState(false)
  const [gameMode, setGameMode] = useState(null)
  const [playerNames, setPlayerNames] = useState({ player1: '', player2: '' })

  const handleModeSelect = (mode) => {
    setGameMode(mode)
    setShowSetup(true)
  }

  const handleStartGame = () => {
    if (playerNames.player1 && playerNames.player2) {
      onStartGame(gameMode, playerNames)
    } else {
      alert('请输入玩家姓名')
    }
  }

  if (!showSetup) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '30px',
          padding: '40px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h1 style={{ 
            color: '#FF6B8A', 
            fontSize: '3.5rem', 
            marginBottom: '10px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            🎮 Sky Journey for Two
          </h1>
          <h2 style={{ 
            color: '#4A90E2', 
            marginBottom: '40px',
            fontSize: '1.5rem',
            fontWeight: '300'
          }}>
            情侣专属飞行棋游戏
          </h2>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '50px' }}>
          <button 
            style={{
              background: 'linear-gradient(135deg, #FF6B8A, #FF8FA3)',
              color: 'white',
              border: 'none',
              padding: '25px 45px',
              borderRadius: '30px',
              fontSize: '20px',
              cursor: 'pointer',
              minWidth: '220px',
              boxShadow: '0 10px 30px rgba(255,107,138,0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontWeight: 'bold',
              backdropFilter: 'blur(20px)'
            }}
            onClick={() => handleModeSelect('offline')}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-5px) scale(1.05)'
              e.target.style.boxShadow = '0 15px 40px rgba(255,107,138,0.6)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)'
              e.target.style.boxShadow = '0 10px 30px rgba(255,107,138,0.4)'
            }}
          >
            🏠 本地对战
            <div style={{ fontSize: '14px', marginTop: '5px', opacity: 0.9 }}>
              同屏游戏
            </div>
          </button>
          <button 
            style={{
              background: 'linear-gradient(135deg, #4A90E2, #67A3E8)',
              color: 'white',
              border: 'none',
              padding: '25px 45px',
              borderRadius: '30px',
              fontSize: '20px',
              cursor: 'pointer',
              minWidth: '220px',
              boxShadow: '0 10px 30px rgba(74,144,226,0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontWeight: 'bold',
              backdropFilter: 'blur(20px)'
            }}
            onClick={() => handleModeSelect('online')}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-5px) scale(1.05)'
              e.target.style.boxShadow = '0 15px 40px rgba(74,144,226,0.6)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)'
              e.target.style.boxShadow = '0 10px 30px rgba(74,144,226,0.4)'
            }}
          >
            🌐 在线对战
            <div style={{ fontSize: '14px', marginTop: '5px', opacity: 0.9 }}>
              跨设备连接
            </div>
          </button>
        </div>

        <div style={{ 
          marginTop: '70px', 
          padding: '40px', 
          background: 'rgba(255,255,255,0.15)', 
          borderRadius: '25px', 
          maxWidth: '800px', 
          margin: '70px auto',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ color: '#2C3E50', marginBottom: '30px', fontSize: '1.8rem' }}>🎯 游戏特色</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px', 
            textAlign: 'left' 
          }}>
            {[
              { icon: '🎲', text: '经典飞行棋玩法' },
              { icon: '💕', text: '情侣专属主题' },
              { icon: '🎪', text: '真心话大冒险' },
              { icon: '⏰', text: '终极挑战模式' },
              { icon: '📱', text: '跨设备对战' },
              { icon: '🎨', text: '精美动画效果' }
            ].map((feature, index) => (
              <div key={index} style={{
                padding: '15px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <span style={{ fontSize: '1.5rem' }}>{feature.icon}</span>
                <span style={{ fontWeight: '500', color: '#2C3E50' }}>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '25px',
        padding: '40px',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h2 style={{ 
          color: '#FF6B8A', 
          marginBottom: '30px',
          fontSize: '2rem'
        }}>
          设置玩家信息 - {gameMode === 'offline' ? '本地对战' : '在线对战'}
        </h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '40px' }}>
          <div style={{ 
            padding: '30px', 
            background: 'rgba(255,255,255,0.2)', 
            borderRadius: '20px', 
            minWidth: '280px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <h3 style={{ color: '#4A90E2', marginBottom: '20px' }}>👨 玩家1</h3>
            <input 
              type="text"
              placeholder="输入姓名"
              value={playerNames.player1}
              onChange={(e) => setPlayerNames({...playerNames, player1: e.target.value})}
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #4A90E2',
                borderRadius: '15px',
                fontSize: '16px',
                marginTop: '10px',
                background: 'rgba(255,255,255,0.9)',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 20px rgba(74,144,226,0.3)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>
          
          <div style={{ 
            padding: '30px', 
            background: 'rgba(255,255,255,0.2)', 
            borderRadius: '20px', 
            minWidth: '280px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <h3 style={{ color: '#FF6B8A', marginBottom: '20px' }}>👩 玩家2</h3>
            <input 
              type="text"
              placeholder="输入姓名"
              value={playerNames.player2}
              onChange={(e) => setPlayerNames({...playerNames, player2: e.target.value})}
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #FF6B8A',
                borderRadius: '15px',
                fontSize: '16px',
                marginTop: '10px',
                background: 'rgba(255,255,255,0.9)',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 20px rgba(255,107,138,0.3)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>
        </div>
        
        <div style={{ marginTop: '40px' }}>
          <button 
            style={{
              background: 'linear-gradient(45deg, #FF6B8A, #4A90E2)',
              color: 'white',
              border: 'none',
              padding: '18px 45px',
              borderRadius: '30px',
              fontSize: '18px',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
              marginRight: '20px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onClick={handleStartGame}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🚀 开始游戏
          </button>
          
          <button 
            style={{
              background: 'linear-gradient(45deg, #95a5a6, #7f8c8d)',
              color: 'white',
              border: 'none',
              padding: '18px 45px',
              borderRadius: '30px',
              fontSize: '18px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setShowSetup(false)}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            ← 返回
          </button>
        </div>
      </div>
    </div>
  )
}

// 游戏棋盘组件
function GameBoard({ gameState, onDiceRoll, onPositionUpdate, onShowTask, onExitGame }) {
  const { players, currentPlayer, diceValue, canRollDice } = gameState
  
  // 简化的棋盘位置（16个位置的正方形）
  const positions = Array.from({length: 16}, (_, i) => i)
  
  const getPositionStyle = (index) => {
    const row = Math.floor(index / 4)
    const col = index % 4
    
    return {
      position: 'absolute',
      left: `${col * 90 + 25}px`,
      top: `${row * 90 + 25}px`,
      width: '70px',
      height: '70px',
      background: index === 0 ? 'linear-gradient(135deg, #2ecc71, #27ae60)' : 
                 index === 15 ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 
                 'linear-gradient(135deg, #ecf0f1, #bdc3c7)',
      border: '3px solid #34495e',
      borderRadius: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
      color: index === 0 || index === 15 ? 'white' : '#2c3e50',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      transition: 'all 0.3s ease'
    }
  }

  const rollDice = () => {
    if (!canRollDice) return
    
    const newValue = Math.floor(Math.random() * 6) + 1
    onDiceRoll(newValue)
    
    setTimeout(() => {
      const newPosition = Math.min(players[currentPlayer].position + newValue, 15)
      onPositionUpdate(currentPlayer, newPosition)
      
      // 如果不是起点或终点，显示任务
      if (newPosition > 0 && newPosition < 15) {
        const taskType = Math.random() > 0.5 ? 'truth' : 'dare'
        const tasks = TASKS[taskType]
        const randomTask = tasks[Math.floor(Math.random() * tasks.length)]
        onShowTask(taskType, randomTask)
      }
    }, 2000)
  }

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      {/* 顶部工具栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '20px',
        backdropFilter: 'blur(20px)'
      }}>
        <h2 style={{ color: '#2C3E50', margin: 0, fontSize: '1.8rem' }}>🎲 Sky Journey</h2>
        <button
          style={{
            background: 'linear-gradient(45deg, #e74c3c, #c0392b)',
            color: 'white',
            border: 'none',
            padding: '12px 25px',
            borderRadius: '20px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onClick={onExitGame}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          🚪 退出游戏
        </button>
      </div>
      
      {/* 玩家状态 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '40px' }}>
        {Object.entries(players).map(([id, player]) => (
          <div 
            key={id}
            style={{ 
              padding: '25px',
              background: currentPlayer == id ? 
                'linear-gradient(135deg, rgba(255,235,59,0.9), rgba(255,193,7,0.8))' : 
                'rgba(255,255,255,0.2)',
              borderRadius: '20px',
              border: currentPlayer == id ? '3px solid #ffeb3b' : '2px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              transform: currentPlayer == id ? 'scale(1.05)' : 'scale(1)',
              boxShadow: currentPlayer == id ? 
                '0 10px 30px rgba(255,235,59,0.4)' : 
                '0 5px 15px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{player.avatar}</div>
            <div style={{ 
              fontWeight: 'bold', 
              color: currentPlayer == id ? '#2c3e50' : (id == 1 ? '#4A90E2' : '#FF6B8A'),
              fontSize: '1.1rem',
              marginBottom: '5px'
            }}>
              {player.name}
            </div>
            <div style={{ 
              color: currentPlayer == id ? '#2c3e50' : '#7f8c8d',
              fontWeight: '500'
            }}>
              位置: {player.position}/15
            </div>
            {currentPlayer == id && (
              <div style={{
                marginTop: '10px',
                padding: '5px 10px',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#2c3e50',
                fontWeight: 'bold'
              }}>
                轮到你了！
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 棋盘 */}
      <div style={{ 
        position: 'relative', 
        width: '390px', 
        height: '390px', 
        margin: '0 auto 40px',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '25px',
        border: '3px solid rgba(255,255,255,0.3)',
        backdropFilter: 'blur(20px)',
        padding: '10px'
      }}>
        {positions.map(index => (
          <div key={index} style={getPositionStyle(index)}>
            {index === 0 && '🏁'}
            {index === 15 && '🏆'}
            {index > 0 && index < 15 && index}
            
            {/* 显示玩家棋子 */}
            {Object.entries(players).map(([id, player]) => 
              player.position === index && (
                <div 
                  key={id}
                  style={{
                    position: 'absolute',
                    top: id == 1 ? '-15px' : '60px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '28px',
                    zIndex: 10,
                    animation: 'bounce 1s infinite',
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                  }}
                >
                  {player.avatar}
                </div>
              )
            )}
          </div>
        ))}
      </div>

      {/* 骰子区域 */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          display: 'inline-block',
          fontSize: '5rem',
          margin: '20px',
          padding: '25px',
          background: 'linear-gradient(135deg, #fff, #f8f9fa)',
          borderRadius: '20px',
          border: '4px solid #34495e',
          minWidth: '120px',
          minHeight: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
          animation: diceValue ? 'diceRoll 0.6s ease-out' : 'none'
        }}>
          {diceValue || '🎲'}
        </div>
        
        <div style={{ marginTop: '25px' }}>
          <button 
            style={{
              background: canRollDice ? 
                `linear-gradient(135deg, ${currentPlayer == 1 ? '#4A90E2, #67A3E8' : '#FF6B8A, #FF8FA3'})` :
                'linear-gradient(135deg, #95a5a6, #7f8c8d)',
              color: 'white',
              border: 'none',
              padding: '18px 40px',
              borderRadius: '30px',
              fontSize: '18px',
              cursor: canRollDice ? 'pointer' : 'not-allowed',
              boxShadow: canRollDice ? '0 6px 20px rgba(0,0,0,0.2)' : 'none',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              opacity: canRollDice ? 1 : 0.6
            }}
            onClick={rollDice}
            disabled={!canRollDice}
            onMouseOver={(e) => {
              if (canRollDice) {
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)'
              }
            }}
            onMouseOut={(e) => {
              if (canRollDice) {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'
              }
            }}
          >
            {canRollDice ? `${players[currentPlayer].name} 掷骰子` : '请等待...'}
          </button>
          
          {!canRollDice && (
            <div style={{
              marginTop: '15px',
              color: '#7f8c8d',
              fontSize: '14px'
            }}>
              请等待骰子冷却...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 主应用组件
function App() {
  const { gameState, setGameState } = useGameState()

  const handleStartGame = (mode, playerNames) => {
    setGameState(prev => ({
      ...prev,
      mode,
      gameStarted: true,
      players: {
        1: { ...prev.players[1], name: playerNames.player1 },
        2: { ...prev.players[2], name: playerNames.player2 }
      }
    }))
  }

  const handleDiceRoll = (value) => {
    setGameState(prev => ({
      ...prev,
      diceValue: value,
      canRollDice: false // 禁用骰子按钮
    }))
  }

  const handlePositionUpdate = (playerId, newPosition) => {
    setGameState(prev => {
      const newState = {
        ...prev,
        players: {
          ...prev.players,
          [playerId]: { ...prev.players[playerId], position: newPosition }
        },
        currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
        diceValue: null
      }
      
      // 检查胜利条件
      if (newPosition >= 15) {
        newState.showVictory = true
        newState.winner = prev.players[playerId]
        newState.canRollDice = false
      } else {
        // 3秒后允许下一次投掷
        setTimeout(() => {
          setGameState(current => ({
            ...current,
            canRollDice: true
          }))
        }, 3000)
      }
      
      return newState
    })
  }

  const handleShowTask = (taskType, task) => {
    setGameState(prev => ({
      ...prev,
      showTask: true,
      currentTask: task,
      taskType: taskType
    }))
  }

  const handleTaskComplete = () => {
    setGameState(prev => ({
      ...prev,
      showTask: false,
      currentTask: null,
      taskType: null
    }))
  }

  const handleTaskClose = () => {
    // 重新生成任务
    const taskType = Math.random() > 0.5 ? 'truth' : 'dare'
    const tasks = TASKS[taskType]
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)]
    
    setGameState(prev => ({
      ...prev,
      currentTask: randomTask,
      taskType: taskType
    }))
  }

  const handleRestart = () => {
    setGameState(prev => ({
      ...prev,
      players: {
        1: { ...prev.players[1], position: 0 },
        2: { ...prev.players[2], position: 0 }
      },
      currentPlayer: 1,
      diceValue: null,
      showTask: false,
      currentTask: null,
      taskType: null,
      canRollDice: true,
      showVictory: false,
      winner: null
    }))
  }

  const handleExitGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStarted: false,
      mode: null,
      players: {
        1: { name: '玩家1', position: 0, avatar: '👨' },
        2: { name: '玩家2', position: 0, avatar: '👩' }
      },
      currentPlayer: 1,
      diceValue: null,
      showTask: false,
      currentTask: null,
      taskType: null,
      canRollDice: true,
      showVictory: false,
      winner: null
    }))
  }

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideIn {
            from { 
              opacity: 0; 
              transform: translateY(-50px) scale(0.8); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1); 
            }
          }
          
          @keyframes victoryFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes victoryBounce {
            0% { 
              opacity: 0; 
              transform: scale(0.3) translateY(-100px); 
            }
            50% { 
              transform: scale(1.1) translateY(0); 
            }
            100% { 
              opacity: 1; 
              transform: scale(1) translateY(0); 
            }
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-5px);
            }
            60% {
              transform: translateY(-3px);
            }
          }
          
          @keyframes diceRoll {
            0% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(90deg) scale(1.1); }
            50% { transform: rotate(180deg) scale(1.2); }
            75% { transform: rotate(270deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(1); }
          }
        `}
      </style>
      
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFE5F1 0%, #E8F4FD 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {!gameState.gameStarted ? (
          <HomePage onStartGame={handleStartGame} />
        ) : (
          <GameBoard 
            gameState={gameState}
            onDiceRoll={handleDiceRoll}
            onPositionUpdate={handlePositionUpdate}
            onShowTask={handleShowTask}
            onExitGame={handleExitGame}
          />
        )}
        
        {/* 任务弹窗 */}
        {gameState.showTask && (
          <TaskModal
            task={gameState.currentTask}
            taskType={gameState.taskType}
            playerName={gameState.players[gameState.currentPlayer === 1 ? 2 : 1].name}
            onComplete={handleTaskComplete}
            onClose={handleTaskClose}
          />
        )}
        
        {/* 胜利弹窗 */}
        {gameState.showVictory && (
          <VictoryModal
            winner={gameState.winner}
            onRestart={handleRestart}
            onExit={handleExitGame}
          />
        )}
      </div>
    </>
  )
}

export default App
