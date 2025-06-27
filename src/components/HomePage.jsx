import React from 'react';
import { TASK_LIBRARIES } from '../data/taskLibrary.js';

const HomePage = ({ 
  selectedTaskType, 
  setSelectedTaskType, 
  taskRatio, 
  setTaskRatio, 
  onStartGame,
  playButtonSound 
}) => {
  return (
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
        <div style={{ marginBottom: '30px', color: 'white', fontSize: '1.1rem' }}>
          <div style={{ marginBottom: '10px' }}>
            任务格比例：
            <span style={{ fontWeight: 'bold', color: '#FFD700', marginLeft: '10px' }}>
              {Math.round(taskRatio * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.1" 
            max="0.7" 
            step="0.05"
            value={taskRatio}
            onChange={e => setTaskRatio(Number(e.target.value))}
            className="slider"
            style={{ width: '280px' }}
          />
        </div>
        
        {/* 任务类型选择 */}
        <div style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
          {Object.entries(TASK_LIBRARIES).map(([key, library]) => (
            <button
              key={key}
              style={{
                background: selectedTaskType === key 
                  ? 'linear-gradient(135deg, #FFD700, #FFA500)' 
                  : 'rgba(255,255,255,0.2)',
                color: 'white',
                border: selectedTaskType === key ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.3)',
                padding: '15px 20px',
                borderRadius: '15px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onClick={() => {
                playButtonSound();
                setSelectedTaskType(key);
              }}
              onMouseEnter={(e) => {
                if (selectedTaskType !== key) {
                  e.target.style.background = 'rgba(255,255,255,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedTaskType !== key) {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                }
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {library.name}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  {library.description}
                </div>
              </div>
              {selectedTaskType === key && (
                <div style={{ fontSize: '1.5rem' }}>✓</div>
              )}
            </button>
          ))}
        </div>
        
        {/* 开始游戏按钮 */}
        <button
          className="btn btn-success"
          style={{
            fontSize: '18px',
            padding: '15px 40px',
            borderRadius: '25px',
          }}
          onClick={() => {
            playButtonSound();
            onStartGame();
          }}
          onMouseDown={e => e.target.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.target.style.transform = 'scale(1)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        >
          🎯 开始游戏
        </button>
      </div>
    </div>
  );
};

export default HomePage;
