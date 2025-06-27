import React, { useState, useEffect, useRef } from 'react'

// 🎮 Sky Journey for Two - 飞行棋游戏改进版
// 修复：真正的棋盘地图、BGM音效、统一任务类型选择、投骰子前选择真心话/大冒险

// 智能昵称生成器
const generateNickname = () => {
  const prefixes = ['甜心', '宝贝', '小可爱', '小天使', '小公主', '小王子']
  const words = ['兔子', '猫咪', '狐狸', '熊猫', '企鹅', '樱花', '星星', '月亮']
  const suffixes = ['酱', '君', '喵', '宝宝', '妹妹', '哥哥']
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const word = words[Math.floor(Math.random() * words.length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
  
  return Math.random() > 0.5 ? `${prefix}${word}` : `${word}${suffix}`
}// 音效管理器
class AudioManager {
  constructor() {
    this.audioContext = null
    this.bgmAudio = null
    this.isBGMPlaying = false
    this.volume = 0.5
    this.bgmEnabled = false
    this.initAudio()
  }

  async initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      // 尝试加载BGM文件
      this.loadBGM()
    } catch (error) {
      console.warn('音频初始化失败:', error)
    }
  }

  async loadBGM() {
    try {
      // 尝试加载用户上传的音频文件或示例文件
      const bgmSources = [
        './bgm.mp4',
        './bgm.mp3',
        './bgm.wav', // 支持WAV格式
        './music/bgm.mp4',
        './music/bgm.mp3',
        './music/bgm.wav',
        './assets/bgm.mp4',
        './assets/bgm.mp3',
        './assets/bgm.wav'
      ]
      
      for (const src of bgmSources) {
        try {
          const audio = new Audio(src)
          audio.loop = true
          audio.volume = this.volume
          audio.preload = 'auto'
          
          // 测试音频是否可以加载
          await new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', resolve, { once: true })
            audio.addEventListener('error', reject, { once: true })
            audio.load()
          })
          
          this.bgmAudio = audio
          this.bgmEnabled = true
          console.log('BGM音频加载成功:', src)
          break
        } catch (error) {
          continue
        }
      }
      
      if (!this.bgmAudio) {
        console.log('未找到BGM文件，将使用静音模式')
      }
    } catch (error) {
      console.warn('BGM加载失败:', error)
    }
  }

  // 播放按钮音效
  playButtonSound() {
    if (!this.audioContext) return
    
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)
    
    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + 0.1)
  }

  // 播放骰子音效
  playDiceSound() {
    if (!this.audioContext) return
    
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.2)
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3)
    
    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + 0.3)
  }

  // 开始播放BGM
  async startBGM() {
    if (!this.bgmEnabled || !this.bgmAudio || this.isBGMPlaying) return
    
    try {
      await this.bgmAudio.play()
      this.isBGMPlaying = true
      console.log('BGM开始播放')
    } catch (error) {
      console.warn('BGM播放失败:', error)
    }
  }

  stopBGM() {
    if (this.bgmAudio && this.isBGMPlaying) {
      this.bgmAudio.pause()
      this.bgmAudio.currentTime = 0
      this.isBGMPlaying = false
      console.log('BGM已停止')
    }
  }

  toggleBGM() {
    if (this.isBGMPlaying) {
      this.stopBGM()
    } else {
      this.startBGM()
    }
  }

  setVolume(volume) {
    this.volume = volume
    if (this.bgmAudio) {
      this.bgmAudio.volume = volume
    }
  }

  isBGMEnabled() {
    return this.bgmEnabled
  }
}

