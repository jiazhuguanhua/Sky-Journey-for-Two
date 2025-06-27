import React from 'react'

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #FFE5F1 0%, #E8F4FD 100%)',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#FF6B8A' }}>🎮 Sky Journey for Two</h1>
      <h2 style={{ color: '#4A90E2' }}>情侣飞行棋游戏</h2>
      
      <div style={{ marginTop: '40px' }}>
        <h3>选择游戏模式</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
          <button 
            style={{
              background: '#FF6B8A',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: 'pointer',
              minWidth: '150px'
            }}
            onClick={() => alert('本地对战模式 - 即将开发')}
          >
            🏠 本地对战
          </button>
          <button 
            style={{
              background: '#4A90E2',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: 'pointer',
              minWidth: '150px'
            }}
            onClick={() => alert('在线对战模式 - 即将开发')}
          >
            🌐 在线对战
          </button>
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(255,255,255,0.8)', borderRadius: '15px', maxWidth: '600px', margin: '40px auto' }}>
        <h3>游戏特色</h3>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>🎲 经典飞行棋玩法</li>
          <li>💕 情侣专属主题</li>
          <li>🎪 真心话大冒险互动</li>
          <li>⏰ 终极挑战倒计时</li>
          <li>📱 支持跨设备对战</li>
        </ul>
      </div>
    </div>
  )
}

export default App
