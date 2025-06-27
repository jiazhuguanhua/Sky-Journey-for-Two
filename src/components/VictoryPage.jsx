import React from 'react';
import { TASK_LIBRARIES } from '../data/taskLibrary.js';

const VictoryPage = ({ gameState, players, selectedTaskType, onRestart, playButtonSound }) => (
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
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      pointerEvents: 'none', 
      zIndex: 1 
    }}>
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
      className="btn"
      style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        fontSize: '18px',
        padding: '15px 40px',
        zIndex: 2
      }}
      onClick={() => {
        playButtonSound();
        onRestart();
      }}
    >
      🔄 再来一局
    </button>
  </div>
);

export default VictoryPage;
