import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useAudio } from '../context/AudioContext'
import { TASK_LIBRARIES } from '../data/taskLibrary'
import '../styles/HomePage.css'

const HomePage = () => {
  const { state, dispatch } = useGame()
  const audioManager = useAudio()
  const navigate = useNavigate()

  const handleTaskTypeSelect = (key) => {
    audioManager.playButtonSound()
    dispatch({ type: 'SET_SELECTED_TASK_TYPE', payload: key })
  }

  const handleTaskRatioChange = (e) => {
    dispatch({ type: 'SET_TASK_RATIO', payload: Number(e.target.value) })
  }

  const handleStartGame = () => {
    if (state.selectedTaskType) {
      audioManager.playButtonSound()
      if (audioManager.isBGMEnabled()) {
        audioManager.startBGM()
      }
      dispatch({ type: 'SET_GAME_PHASE', payload: 'setup' })
      navigate('/game')
    }
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <h1 className="home-title">
          ✈️ Sky Journey for Two
        </h1>
        <p className="home-subtitle">
          情侣专属的浪漫飞行棋之旅
        </p>
      </div>
      
      <div className="home-content">
        <h3 className="section-title">选择任务类型</h3>
        
        {/* 任务格比例调节 */}
        <div className="task-ratio-control">
          任务格比例：
          <input
            type="range"
            min="0.1" max="0.7" step="0.05"
            value={state.taskRatio}
            onChange={handleTaskRatioChange}
            className="ratio-slider"
          />
          <span className="ratio-value">{Math.round(state.taskRatio * 100)}%</span>
        </div>
        
        <div className="task-type-grid">
          {Object.entries(TASK_LIBRARIES).map(([key, library]) => (
            <button
              key={key}
              className={`task-type-btn ${state.selectedTaskType === key ? 'selected' : ''}`}
              onClick={() => handleTaskTypeSelect(key)}
            >
              {library.name}
            </button>
          ))}
        </div>
        
        <button
          className={`start-btn ${!state.selectedTaskType ? 'disabled' : ''}`}
          disabled={!state.selectedTaskType}
          onClick={handleStartGame}
        >
          🚀 开始游戏
        </button>
        
        {/* BGM控制 */}
        {audioManager.isBGMEnabled() && (
          <div className="bgm-control">
            <span>🎵 背景音乐</span>
            <button
              className={`bgm-btn ${audioManager.isBGMPlaying ? 'playing' : ''}`}
              onClick={() => {
                audioManager.toggleBGM()
              }}
            >
              {audioManager.isBGMPlaying ? '🔇 关闭' : '🔊 开启'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
