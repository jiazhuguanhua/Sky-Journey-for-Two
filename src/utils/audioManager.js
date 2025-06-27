// 音效管理器
export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.bgmAudio = null;
    this.isBGMPlaying = false;
    this.volume = 0.5;
    this.bgmEnabled = false;
    this.initAudio();
  }

  async initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.loadBGM();
    } catch (error) {
      console.warn('音频初始化失败:', error);
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
      ];
      
      for (const src of bgmSources) {
        try {
          const audio = new Audio(src);
          audio.loop = true;
          audio.volume = this.volume;
          audio.preload = 'auto';
          
          await new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', resolve, { once: true });
            audio.addEventListener('error', reject, { once: true });
            audio.load();
          });
          
          this.bgmAudio = audio;
          this.bgmEnabled = true;
          console.log('BGM音频加载成功:', src);
          break;
        } catch (error) {
          continue;
        }
      }
      
      if (!this.bgmAudio) {
        console.log('未找到BGM文件，将使用静音模式');
      }
    } catch (error) {
      console.warn('BGM加载失败:', error);
    }
  }

  playButtonSound() {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  playDiceSound() {
    if (!this.audioContext) return;
    
    // 创建骰子滚动音效
    const oscillators = [];
    const gains = [];
    
    for (let i = 0; i < 3; i++) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(300 + i * 100, this.audioContext.currentTime + i * 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(500 + i * 150, this.audioContext.currentTime + 0.3 + i * 0.1);
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime + i * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4 + i * 0.1);
      
      oscillator.start(this.audioContext.currentTime + i * 0.1);
      oscillator.stop(this.audioContext.currentTime + 0.5 + i * 0.1);
      
      oscillators.push(oscillator);
      gains.push(gainNode);
    }
  }

  playMoveSound() {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(330, this.audioContext.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  playTaskSound() {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  playVictorySound() {
    if (!this.audioContext) return;
    
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    
    notes.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * 0.2);
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime + index * 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3 + index * 0.2);
      
      oscillator.start(this.audioContext.currentTime + index * 0.2);
      oscillator.stop(this.audioContext.currentTime + 0.4 + index * 0.2);
    });
  }

  playErrorSound() {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  playNotificationSound() {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  async startBGM() {
    if (!this.bgmEnabled || !this.bgmAudio || this.isBGMPlaying) return;
    
    try {
      await this.bgmAudio.play();
      this.isBGMPlaying = true;
      console.log('BGM开始播放');
    } catch (error) {
      console.warn('BGM播放失败:', error);
    }
  }

  stopBGM() {
    if (this.bgmAudio && this.isBGMPlaying) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      this.isBGMPlaying = false;
      console.log('BGM已停止');
    }
  }

  toggleBGM() {
    if (this.isBGMPlaying) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }

  setVolume(volume) {
    this.volume = volume;
    if (this.bgmAudio) {
      this.bgmAudio.volume = volume;
    }
  }

  isBGMEnabled() {
    return this.bgmEnabled;
  }
}
