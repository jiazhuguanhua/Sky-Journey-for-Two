import React, { createContext, useContext, useRef } from 'react'
import AudioManager from '../utils/audioManager'

const AudioContext = createContext()

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}

export const AudioProvider = ({ children }) => {
  const audioManager = useRef(new AudioManager())

  return (
    <AudioContext.Provider value={audioManager.current}>
      {children}
    </AudioContext.Provider>
  )
}
