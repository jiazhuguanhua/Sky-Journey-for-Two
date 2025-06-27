// 音效管理器 - 增强版
class AudioManager {
  constructor() {
    this.audioContext = null
    this.sounds = new Map()
    this.bgmAudio = null
    this.currentBGM = null
    this.volume = {
      master: 0.7,
      sfx: 0.5,
      bgm: 0.3
    }
    this.isEnabled = true
    this.isInitialized = false
    
    // BGM库
    this.bgmTracks = {
      romantic: {
        name: '浪漫情调',
        urls: [
          'https://www.soundjay.com/misc/sounds/magic-chime-02.wav',
          'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmoegjyR2e3AciYELYDO8diJOQcZab3t559NEAxPqOLwtmMcBjiR2PF'
        ]
      },
      cheerful: {
        name: '欢快节拍',
        urls: [
          'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        ]
      },
      relaxing: {
        name: '轻松氛围', 
        urls: [
          'https://www.soundjay.com/misc/sounds/wind-chime-1.wav'
        ]
      }
    }
    
    // 音效库
    this.soundEffects = {
      dice: {
        duration: 1.5,
        frequencies: [400, 500, 600, 800, 1000],
        type: 'complex'
      },
      button: {
        duration: 0.3,
        frequency: 800,
        type: 'beep'
      },
      move: {
        duration: 0.5,
        frequency: 600,
        type: 'slide'
      },
      task: {
        duration: 1.0,
        frequency: 1200,
        type: 'ding'
      },
      victory: {
        duration: 3.0,
        frequencies: [523, 659, 784, 1047],
        type: 'melody'
      },
      error: {
        duration: 0.8,
        frequency: 200,
        type: 'buzz'
      }
    }
  }

  // 初始化音频上下文
  async initialize() {
    if (this.isInitialized) return true
    
    try {
      // 创建音频上下文
      const AudioContext = window.AudioContext || window.webkitAudioContext
      this.audioContext = new AudioContext()
      
      // 需要用户交互才能启用音频
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
      
      this.isInitialized = true
      console.log('🎵 Audio Manager initialized')
      return true
    } catch (error) {
      console.warn('❌ Audio initialization failed:', error)
      this.isEnabled = false
      return false
    }
  }

  // 生成音效
  generateSound(config) {
    if (!this.isEnabled || !this.audioContext) return null

    const { duration, frequency, frequencies, type } = config
    
    try {
      switch (type) {
        case 'beep':
          return this.createBeep(frequency, duration)
          
        case 'slide':
          return this.createSlide(frequency, duration)
          
        case 'ding':
          return this.createDing(frequency, duration)
          
        case 'buzz':
          return this.createBuzz(frequency, duration)
          
        case 'complex':
          return this.createComplexSound(frequencies, duration)
          
        case 'melody':
          return this.createMelody(frequencies, duration)
          
        default:
          return this.createBeep(frequency || 440, duration || 0.3)
      }
    } catch (error) {
      console.warn('Sound generation failed:', error)
      return null
    }
  }

  // 创建简单提示音
  createBeep(frequency, duration) {
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume.sfx * this.volume.master, this.audioContext.currentTime + 0.1)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)
    
