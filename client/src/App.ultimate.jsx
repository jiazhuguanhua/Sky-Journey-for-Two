import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

// 🎪 升级版任务库 - 分级内容
const TASK_LIBRARIES = {
  couple: {
    name: "💕 甜蜜情侣版",
    truth: [
      "说出你最想和我一起去的三个地方",
      "如果我们能重新认识一次，你希望在哪里遇见我？",
      "告诉我一个只有你知道的关于我的小秘密",
      "描述一下你心中完美的约会",
      "说出我做过让你最感动的一件事",
      "如果可以给我们的关系起个代号，你会叫什么？",
      "分享一个你想和我一起完成的梦想",
      "说出你觉得我们最像的动物组合",
      "告诉我你最喜欢我的哪个小习惯",
      "如果要给我们写一首歌，歌名叫什么？"
    ],
    dare: [
      "给对方一个持续30秒的拥抱",
      "用最温柔的声音对我说一句肉麻的话",
      "模仿我刚才的一个小动作",
      "为我唱一小段你最喜欢的歌",
      "给我做一个爱心手势并拍照留念",
      "闭上眼睛让我牵着你的手走10步",
      "用我的语气说一句话",
      "给我一个公主抱（或被公主抱）",
      "为我按摩肩膀1分钟",
      "和我十指紧扣保持2分钟"
    ]
  },
  gentle: {
    name: "🌸 温柔淑女版",
    truth: [
      "分享一个你童年最美好的回忆",
      "说出三个你觉得最重要的品质",
      "描述你理想中的完美一天",
      "告诉我一本对你影响很大的书",
      "分享一个你最想学会的技能",
      "说出你最感激的一个人和原因",
      "描述你心目中的幸福定义",
      "分享一个让你印象深刻的旅行经历",
      "说出你最喜欢的季节和原因",
      "告诉我一个你一直想要实现的小愿望"
    ],
    dare: [
      "为大家表演一个才艺",
      "用不同的语调说'你好'三遍",
      "做一个你觉得最可爱的表情",
      "模仿一种动物的叫声",
      "说出三句赞美对方的话",
      "做一个搞笑的鬼脸让对方笑",
      "用手比划出你的名字",
      "学一种动物走路的样子",
      "为对方整理一下衣服或头发",
      "做10个开合跳"
    ]
  },
  friend: {
    name: "🤝 好友兄弟版",
    truth: [
      "说出你最佩服朋友的三个特质",
      "分享一次我们一起做过最疯狂的事",
      "告诉我你觉得友情最重要的是什么",
      "说出一个你一直想对我说但没说的话",
      "描述你心目中的最佳损友标准",
      "分享一个你觉得我们很默契的时刻",
      "说出你觉得我最大的优点和小缺点",
      "告诉我你最想和我一起挑战的事情",
      "分享一个我帮助过你的难忘经历",
      "说出如果我们是超级英雄组合，我们叫什么"
    ],
    dare: [
      "和对方来一个兄弟式的拳头碰撞",
      "模仿对方的一个经典动作",
      "用说唱的方式介绍自己",
      "做20个俯卧撑",
      "学一段广场舞动作",
      "大声喊出对方的外号3遍",
      "做一个超级英雄的经典动作",
      "用方言说一段绕口令",
      "表演一段无实物表演",
      "和对方来一个创意击掌"
    ]
  },
  passionate: {
    name: "🔥 热恋激情版",
    truth: [
      "说出你对我最深的三个渴望",
      "描述你最想和我度过的浪漫时光",
      "告诉我你最无法抗拒我的哪一点",
      "分享你对我们未来最美好的憧憬",
      "说出你觉得我们最有化学反应的时刻",
      "告诉我你最想听我对你说的话",
      "描述你心中我们最完美的相处模式",
      "说出你觉得我最性感迷人的瞬间",
      "分享一个关于我们的甜蜜幻想",
      "告诉我你最想和我一起创造的回忆"
    ],
    dare: [
      "深情凝视对方的眼睛30秒",
      "轻抚对方的脸颊并说'我爱你'",
      "给对方一个充满爱意的亲吻",
      "紧紧拥抱对方并在耳边说悄悄话",
      "为对方献上一支浪漫的舞蹈",
      "用最撩人的语气说一句情话",
      "给对方做一个心跳加速的眼神",
      "温柔地为对方整理头发",
      "和对方一起慢慢跳一支舞",
      "在对方额头轻吻并说甜言蜜语"
    ]
  },
  wild: {
    name: "🌪️ 狂野挑战版",
    truth: [
      "说出你最大胆的三个梦想",
      "分享你做过最疯狂的一件事",
      "告诉我你最想挑战的极限运动",
      "说出你觉得最刺激的冒险经历",
      "描述你想象中最疯狂的约会方式",
      "分享一个你从未告诉过任何人的秘密",
      "说出你最想和我一起做的疯狂事情",
      "告诉我你最大胆的人生计划",
      "描述你心中最理想的叛逆时刻",
      "说出你觉得最能释放自我的方式"
    ],
    dare: [
      "做一个最具挑战性的瑜伽动作",
      "大声唱一首歌给所有人听",
      "表演一段你的独创舞蹈",
      "做50个跳跃运动",
      "模仿一位明星的经典动作",
      "即兴表演一段戏剧独白",
      "挑战一个高难度的平衡动作",
      "用最夸张的方式表达开心",
      "做一个让人印象深刻的鬼脸",
      "展示你最特别的一个技能"
    ]
  }
}