// 任务库
const TASK_LIBRARIES = {
  couple: {
    name: "💕 甜蜜情侣版",
    tasks: {
      truth: [
        '说出你最想和我一起去的三个地方',
        '告诉我一个只有你知道的关于我的小秘密',
        '分享一个你想和我一起完成的梦想',
        '说出你第一次见到我时的想法',
        '告诉我你最喜欢我的三个特质',
        '描述你心中完美的约会'
      ],
      dare: [
        '给对方一个持续30秒的拥抱',
        '用最温柔的声音对我说一句肉麻的话',
        '为我唱一小段你最喜欢的歌',
        '做一个你觉得最性感的表情',
        '亲吻对方的手背',
        '为对方按摩肩膀2分钟'
      ]
    }
  },
  gentle: {
    name: "🌸 温柔淑女版",
    tasks: {
      truth: [
        '分享一个你童年最美好的回忆',
        '说出三个你觉得最重要的品质',
        '描述你理想中的完美一天',
        '告诉大家你最感谢的一个人',
        '分享一个让你感动的故事',
        '说出你最想学会的技能'
      ],
      dare: [
        '为大家表演一个才艺',
        '做一个你觉得最可爱的表情',
        '模仿一种动物的叫声',
        '用三个词形容今天的心情',
        '做10个优雅的转圈',
        '给大家讲一个有趣的笑话'
      ]
    }
  },
  friend: {
    name: "🤝 好友兄弟版",
    tasks: {
      truth: [
        '说出你最佩服朋友的三个特质',
        '分享一次我们一起做过最疯狂的事',
        '告诉我你觉得友情最重要的是什么',
        '说出你最难忘的一次友谊经历',
        '描述你理想中的朋友',
        '分享一个关于成长的感悟'
      ],
      dare: [
        '和对方来一个兄弟式的拳头碰撞',
        '用说唱的方式介绍自己',
        '做20个俯卧撑',
        '模仿一个搞笑的表情包',
        '跳一段freestyle舞蹈',
        '用方言说一句土味情话'
      ]
    }
  },
  passionate: {
    name: "🔥 热恋火花版",
    tasks: {
      truth: [
        '说出你对我最深的三个感受',
        '描述你想象中我们未来的样子',
        '告诉我你最想为我做的一件事',
        '分享你觉得我们最甜蜜的一个瞬间',
        '说出你希望我们一起改变的一个习惯',
        '描述你眼中我最迷人的时刻'
      ],
      dare: [
        '深情凝视对方30秒不眨眼',
        '用你的方式表达"我爱你"',
        '为对方写一首即兴小诗',
        '模仿我们第一次牵手的情景',
        '说出10个关于对方的赞美',
        '计划一个浪漫的惊喜行程'
      ]
    }
  },
  wild: {
    name: "🌪️ 狂野挑战版", 
    tasks: {
      truth: [
        '说出你最大胆的一个梦想',
        '分享你做过最疯狂的一件事',
        '告诉我你最想挑战的极限运动',
        '描述你理想中的冒险旅程',
        '说出你最想突破的一个恐惧',
        '分享一个你从未告诉过任何人的秘密'
      ],
      dare: [
        '做50个开合跳',
        '用最夸张的方式表演一个情绪',
        '模仿三种不同的动物',
        '倒立30秒',
        '快速说出20个动物名字',
        '闭眼原地转10圈然后直线走路'
      ]
    }
  }
}

// 创建固定的方形飞行棋棋盘 - 类似大富翁布局
const createBoardPositions = () => {
  const positions = []
  const totalPositions = 40 // 增加到40个格子，更像传统棋盘
  const boardSize = 700 // 增大棋盘尺寸
  const cellSize = 70 // 稍微缩小格子，避免重叠
  const margin = 10 // 格子间距
  
  // 分四边排列格子：下边、右边、上边、左边
  for (let i = 0; i < totalPositions; i++) {
    let x, y, side
    
    if (i < 10) {
      // 下边（从左到右）
      side = 'bottom'
      x = i * (cellSize + margin) + margin
      y = boardSize - cellSize - margin
    } else if (i < 20) {
      // 右边（从下到上）
      side = 'right'
      x = boardSize - cellSize - margin
      y = boardSize - cellSize - margin - (i - 10) * (cellSize + margin)
    } else if (i < 30) {
      // 上边（从右到左）
      side = 'top'
      x = boardSize - cellSize - margin - (i - 20) * (cellSize + margin)
      y = margin
    } else {
      // 左边（从上到下）
      side = 'left'
      x = margin
      y = margin + (i - 30) * (cellSize + margin)
    }
    
    positions.push({
      id: i,
      x: x,
      y: y,
      side: side,
      isSpecial: i % 4 === 0 && i !== 0, // 每4格一个任务格
      isStart: i === 0,
      isFinish: i === totalPositions - 1,
      hasTask: i % 3 === 0 || i % 4 === 0, // 更多格子有任务
      tasks: null // 将在游戏开始时初始化
    })
  }
  
  return positions
}

