import React from 'react'

function TestApp() {
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
      <p>如果你能看到这个页面，说明基础设置正常！</p>
      <button 
        style={{
          background: '#FF6B8A',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '20px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
        onClick={() => alert('按钮点击成功！')}
      >
        测试按钮
      </button>
    </div>
  )
}

export default TestApp