// 🎲 随机名字生成器
const NAME_GENERATORS = {
  cute: ["小可爱", "甜心", "宝贝", "小天使", "糖果", "小星星", "蜜桃", "小兔子"],
  cool: ["酷哥", "女神", "大佬", "王者", "传奇", "英雄", "冠军", "巨星"],
  funny: ["逗比", "搞笑王", "快乐豆", "笑话精", "幽默大师", "开心果", "笑容满面", "乐天派"],
  romantic: ["心动", "浪漫", "甜蜜", "温柔", "深情", "柔情", "蜜意", "倾心"]
}

function generateRandomName() {
  const categories = Object.values(NAME_GENERATORS)
  const randomCategory = categories[Math.floor(Math.random() * categories.length)]
  const randomName = randomCategory[Math.floor(Math.random() * randomCategory.length)]
  const randomNumber = Math.floor(Math.random() * 999) + 1
  return `${randomName}${randomNumber}`
}

// 🎵 音效管理器
class SoundManager {
  constructor() {
    this.sounds = {}
    this.bgm = null
    this.volume = 0.5
    this.bgmVolume = 0.3
    this.isEnabled = true
  }

  // 创建音效（使用Web Audio API模拟）
  createBeep(frequency, duration, type = 'sine') {
    if (!this.isEnabled) return
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = frequency
      oscillator.type = type
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    } catch (e) {
      console.log('音效播放失败:', e)
    }
  }

  playDiceRoll() {
    // 骰子滚动音效
    this.createBeep(800, 0.1)
    setTimeout(() => this.createBeep(600, 0.1), 100)
    setTimeout(() => this.createBeep(400, 0.2), 200)
  }

  playMove() {
    // 移动音效
    this.createBeep(523, 0.2) // C5
  }

  playTask() {
    // 任务音效
    this.createBeep(659, 0.3) // E5
    setTimeout(() => this.createBeep(783, 0.3), 150) // G5
  }

  playVictory() {
    // 胜利音效
    const melody = [523, 659, 783, 1047] // C-E-G-C
    melody.forEach((freq, index) => {
      setTimeout(() => this.createBeep(freq, 0.4), index * 200)
    })
  }

  playButton() {
    // 按钮点击音效
    this.createBeep(800, 0.1)
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  toggle() {
    this.isEnabled = !this.isEnabled
  }
}

// 全局音效管理器
const soundManager = new SoundManager()

// 简化的游戏状态管理
const useGameState = () => {
  const [gameState, setGameState] = useState({
    mode: null,
    roomId: null,
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
    taskLibrary: 'couple',
    canRollDice: true,
    showVictory: false,
    winner: null,
    isConnected: false,
    diceAnimation: false
  })

  return { gameState, setGameState }
}

