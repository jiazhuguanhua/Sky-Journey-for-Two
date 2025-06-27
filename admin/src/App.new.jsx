import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

// 游戏统计卡片组件
function StatCard({ title, value, icon, color, description }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '25px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
      border: `3px solid ${color}`,
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseOver={(e) => e.target.style.transform = 'translateY(-5px)'}
    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{ 
          fontSize: '2.5rem', 
          marginRight: '15px',
          padding: '10px',
          background: color,
          borderRadius: '15px',
          color: 'white'
        }}>
          {icon}
        </div>
        <div>
          <h3 style={{ margin: 0, color: color, fontSize: '1.2rem' }}>{title}</h3>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>{description}</p>
        </div>
      </div>
      <div style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        color: color,
        textAlign: 'center'
      }}>
        {value}
      </div>
    </div>
  )
}

// 实时游戏日志组件
function GameLogs({ logs }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '25px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
      height: '400px'
    }}>
      <h3 style={{ marginTop: 0, color: '#2c3e50', display: 'flex', alignItems: 'center' }}>
        📊 实时游戏日志
      </h3>
      <div style={{
        height: '320px',
        overflowY: 'auto',
        background: '#f8f9fa',
        borderRadius: '15px',
        padding: '15px'
      }}>
        {logs.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#7f8c8d', 
            padding: '50px 0',
            fontSize: '1.1rem'
          }}>
            🎮 等待游戏开始...
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{
              padding: '10px 15px',
              marginBottom: '8px',
              background: 'white',
              borderRadius: '10px',
              borderLeft: `4px solid ${log.type === 'dice' ? '#3498db' : 
                                       log.type === 'move' ? '#2ecc71' : 
                                       log.type === 'task' ? '#e74c3c' : '#f39c12'}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '5px' }}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
              <div style={{ color: '#2c3e50' }}>{log.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// 在线房间管理组件
function RoomManager({ rooms, onRoomAction }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '25px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ marginTop: 0, color: '#2c3e50', display: 'flex', alignItems: 'center' }}>
        🏠 在线房间管理
      </h3>
      {rooms.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          color: '#7f8c8d', 
          padding: '30px 0',
          fontSize: '1.1rem'
        }}>
          📝 暂无活跃房间
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {rooms.map((room, index) => (
            <div key={index} style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #e8f4fd, #ffe5f1)',
              borderRadius: '15px',
              border: '2px solid rgba(255,255,255,0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#2c3e50' }}>房间 {room.id}</h4>
                  <p style={{ margin: '5px 0', color: '#7f8c8d' }}>
                    玩家: {room.players.length}/2 | 状态: {room.status}
                  </p>
                </div>
                <button
                  style={{
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                  onClick={() => onRoomAction(room.id, 'close')}
                >
                  关闭房间
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// 游戏设置组件
function GameSettings({ settings, onSettingsChange }) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    onSettingsChange(newSettings)
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '25px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ marginTop: 0, color: '#2c3e50', display: 'flex', alignItems: 'center' }}>
        ⚙️ 游戏设置
      </h3>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
            🎲 骰子冷却时间 (秒)
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={localSettings.diceCooldown || 3}
            onChange={(e) => handleChange('diceCooldown', Number(e.target.value))}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '5px',
              background: '#ddd',
              outline: 'none'
            }}
          />
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
            当前: {localSettings.diceCooldown || 3} 秒
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
            🎪 任务触发概率 (%)
          </label>
          <input
            type="range"
            min="20"
            max="100"
            value={localSettings.taskProbability || 70}
            onChange={(e) => handleChange('taskProbability', Number(e.target.value))}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '5px',
              background: '#ddd',
              outline: 'none'
            }}
          />
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
            当前: {localSettings.taskProbability || 70}%
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
            🔊 音效音量
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={localSettings.soundVolume || 50}
            onChange={(e) => handleChange('soundVolume', Number(e.target.value))}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '5px',
              background: '#ddd',
              outline: 'none'
            }}
          />
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
            当前: {localSettings.soundVolume || 50}%
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
            🎵 背景音乐
          </label>
          <select
            value={localSettings.bgmTrack || 'romantic'}
            onChange={(e) => handleChange('bgmTrack', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: '2px solid #ddd',
              fontSize: '16px'
            }}
          >
            <option value="romantic">浪漫情调</option>
            <option value="cheerful">欢快节拍</option>
            <option value="relaxing">轻松氛围</option>
            <option value="none">无背景音乐</option>
          </select>
        </div>
      </div>
    </div>
  )
}

// 主管理面板组件
function AdminDashboard() {
  const [socket, setSocket] = useState(null)
  const [stats, setStats] = useState({
    onlineUsers: 0,
    activeRooms: 0,
    totalGames: 0,
    tasksCompleted: 0
  })
  const [logs, setLogs] = useState([])
  const [rooms, setRooms] = useState([])
  const [settings, setSettings] = useState({
    diceCooldown: 3,
    taskProbability: 70,
    soundVolume: 50,
    bgmTrack: 'romantic'
  })

  useEffect(() => {
    // 连接到服务器
    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('管理后台已连接到服务器')
      newSocket.emit('join-admin', { adminKey: 'admin123' })
    })

    // 监听统计数据更新
    newSocket.on('stats-update', (newStats) => {
      setStats(newStats)
    })

    // 监听游戏日志
    newSocket.on('game-log', (log) => {
      setLogs(prev => [log, ...prev.slice(0, 49)]) // 保留最新50条
    })

    // 监听房间更新
    newSocket.on('rooms-update', (roomsData) => {
      setRooms(roomsData)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  const handleRoomAction = (roomId, action) => {
    if (socket) {
      socket.emit('admin-room-action', { roomId, action })
    }
  }

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings)
    if (socket) {
      socket.emit('admin-settings-update', newSettings)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 顶部标题 */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '20px',
        padding: '25px',
        marginBottom: '30px',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          color: 'white', 
          margin: 0, 
          fontSize: '2.5rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          🎮 Sky Journey 管理后台
        </h1>
        <p style={{ 
          color: 'rgba(255,255,255,0.9)', 
          margin: '10px 0 0', 
          fontSize: '1.2rem'
        }}>
          实时监控和管理情侣飞行棋游戏
        </p>
      </div>

      {/* 统计卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <StatCard
          title="在线用户"
          value={stats.onlineUsers}
          icon="👥"
          color="#3498db"
          description="当前在线玩家数量"
        />
        <StatCard
          title="活跃房间"
          value={stats.activeRooms}
          icon="🏠"
          color="#2ecc71"
          description="正在进行的游戏房间"
        />
        <StatCard
          title="总游戏场次"
          value={stats.totalGames}
          icon="🎲"
          color="#e74c3c"
          description="累计游戏场次"
        />
        <StatCard
          title="任务完成数"
          value={stats.tasksCompleted}
          icon="🎪"
          color="#f39c12"
          description="累计完成的任务数"
        />
      </div>

      {/* 主要内容区域 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <GameLogs logs={logs} />
        <RoomManager rooms={rooms} onRoomAction={handleRoomAction} />
      </div>

      {/* 游戏设置 */}
      <GameSettings 
        settings={settings} 
        onSettingsChange={handleSettingsChange}
      />
    </div>
  )
}

function App() {
  return <AdminDashboard />
}

export default App
