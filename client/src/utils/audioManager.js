// 音效管理器类
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
      this.loadBGM()
    } catch (error) {
      console.warn('音频初始化失败:', error)
    }
  }

  async loadBGM() {
    try {
      const bgmSources = [
        './bgm.mp4',
        './bgm.mp3',
        './bgm.wav',
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

export default AudioManager