    return { oscillator, gainNode }
  }

  // 创建滑动音效
  createSlide(startFreq, duration) {
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime)
    oscillator.frequency.linearRampToValueAtTime(startFreq * 1.5, this.audioContext.currentTime + duration)
    
    gainNode.gain.setValueAtTime(this.volume.sfx * this.volume.master, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)
    
    return { oscillator, gainNode }
  }

  // 创建叮当音效
  createDing(frequency, duration) {
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume.sfx * this.volume.master, this.audioContext.currentTime + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)
    
    return { oscillator, gainNode }
  }

  // 创建嗡嗡音效
  createBuzz(frequency, duration) {
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
    
    gainNode.gain.setValueAtTime(this.volume.sfx * this.volume.master, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)
    
    return { oscillator, gainNode }
  }

  // 创建复杂音效（骰子）
  createComplexSound(frequencies, duration) {
    const nodes = []
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * 0.3)
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + index * 0.3)
      gainNode.gain.linearRampToValueAtTime(this.volume.sfx * this.volume.master * 0.3, this.audioContext.currentTime + index * 0.3 + 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)
      
      nodes.push({ oscillator, gainNode })
    })
    
    return nodes
  }

  // 创建旋律（胜利）
  createMelody(frequencies, duration) {
    const nodes = []
    const noteLength = duration / frequencies.length
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * noteLength)
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + index * noteLength)
      gainNode.gain.linearRampToValueAtTime(this.volume.sfx * this.volume.master, this.audioContext.currentTime + index * noteLength + 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + (index + 1) * noteLength)
      
      nodes.push({ oscillator, gainNode })
    })
    
    return nodes
  }

  // 播放音效
  async playSound(soundName) {
    if (!this.isEnabled) return
    
    await this.initialize()
    
    const config = this.soundEffects[soundName]
    if (!config) {
      console.warn(`Sound '${soundName}' not found`)
      return
    }

    try {
      const soundNodes = this.generateSound(config)
      if (!soundNodes) return

      if (Array.isArray(soundNodes)) {
        // 复杂音效
        soundNodes.forEach(({ oscillator }, index) => {
          oscillator.start(this.audioContext.currentTime + index * 0.3)
          oscillator.stop(this.audioContext.currentTime + config.duration)
        })
      } else {
        // 简单音效
        const { oscillator } = soundNodes
        oscillator.start(this.audioContext.currentTime)
        oscillator.stop(this.audioContext.currentTime + config.duration)
      }
      
      console.log(`🔊 Playing sound: ${soundName}`)
    } catch (error) {
      console.warn('Sound playback failed:', error)
    }
  }

  // BGM管理
  async playBGM(trackName = 'romantic') {
    if (!this.isEnabled) return
    
    await this.initialize()
    
    // 停止当前BGM
    this.stopBGM()
    
    const track = this.bgmTracks[trackName]
    if (!track) {
      console.warn(`BGM track '${trackName}' not found`)
      return
    }

    try {
      // 使用Web Audio API生成简单BGM
      this.createSimpleBGM(trackName)
      this.currentBGM = trackName
      console.log(`🎵 Playing BGM: ${track.name}`)
    } catch (error) {
      console.warn('BGM playback failed:', error)
    }
  }

  // 创建简单BGM
  createSimpleBGM(trackName) {
    const bgmConfig = {
      romantic: { baseFreq: 220, pattern: [1, 1.25, 1.5, 1.25], tempo: 2000 },
      cheerful: { baseFreq: 330, pattern: [1, 1.5, 2, 1.5], tempo: 1000 },
      relaxing: { baseFreq: 150, pattern: [1, 1.2, 1.4, 1.2], tempo: 3000 }
    }
    
    const config = bgmConfig[trackName]
    if (!config) return
    
    let noteIndex = 0
    
    const playNote = () => {
      if (!this.isEnabled || this.currentBGM !== trackName) return
      
      const frequency = config.baseFreq * config.pattern[noteIndex % config.pattern.length]
      const { oscillator, gainNode } = this.createBeep(frequency, 0.8)
      
      gainNode.gain.setValueAtTime(this.volume.bgm * this.volume.master * 0.3, this.audioContext.currentTime)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.8)
      
      noteIndex++
      setTimeout(playNote, config.tempo)
    }
    
    playNote()
  }

  // 停止BGM
  stopBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause()
      this.bgmAudio = null
    }
    this.currentBGM = null
  }

  // 设置音量
  setVolume(type, value) {
    this.volume[type] = Math.max(0, Math.min(1, value))
    
    if (type === 'bgm' && this.bgmAudio) {
      this.bgmAudio.volume = this.volume.bgm * this.volume.master
    }
    
    console.log(`🔊 ${type} volume set to ${Math.round(this.volume[type] * 100)}%`)
  }

  // 获取音量
  getVolume(type) {
    return this.volume[type]
  }

  // 启用/禁用音效
  setEnabled(enabled) {
    this.isEnabled = enabled
    if (!enabled) {
      this.stopBGM()
    }
    console.log(`🔊 Audio ${enabled ? 'enabled' : 'disabled'}`)
  }

  // 获取状态
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      isInitialized: this.isInitialized,
      currentBGM: this.currentBGM,
      volume: { ...this.volume }
    }
  }
}

// 创建全局音效管理器实例
const audioManager = new AudioManager()

export default audioManager