// 🎲 动画骰子组件
function AnimatedDice({ value, isRolling, onClick, disabled }) {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setRotation(prev => prev + 90)
      }, 100)
      
      setTimeout(() => {
        clearInterval(interval)
        setRotation(0)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isRolling])

  const diceStyle = {
    display: 'inline-flex',
    fontSize: '5rem',
    margin: '20px',
    padding: '25px',
    background: isRolling 
      ? 'linear-gradient(45deg, #FF6B8A, #4A90E2)' 
      : 'linear-gradient(135deg, #fff, #f8f9fa)',
    borderRadius: '20px',
    border: '4px solid #34495e',
    minWidth: '120px',
    minHeight: '120px',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: disabled ? 'none' : '0 8px 25px rgba(0,0,0,0.2)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    transform: `rotate(${rotation}deg) scale(${isRolling ? 1.1 : 1})`,
    opacity: disabled ? 0.6 : 1,
    animation: isRolling ? 'shake 0.1s infinite' : 'none'
  }

  return (
    <>
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0) rotate(${rotation}deg); }
            25% { transform: translateX(-5px) rotate(${rotation + 22.5}deg); }
            75% { transform: translateX(5px) rotate(${rotation - 22.5}deg); }
          }
        `}
      </style>
      <div 
        style={diceStyle}
        onClick={disabled ? undefined : onClick}
        onMouseOver={(e) => {
          if (!disabled) {
            e.target.style.transform = `rotate(${rotation}deg) scale(1.05)`
            soundManager.playButton()
          }
        }}
        onMouseOut={(e) => {
          if (!disabled) {
            e.target.style.transform = `rotate(${rotation}deg) scale(1)`
          }
        }}
      >
        {value || '🎲'}
      </div>
    </>
  )
}

// 任务难度选择组件
function TaskLibrarySelector({ currentLibrary, onLibraryChange }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.15)',
      borderRadius: '20px',
      padding: '20px',
      marginBottom: '20px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      <h3 style={{ color: '#2C3E50', marginBottom: '15px', textAlign: 'center' }}>
        🎪 选择任务难度
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '10px'
      }}>
        {Object.entries(TASK_LIBRARIES).map(([key, library]) => (
          <button
            key={key}
            style={{
              background: currentLibrary === key 
                ? 'linear-gradient(45deg, #FF6B8A, #4A90E2)'
                : 'rgba(255,255,255,0.8)',
              color: currentLibrary === key ? 'white' : '#2C3E50',
              border: 'none',
              padding: '12px 8px',
              borderRadius: '15px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onClick={() => {
              onLibraryChange(key)
              soundManager.playButton()
            }}
            onMouseOver={(e) => {
              if (currentLibrary !== key) {
                e.target.style.background = 'rgba(255,255,255,0.9)'
              }
            }}
            onMouseOut={(e) => {
              if (currentLibrary !== key) {
                e.target.style.background = 'rgba(255,255,255,0.8)'
              }
            }}
          >
            {library.name}
          </button>
        ))}
      </div>
    </div>
  )
}

// 任务弹窗组件 - 升级版
function TaskModal({ task, taskType, playerName, taskLibrary, onComplete, onClose }) {
  const [timeLeft, setTimeLeft] = useState(60)
  
  useEffect(() => {
    soundManager.playTask()
    
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

  const libraryInfo = TASK_LIBRARIES[taskLibrary]

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'taskFadeIn 0.3s ease-in'
    }}>
      <style>
        {`
          @keyframes taskFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes taskSlideIn {
            from { 
              opacity: 0; 
              transform: translateY(-50px) scale(0.8); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1); 
            }
          }
        `}
      </style>
      <div style={{
        background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
        padding: '40px',
        borderRadius: '25px',
        maxWidth: '600px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        animation: 'taskSlideIn 0.3s ease-out'
      }}>
        {/* 任务库标识 */}
        <div style={{
          background: 'linear-gradient(45deg, #FF6B8A, #4A90E2)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '20px',
          display: 'inline-block'
        }}>
          {libraryInfo.name}
        </div>

        <div style={{
          fontSize: '4rem',
          marginBottom: '20px',
          animation: 'bounce 2s infinite'
        }}>
          {taskType === 'truth' ? '💭' : '🎪'}
        </div>
        
        <h3 style={{
          color: taskType === 'truth' ? '#4A90E2' : '#FF6B8A',
          marginBottom: '20px',
          fontSize: '2rem',
          fontWeight: 'bold'
        }}>
          {taskType === 'truth' ? '真心话时间' : '大冒险挑战'}
        </h3>
        
        <div style={{
          background: taskType === 'truth' ? 'rgba(74,144,226,0.1)' : 'rgba(255,107,138,0.1)',
          padding: '25px',
          borderRadius: '20px',
          marginBottom: '25px',
          border: `3px solid ${taskType === 'truth' ? '#4A90E2' : '#FF6B8A'}`
        }}>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.6', margin: 0, color: '#7f8c8d' }}>
            <strong style={{ color: '#2C3E50' }}>{playerName}</strong>，你的挑战是：
          </p>
          <p style={{ 
            fontSize: '1.4rem', 
            fontWeight: 'bold', 
            margin: '20px 0', 
            color: '#2C3E50',
            lineHeight: '1.5'
          }}>
            {task}
          </p>
        </div>

        {taskType === 'dare' && (
          <div style={{
            background: timeLeft > 10 ? 
              'linear-gradient(45deg, #2ecc71, #27ae60)' : 
              'linear-gradient(45deg, #e74c3c, #c0392b)',
            color: 'white',
            padding: '20px',
            borderRadius: '50%',
            width: '100px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '20px auto',
            fontSize: '2rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
          }}>
            {timeLeft}s
          </div>
        )}

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button
            style={{
              background: 'linear-gradient(45deg, #2ecc71, #27ae60)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontSize: '18px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 6px 20px rgba(46,204,113,0.4)',
              transition: 'all 0.3s ease'
            }}
            onClick={() => {
              soundManager.playButton()
              onComplete()
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            ✅ 完成挑战
          </button>
          
          <button
            style={{
              background: 'linear-gradient(45deg, #f39c12, #e67e22)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontSize: '18px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 6px 20px rgba(243,156,18,0.4)',
              transition: 'all 0.3s ease'
            }}
            onClick={() => {
              soundManager.playButton()
              onClose()
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🔄 换个挑战
          </button>
        </div>
      </div>
    </div>
  )
}

// 音效控制组件
function SoundControls() {
  const [volume, setVolume] = useState(50)
  const [isEnabled, setIsEnabled] = useState(true)

  useEffect(() => {
    soundManager.setVolume(volume / 100)
  }, [volume])

  const toggleSound = () => {
    soundManager.toggle()
    setIsEnabled(!isEnabled)
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'rgba(255,255,255,0.9)',
      borderRadius: '15px',
      padding: '15px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          style={{
            background: isEnabled ? '#2ecc71' : '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          onClick={toggleSound}
        >
          {isEnabled ? '🔊' : '🔇'}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={{ width: '80px' }}
          disabled={!isEnabled}
        />
      </div>
    </div>
  )
}

// 继续下一部分...

// 胜利动画组件 - 升级版
function VictoryModal({ winner, onRestart, onExit }) {
  useEffect(() => {
    soundManager.playVictory()
  }, [])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(45deg, rgba(255,107,138,0.95), rgba(74,144,226,0.95))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'victoryFadeIn 0.8s ease-in'
    }}>
      <style>
        {`
          @keyframes victoryFadeIn {
            from { opacity: 0; background: rgba(0,0,0,0.8); }
            to { opacity: 1; }
          }
          @keyframes victoryBounce {
            0% { 
              opacity: 0; 
              transform: scale(0.3) translateY(-100px) rotate(-180deg); 
            }
            50% { 
              transform: scale(1.2) translateY(0) rotate(0deg); 
            }
            100% { 
              opacity: 1; 
              transform: scale(1) translateY(0) rotate(0deg); 
            }
          }
          @keyframes fireworks {
            0%, 100% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.1) rotate(5deg); }
            75% { transform: scale(1.1) rotate(-5deg); }
          }
          @keyframes sparkle {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}
      </style>
      <div style={{
        background: 'white',
        padding: '60px',
        borderRadius: '30px',
        textAlign: 'center',
        boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
        animation: 'victoryBounce 1s ease-out',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 装饰性烟花效果 */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          fontSize: '2rem',
          animation: 'fireworks 2s infinite'
        }}>✨</div>
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          fontSize: '2rem',
          animation: 'fireworks 2s infinite 0.5s'
        }}>🎉</div>
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '20px',
          fontSize: '2rem',
          animation: 'sparkle 1.5s infinite'
        }}>⭐</div>
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '20px',
          fontSize: '2rem',
          animation: 'sparkle 1.5s infinite 0.7s'
        }}>💫</div>

        <div style={{
          fontSize: '6rem',
          marginBottom: '20px',
          animation: 'bounce 2s infinite'
        }}>
          🏆
        </div>
        
        <h1 style={{
          background: 'linear-gradient(45deg, #FF6B8A, #4A90E2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '3.5rem',
          marginBottom: '20px',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>
          🎊 胜利时刻！🎊
        </h1>
        
        <div style={{
          background: 'linear-gradient(135deg, #FFE5F1, #E8F4FD)',
          padding: '30px',
          borderRadius: '25px',
          marginBottom: '40px',
          border: '3px solid rgba(255,107,138,0.3)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '15px' }}>
            {winner.avatar}
          </div>
          <p style={{ fontSize: '2rem', margin: 0, color: '#2C3E50', fontWeight: 'bold' }}>
            🎉 <strong>{winner.name}</strong> 勇夺冠军！
          </p>
          <p style={{ fontSize: '1.2rem', margin: '15px 0 0', color: '#7f8c8d' }}>
            在爱情的飞行棋中，你们都是彼此的赢家 💕
          </p>
        </div>

        <div style={{ display: 'flex', gap: '25px', justifyContent: 'center' }}>
          <button
            style={{
              background: 'linear-gradient(45deg, #FF6B8A, #FF8FA3)',
              color: 'white',
              border: 'none',
              padding: '18px 35px',
              borderRadius: '30px',
              fontSize: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 8px 25px rgba(255,107,138,0.4)',
              transition: 'all 0.3s ease'
            }}
            onClick={() => {
              soundManager.playButton()
              onRestart()
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-4px) scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0) scale(1)'}
          >
            🔄 再来一局
          </button>
          
          <button
            style={{
              background: 'linear-gradient(45deg, #4A90E2, #67A3E8)',
              color: 'white',
              border: 'none',
              padding: '18px 35px',
              borderRadius: '30px',
              fontSize: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 8px 25px rgba(74,144,226,0.4)',
              transition: 'all 0.3s ease'
            }}
            onClick={() => {
              soundManager.playButton()
              onExit()
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-4px) scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0) scale(1)'}
          >
            🏠 返回主页
          </button>
        </div>
      </div>
    </div>
  )
}

// 在线房间连接组件
function OnlineRoomModal({ onCreateRoom, onJoinRoom, onClose }) {
  const [roomId, setRoomId] = useState('')
  const [isCreating, setIsCreating] = useState(false)

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
        background: 'white',
        borderRadius: '25px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ color: '#2C3E50', marginBottom: '30px' }}>
          🌐 在线对战设置
        </h2>

        <div style={{ display: 'grid', gap: '20px', marginBottom: '30px' }}>
          <button
            style={{
              background: 'linear-gradient(45deg, #2ecc71, #27ae60)',
              color: 'white',
              border: 'none',
              padding: '20px',
              borderRadius: '20px',
              fontSize: '18px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onClick={() => {
              setIsCreating(true)
              onCreateRoom()
            }}
            disabled={isCreating}
          >
            {isCreating ? '⏳ 创建中...' : '🎯 创建新房间'}
          </button>

          <div style={{ textAlign: 'left' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px', 
              fontWeight: 'bold',
              color: '#2C3E50'
            }}>
              或输入房间号加入：
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="输入6位房间号"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  padding: '15px',
                  border: '2px solid #ddd',
                  borderRadius: '15px',
                  fontSize: '16px',
                  textAlign: 'center',
                  letterSpacing: '2px'
                }}
                maxLength={6}
              />
              <button
                style={{
                  background: roomId.length === 6 ? 
                    'linear-gradient(45deg, #4A90E2, #67A3E8)' : 
                    '#95a5a6',
                  color: 'white',
                  border: 'none',
                  padding: '15px 25px',
                  borderRadius: '15px',
                  cursor: roomId.length === 6 ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}
                onClick={() => onJoinRoom(roomId)}
                disabled={roomId.length !== 6}
              >
                加入
              </button>
            </div>
          </div>
        </div>

        <button
          style={{
            background: '#95a5a6',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '20px',
            cursor: 'pointer'
          }}
          onClick={onClose}
        >
          取消
        </button>
      </div>
    </div>
  )
}

