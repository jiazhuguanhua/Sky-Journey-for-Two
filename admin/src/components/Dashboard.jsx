import React, { useState, useEffect } from 'react'
import RoomManagement from './RoomManagement'
import SystemSettings from './SystemSettings'
import LiveLogs from './LiveLogs'
import Statistics from './Statistics'
import './Dashboard.css'

const Dashboard = ({ socket }) => {
  const [activeTab, setActiveTab] = useState('rooms')
  const [systemStats, setSystemStats] = useState({
    totalRooms: 0,
    activeRooms: 0,
    totalPlayers: 0,
    activePlayers: 0,
    uptime: 0
  })
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    if (!socket) return

    // 监听系统状态更新
    socket.on('system-stats', (stats) => {
      setSystemStats(stats)
    })

    // 监听连接状态
    socket.on('connect', () => setIsConnected(true))
    socket.on('disconnect', () => setIsConnected(false))

    // 请求初始数据
    socket.emit('get-system-stats')
    
    // 定期更新统计数据
    const interval = setInterval(() => {
      socket.emit('get-system-stats')
    }, 10000) // 每10秒更新一次

    return () => {
      clearInterval(interval)
      socket.off('system-stats')
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [socket])

  const handleLogout = () => {
    if (socket) {
      socket.disconnect()
    }
    window.location.reload()
  }

  const tabs = [
    { id: 'rooms', label: '房间管理', icon: '🏠' },
    { id: 'settings', label: '系统设置', icon: '⚙️' },
    { id: 'logs', label: '实时日志', icon: '📋' },
    { id: 'stats', label: '数据统计', icon: '📊' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'rooms':
        return <RoomManagement socket={socket} />
      case 'settings':
        return <SystemSettings socket={socket} />
      case 'logs':
        return <LiveLogs socket={socket} />
      case 'stats':
        return <Statistics socket={socket} />
      default:
        return <RoomManagement socket={socket} />
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>
            <span className="logo">✈️</span>
            Sky Journey 管理后台
          </h1>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-indicator"></span>
            {isConnected ? '已连接' : '连接断开'}
          </div>
        </div>
        
        <div className="header-right">
          <div className="system-info">
            <div className="stat-item">
              <span className="stat-label">活跃房间</span>
              <span className="stat-value">{systemStats.activeRooms}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">在线玩家</span>
              <span className="stat-value">{systemStats.activePlayers}</span>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <span>🚪</span>
            退出登录
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        <nav className="dashboard-sidebar">
          <div className="tab-list">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="quick-stats">
              <h3>系统概览</h3>
              <div className="quick-stat">
                <span className="label">总房间数</span>
                <span className="value">{systemStats.totalRooms}</span>
              </div>
              <div className="quick-stat">
                <span className="label">总玩家数</span>
                <span className="value">{systemStats.totalPlayers}</span>
              </div>
              <div className="quick-stat">
                <span className="label">运行时间</span>
                <span className="value">{formatUptime(systemStats.uptime)}</span>
              </div>
            </div>
          </div>
        </nav>

        <main className="dashboard-content">
          <div className="content-header">
            <h2>
              {tabs.find(tab => tab.id === activeTab)?.icon}
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
          </div>
          <div className="content-body">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

// 格式化运行时间
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) {
    return `${days}天 ${hours}时`
  } else if (hours > 0) {
    return `${hours}时 ${minutes}分`
  } else {
    return `${minutes}分钟`
  }
}

export default Dashboard
