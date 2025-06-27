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
        '给对方一个持续30秒的拥抱',,
        '用最温柔的声音对我说一句肉麻的话',
        '为我唱一小段你最喜欢的歌',
        '做一个你觉得最性感的表情',
        '亲吻对方的手背',yle舞蹈',
        '为对方按摩肩膀2分钟'
      ]
    }
  },
  gentle: {e: {
    name: "🌸 温柔淑女版",
    tasks: {
      truth: [
        '分享一个你童年最美好的回忆',
        '说出三个你觉得最重要的品质',
        '描述你理想中的完美一天',',
        '告诉大家你最感谢的一个人',间',
        '分享一个让你感动的故事',个习惯',
        '说出你最想学会的技能'刻'
      ],
      dare: [
        '为大家表演一个才艺',眼',
        '做一个你觉得最可爱的表情',
        '模仿一种动物的叫声',,
        '用三个词形容今天的心情',,
        '做10个优雅的转圈',美',
        '给大家讲一个有趣的笑话'
      ]
    }
  },
  friend: {
    name: "🤝 好友兄弟版",, 
    tasks: {
      truth: [
        '说出你最佩服朋友的三个特质',
        '分享一次我们一起做过最疯狂的事',
        '告诉我你觉得友情最重要的是什么',
        '说出你最难忘的一次友谊经历',
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

// 创建固定的方形飞行棋棋盘 - 支持任务格比例设置
const createBoardPositions = (taskRatio = 0.3, totalPositions = 40) => {
  const positions = []
  const boardSize = 600 // 棋盘总尺寸
  const cellSize = 50 // 格子大小
  const perSide = 10 // 每边10个格子
  // 计算格子间距，确保完美适配
  const availableSpace = boardSize - (2 * cellSize)
  const spacing = availableSpace / (perSide - 2)
  for (let i = 0; i < totalPositions; i++) {
    let x, y, side
    if (i < perSide) {
      side = 'bottom'
      if (i === 0) {
        x = 0; y = boardSize - cellSize
      } else if (i === perSide - 1) {
        x = boardSize - cellSize; y = boardSize - cellSize
      } else {
        x = cellSize + (i - 1) * spacing; y = boardSize - cellSize
      }
    } else if (i < perSide * 2) {
      side = 'right'
      const rightIndex = i - perSide
      if (rightIndex === 0) {
        x = boardSize - cellSize; y = boardSize - cellSize
      } else if (rightIndex === perSide - 1) {
        x = boardSize - cellSize; y = 0
      } else {
        x = boardSize - cellSize; y = boardSize - cellSize - (rightIndex * spacing)
      }
    } else if (i < perSide * 3) {
      side = 'top'
      const topIndex = i - (perSide * 2)
      if (topIndex === 0) {
        x = boardSize - cellSize; y = 0
      } else if (topIndex === perSide - 1) {
        x = 0; y = 0
      } else {
        x = boardSize - cellSize - (topIndex * spacing); y = 0
      }
    } else {
      side = 'left'
      const leftIndex = i - (perSide * 3)
      if (leftIndex === 0) {
        x = 0; y = 0
      } else if (leftIndex === perSide - 1) {
        x = 0; y = boardSize - cellSize
      } else {
        x = 0; y = leftIndex * spacing
      }
    }
    positions.push({
      id: i,
      x: Math.round(x),
      y: Math.round(y),
      side: side,
      isStart: i === 0,
      isFinish: i === totalPositions - 1,
      hasTask: false, // 任务格将在游戏开始时随机分配
      tasks: null
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
    canRoll: true, // 游戏开始时就可以掷骰子
    winner: null,
    turn: 0,
    totalPositions: 40, // 更新为40个格子
    selectedTaskCategory: null, // 'truth' 或 'dare'
    canChangeTaskType: true, // 是否可以重新选择任务类型
    boardTasks: null // 棋盘所有格子的预设任务
  })
  
  // 任务系统
  const [currentTask, setCurrentTask] = useState(null);
  const [taskTimeLeft, setTaskTimeLeft] = useState(0);
  const [isTaskActive, setIsTaskActive] = useState(false);
  const [isTimerStarted, setIsTimerStarted] = useState(false); // 计时器是否已开始
  const [showTimerAnimation, setShowTimerAnimation] = useState(false); // 计时完成动画
  const [showCompleteAnimation, setShowCompleteAnimation] = useState(false); // 完成任务动画
  const [showSkipAnimation, setShowSkipAnimation] = useState(false); // 喝酒跳过动画
  const [selectedCell, setSelectedCell] = useState(null); // 查看任务时选中的格子

  // 任务动画与选择状态
  const [showTaskCongrats, setShowTaskCongrats] = useState(false);
  const [showTaskTypeSelect, setShowTaskTypeSelect] = useState(false);
  const [justMoved, setJustMoved] = useState(false); // 标记是否刚刚移动过

  // 任务格比例（可调节）
  const [taskRatio, setTaskRatio] = useState(0.3); // 默认30%为任务格
  const [totalPositions] = useState(40);
  // 棋盘位置
  const [boardPositions, setBoardPositions] = useState(() => createBoardPositions(taskRatio, totalPositions));
  
  // 任务倒计时 - 修改：只有大冒险且计时器启动后才倒计时
  useEffect(() => {
    if (isTaskActive && isTimerStarted && taskTimeLeft > 0 && currentTask?.category === 'dare') {
      const timer = setTimeout(() => {
        setTaskTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (taskTimeLeft === 0 && isTaskActive && isTimerStarted && currentTask?.category === 'dare') {
      // 计时完成，显示动画
      setShowTimerAnimation(true)
      setTimeout(() => {
        setShowTimerAnimation(false)
        setIsTaskActive(false)
        setCurrentTask(null)
        setIsTimerStarted(false)
        switchPlayer()
      }, 2000) // 动画显示2秒
    }
  }, [taskTimeLeft, isTaskActive, isTimerStarted, currentTask])

  // 修复：只有在刚移动完成后才检查任务格
  useEffect(() => {
    if (justMoved && !isTaskActive && !currentTask && !gameState.winner) {
      const currentPlayerKey = gameState.currentPlayer
      const currentPos = players[currentPlayerKey]?.position
      const targetPosition = boardPositions[currentPos]
      
      if (targetPosition && (targetPosition.hasTask || targetPosition.isSpecial) && gameState.boardTasks?.[currentPos]) {
        // 触发任务动画
        setShowTaskCongrats(true)
        setTimeout(() => {
          setShowTaskCongrats(false)
          setShowTaskTypeSelect(true)
        }, 1200)
      }
      
      // 重置移动标记
      setJustMoved(false)
    }
  }, [justMoved, players, gameState, isTaskActive, currentTask, boardPositions])

  // 初始化棋盘任务和任务格
  const initializeBoardTasks = () => {
    // 1. 随机分配任务格
    let positions = createBoardPositions(taskRatio, totalPositions)
    // 除去起点和终点
    const candidateIds = positions.filter(p => !p.isStart && !p.isFinish).map(p => p.id)
    const taskCount = Math.max(1, Math.floor(candidateIds.length * taskRatio))
    // 随机选出任务格id
    const shuffled = [...candidateIds].sort(() => Math.random() - 0.5)
    const taskIds = new Set(shuffled.slice(0, taskCount))
    positions = positions.map(p => ({ ...p, hasTask: taskIds.has(p.id) }))
    setBoardPositions(positions)
    // 2. 为每个任务格分配任务
    const tasks = {}
    positions.forEach(position => {
      if (position.hasTask) {
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

  // 换一换：重新为格子随机选择任务 - 确保不重复
  const regenerateCellTasks = (cellId) => {
    const currentTasks = gameState.boardTasks[cellId]
    if (!currentTasks) return
    
    const truthTasks = TASK_LIBRARIES[selectedTaskType].tasks.truth
    const dareTasks = TASK_LIBRARIES[selectedTaskType].tasks.dare
    
    // 过滤掉当前任务，确保选择不同的任务
    const availableTruthTasks = truthTasks.filter(task => task !== currentTasks.truth)
    const availableDareTasks = dareTasks.filter(task => task !== currentTasks.dare)
    
    // 如果没有其他任务可选，保持原任务
    const newTruthTask = availableTruthTasks.length > 0 
      ? availableTruthTasks[Math.floor(Math.random() * availableTruthTasks.length)]
      : currentTasks.truth
      
    const newDareTask = availableDareTasks.length > 0
      ? availableDareTasks[Math.floor(Math.random() * availableDareTasks.length)]
      : currentTasks.dare
    
    const newTasks = {
      truth: newTruthTask,
      dare: newDareTask
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
        {/* 任务格比例调节 */}
        <div style={{ marginBottom: '20px', color: 'white', fontSize: '1.1rem' }}>
          任务格比例：
          <input
            type="range"
            min="0.1" max="0.7" step="0.05"
            value={taskRatio}
            onChange={e => setTaskRatio(Number(e.target.value))}
            style={{ width: 180, verticalAlign: 'middle', margin: '0 10px' }}
          />
          <span style={{ fontWeight: 'bold', color: '#FFD700' }}>{Math.round(taskRatio * 100)}%</span>
        </div>
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
  // 开始游戏按钮
  <button
    style={{
      background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
      color: 'white',
      border: 'none',
      padding: '15px 40px',
      borderRadius: '25px',
      fontSize: '18px',
      cursor: 'pointer',
      fontWeight: 'bold',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      transition: 'transform 0.2s',
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
      setGameState(prev => ({ ...prev, canRoll: true })) // 游戏开始时可以直接掷骰子
      // 初始化棋盘任务和任务格
      initializeBoardTasks()
      setGamePhase('playing')
    }}
    onMouseDown={e => e.target.style.transform = 'scale(0.95)'}
    onMouseUp={e => e.target.style.transform = 'scale(1)'}
    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
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

  // 移动玩家 - 添加逐格动画
  const movePlayer = (steps) => {
    const currentPlayerKey = gameState.currentPlayer
    const currentPos = players[currentPlayerKey].position
    const finalPos = Math.min(currentPos + steps, gameState.totalPositions - 1)
    
    // 播放移动音效
    audioManager.current.playButtonSound()
    
    // 逐格移动动画
    let currentStep = 0
    const moveInterval = setInterval(() => {
      if (currentStep >= steps || currentPos + currentStep >= gameState.totalPositions - 1) {
        clearInterval(moveInterval)
        
        // 移动完成后的逻辑
        setPlayers(prev => ({
          ...prev,
          [currentPlayerKey]: { ...prev[currentPlayerKey], position: finalPos }
        }))
        
        // 检查是否到达终点
        if (finalPos >= gameState.totalPositions - 1) {
          setGameState(prev => ({ ...prev, winner: currentPlayerKey }))
          setGamePhase('finished')
          return
        }
        
        // 标记刚刚移动完成，触发任务检查
        setJustMoved(true)
        
        // 检查是否触发任务的逻辑将在useEffect中处理
        const targetPosition = boardPositions[finalPos]
        if (!targetPosition || (!targetPosition.hasTask && !targetPosition.isSpecial)) {
          // 如果不是任务格，直接切换玩家
          setTimeout(() => {
            switchPlayer()
          }, 300)
        }
        return
      }
      
      // 逐步移动
      currentStep++
      const nextPos = Math.min(currentPos + currentStep, gameState.totalPositions - 1)
      setPlayers(prev => ({
        ...prev,
        [currentPlayerKey]: { ...prev[currentPlayerKey], position: nextPos }
      }))
      
      // 播放移动音效
      audioManager.current.playButtonSound()
      
    }, 400) // 每400ms移动一格
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
      canRoll: true, // 下一个玩家可以直接掷骰子
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
      canChangeTaskType: false
    }))
    setShowTaskTypeSelect(false)
    
    // 直接触发任务，传入选择的类型
    const currentPlayerKey = gameState.currentPlayer
    const currentPos = players[currentPlayerKey].position
    const cellTasks = gameState.boardTasks[currentPos]
    
    if (cellTasks) {
      const taskText = cellTasks[category] // 直接使用传入的category
      
      setCurrentTask({
        text: taskText,
        category: category,
        duration: 60
      })
      // 只有大冒险才设置倒计时，真心话不设置倒计时
      setTaskTimeLeft(category === 'dare' ? 60 : 0)
      setIsTaskActive(true)
      setIsTimerStarted(false) // 初始状态下计时器未开始
    }
  }

  // 开始计时（仅大冒险任务）
  const startTimer = () => {
    if (currentTask?.category === 'dare') {
      audioManager.current.playButtonSound()
      setIsTimerStarted(true)
    }
  }

  // 完成任务
  const completeTask = () => {
    audioManager.current.playButtonSound()
    setShowCompleteAnimation(true)
    setTimeout(() => {
      setShowCompleteAnimation(false)
      setIsTaskActive(false)
      setCurrentTask(null)
      setIsTimerStarted(false)
      switchPlayer()
    }, 1500)
  }

  // 喝酒跳过任务（视为完成）
  const drinkAndSkip = () => {
    audioManager.current.playDiceSound()
    setShowSkipAnimation(true)
    setTimeout(() => {
      setShowSkipAnimation(false)
      setIsTaskActive(false)
      setCurrentTask(null)
      setIsTimerStarted(false)
      switchPlayer()
    }, 1500)
  }

  // 换任务 - 确保不会抽到相同任务
  const changeTask = () => {
    audioManager.current.playButtonSound()
    
    if (!currentTask) return // 如果没有当前任务，直接返回
    
    const currentPlayerKey = gameState.currentPlayer
    const currentPos = players[currentPlayerKey].position
    const taskCategory = currentTask.category // 使用当前任务的类别
    const currentTaskText = currentTask.text // 当前任务内容
    
    const taskLibrary = TASK_LIBRARIES[selectedTaskType].tasks[taskCategory]
    // 过滤掉当前任务，从剩余任务中随机选择
    const availableTasks = taskLibrary.filter(task => task !== currentTaskText)
    
    if (availableTasks.length === 0) {
      // 如果没有其他任务可选，提示用户
      alert('当前任务库中没有其他任务可选择了！')
      return
    }
    
    const newTask = availableTasks[Math.floor(Math.random() * availableTasks.length)]
    
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
    
    // 直接更新当前任务，不需要重新触发
    setCurrentTask({
      text: newTask,
      category: taskCategory,
      duration: 60
    })
    
    // 重置计时器状态 - 只有大冒险才重置倒计时
    if (taskCategory === 'dare') {
      setTaskTimeLeft(60)
      setIsTimerStarted(false)
    } else {
      // 真心话不设置倒计时
      setTaskTimeLeft(0)
      setIsTimerStarted(false)
    }
  }

  // 🗺️ 游戏棋盘组件
  const GameBoard = () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '2rem' }}>
        ✈️ Sky Journey 飞行棋
      </h2>
      {/* 全局BGM控制按钮，始终显示且风格统一 */}
      <div style={{ position: 'absolute', top: 20, right: 40, zIndex: 100 }}>
        <button
          style={{
            background: audioManager.current.isBGMPlaying ? '#e74c3c' : '#27ae60',
            color: 'white',
            border: 'none',
            padding: '10px 22px',
            borderRadius: '20px',
            fontSize: '18px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
          onClick={() => {
            audioManager.current.toggleBGM()
            // 强制重新渲染
            setGamePhase(prev => prev)
          }}
        >
          {audioManager.current.isBGMPlaying ? '🔇 BGM' : '🔊 BGM'}
        </button>
      </div>
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
        alignItems: 'center',
        width: '650px',
        maxWidth: '100%'
      }}>
        <div>
          <p style={{ fontSize: '1.2rem', margin: '0 0 10px 0' }}>
            当前玩家: {players[gameState.currentPlayer].avatar} {players[gameState.currentPlayer].name}
          </p>
          <p style={{ fontSize: '1rem', margin: 0 }}>
            任务类型: {TASK_LIBRARIES[selectedTaskType].name}
          </p>
        </div>
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

      {/* 任务动画与选择弹窗 */}
      {showTaskCongrats && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          animation: 'fadeIn 0.5s',
        }}>
          <div style={{
            textAlign: 'center',
            color: 'white',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            padding: '60px 40px',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, #FFD700 0%, #FF6B9D 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            🎉 恭喜你触发了任务！
            <div style={{ fontSize: '1.5rem', marginTop: '20px' }}>准备迎接挑战吧！</div>
            {/* 彩带动画 */}
            <div style={{
              position: 'absolute',
              left: 0, right: 0, top: 0, height: '100%',
              pointerEvents: 'none',
              zIndex: 1
            }}>
              {[...Array(12)].map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  left: `${8 + i * 7}%`,
                  top: '-40px',
                  width: '18px',
                  height: '80px',
                  background: `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)} 0%, #${Math.floor(Math.random()*16777215).toString(16)} 100%)`,
                  borderRadius: '10px',
                  opacity: 0.7,
                  transform: `rotate(${Math.random()*60-30}deg)`,
                  animation: `confetti-fall 1.2s cubic-bezier(.6,.2,.4,1) forwards`,
                  animationDelay: `${i*0.08}s`
                }} />
              ))}
            </div>
          </div>
          <style>{`
            @keyframes confetti-fall {
              0% { top: -40px; opacity: 0.7; }
              80% { opacity: 1; }
              100% { top: 120px; opacity: 0; }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      )}
      {showTaskTypeSelect && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '25px',
            padding: '40px 30px',
            textAlign: 'center',
            minWidth: '320px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '20px', color: '#764ba2' }}>请选择挑战类型</div>
            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
              <button
                style={{
                  background: 'linear-gradient(135deg, #FF6B9D, #FF8E53)',
                  color: 'white',
                  border: 'none',
                  padding: '18px 36px',
                  borderRadius: '20px',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                }}
                onClick={() => selectTaskCategory('truth')}
              >💭 真心话</button>
              <button
                style={{
                  background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
                  color: 'white',
                  border: 'none',
                  padding: '18px 36px',
                  borderRadius: '20px',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                }}
                onClick={() => selectTaskCategory('dare')}
              >🎪 大冒险</button>
            </div>
          </div>
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

      {/* 方形飞行棋棋盘 - 优化版 */}
      <div style={{
        position: 'relative',
        width: '650px',
        height: '650px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        borderRadius: '20px',
        border: '3px solid rgba(255,255,255,0.3)',
        backdropFilter: 'blur(20px)',
        margin: '0 auto',
        padding: '25px'
      }}>
        {/* 中央区域 */}
        <div style={{
          position: 'absolute',
          top: '75px',
          left: '75px',
          width: '450px',
          height: '450px',
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
                width: '50px',
                height: '50px',
                borderRadius: '8px',
                background: position.isStart 
                  ? 'linear-gradient(135deg, #4ECDC4, #44A08D)'
                  : position.isFinish 
                  ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                  : hasTask
                  ? 'linear-gradient(135deg, #FF6B9D, #FF8E53)'
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                border: isPlayerHere ? '3px solid #FFD700' : '2px solid white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
                cursor: hasTask ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                zIndex: 5
              }}
              onClick={() => hasTask && onCellClick(position)}
              onMouseEnter={(e) => {
                if (hasTask) {
                  e.target.style.transform = 'scale(1.1)'
                  e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (hasTask) {
                  e.target.style.transform = 'scale(1)'
                  e.target.style.boxShadow = '0 3px 10px rgba(0,0,0,0.3)'
                }
              }}
            >
              <div style={{ fontSize: '12px', marginBottom: '2px' }}>
                {position.isStart ? '🏠' : 
                 position.isFinish ? '🏁' : 
                 hasTask ? '💝' : 
                 '⭐'}
              </div>
              <div style={{ fontSize: '8px' }}>{index}</div>
            </div>
          )
        })}

        {/* 玩家棋子 - 优化位置和动画 */}
        {Object.entries(players).map(([playerId, player]) => {
          const position = boardPositions[player.position]
          if (!position) return null
          
          // 计算玩家在格子内的偏移位置，避免重叠
          const offsetX = playerId === 'player1' ? -8 : 8
          const offsetY = playerId === 'player1' ? -8 : 8
          
          return (
            <div
              key={playerId}
              style={{
                position: 'absolute',
                left: position.x + 25 + offsetX,
                top: position.y + 25 + offsetY,
                width: '25px',
                height: '25px',
                borderRadius: '50%',
                background: player.color,
                border: gameState.currentPlayer === playerId ? '3px solid #FFD700' : '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                boxShadow: '0 3px 12px rgba(0,0,0,0.4)',
                animation: gameState.currentPlayer === playerId ? 'pulse 1.5s infinite' : 'none',
                zIndex: 20,
                transition: 'left 0.4s ease, top 0.4s ease, transform 0.2s ease'
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
        @keyframes jump {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .player-moving {
          animation: jump 0.4s ease-in-out !important;
        }
      `}</style>
    </div>
  )

  // 🎪 任务弹窗（真心话和大冒险不同背景色，优化计时器）
  const TaskModal = () => {
    if (!currentTask) return null
    const isTruth = currentTask.category === 'truth'
    const isDare = currentTask.category === 'dare'
    
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
          background: isTruth
            ? 'linear-gradient(135deg, #FF6B9D 0%, #FF8E53 100%)'
            : 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center',
          color: 'white',
          border: '2px solid rgba(255,255,255,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
            {isTruth ? '💭' : '🎪'}
          </div>
          <h3 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>
            {isTruth ? '真心话时间' : '大冒险时间'}
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
          
          {/* 计时器区域 - 只有大冒险显示 */}
          {isDare && (
            <div style={{ marginBottom: '25px' }}>
              {!isTimerStarted ? (
                <button
                  style={{
                    background: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    border: '2px solid white',
                    padding: '12px 25px',
                    borderRadius: '20px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={startTimer}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.5)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                >
                  ⏰ 点击开始计时
                </button>
              ) : (
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold',
                  color: taskTimeLeft <= 10 ? '#ff4444' : 'white',
                  animation: taskTimeLeft <= 10 ? 'pulse 1s infinite' : 'none'
                }}>
                  ⏰ {Math.floor(taskTimeLeft / 60)}:{(taskTimeLeft % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
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

  // 🏆 胜利页面（动画增强）
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
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 彩带动画 */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
        {[...Array(18)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${5 + i * 5}%`,
            top: '-60px',
            width: '22px',
            height: '120px',
            background: `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)} 0%, #${Math.floor(Math.random()*16777215).toString(16)} 100%)`,
            borderRadius: '12px',
            opacity: 0.8,
            transform: `rotate(${Math.random()*60-30}deg)`,
            animation: `confetti-fall-victory 1.8s cubic-bezier(.6,.2,.4,1) forwards`,
            animationDelay: `${i*0.09}s`
          }} />
        ))}
      </div>
      <div style={{ fontSize: '6rem', marginBottom: '20px', zIndex: 2 }}>🏆</div>
      <h1 style={{
        fontSize: '3rem',
        color: 'white',
        marginBottom: '20px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        zIndex: 2
      }}>
        🎉 恭喜胜利！
      </h1>
      <div style={{
        fontSize: '2rem',
        marginBottom: '30px',
        color: 'white',
        zIndex: 2
      }}>
        {players[gameState.winner].avatar} {players[gameState.winner].name} 获得胜利！
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px',
        backdropFilter: 'blur(20px)',
        zIndex: 2
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
          fontWeight: 'bold',
          zIndex: 2
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
            canRoll: true,
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
        @keyframes confetti-fall-victory {
          0% { top: -60px; opacity: 0.8; }
          80% { opacity: 1; }
          100% { top: 180px; opacity: 0; }
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
      
      {/* 计时完成动画 */}
      {showTimerAnimation && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.5s'
        }}>
          <div style={{
            textAlign: 'center',
            color: 'white',
            fontSize: '3rem',
            fontWeight: 'bold',
            padding: '60px 40px',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, #FF4444 0%, #FF8888 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'pulse 0.8s ease-in-out infinite alternate'
          }}>
            ⏰ 时间到！
            <div style={{ fontSize: '1.5rem', marginTop: '20px' }}>任务时间已结束</div>
            {/* 爆炸动画效果 */}
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '20px',
                height: '20px',
                background: '#FFD700',
                borderRadius: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-60px)`,
                animation: `explosion 1.5s ease-out forwards`,
                animationDelay: `${i * 0.1}s`
              }} />
            ))}
          </div>
          <style>{`
            @keyframes explosion {
              0% { transform: translate(-50%, -50%) rotate(0deg) translateY(0px); opacity: 1; }
              100% { transform: translate(-50%, -50%) rotate(0deg) translateY(-120px); opacity: 0; }
            }
          `}</style>
        </div>
      )}
      {/* 完成任务动画 */}
      {showCompleteAnimation && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.5s'
        }}>
          <div style={{
            textAlign: 'center',
            color: '#FFD700',
            fontSize: '3rem',
            fontWeight: 'bold',
            padding: '60px 40px',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'bounceIn 0.8s'
          }}>
            🎉 完成任务！
            <div style={{ fontSize: '1.5rem', marginTop: '20px', color: '#333' }}>奖励一枚小星星！</div>
            {/* 星星动画 */}
            {[...Array(10)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${30 + Math.random()*40}%`,
                top: `${30 + Math.random()*40}%`,
                width: '18px',
                height: '18px',
                background: 'yellow',
                borderRadius: '50%',
                boxShadow: '0 0 12px 4px #FFD700',
                opacity: 0.8,
                animation: `star-pop 1.2s cubic-bezier(.6,.2,.4,1) forwards`,
                animationDelay: `${i*0.07}s`,
                zIndex: 2
              }} />
            ))}
          </div>
          <style>{`
            @keyframes bounceIn {
              0% { transform: scale(0.5); opacity: 0; }
              60% { transform: scale(1.1); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes star-pop {
              0% { opacity: 0; transform: scale(0.2); }
              60% { opacity: 1; transform: scale(1.2); }
              100% { opacity: 0; transform: scale(0.8) translateY(-60px); }
            }
          `}</style>
        </div>
      )}
      {/* 喝酒跳过动画 */}
      {showSkipAnimation && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.5s'
        }}>
          <div style={{
            textAlign: 'center',
            color: '#fff',
            fontSize: '3rem',
            fontWeight: 'bold',
            padding: '60px 40px',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'shake 0.8s'
          }}>
            🍻 喝一口酒跳过！
            <div style={{ fontSize: '1.5rem', marginTop: '20px', color: '#FFD700' }}>下次加油！</div>
            {/* 酒杯动画 */}
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${40 + Math.random()*20}%`,
                top: `${40 + Math.random()*20}%`,
                width: '22px',
                height: '22px',
                background: 'linear-gradient(135deg, #fffbe7 60%, #FFD700 100%)',
                borderRadius: '6px 6px 12px 12px',
                border: '2px solid #FFD700',
                opacity: 0.9,
                animation: `cup-pop 1.2s cubic-bezier(.6,.2,.4,1) forwards`,
                animationDelay: `${i*0.09}s`,
                zIndex: 2
              }} />
            ))}
          </div>
          <style>{`
            @keyframes shake {
              0% { transform: rotate(-8deg); }
              20% { transform: rotate(8deg); }
              40% { transform: rotate(-6deg); }
              60% { transform: rotate(6deg); }
              80% { transform: rotate(-3deg); }
              100% { transform: rotate(0deg); }
            }
            @keyframes cup-pop {
              0% { opacity: 0; transform: scale(0.2); }
              60% { opacity: 1; transform: scale(1.2); }
              100% { opacity: 0; transform: scale(0.8) translateY(-60px); }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}

export default SkyJourney
