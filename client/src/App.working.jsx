import React, { useState, useEffect } from 'react'

// 🎮 Sky Journey for Two - 完整前台流程
// 修复版本：支持完整的游戏流程体验

// 智能昵称生成器
const generateNickname = () => {
  const prefixes = ['甜心', '宝贝', '小可爱', '小天使', '小公主', '小王子']
  const words = ['兔子', '猫咪', '狐狸', '熊猫', '企鹅', '樱花', '星星', '月亮']
  const suffixes = ['酱', '君', '喵', '宝宝', '妹妹', '哥哥']
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const word = words[Math.floor(Math.random() * words.length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
  
  return Math.random() > 0.5 ? `${prefix}${word}` : `${word}${suffix}`
}

// 任务库
const TASK_LIBRARIES = {
  couple: {
    name: "💕 甜蜜情侣版",
    tasks: [
      { type: 'truth', text: '说出你最想和我一起去的三个地方', duration: 45 },
      { type: 'truth', text: '告诉我一个只有你知道的关于我的小秘密', duration: 60 },
      { type: 'dare', text: '给对方一个持续30秒的拥抱', duration: 40 },
      { type: 'dare', text: '用最温柔的声音对我说一句肉麻的话', duration: 30 },
      { type: 'truth', text: '分享一个你想和我一起完成的梦想', duration: 90 },
      { type: 'dare', text: '为我唱一小段你最喜欢的歌', duration: 60 }
    ]
  },
  gentle: {
    name: "🌸 温柔淑女版", 
    tasks: [
      { type: 'truth', text: '分享一个你童年最美好的回忆', duration: 60 },
      { type: 'truth', text: '说出三个你觉得最重要的品质', duration: 45 },
      { type: 'dare', text: '为大家表演一个才艺', duration: 90 },
      { type: 'dare', text: '做一个你觉得最可爱的表情', duration: 20 },
      { type: 'truth', text: '描述你理想中的完美一天', duration: 75 },
      { type: 'dare', text: '模仿一种动物的叫声', duration: 30 }
    ]
  },
  friend: {
    name: "🤝 好友兄弟版",
    tasks: [
      { type: 'truth', text: '说出你最佩服朋友的三个特质', duration: 45 },
      { type: 'truth', text: '分享一次我们一起做过最疯狂的事', duration: 60 },
      { type: 'dare', text: '和对方来一个兄弟式的拳头碰撞', duration: 15 },
      { type: 'dare', text: '用说唱的方式介绍自己', duration: 45 },
      { type: 'truth', text: '告诉我你觉得友情最重要的是什么', duration: 50 },
      { type: 'dare', text: '做20个俯卧撑', duration: 60 }
    ]
  }
}

function SkyJourney() {
  // 游戏阶段状态
  const [gamePhase, setGamePhase] = useState('home') // home, setup, playing, finished
  const [gameMode, setGameMode] = useState(null) // local, online
  
  // 玩家设置
  const [players, setPlayers] = useState({
    player1: { 
      name: '', 
      avatar: '🤴', 
      taskLevel: 'couple', 
      position: 0, 
      color: '#FF6B9D',
      isActive: true
    },
    player2: { 
      name: '', 
      avatar: '👸', 
      taskLevel: 'couple', 
      position: 0, 
      color: '#4ECDC4',
      isActive: false
    }
  })
  
  // 游戏状态
  const [gameState, setGameState] = useState({
    currentPlayer: 'player1',
    diceValue: null,
    isRolling: false,
    canRoll: true,
    winner: null,
    turn: 0,
    boardSize: 20
  })
  
  // 任务系统
  const [currentTask, setCurrentTask] = useState(null)
  const [taskTimeLeft, setTaskTimeLeft] = useState(0)
  const [isTaskActive, setIsTaskActive] = useState(false)
  
  // 任务倒计时
  useEffect(() => {
    if (isTaskActive && taskTimeLeft > 0) {
      const timer = setTimeout(() => {
        setTaskTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (taskTimeLeft === 0 && isTaskActive) {
      // 任务超时
      setIsTaskActive(false)
      alert('时间到！任务结束')
      setCurrentTask(null)
    }
  }, [taskTimeLeft, isTaskActive])
  
  // 🏠 主页组件
  const HomePage = () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '3.5rem',
          color: 'white',
          margin: '0 0 10px 0',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          ✈️ Sky Journey for Two
        </h1>
        <p style={{
          fontSize: '1.3rem',
          color: 'rgba(255,255,255,0.9)',
          margin: 0
        }}>
          情侣专属的浪漫飞行棋之旅
        </p>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        maxWidth: '600px',
        width: '100%',
        marginBottom: '30px'
      }}>
        <button
          onClick={() => {
            setGameMode('local')
            setGamePhase('setup')
          }}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            padding: '30px',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(20px)',
            fontSize: '16px'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>💕</div>
          <h3 style={{ margin: '0 0 10px 0' }}>本地对战</h3>
          <p style={{ margin: 0, opacity: 0.8 }}>
            两人共用一台设备<br />轻松开始浪漫之旅
          </p>
        </button>
        
        <button
          onClick={() => alert('在线模式开发中...')}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            padding: '30px',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(20px)',
            fontSize: '16px'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🌐</div>
          <h3 style={{ margin: '0 0 10px 0' }}>在线房间</h3>
          <p style={{ margin: 0, opacity: 0.8 }}>
            跨设备连接对战<br />远程也能甜蜜互动
          </p>
        </button>
      </div>
    </div>
  )
  
  // 🛠️ 玩家设置页
  const SetupPage = () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <h2 style={{ color: 'white', marginBottom: '40px', fontSize: '2.5rem' }}>
        🎮 玩家设置
      </h2>
      
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {['player1', 'player2'].map(playerId => (
          <div key={playerId} style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '20px',
            padding: '30px',
            minWidth: '280px',
            color: 'white',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '20px' }}>
              {players[playerId].avatar}
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                玩家昵称：
              </label>
              <input
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="输入昵称或留空自动生成"
                value={players[playerId].name}
                onChange={(e) => setPlayers(prev => ({
                  ...prev,
                  [playerId]: { ...prev[playerId], name: e.target.value }
                }))}
                onBlur={(e) => {
                  if (!e.target.value) {
                    setPlayers(prev => ({
                      ...prev,
                      [playerId]: { ...prev[playerId], name: generateNickname() }
                    }))
                  }
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                任务等级：
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                value={players[playerId].taskLevel}
                onChange={(e) => setPlayers(prev => ({
                  ...prev,
                  [playerId]: { ...prev[playerId], taskLevel: e.target.value }
                }))}
              >
                <option value="couple">💕 甜蜜情侣版</option>
                <option value="gentle">🌸 温柔淑女版</option>
                <option value="friend">🤝 好友兄弟版</option>
              </select>
            </div>
            
            <button
              onClick={() => setPlayers(prev => ({
                ...prev,
                [playerId]: { ...prev[playerId], name: generateNickname() }
              }))}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                width: '100%'
              }}
            >
              🎲 随机生成昵称
            </button>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
        <button
          onClick={() => {
            // 确保玩家有昵称
            const updatedPlayers = { ...players }
            if (!updatedPlayers.player1.name) updatedPlayers.player1.name = generateNickname()
            if (!updatedPlayers.player2.name) updatedPlayers.player2.name = generateNickname()
            setPlayers(updatedPlayers)
            setGamePhase('playing')
          }}
          style={{
            background: '#4ECDC4',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            padding: '15px 40px',
            fontSize: '20px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🚀 开始游戏
        </button>
        
        <button
          onClick={() => setGamePhase('home')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '15px',
            padding: '15px 40px',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          ← 返回主页
        </button>
      </div>
    </div>
  )
  
  // 🎲 掷骰子
  const rollDice = () => {
    if (!gameState.canRoll || gameState.isRolling) return
    
    setGameState(prev => ({ ...prev, isRolling: true, canRoll: false }))
    
    setTimeout(() => {
      const diceValue = Math.floor(Math.random() * 6) + 1
      setGameState(prev => ({ 
        ...prev, 
        diceValue, 
        isRolling: false,
        canRoll: true
      }))
      
      // 移动棋子
      movePlayer(gameState.currentPlayer, diceValue)
    }, 1500)
  }
  
  // 移动玩家
  const movePlayer = (playerId, steps) => {
    setPlayers(prev => {
      const newPosition = Math.min(prev[playerId].position + steps, gameState.boardSize)
      const updated = {
        ...prev,
        [playerId]: { ...prev[playerId], position: newPosition }
      }
      
      // 检查胜利
      if (newPosition >= gameState.boardSize) {
        setGameState(prevState => ({ ...prevState, winner: playerId }))
        setGamePhase('finished')
        return updated
      }
      
      // 检查是否触发任务事件
      if (Math.random() < 0.4) { // 40% 概率触发任务
        triggerTask()
      }
      
      return updated
    })
    
    // 切换玩家
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        currentPlayer: prev.currentPlayer === 'player1' ? 'player2' : 'player1',
        turn: prev.turn + 1
      }))
    }, 1000)
  }
  
  // 触发任务事件
  const triggerTask = () => {
    const currentPlayerLevel = players[gameState.currentPlayer].taskLevel
    const taskLibrary = TASK_LIBRARIES[currentPlayerLevel]
    const randomTask = taskLibrary.tasks[Math.floor(Math.random() * taskLibrary.tasks.length)]
    
    setCurrentTask(randomTask)
  }
  
  // 🎮 游戏主界面
  const PlayingPage = () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* 游戏头部信息 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '15px',
        padding: '20px',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ color: 'white' }}>
          <h2 style={{ margin: 0 }}>回合 {gameState.turn + 1}</h2>
          <p style={{ margin: '5px 0 0 0' }}>
            当前玩家：{players[gameState.currentPlayer].name}
          </p>
        </div>
        
        <button
          onClick={() => setGamePhase('home')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '10px',
            padding: '10px 20px',
            cursor: 'pointer'
          }}
        >
          🏠 退出游戏
        </button>
      </div>
      
      {/* 玩家信息 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {['player1', 'player2'].map(playerId => (
          <div key={playerId} style={{
            background: gameState.currentPlayer === playerId 
              ? 'rgba(255,255,255,0.25)' 
              : 'rgba(255,255,255,0.15)',
            borderRadius: '15px',
            padding: '20px',
            color: 'white',
            border: gameState.currentPlayer === playerId 
              ? '2px solid #FFD700' 
              : '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '3rem' }}>{players[playerId].avatar}</div>
              <div>
                <h3 style={{ margin: 0 }}>{players[playerId].name}</h3>
                <p style={{ margin: '5px 0', opacity: 0.8 }}>
                  位置: {players[playerId].position}/{gameState.boardSize}
                </p>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.6 }}>
                  {TASK_LIBRARIES[players[playerId].taskLevel].name}
                </p>
              </div>
            </div>
            
            {/* 进度条 */}
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '10px',
              height: '8px',
              marginTop: '15px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: players[playerId].color,
                height: '100%',
                width: `${(players[playerId].position / gameState.boardSize) * 100}%`,
                transition: 'width 1s ease'
              }} />
            </div>
          </div>
        ))}
      </div>
      
      {/* 骰子区域 */}
      <div style={{
        textAlign: 'center',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '20px',
        padding: '30px',
        backdropFilter: 'blur(20px)',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '20px',
          animation: gameState.isRolling ? 'spin 1.5s ease-in-out' : 'none'
        }}>
          {gameState.isRolling ? '🎲' : (gameState.diceValue ? `🎲 ${gameState.diceValue}` : '🎲')}
        </div>
        
        <button
          onClick={rollDice}
          disabled={!gameState.canRoll || gameState.isRolling}
          style={{
            background: gameState.canRoll && !gameState.isRolling ? '#4ECDC4' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            padding: '15px 40px',
            fontSize: '20px',
            cursor: gameState.canRoll && !gameState.isRolling ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }}
        >
          {gameState.isRolling ? '投掷中...' : '🎲 掷骰子'}
        </button>
        
        {gameState.diceValue && !gameState.isRolling && (
          <p style={{ color: 'white', marginTop: '15px', fontSize: '18px' }}>
            {players[gameState.currentPlayer].name} 掷出了 {gameState.diceValue} 点！
          </p>
        )}
      </div>
    </div>
  )
  
  // 🎪 任务弹窗
  const TaskModal = () => {
    if (!currentTask) return null
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ 
            color: '#764ba2', 
            marginBottom: '20px',
            fontSize: '2rem'
          }}>
            {currentTask.type === 'truth' ? '💭 真心话' : '🎪 大冒险'}
          </h2>
          
          <div style={{
            fontSize: '1.3rem',
            marginBottom: '25px',
            lineHeight: '1.6',
            color: '#333'
          }}>
            {currentTask.text}
          </div>
          
          {isTaskActive && (
            <div style={{
              fontSize: '2rem',
              color: '#e74c3c',
              fontWeight: 'bold',
              marginBottom: '20px'
            }}>
              ⏰ {taskTimeLeft}秒
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            {!isTaskActive ? (
              <button
                onClick={() => {
                  setTaskTimeLeft(currentTask.duration)
                  setIsTaskActive(true)
                }}
                style={{
                  background: '#4ECDC4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 30px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🚀 开始挑战
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsTaskActive(false)
                  setCurrentTask(null)
                  alert('任务完成！🎉')
                }}
                style={{
                  background: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 30px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✅ 完成任务
              </button>
            )}
            
            <button
              onClick={() => {
                setIsTaskActive(false)
                setCurrentTask(null)
              }}
              style={{
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 30px',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              ❌ 跳过任务
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  // 🏆 胜利页面
  const VictoryPage = () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFD700 0%, #FF6B9D 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🏆</div>
      <h1 style={{ 
        color: 'white', 
        fontSize: '3rem', 
        marginBottom: '20px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      }}>
        恭喜胜利！
      </h1>
      <h2 style={{ 
        color: 'white', 
        fontSize: '2rem', 
        marginBottom: '30px' 
      }}>
        🎉 {players[gameState.winner]?.name} 获得胜利！
      </h2>
      
      <div style={{
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px',
        backdropFilter: 'blur(20px)'
      }}>
        <h3 style={{ color: 'white', marginBottom: '15px' }}>🎮 游戏统计</h3>
        <p style={{ color: 'white', margin: '5px 0' }}>总回合数: {gameState.turn}</p>
        <p style={{ color: 'white', margin: '5px 0' }}>
          {players.player1.name}: {players.player1.position}/{gameState.boardSize}
        </p>
        <p style={{ color: 'white', margin: '5px 0' }}>
          {players.player2.name}: {players.player2.position}/{gameState.boardSize}
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <button
          onClick={() => {
            setGamePhase('playing')
            setGameState({
              currentPlayer: 'player1',
              diceValue: null,
              isRolling: false,
              canRoll: true,
              winner: null,
              turn: 0,
              boardSize: 20
            })
            setPlayers(prev => ({
              ...prev,
              player1: { ...prev.player1, position: 0 },
              player2: { ...prev.player2, position: 0 }
            }))
          }}
          style={{
            background: '#4ECDC4',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            padding: '15px 30px',
            fontSize: '18px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔄 再来一局
        </button>
        
        <button
          onClick={() => setGamePhase('home')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '15px',
            padding: '15px 30px',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          🏠 返回主页
        </button>
      </div>
    </div>
  )
  
  // 主应用渲染
  return (
    <div style={{ position: 'relative', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {gamePhase === 'home' && <HomePage />}
      {gamePhase === 'setup' && <SetupPage />}
      {gamePhase === 'playing' && <PlayingPage />}
      {gamePhase === 'finished' && <VictoryPage />}
      
      {/* 任务弹窗 */}
      <TaskModal />
      
      {/* CSS 动画 */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        
        button:hover {
          transform: translateY(-2px);
          transition: transform 0.2s ease;
        }
        
        button:active {
          transform: translateY(0);
        }
        
        @media (max-width: 768px) {
          .game-container {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  )
}

export default SkyJourney
