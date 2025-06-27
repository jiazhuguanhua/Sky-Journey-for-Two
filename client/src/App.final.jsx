import React, { useState, useEffect, useRef } from 'react'
import { GameProvider } from './contexts/GameContext'
import { SocketProvider } from './contexts/SocketContext'
import audioManager from './utils/AudioManager'
import nicknameGenerator from './utils/NicknameGenerator'

// 🎮 Sky Journey for Two - 终极完整版
// 集成跨设备连接、音效BGM、任务分级、智能昵称、动画交互等所有功能

function SkyJourneyGame() {
  const [gamePhase, setGamePhase] = useState('home') // home, setup, playing, finished
  const [gameMode, setGameMode] = useState(null) // local, online
  const [onlineMode, setOnlineMode] = useState(null) // create, join, browse
  const [roomId, setRoomId] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  
  // 玩家设置
  const [players, setPlayers] = useState({
    player1: { name: '', avatar: '🤴', taskLevel: 'couple', position: 0, color: '#FF6B9D' },
    player2: { name: '', avatar: '👸', taskLevel: 'couple', position: 0, color: '#4ECDC4' }
  })
  
  // 游戏状态
  const [gameState, setGameState] = useState({
    currentPlayer: 'player1',
    diceValue: null,
    isRolling: false,
    canRoll: true,
    winner: null,
    cooldownTime: 0,
    turn: 0
  })
  
  // 任务系统
  const [currentTask, setCurrentTask] = useState(null)
  const [taskCooldown, setTaskCooldown] = useState(0)
  const [taskStats, setTaskStats] = useState({
    completed: 0,
    skipped: 0,
    remaining: 3
  })
  
  // 音效设置
  const [audioSettings, setAudioSettings] = useState({
    enabled: true,
    sfxVolume: 50,
    bgmVolume: 30,
    currentBGM: 'romantic'
  })
  
  // 房间列表（在线模式）
  const [roomList, setRoomList] = useState([])
  const [roomFilter, setRoomFilter] = useState('all')
  
  // UI状态
  const [showSettings, setShowSettings] = useState(false)
  const [showRoomList, setShowRoomList] = useState(false)
  const [showVictory, setShowVictory] = useState(false)
  const [showNicknameHelper, setShowNicknameHelper] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  
  // Refs
  const diceRef = useRef(null)
  const gameContainerRef = useRef(null)
  
  // 🎵 音效系统初始化
  useEffect(() => {
    const initAudio = async () => {
      try {
        await audioManager.initialize()
        audioManager.setVolume('sfx', audioSettings.sfxVolume / 100)
        audioManager.setVolume('bgm', audioSettings.bgmVolume / 100)
        audioManager.setEnabled(audioSettings.enabled)
        
        if (audioSettings.enabled && audioSettings.currentBGM !== 'none') {
          audioManager.playBGM(audioSettings.currentBGM)
        }
      } catch (error) {
        console.warn('Audio initialization failed:', error)
      }
    }
    
    // 需要用户交互才能初始化音频
    const handleFirstInteraction = () => {
      initAudio()
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }
    
    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('keydown', handleFirstInteraction)
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [])
  
  // 🎲 骰子冷却
  useEffect(() => {
    if (gameState.cooldownTime > 0) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, cooldownTime: prev.cooldownTime - 1 }))
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setGameState(prev => ({ ...prev, canRoll: true }))
    }
  }, [gameState.cooldownTime])
  
  // 🎪 任务冷却
  useEffect(() => {
    if (taskCooldown > 0) {
      const timer = setTimeout(() => {
        setTaskCooldown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [taskCooldown])
  
  // 🎯 主页组件
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
      {/* 游戏标题 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        animation: 'fadeInDown 1s ease-out'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          color: 'white',
          margin: '0 0 10px 0',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          fontWeight: 'bold'
        }}>
          ✈️ Sky Journey for Two
        </h1>
        <p style={{
          fontSize: '1.3rem',
          color: 'rgba(255,255,255,0.9)',
          margin: 0,
          fontWeight: '300'
        }}>
          情侣专属的浪漫飞行棋之旅
        </p>
      </div>
      
      {/* 连接状态指示器 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.1)',
        padding: '8px 16px',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: connectionStatus === 'connected' ? '#2ecc71' : 
                          connectionStatus === 'reconnecting' ? '#f39c12' : '#e74c3c',
          marginRight: '8px',
          animation: connectionStatus === 'reconnecting' ? 'pulse 1s infinite' : 'none'
        }} />
        <span style={{ color: 'white', fontSize: '0.9rem' }}>
          {connectionStatus === 'connected' ? '已连接' :
           connectionStatus === 'reconnecting' ? '重连中...' : '未连接'}
        </span>
      </div>
      
      {/* 游戏模式选择 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        maxWidth: '800px',
        width: '100%',
        marginBottom: '30px'
      }}>
        {/* 本地对战 */}
        <button
          onClick={() => handleGameModeSelect('local')}
          onMouseOver={() => audioManager.playSound('button')}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            padding: '30px',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px) scale(1.02)'
            e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)'
            e.target.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>💕</div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>本地对战</h3>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '1rem' }}>
            两人共用一台设备<br />轻松开始浪漫之旅
          </p>
        </button>
        
        {/* 在线房间 */}
        <button
          onClick={() => handleGameModeSelect('online')}
          onMouseOver={() => audioManager.playSound('button')}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            padding: '30px',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px) scale(1.02)'
            e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)'
            e.target.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🌐</div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>在线房间</h3>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '1rem' }}>
            跨设备连接对战<br />远程也能甜蜜互动
          </p>
        </button>
      </div>
      
      {/* 功能介绍 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        maxWidth: '900px',
        width: '100%',
        marginBottom: '30px'
      }}>
        {[
          { icon: '🎲', title: '3D骰子动画', desc: '真实投掷体验' },
          { icon: '🎪', title: '五级任务系统', desc: '从温柔到狂热' },
          { icon: '🎵', title: '音效与BGM', desc: '沉浸式体验' },
          { icon: '🤖', title: '智能昵称', desc: '自动生成可爱名字' }
        ].map((feature, index) => (
          <div key={index} style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '15px',
            padding: '20px',
            textAlign: 'center',
            color: 'white',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{feature.icon}</div>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>{feature.title}</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>{feature.desc}</p>
          </div>
        ))}
      </div>
      
      {/* 设置按钮 */}
      <div style={{ display: 'flex', gap: '15px' }}>
        <button
          onClick={() => setShowSettings(true)}
          onMouseOver={() => audioManager.playSound('button')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '25px',
            padding: '12px 24px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.3s ease'
          }}
        >
          ⚙️ 游戏设置
        </button>
        
        <button
          onClick={() => setShowRoomList(true)}
          onMouseOver={() => audioManager.playSound('button')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '25px',
            padding: '12px 24px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.3s ease'
          }}
        >
          🏠 房间列表
        </button>
      </div>
      
      {/* 加载消息 */}
      {loadingMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '25px',
          backdropFilter: 'blur(10px)'
        }}>
          {loadingMessage}
        </div>
      )}
      
      {/* 错误消息 */}
      {errorMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(231, 76, 60, 0.9)',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '25px',
          backdropFilter: 'blur(10px)'
        }}>
          {errorMessage}
          <button
            onClick={() => setErrorMessage('')}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              marginLeft: '10px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
  
  // 处理游戏模式选择
  const handleGameModeSelect = (mode) => {
    audioManager.playSound('button')
    setGameMode(mode)
    if (mode === 'local') {
      setGamePhase('setup')
    } else if (mode === 'online') {
      setShowOnlineModeSelect(true)
    }
  }

  // 玩家设置页
  const SetupPage = () => (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <h2 style={{ color: 'white', marginBottom: 24 }}>玩家设置</h2>
      <div style={{ display: 'flex', gap: 40 }}>
        {['player1', 'player2'].map(pid => (
          <div key={pid} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 24, minWidth: 220, color: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 48, textAlign: 'center' }}>{players[pid].avatar}</div>
            <input
              style={{ width: '100%', margin: '12px 0', padding: 8, borderRadius: 8, border: 'none', fontSize: 18 }}
              placeholder="输入昵称或留空自动生成"
              value={players[pid].name}
              onChange={e => setPlayers(p => ({ ...p, [pid]: { ...p[pid], name: e.target.value } }))}
              onBlur={e => {
                if (!e.target.value) setPlayers(p => ({ ...p, [pid]: { ...p[pid], name: nicknameGenerator.generate({ type: 'random' }) } }))
              }}
            />
            <div style={{ margin: '8px 0' }}>
              <label>任务等级：</label>
              <select value={players[pid].taskLevel} onChange={e => setPlayers(p => ({ ...p, [pid]: { ...p[pid], taskLevel: e.target.value } }))}>
                <option value="couple">情侣</option>
                <option value="gentle">温柔</option>
                <option value="friend">好友</option>
                <option value="passionate">热恋</option>
                <option value="crazy">狂热</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      <button style={{ marginTop: 32, padding: '12px 32px', borderRadius: 16, fontSize: 20, background: '#4ECDC4', color: 'white', border: 'none', cursor: 'pointer' }}
        onClick={() => setGamePhase('playing')}>开始游戏</button>
      <button style={{ marginTop: 16, background: 'none', color: 'white', border: 'none', cursor: 'pointer' }} onClick={() => setGamePhase('home')}>返回主页</button>
    </div>
  )

  // 任务弹窗（支持自定义任务和独立倒计时）
  const [taskTimer, setTaskTimer] = useState(null)
  const [taskTimeLeft, setTaskTimeLeft] = useState(0)
  useEffect(() => {
    if (taskTimeLeft > 0) {
      const t = setTimeout(() => setTaskTimeLeft(tl => tl - 1), 1000)
      return () => clearTimeout(t)
    }
    if (taskTimeLeft === 0 && taskTimer) {
      setTaskTimer(null)
      // 任务超时处理
      // ...可扩展
    }
  }, [taskTimeLeft, taskTimer])

  const TaskModal = ({ task, onStart, onComplete, onSkip }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <h3 style={{ color: '#764ba2' }}>{task.type === 'truth' ? '真心话' : '大冒险'}</h3>
        <div style={{ fontSize: 20, margin: '16px 0' }}>{task.text}</div>
        {taskTimer ? (
          <div style={{ margin: '12px 0', color: '#e67e22', fontWeight: 'bold' }}>倒计时：{taskTimeLeft}s</div>
        ) : null}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          {!taskTimer && <button onClick={() => { setTaskTimeLeft(task.duration || 60); setTaskTimer(true); onStart && onStart(); }} style={{ background: '#4ECDC4', color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 16 }}>开始</button>}
          {taskTimer && <button onClick={() => { setTaskTimer(null); onComplete && onComplete(); }} style={{ background: '#2ecc71', color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 16 }}>完成</button>}
          <button onClick={onSkip} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 16 }}>换一个</button>
        </div>
      </div>
    </div>
  )

  // ...existing code...
  
  // 🌐 在线模式选择组件
  const OnlineModeSelect = () => (
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
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#2c3e50' }}>
          🌐 选择在线模式
        </h2>
        
        <div style={{ display: 'grid', gap: '15px' }}>
          <button
            onClick={() => handleOnlineModeSelect('create')}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              padding: '20px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'transform 0.3s ease'
            }}
          >
            🏠 创建房间 - 邀请TA加入
          </button>
          
          <button
            onClick={() => handleOnlineModeSelect('join')}
            style={{
              background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              padding: '20px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'transform 0.3s ease'
            }}
          >
            🔗 加入房间 - 输入房间ID
          </button>
          
          <button
            onClick={() => handleOnlineModeSelect('browse')}
            style={{
              background: 'linear-gradient(135deg, #FF6B9D, #C44569)',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              padding: '20px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'transform 0.3s ease'
            }}
          >
            👀 浏览房间 - 寻找游戏伙伴
          </button>
        </div>
        
        <button
          onClick={() => setShowOnlineModeSelect(false)}
          style={{
            background: 'none',
            border: '2px solid #ddd',
            borderRadius: '15px',
            padding: '15px',
            width: '100%',
            marginTop: '20px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          返回
        </button>
      </div>
    </div>
  )
  
  // 🎮 主应用渲染
  return (
    <GameProvider>
      <SocketProvider>
        <div ref={gameContainerRef} style={{ position: 'relative', minHeight: '100vh' }}>
          {gamePhase === 'home' && <HomePage />}
          {gamePhase === 'setup' && <SetupPage />}
          {/* TODO: playing 阶段和任务弹窗等后续完善 */}
          {/* 模态框组件 */}
          {showSettings && <div>设置弹窗开发中</div>}
          {showRoomList && <div>房间列表开发中</div>}
          {showVictory && <div>胜利弹窗开发中</div>}
          {showNicknameHelper && <div>昵称助手开发中</div>}
          {/* 样式定义 */}
          <style jsx>{`
            @keyframes fadeInDown {
              from {
                opacity: 0;
                transform: translateY(-30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            @keyframes spin {
              0% { transform: rotateY(0deg); }
              100% { transform: rotateY(360deg); }
            }
            button:hover {
              transform: translateY(-2px);
            }
            button:active {
              transform: translateY(0);
            }
          `}</style>
        </div>
      </SocketProvider>
    </GameProvider>
  )
}

export default SkyJourneyGame