// 主页组件 - 升级版
function HomePage({ onStartGame }) {
  const [showSetup, setShowSetup] = useState(false)
  const [showOnlineModal, setShowOnlineModal] = useState(false)
  const [gameMode, setGameMode] = useState(null)
  const [playerNames, setPlayerNames] = useState({ player1: '', player2: '' })
  const [taskLibrary, setTaskLibrary] = useState('couple')

  const handleModeSelect = (mode) => {
    soundManager.playButton()
    setGameMode(mode)
    if (mode === 'online') {
      setShowOnlineModal(true)
    } else {
      setShowSetup(true)
    }
  }

  const handleStartGame = () => {
    const finalNames = {
      player1: playerNames.player1 || generateRandomName(),
      player2: playerNames.player2 || generateRandomName()
    }
    
    soundManager.playButton()
    onStartGame(gameMode, finalNames, taskLibrary)
  }

  const generateNames = () => {
    setPlayerNames({
      player1: generateRandomName(),
      player2: generateRandomName()
    })
    soundManager.playButton()
  }

  if (showOnlineModal) {
    return (
      <>
        <HomePage onStartGame={onStartGame} />
        <OnlineRoomModal
          onCreateRoom={() => {
            // TODO: 实现创建房间逻辑
            setShowOnlineModal(false)
            setShowSetup(true)
          }}
          onJoinRoom={(roomId) => {
            // TODO: 实现加入房间逻辑
            setShowOnlineModal(false)
            setShowSetup(true)
          }}
          onClose={() => setShowOnlineModal(false)}
        />
      </>
    )
  }

  if (!showSetup) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '30px',
          padding: '50px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '40px'
        }}>
          <h1 style={{ 
            color: '#FF6B8A', 
            fontSize: '4rem', 
            marginBottom: '15px',
            textShadow: '3px 3px 6px rgba(0,0,0,0.1)',
            animation: 'glow 2s ease-in-out infinite alternate'
          }}>
            🎮 Sky Journey for Two
          </h1>
          <h2 style={{ 
            color: '#4A90E2', 
            marginBottom: '20px',
            fontSize: '1.8rem',
            fontWeight: '300'
          }}>
            情侣专属·互动飞行棋·甜蜜升级
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.1rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            在爱情的棋盘上，每一步都是甜蜜的冒险 💕
          </p>
        </div>
        
        <style>
          {`
            @keyframes glow {
              from { text-shadow: 3px 3px 6px rgba(0,0,0,0.1), 0 0 20px rgba(255,107,138,0.3); }
              to { text-shadow: 3px 3px 6px rgba(0,0,0,0.1), 0 0 30px rgba(74,144,226,0.5); }
            }
          `}
        </style>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', marginTop: '60px' }}>
          <button 
            style={{
              background: 'linear-gradient(135deg, #FF6B8A, #FF8FA3)',
              color: 'white',
              border: 'none',
              padding: '30px 50px',
              borderRadius: '35px',
              fontSize: '22px',
              cursor: 'pointer',
              minWidth: '280px',
              boxShadow: '0 15px 35px rgba(255,107,138,0.4)',
              fontWeight: 'bold',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => handleModeSelect('offline')}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-8px) scale(1.08)'
              e.target.style.boxShadow = '0 20px 45px rgba(255,107,138,0.6)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)'
              e.target.style.boxShadow = '0 15px 35px rgba(255,107,138,0.4)'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏠</div>
            本地对战
            <div style={{ fontSize: '16px', marginTop: '8px', opacity: 0.9 }}>
              同屏温馨对战
            </div>
          </button>
          
          <button 
            style={{
              background: 'linear-gradient(135deg, #4A90E2, #67A3E8)',
              color: 'white',
              border: 'none',
              padding: '30px 50px',
              borderRadius: '35px',
              fontSize: '22px',
              cursor: 'pointer',
              minWidth: '280px',
              boxShadow: '0 15px 35px rgba(74,144,226,0.4)',
              fontWeight: 'bold',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => handleModeSelect('online')}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-8px) scale(1.08)'
              e.target.style.boxShadow = '0 20px 45px rgba(74,144,226,0.6)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)'
              e.target.style.boxShadow = '0 15px 35px rgba(74,144,226,0.4)'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🌐</div>
            在线对战
            <div style={{ fontSize: '16px', marginTop: '8px', opacity: 0.9 }}>
              跨设备甜蜜连接
            </div>
          </button>
        </div>

        <div style={{ 
          marginTop: '80px', 
          padding: '40px', 
          background: 'rgba(255,255,255,0.15)', 
          borderRadius: '25px', 
          maxWidth: '900px', 
          margin: '80px auto',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ color: '#2C3E50', marginBottom: '30px', fontSize: '2rem' }}>✨ 全新升级特色</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '25px', 
            textAlign: 'left' 
          }}>
            {[
              { icon: '🎲', title: '动画骰子', desc: '震撼的3D滚动效果' },
              { icon: '🎵', title: '沉浸音效', desc: '专业音效和背景音乐' },
              { icon: '🎪', title: '分级任务', desc: '5种难度等级可选' },
              { icon: '🌐', title: '跨设备对战', desc: '真正的在线房间系统' },
              { icon: '🎨', title: '视觉升级', desc: '毛玻璃与渐变特效' },
              { icon: '🤖', title: '智能取名', desc: '自动生成可爱昵称' }
            ].map((feature, index) => (
              <div key={index} style={{
                padding: '20px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.background = 'rgba(255,255,255,0.2)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.background = 'rgba(255,255,255,0.1)'
              }}
              >
                <span style={{ fontSize: '2rem' }}>{feature.icon}</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#2C3E50', fontSize: '1.1rem' }}>
                    {feature.title}
                  </div>
                  <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                    {feature.desc}
                  </div>
                </div>
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
        borderRadius: '30px',
        padding: '50px',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h2 style={{ 
          color: '#FF6B8A', 
          marginBottom: '40px',
          fontSize: '2.5rem'
        }}>
          🎯 游戏设置 - {gameMode === 'offline' ? '本地对战' : '在线对战'}
        </h2>

        {/* 任务难度选择 */}
        <TaskLibrarySelector 
          currentLibrary={taskLibrary}
          onLibraryChange={setTaskLibrary}
        />
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '40px' }}>
          <div style={{ 
            padding: '30px', 
            background: 'rgba(255,255,255,0.2)', 
            borderRadius: '25px', 
            minWidth: '300px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <h3 style={{ color: '#4A90E2', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2rem', marginRight: '10px' }}>👨</span>
              玩家1
            </h3>
            <input 
              type="text"
              placeholder="输入姓名或留空自动生成"
              value={playerNames.player1}
              onChange={(e) => setPlayerNames({...playerNames, player1: e.target.value})}
              style={{
                width: '100%',
                padding: '18px',
                border: '3px solid #4A90E2',
                borderRadius: '20px',
                fontSize: '18px',
                marginTop: '15px',
                background: 'rgba(255,255,255,0.9)',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 25px rgba(74,144,226,0.4)'
                e.target.style.transform = 'scale(1.02)'
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none'
                e.target.style.transform = 'scale(1)'
              }}
            />
          </div>
          
          <div style={{ 
            padding: '30px', 
            background: 'rgba(255,255,255,0.2)', 
            borderRadius: '25px', 
            minWidth: '300px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <h3 style={{ color: '#FF6B8A', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2rem', marginRight: '10px' }}>👩</span>
              玩家2
            </h3>
            <input 
              type="text"
              placeholder="输入姓名或留空自动生成"
              value={playerNames.player2}
              onChange={(e) => setPlayerNames({...playerNames, player2: e.target.value})}
              style={{
                width: '100%',
                padding: '18px',
                border: '3px solid #FF6B8A',
                borderRadius: '20px',
                fontSize: '18px',
                marginTop: '15px',
                background: 'rgba(255,255,255,0.9)',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 25px rgba(255,107,138,0.4)'
                e.target.style.transform = 'scale(1.02)'
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none'
                e.target.style.transform = 'scale(1)'
              }}
            />
          </div>
        </div>

        {/* 随机取名按钮 */}
        <div style={{ marginTop: '30px' }}>
          <button
            style={{
              background: 'linear-gradient(45deg, #f39c12, #e67e22)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 6px 20px rgba(243,156,18,0.3)',
              transition: 'all 0.3s ease'
            }}
            onClick={generateNames}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🎲 随机生成昵称
          </button>
        </div>
        
        <div style={{ marginTop: '50px' }}>
          <button 
            style={{
              background: 'linear-gradient(45deg, #FF6B8A, #4A90E2)',
              color: 'white',
              border: 'none',
              padding: '22px 55px',
              borderRadius: '35px',
              fontSize: '20px',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              marginRight: '25px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onClick={handleStartGame}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-4px) scale(1.05)'
              e.target.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)'
              e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)'
            }}
          >
            🚀 开始甜蜜之旅
          </button>
          
          <button 
            style={{
              background: 'linear-gradient(45deg, #95a5a6, #7f8c8d)',
              color: 'white',
              border: 'none',
              padding: '22px 55px',
              borderRadius: '35px',
              fontSize: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onClick={() => {
              soundManager.playButton()
              setShowSetup(false)
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-4px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            ← 返回选择
          </button>
        </div>
      </div>
    </div>
  )
}

// 游戏棋盘组件 - 终极版
function GameBoard({ gameState, onDiceRoll, onPositionUpdate, onShowTask, onExitGame }) {
  const { players, currentPlayer, diceValue, canRollDice, diceAnimation } = gameState
  const [socket, setSocket] = useState(null)
  
  const positions = Array.from({length: 16}, (_, i) => i)
  
  useEffect(() => {
    if (gameState.mode === 'online') {
      const newSocket = io(SERVER_URL)
      setSocket(newSocket)
      
      // 加入房间
      newSocket.emit('join-room', { 
        roomId: gameState.roomId,
        playerInfo: players[currentPlayer]
      })

      // 监听游戏事件
      newSocket.on('dice-rolled', (data) => {
        onDiceRoll(data.value)
      })

      newSocket.on('player-moved', (data) => {
        onPositionUpdate(data.playerId, data.newPosition)
      })

      return () => newSocket.disconnect()
    }
  }, [gameState.mode])
  
  const getPositionStyle = (index) => {
    const row = Math.floor(index / 4)
    const col = index % 4
    
    return {
      position: 'absolute',
      left: `${col * 95 + 30}px`,
      top: `${row * 95 + 30}px`,
      width: '75px',
      height: '75px',
      background: index === 0 ? 'linear-gradient(135deg, #2ecc71, #27ae60)' : 
                 index === 15 ? 'linear-gradient(135deg, #f1c40f, #f39c12)' : 
                 'linear-gradient(135deg, #ecf0f1, #bdc3c7)',
      border: '3px solid #34495e',
      borderRadius: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '13px',
      fontWeight: 'bold',
      color: index === 0 || index === 15 ? 'white' : '#2c3e50',
      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }
  }

  const rollDice = () => {
    if (!canRollDice) return
    
    soundManager.playDiceRoll()
    const newValue = Math.floor(Math.random() * 6) + 1
    
    if (gameState.mode === 'online' && socket) {
      socket.emit('roll-dice', { value: newValue })
    } else {
      onDiceRoll(newValue)
    }
    
    setTimeout(() => {
      soundManager.playMove()
      const newPosition = Math.min(players[currentPlayer].position + newValue, 15)
      
      if (gameState.mode === 'online' && socket) {
        socket.emit('move-player', { 
          playerId: currentPlayer, 
          newPosition 
        })
      } else {
        onPositionUpdate(currentPlayer, newPosition)
      }
      
      if (newPosition > 0 && newPosition < 15) {
        const taskType = Math.random() > 0.5 ? 'truth' : 'dare'
        const tasks = TASK_LIBRARIES[gameState.taskLibrary][taskType]
        const randomTask = tasks[Math.floor(Math.random() * tasks.length)]
        onShowTask(taskType, randomTask)
      }
    }, 2500)
  }

  return (
    <div style={{ textAlign: 'center', padding: '20px', minHeight: '100vh' }}>
      {/* 顶部工具栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '25px',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '25px',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h2 style={{ color: '#2C3E50', margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '2.5rem', marginRight: '15px' }}>🎲</span>
          Sky Journey 
          {gameState.mode === 'online' && (
            <span style={{ 
              fontSize: '1rem', 
              marginLeft: '15px',
              padding: '5px 15px',
              background: '#2ecc71',
              borderRadius: '15px',
              color: 'white'
            }}>
              🌐 在线模式
            </span>
          )}
        </h2>
        <button
          style={{
            background: 'linear-gradient(45deg, #e74c3c, #c0392b)',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '25px',
            fontSize: '18px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 6px 20px rgba(231,76,60,0.3)'
          }}
          onClick={() => {
            soundManager.playButton()
            onExitGame()
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-3px)'
            e.target.style.boxShadow = '0 8px 25px rgba(231,76,60,0.4)'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 6px 20px rgba(231,76,60,0.3)'
          }}
        >
          🚪 退出游戏
        </button>
      </div>
      
      {/* 玩家状态展示 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', marginBottom: '50px' }}>
        {Object.entries(players).map(([id, player]) => (
          <div 
            key={id}
            style={{ 
              padding: '30px',
              background: currentPlayer == id ? 
                'linear-gradient(135deg, rgba(255,235,59,0.95), rgba(255,193,7,0.9))' : 
                'rgba(255,255,255,0.25)',
              borderRadius: '25px',
              border: currentPlayer == id ? '4px solid #ffeb3b' : '3px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(15px)',
              transition: 'all 0.4s ease',
              transform: currentPlayer == id ? 'scale(1.08)' : 'scale(1)',
              boxShadow: currentPlayer == id ? 
                '0 15px 40px rgba(255,235,59,0.5), 0 0 30px rgba(255,235,59,0.3)' : 
                '0 8px 25px rgba(0,0,0,0.1)',
              minWidth: '200px'
            }}
          >
            <div style={{ 
              fontSize: '4rem', 
              marginBottom: '15px',
              animation: currentPlayer == id ? 'bounce 2s infinite' : 'none'
            }}>
              {player.avatar}
            </div>
            <div style={{ 
              fontWeight: 'bold', 
              color: currentPlayer == id ? '#2c3e50' : (id == 1 ? '#4A90E2' : '#FF6B8A'),
              fontSize: '1.3rem',
              marginBottom: '8px'
            }}>
              {player.name}
            </div>
            <div style={{ 
              color: currentPlayer == id ? '#2c3e50' : '#7f8c8d',
              fontWeight: '600',
              fontSize: '1.1rem'
            }}>
              位置: {player.position}/15
            </div>
            {currentPlayer == id && (
              <div style={{
                marginTop: '15px',
                padding: '8px 15px',
                background: 'rgba(255,255,255,0.9)',
                borderRadius: '15px',
                fontSize: '16px',
                color: '#2c3e50',
                fontWeight: 'bold',
                animation: 'pulse 2s infinite'
              }}>
                ⭐ 你的回合！
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 游戏棋盘 */}
      <div style={{ 
        position: 'relative', 
        width: '420px', 
        height: '420px', 
        margin: '0 auto 50px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '30px',
        border: '4px solid rgba(255,255,255,0.3)',
        backdropFilter: 'blur(25px)',
        padding: '15px',
        boxShadow: '0 15px 40px rgba(0,0,0,0.1)'
      }}>
        {positions.map(index => (
          <div 
            key={index} 
            style={getPositionStyle(index)}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.1)'
              e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.25)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)'
              e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)'
            }}
          >
            {index === 0 && <span style={{ fontSize: '20px' }}>🏁</span>}
            {index === 15 && <span style={{ fontSize: '20px' }}>🏆</span>}
            {index > 0 && index < 15 && index}
            
            {Object.entries(players).map(([id, player]) => 
              player.position === index && (
                <div 
                  key={id}
                  style={{
                    position: 'absolute',
                    top: id == 1 ? '-20px' : '70px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '32px',
                    zIndex: 10,
                    filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))',
                    animation: currentPlayer == id ? 'playerGlow 2s infinite' : 'none'
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
      <div style={{ marginBottom: '40px' }}>
        <AnimatedDice
          value={diceValue}
          isRolling={diceAnimation}
          onClick={rollDice}
          disabled={!canRollDice}
        />
        
        <div style={{ marginTop: '30px' }}>
          <button 
            style={{
              background: canRollDice ? 
                `linear-gradient(135deg, ${currentPlayer == 1 ? '#4A90E2, #67A3E8' : '#FF6B8A, #FF8FA3'})` :
                'linear-gradient(135deg, #95a5a6, #7f8c8d)',
              color: 'white',
              border: 'none',
              padding: '22px 50px',
              borderRadius: '35px',
              fontSize: '20px',
              cursor: canRollDice ? 'pointer' : 'not-allowed',
              boxShadow: canRollDice ? '0 8px 25px rgba(0,0,0,0.2)' : 'none',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              opacity: canRollDice ? 1 : 0.6,
              minWidth: '250px'
            }}
            onClick={rollDice}
            disabled={!canRollDice}
            onMouseOver={(e) => {
              if (canRollDice) {
                e.target.style.transform = 'translateY(-4px) scale(1.05)'
                e.target.style.boxShadow = '0 12px 35px rgba(0,0,0,0.3)'
              }
            }}
            onMouseOut={(e) => {
              if (canRollDice) {
                e.target.style.transform = 'translateY(0) scale(1)'
                e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)'
              }
            }}
          >
            {canRollDice ? (
              <>
                🎲 {players[currentPlayer].name} 投掷骰子
              </>
            ) : (
              <>
                ⏳ 请稍等片刻...
              </>
            )}
          </button>
          
          {!canRollDice && (
            <div style={{
              marginTop: '20px',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '16px',
              animation: 'fade 2s infinite'
            }}>
              骰子冷却中，请耐心等待 ✨
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes playerGlow {
            0%, 100% { filter: drop-shadow(3px 3px 6px rgba(0,0,0,0.4)) drop-shadow(0 0 15px rgba(255,215,0,0.6)); }
            50% { filter: drop-shadow(3px 3px 6px rgba(0,0,0,0.4)) drop-shadow(0 0 25px rgba(255,215,0,0.8)); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes fade {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </div>
  )
}

// 主应用组件 - 终极版
function App() {
  const { gameState, setGameState } = useGameState()

  const handleStartGame = (mode, playerNames, taskLibrary) => {
    setGameState(prev => ({
      ...prev,
      mode,
      gameStarted: true,
      taskLibrary,
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
      canRollDice: false,
      diceAnimation: true
    }))
    
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        diceAnimation: false
      }))
    }, 2000)
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
      
      if (newPosition >= 15) {
        newState.showVictory = true
        newState.winner = prev.players[playerId]
        newState.canRollDice = false
      } else {
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
    const taskType = Math.random() > 0.5 ? 'truth' : 'dare'
    const tasks = TASK_LIBRARIES[gameState.taskLibrary][taskType]
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
      winner: null,
      diceAnimation: false
    }))
  }

  const handleExitGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStarted: false,
      mode: null,
      roomId: null,
      players: {
        1: { name: '玩家1', position: 0, avatar: '👨' },
        2: { name: '玩家2', position: 0, avatar: '👩' }
      },
      currentPlayer: 1,
      diceValue: null,
      showTask: false,
      currentTask: null,
      taskType: null,
      taskLibrary: 'couple',
      canRollDice: true,
      showVictory: false,
      winner: null,
      diceAnimation: false
    }))
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFE5F1 0%, #E8F4FD 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative'
    }}>
      {/* 音效控制 */}
      <SoundControls />
      
      {/* 全局样式 */}
      <style>
        {`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
        `}
      </style>
      
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
      
      {gameState.showTask && (
        <TaskModal
          task={gameState.currentTask}
          taskType={gameState.taskType}
          taskLibrary={gameState.taskLibrary}
          playerName={gameState.players[gameState.currentPlayer === 1 ? 2 : 1].name}
          onComplete={handleTaskComplete}
          onClose={handleTaskClose}
        />
      )}
      
      {gameState.showVictory && (
        <VictoryModal
          winner={gameState.winner}
          onRestart={handleRestart}
          onExit={handleExitGame}
        />
      )}
    </div>
  )
}

export default App
