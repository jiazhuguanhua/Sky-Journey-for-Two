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

  const playMoveSound = () => {
    audioManager.current.playMoveSound();
  };

  const playTaskSound = () => {
    audioManager.current.playTaskSound();
  };

  const playVictorySound = () => {
    audioManager.current.playVictorySound();
  };

  const playErrorSound = () => {
    audioManager.current.playErrorSound();
  };

  const playNotificationSound = () => {
    audioManager.current.playNotificationSound();
  };

  const startBGM = () => {
    audioManager.current.startBGM();
    setIsBGMPlaying(true);
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
    playMoveSound,
    playTaskSound,
    playVictorySound,
    playErrorSound,
    playNotificationSound,
    startBGM,
    toggleBGM,
    stopBGM,
    isBGMPlaying,
    isBGMEnabled: audioManager.current.isBGMEnabled()
  };
};
