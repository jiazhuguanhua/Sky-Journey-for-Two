import { useState, useRef } from 'react';
import { AudioManager } from '../utils/audioManager.js';

export const useAudio = () => {
  const audioManager = useRef(new AudioManager());
  const [isBGMPlaying, setIsBGMPlaying] = useState(false);

  const playButtonSound = () => {
    audioManager.current.playButtonSound();
  };

  const playDiceSound = () => {
    audioManager.current.playDiceSound();
  };

  const toggleBGM = () => {
    audioManager.current.toggleBGM();
    setIsBGMPlaying(audioManager.current.isBGMPlaying);
  };

  const stopBGM = () => {
    audioManager.current.stopBGM();
    setIsBGMPlaying(false);
  };

  return {
    playButtonSound,
    playDiceSound,
    toggleBGM,
    stopBGM,
    isBGMPlaying,
    isBGMEnabled: audioManager.current.isBGMEnabled()
  };
};