function SkyJourney() {
  // 音效管理器
  const audioManager = useRef(new AudioManager())
  
  // 游戏阶段状态
  const [gamePhase, setGamePhase] = useState('home') // home, setup, playing, finished
  const [selectedTaskType, setSelectedTaskType] = useState('couple') // 统一的任务类型
  
  // 玩家设置
  const [players, setPlayers] = useState({
    player1: { 
      name: '', 
      avatar: '🤴', 
      position: 0, 
      color: '#FF6B9D'
    },
    player2: { 
      name: '', 
      avatar: '👸', 
      position: 0, 
      color: '#4ECDC4'
    }
  })
  
  // 游戏状态
  const [gameState, setGameState] = useState({
    currentPlayer: 'player1',
    diceValue: null,
    isRolling: false,
    canRoll: false, // 需要先选择真心话或大冒险
    winner: null,
    turn: 0,
    totalPositions: 40, // 更新为40个格子
    selectedTaskCategory: null, // 'truth' 或 'dare'
    canChangeTaskType: true, // 是否可以重新选择任务类型
    boardTasks: null // 棋盘所有格子的预设任务
  })
  
  // 任务系统
  const [currentTask, setCurrentTask] = useState(null)
  const [taskTimeLeft, setTaskTimeLeft] = useState(0)
  const [isTaskActive, setIsTaskActive] = useState(false)
  const [selectedCell, setSelectedCell] = useState(null) // 查看任务时选中的格子
  
  // 棋盘位置
  const boardPositions = createBoardPositions()
  
  // 任务倒计时
  useEffect(() => {
    if (isTaskActive && taskTimeLeft > 0) {
      const timer = setTimeout(() => {
        setTaskTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (taskTimeLeft === 0 && isTaskActive) {
      setIsTaskActive(false)
      setCurrentTask(null)
    }
  }, [taskTimeLeft, isTaskActive])

  // 初始化棋盘任务
  const initializeBoardTasks = () => {
    const tasks = {}
    
    boardPositions.forEach(position => {
      if (position.hasTask || position.isSpecial) {
        // 为每个任务格子随机选择真心话和大冒险
        const truthTasks = TASK_LIBRARIES[selectedTaskType].tasks.truth
        const dareTasks = TASK_LIBRARIES[selectedTaskType].tasks.dare
        
        tasks[position.id] = {
          truth: truthTasks[Math.floor(Math.random() * truthTasks.length)],
          dare: dareTasks[Math.floor(Math.random() * dareTasks.length)]
        }
      }
    })
    
    setGameState(prev => ({ ...prev, boardTasks: tasks }))
  }

  // 点击格子查看任务
  const onCellClick = (position) => {
    if (!gameState.boardTasks || (!position.hasTask && !position.isSpecial)) return
    
    const cellTasks = gameState.boardTasks[position.id]
    if (cellTasks) {
      setSelectedCell({
        position: position,
        tasks: cellTasks
      })
    }
  }

  // 关闭任务预览
  const closeCellPreview = () => {
    setSelectedCell(null)
  }

  // 换一换：重新为格子随机选择任务
  const regenerateCellTasks = (cellId) => {
    const truthTasks = TASK_LIBRARIES[selectedTaskType].tasks.truth
    const dareTasks = TASK_LIBRARIES[selectedTaskType].tasks.dare
    
    const newTasks = {
      truth: truthTasks[Math.floor(Math.random() * truthTasks.length)],
      dare: dareTasks[Math.floor(Math.random() * dareTasks.length)]
    }
    
    // 更新游戏状态中的棋盘任务
    setGameState(prev => ({
      ...prev,
      boardTasks: {
        ...prev.boardTasks,
        [cellId]: newTasks
      }
    }))
    
    // 更新当前预览的任务
    if (selectedCell && selectedCell.position.id === cellId) {
      setSelectedCell(prev => ({
        ...prev,
        tasks: newTasks
      }))
    }
    
    // 播放音效
    audioManager.current.playButtonSound()
  }

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
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          animation: 'float 3s ease-in-out infinite'
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
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '20px',
        padding: '40px',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h3 style={{ color: 'white', marginBottom: '30px', fontSize: '1.8rem' }}>
          选择任务类型
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          {Object.entries(TASK_LIBRARIES).map(([key, library]) => (
            <button
              key={key}
              style={{
                background: selectedTaskType === key 
                  ? 'linear-gradient(135deg, #FF6B9D, #FF8E53)' 
                  : 'rgba(255,255,255,0.2)',
                color: 'white',
                border: selectedTaskType === key 
                  ? '2px solid #FF6B9D' 
                  : '1px solid rgba(255,255,255,0.3)',
                padding: '20px',
                borderRadius: '15px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: selectedTaskType === key ? 'scale(1.05)' : 'scale(1)'
              }}
              onClick={() => {
                audioManager.current.playButtonSound()
                setSelectedTaskType(key)
              }}
              onMouseEnter={(e) => {
                if (selectedTaskType !== key) {
                  e.target.style.background = 'rgba(255,255,255,0.3)'
                  e.target.style.transform = 'scale(1.02)'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedTaskType !== key) {
                  e.target.style.background = 'rgba(255,255,255,0.2)'
                  e.target.style.transform = 'scale(1)'
                }
              }}
            >
              {library.name}
            </button>
          ))}
        </div>
        
        <button
          style={{
            background: selectedTaskType 
              ? 'linear-gradient(135deg, #4ECDC4, #44A08D)' 
              : 'rgba(128,128,128,0.5)',
            color: 'white',
            border: 'none',
            padding: '15px 40px',
            borderRadius: '25px',
            fontSize: '18px',
            cursor: selectedTaskType ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            fontWeight: 'bold'
          }}
          disabled={!selectedTaskType}
          onClick={() => {
            if (selectedTaskType) {
              audioManager.current.playButtonSound()
              if (audioManager.current.isBGMEnabled()) {
                audioManager.current.startBGM()
              }
              setGamePhase('setup')
            }
          }}
          onMouseEnter={(e) => {
            if (selectedTaskType) {
              e.target.style.transform = 'scale(1.05)'
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
          }}
        >
          🚀 开始游戏
        </button>
        
        {/* BGM控制 */}
        {audioManager.current.isBGMEnabled() && (
          <div style={{ 
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <span style={{ color: 'white', fontSize: '14px' }}>🎵 背景音乐</span>
            <button
              style={{
                background: audioManager.current.isBGMPlaying ? '#e74c3c' : '#27ae60',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '15px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
              onClick={() => {
                audioManager.current.toggleBGM()
                // 强制重新渲染以更新按钮状态
                setSelectedTaskType(prev => prev)
              }}
            >
              {audioManager.current.isBGMPlaying ? '🔇 关闭' : '🔊 开启'}
            </button>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )

  // 🎮 玩家设置页面
  const PlayerSetup = () => (
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
      
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginBottom: '30px' }}>
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
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <p style={{ color: 'white', fontSize: '1.2rem', marginBottom: '10px' }}>
          已选择任务类型：{TASK_LIBRARIES[selectedTaskType].name}
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <button
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '15px 30px',
            borderRadius: '25px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
          onClick={() => {
            audioManager.current.playButtonSound()
            setGamePhase('home')
          }}
        >
          ⬅️ 返回
        </button>
        
        <button
          style={{
            background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
            color: 'white',
            border: 'none',
            padding: '15px 40px',
            borderRadius: '25px',
            fontSize: '18px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={() => {
            audioManager.current.playButtonSound()
            // 确保玩家都有名字
            const updatedPlayers = { ...players }
            if (!updatedPlayers.player1.name) {
              updatedPlayers.player1.name = generateNickname()
            }
            if (!updatedPlayers.player2.name) {
              updatedPlayers.player2.name = generateNickname()
            }
            setPlayers(updatedPlayers)
            setGameState(prev => ({ ...prev, canRoll: false })) // 需要先选择任务类型
            // 初始化棋盘任务
            initializeBoardTasks()
            setGamePhase('playing')
          }}
        >
          🎯 开始游戏
        </button>
      </div>
    </div>
  )

  // 🎲 掷骰子
  const rollDice = () => {
    if (!gameState.canRoll || gameState.isRolling) return
    
    audioManager.current.playDiceSound()
    setGameState(prev => ({ ...prev, isRolling: true, canRoll: false }))
    
    let rollCount = 0
    const rollInterval = setInterval(() => {
      const newValue = Math.floor(Math.random() * 6) + 1
      setGameState(prev => ({ ...prev, diceValue: newValue }))
      rollCount++
      
      if (rollCount >= 10) {
        clearInterval(rollInterval)
        const finalValue = Math.floor(Math.random() * 6) + 1
        
        setTimeout(() => {
          setGameState(prev => ({ ...prev, isRolling: false, diceValue: finalValue }))
          movePlayer(finalValue)
        }, 200)
      }
    }, 100)
  }

  // 移动玩家
  const movePlayer = (steps) => {
    const currentPlayerKey = gameState.currentPlayer
    const currentPos = players[currentPlayerKey].position
    const newPos = Math.min(currentPos + steps, gameState.totalPositions - 1)
    
    setPlayers(prev => ({
      ...prev,
      [currentPlayerKey]: { ...prev[currentPlayerKey], position: newPos }
    }))
    
    // 检查是否到达终点
    if (newPos >= gameState.totalPositions - 1) {
      setGameState(prev => ({ ...prev, winner: currentPlayerKey }))
      setGamePhase('finished')
      return
    }
    
    // 检查是否触发任务
    const targetPosition = boardPositions[newPos]
    if (targetPosition && targetPosition.isSpecial) {
      // 延迟触发任务，确保移动动画完成
      setTimeout(() => {
        triggerTask()
      }, 500)
    } else {
      // 切换到下一个玩家
      setTimeout(() => {
        switchPlayer()
      }, 500)
    }
  }

  // 触发任务
  const triggerTask = () => {
    const currentPlayerKey = gameState.currentPlayer
    const currentPos = players[currentPlayerKey].position
    const cellTasks = gameState.boardTasks[currentPos]
    
    if (cellTasks) {
      const taskCategory = gameState.selectedTaskCategory // 'truth' 或 'dare'
      const taskText = cellTasks[taskCategory]
      
      setCurrentTask({
        text: taskText,
        category: taskCategory,
        duration: 60 // 固定60秒倒计时
      })
      setTaskTimeLeft(60)
      setIsTaskActive(true)
    }
  }

  // 切换玩家
  const switchPlayer = () => {
    setGameState(prev => ({
      ...prev,
      currentPlayer: prev.currentPlayer === 'player1' ? 'player2' : 'player1',
      turn: prev.turn + 1,
      canRoll: false, // 下一个玩家需要重新选择任务类型
      selectedTaskCategory: null,
      canChangeTaskType: true
    }))
  }

  // 选择任务类型（真心话/大冒险）
  const selectTaskCategory = (category) => {
    audioManager.current.playButtonSound()
    setGameState(prev => ({
      ...prev,
      selectedTaskCategory: category,
      canRoll: true,
      canChangeTaskType: false // 选择后不能立即更改
    }))
  }

  // 重新选择任务类型
  const resetTaskCategory = () => {
    audioManager.current.playButtonSound()
    setGameState(prev => ({
      ...prev,
      selectedTaskCategory: null,
      canRoll: false,
      canChangeTaskType: true
    }))
  }

  // 完成任务
  const completeTask = () => {
    audioManager.current.playButtonSound()
    setIsTaskActive(false)
    setCurrentTask(null)
    switchPlayer()
  }

  // 喝酒跳过任务（视为完成）
  const drinkAndSkip = () => {
    audioManager.current.playButtonSound()
    setIsTaskActive(false)
    setCurrentTask(null)
    // 视为完成任务，进入下一轮
    switchPlayer()
  }

  // 换任务
  const changeTask = () => {
    audioManager.current.playButtonSound()
    setIsTaskActive(false)
    setCurrentTask(null)
    
    // 重新为当前格子生成新任务
    const currentPlayerKey = gameState.currentPlayer
    const currentPos = players[currentPlayerKey].position
    const taskCategory = gameState.selectedTaskCategory
    
    const taskLibrary = TASK_LIBRARIES[selectedTaskType].tasks[taskCategory]
    const newTask = taskLibrary[Math.floor(Math.random() * taskLibrary.length)]
    
    // 更新棋盘任务
    setGameState(prev => ({
      ...prev,
      boardTasks: {
        ...prev.boardTasks,
        [currentPos]: {
          ...prev.boardTasks[currentPos],
          [taskCategory]: newTask
        }
      }
    }))
    
    // 重新触发任务
    setTimeout(() => {
      triggerTask()
    }, 300)
  }

  // 🗺️ 游戏棋盘组件
  const GameBoard = () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px'
    }}>
      <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '2rem' }}>
        ✈️ Sky Journey 飞行棋
      </h2>
      
      {/* 当前玩家信息和控制 */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        color: 'white',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <p style={{ fontSize: '1.2rem', margin: '0 0 10px 0' }}>
            当前玩家: {players[gameState.currentPlayer].avatar} {players[gameState.currentPlayer].name}
          </p>
          <p style={{ fontSize: '1rem', margin: 0 }}>
            任务类型: {TASK_LIBRARIES[selectedTaskType].name}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* BGM控制按钮 */}
          {audioManager.current.isBGMEnabled() && (
            <button
              style={{
                background: audioManager.current.isBGMPlaying ? '#e74c3c' : '#27ae60',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '15px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
              onClick={() => {
                audioManager.current.toggleBGM()
                setGameState(prev => ({ ...prev })) // 强制重新渲染
              }}
            >
              {audioManager.current.isBGMPlaying ? '🔇' : '🔊'}
            </button>
          )}
          
          {/* 退出游戏按钮 */}
          <button
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 16px',
              borderRadius: '15px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
            onClick={() => {
              audioManager.current.playButtonSound()
              audioManager.current.stopBGM()
              if (confirm('确定要退出游戏吗？')) {
                setGamePhase('home')
              }
            }}
          >
            🏠 退出
          </button>
        </div>
      </div>

      {/* 选择真心话/大冒险 */}
      {(!gameState.canRoll || gameState.canChangeTaskType) && (
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          textAlign: 'center'
        }}>
          <p style={{ color: 'white', marginBottom: '15px', fontSize: '1.1rem' }}>
            选择你的挑战类型：
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '15px' }}>
            <button
              style={{
                background: gameState.selectedTaskCategory === 'truth' 
                  ? 'linear-gradient(135deg, #FF6B9D, #FF8E53)' 
                  : 'rgba(255,255,255,0.3)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '20px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transform: gameState.selectedTaskCategory === 'truth' ? 'scale(1.05)' : 'scale(1)'
              }}
              onClick={() => selectTaskCategory('truth')}
            >
              💭 真心话
            </button>
            <button
              style={{
                background: gameState.selectedTaskCategory === 'dare' 
                  ? 'linear-gradient(135deg, #4ECDC4, #44A08D)' 
                  : 'rgba(255,255,255,0.3)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '20px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transform: gameState.selectedTaskCategory === 'dare' ? 'scale(1.05)' : 'scale(1)'
              }}
              onClick={() => selectTaskCategory('dare')}
            >
              🎪 大冒险
            </button>
          </div>
          
          {gameState.selectedTaskCategory && !gameState.canChangeTaskType && (
            <button
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '8px 16px',
                borderRadius: '15px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
              onClick={resetTaskCategory}
            >
              🔄 重新选择
            </button>
          )}
        </div>
      )}

      {/* 骰子区域 */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '15px',
          animation: gameState.isRolling ? 'spin 0.1s linear infinite' : 'none'
        }}>
          🎲
        </div>
        <div style={{ color: 'white', fontSize: '2rem', marginBottom: '15px' }}>
          {gameState.diceValue || '?'}
        </div>
        <button
          style={{
            background: gameState.canRoll 
              ? 'linear-gradient(135deg, #FF6B9D, #FF8E53)' 
              : 'rgba(128,128,128,0.5)',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '25px',
            fontSize: '18px',
            cursor: gameState.canRoll ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }}
          disabled={!gameState.canRoll || gameState.isRolling}
          onClick={rollDice}
        >
          {gameState.isRolling ? '🎲 掷骰中...' : '🎯 掷骰子'}
        </button>
        {gameState.selectedTaskCategory && (
          <p style={{ color: 'white', marginTop: '10px', fontSize: '1rem' }}>
            已选择: {gameState.selectedTaskCategory === 'truth' ? '💭 真心话' : '🎪 大冒险'}
          </p>
        )}
      </div>

      {/* 方形飞行棋棋盘 */}
      <div style={{
        position: 'relative',
        width: '620px',
        height: '620px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        borderRadius: '20px',
        border: '3px solid rgba(255,255,255,0.3)',
        backdropFilter: 'blur(20px)',
        margin: '0 auto',
        padding: '10px'
      }}>
        {/* 中央区域 */}
        <div style={{
          position: 'absolute',
          top: '90px',
          left: '90px',
          width: '420px',
          height: '420px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✈️</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
            Sky Journey
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.8 }}>
            for Two
          </div>
          <div style={{ fontSize: '0.9rem', marginTop: '20px', opacity: 0.6 }}>
            点击格子查看任务
          </div>
        </div>

        {/* 棋盘格子 */}
        {boardPositions.map((position, index) => {
          const hasTask = position.hasTask || position.isSpecial
          const isPlayerHere = Object.values(players).some(player => player.position === index)
          
          return (
            <div
              key={position.id}
              style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                width: '70px',
                height: '70px',
                borderRadius: '10px',
                background: position.isStart 
                  ? 'linear-gradient(135deg, #4ECDC4, #44A08D)'
                  : position.isFinish 
                  ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                  : hasTask
                  ? 'linear-gradient(135deg, #FF6B9D, #FF8E53)'
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                border: isPlayerHere ? '4px solid #FFD700' : '2px solid white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                cursor: hasTask ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                zIndex: 5
              }}
              onClick={() => hasTask && onCellClick(position)}
              onMouseEnter={(e) => {
                if (hasTask) {
                  e.target.style.transform = 'scale(1.05)'
                  e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (hasTask) {
                  e.target.style.transform = 'scale(1)'
                  e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'
                }
              }}
            >
              <div style={{ fontSize: '14px', marginBottom: '2px' }}>
                {position.isStart ? '🏠' : 
                 position.isFinish ? '🏁' : 
                 hasTask ? '💝' : 
                 '⭐'}
              </div>
              <div style={{ fontSize: '9px' }}>{index}</div>
            </div>
          )
        })}

        {/* 玩家棋子 */}
        {Object.entries(players).map(([playerId, player]) => {
          const position = boardPositions[player.position]
          if (!position) return null
          
          // 计算玩家在格子内的偏移位置，避免重叠
          const offsetX = playerId === 'player1' ? -12 : 12
          const offsetY = playerId === 'player1' ? -12 : 12
          
          return (
            <div
              key={playerId}
              style={{
                position: 'absolute',
                left: position.x + 35 + offsetX,
                top: position.y + 35 + offsetY,
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: player.color,
                border: gameState.currentPlayer === playerId ? '3px solid #FFD700' : '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                animation: gameState.currentPlayer === playerId ? 'pulse 1.5s infinite' : 'none',
                zIndex: 20,
                transition: 'all 0.5s ease'
              }}
            >
              {player.avatar}
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
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
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center',
          color: 'white',
          border: '2px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
            {currentTask.category === 'truth' ? '💭' : '🎪'}
          </div>
          
          <h3 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>
            {currentTask.category === 'truth' ? '真心话时间' : '大冒险时间'}
          </h3>
          
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '20px',
            fontSize: '1.2rem',
            lineHeight: '1.6'
          }}>
            {currentTask.text}
          </div>
          
          <div style={{ fontSize: '1.5rem', marginBottom: '25px' }}>
            ⏰ {Math.floor(taskTimeLeft / 60)}:{(taskTimeLeft % 60).toString().padStart(2, '0')}
          </div>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              style={{
                background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '20px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onClick={completeTask}
            >
              ✅ 完成任务
            </button>
            
            <button
              style={{
                background: 'linear-gradient(135deg, #FFA726, #FF7043)',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '20px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onClick={drinkAndSkip}
            >
              🍷 喝一口酒跳过
            </button>
            
            <button
              style={{
                background: 'linear-gradient(135deg, #AB47BC, #8E24AA)',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '20px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onClick={changeTask}
            >
              🔄 换一个任务
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 📋 格子任务预览弹窗
  const CellPreviewModal = () => {
    if (!selectedCell) return null
    
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
        zIndex: 999
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '30px',
          maxWidth: '600px',
          width: '90%',
          textAlign: 'center',
          color: 'white',
          border: '2px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🎪</div>
          
          <h3 style={{ marginBottom: '25px', fontSize: '1.3rem' }}>
            第 {selectedCell.position.id} 格任务预览
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
            {/* 真心话 */}
            <div style={{
              background: 'rgba(255,107,157,0.3)',
              borderRadius: '15px',
              padding: '20px',
              border: '2px solid rgba(255,107,157,0.5)'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>💭</div>
              <h4 style={{ marginBottom: '10px', color: '#FFB6C1' }}>真心话</h4>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.4', margin: 0 }}>
                {selectedCell.tasks.truth}
              </p>
            </div>
            
            {/* 大冒险 */}
            <div style={{
              background: 'rgba(78,205,196,0.3)',
              borderRadius: '15px',
              padding: '20px',
              border: '2px solid rgba(78,205,196,0.5)'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>🎪</div>
              <h4 style={{ marginBottom: '10px', color: '#98E4E0' }}>大冒险</h4>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.4', margin: 0 }}>
                {selectedCell.tasks.dare}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              style={{
                background: 'linear-gradient(135deg, #FF6B9D, #FF8E53)',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '20px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => regenerateCellTasks(selectedCell.position.id)}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              🔄 换一换
            </button>
            
            <button
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '12px 25px',
                borderRadius: '20px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={closeCellPreview}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              ✖️ 关闭
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
      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      animation: 'celebrate 2s ease-in-out infinite alternate'
    }}>
      <div style={{ fontSize: '6rem', marginBottom: '20px' }}>🏆</div>
      
      <h1 style={{
        fontSize: '3rem',
        color: 'white',
        marginBottom: '20px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      }}>
        恭喜胜利！
      </h1>
      
      <div style={{
        fontSize: '2rem',
        marginBottom: '30px',
        color: 'white'
      }}>
        {players[gameState.winner].avatar} {players[gameState.winner].name} 获得胜利！
      </div>
      
      <div style={{
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px',
        backdropFilter: 'blur(20px)'
      }}>
        <h3 style={{ color: 'white', marginBottom: '15px' }}>🎮 游戏统计</h3>
        <p style={{ color: 'white', margin: '5px 0' }}>总回合数: {gameState.turn}</p>
        <p style={{ color: 'white', margin: '5px 0' }}>使用任务库: {TASK_LIBRARIES[selectedTaskType].name}</p>
      </div>
      
      <button
        style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          border: 'none',
          padding: '15px 40px',
          borderRadius: '25px',
          fontSize: '18px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
        onClick={() => {
          audioManager.current.playButtonSound()
          audioManager.current.stopBGM()
          // 重置游戏
          setGamePhase('home')
          setGameState({
            currentPlayer: 'player1',
            diceValue: null,
            isRolling: false,
            canRoll: false,
            winner: null,
            turn: 0,
            totalPositions: 40,
            selectedTaskCategory: null,
            canChangeTaskType: true,
            boardTasks: null
          })
          setPlayers({
            player1: { name: '', avatar: '🤴', position: 0, color: '#FF6B9D' },
            player2: { name: '', avatar: '👸', position: 0, color: '#4ECDC4' }
          })
          setSelectedTaskType('couple')
          setCurrentTask(null)
          setIsTaskActive(false)
        }}
      >
        🔄 再来一局
      </button>
      
      <style>{`
        @keyframes celebrate {
          0% { transform: scale(1) rotate(0deg); }
          100% { transform: scale(1.05) rotate(2deg); }
        }
      `}</style>
    </div>
  )

  // 根据游戏阶段渲染对应页面
  return (
    <div>
      {gamePhase === 'home' && <HomePage />}
      {gamePhase === 'setup' && <PlayerSetup />}
      {gamePhase === 'playing' && <GameBoard />}
      {gamePhase === 'finished' && <VictoryPage />}
      
      {/* 任务弹窗 */}
      {isTaskActive && <TaskModal />}
      
      {/* 格子任务预览弹窗 */}
      {selectedCell && <CellPreviewModal />}
    </div>
  )
}

export default SkyJourney
