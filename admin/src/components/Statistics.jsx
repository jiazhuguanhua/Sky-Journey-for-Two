import React, { useState, useEffect } from 'react'
import './Statistics.css'

const Statistics = ({ socket }) => {
  const [stats, setStats] = useState({
    realtime: {
      activeRooms: 0,
      activePlayers: 0,
      totalConnections: 0,
      averageGameTime: 0,
      systemUptime: 0
    },
    daily: {
      gamesPlayed: 0,
      newPlayers: 0,
      averageSessionTime: 0,
      eventsTrigggered: 0,
      challengesCompleted: 0
    },
    weekly: {
      totalGames: 0,
      uniquePlayers: 0,
      peakConcurrentUsers: 0,
      averageRoomDuration: 0,
      errorRate: 0
    },
    performance: {
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      networkLatency: 0,
      databaseConnections: 0
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [refreshInterval, setRefreshInterval] = useState(30) // 秒

  useEffect(() => {
    if (!socket) return

    // 监听统计数据更新
    socket.on('statistics-update', (newStats) => {
      setStats(newStats)
      setLastUpdate(new Date())
      setLoading(false)
    })

    // 请求初始数据
    socket.emit('get-statistics')

    // 设置定期更新
    const interval = setInterval(() => {
      socket.emit('get-statistics')
    }, refreshInterval * 1000)

    return () => {
      clearInterval(interval)
      socket.off('statistics-update')
    }
  }, [socket, refreshInterval])

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}时${minutes}分`
    } else if (minutes > 0) {
      return `${minutes}分${secs}秒`
    } else {
      return `${secs}秒`
    }
  }

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) {
      return `${days}天${hours}时${minutes}分`
    } else if (hours > 0) {
      return `${hours}时${minutes}分`
    } else {
      return `${minutes}分钟`
    }
  }

  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.danger) return '#f44336'
    if (value >= thresholds.warning) return '#ff9800'
    return '#4caf50'
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载统计数据...</p>
      </div>
    )
  }

  return (
    <div className="statistics">
      <div className="stats-header">
        <h2>数据统计</h2>
        <div className="header-controls">
          <div className="refresh-control">
            <label>刷新间隔</label>
            <select 
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              className="refresh-select"
            >
              <option value="10">10秒</option>
              <option value="30">30秒</option>
              <option value="60">1分钟</option>
              <option value="300">5分钟</option>
            </select>
          </div>
          {lastUpdate && (
            <div className="last-update">
              最后更新: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
          <button 
            className="refresh-btn"
            onClick={() => socket.emit('get-statistics')}
          >
            🔄 立即刷新
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {/* 实时数据 */}
        <div className="stats-section realtime">
          <h3>
            <span className="section-icon">⚡</span>
            实时数据
          </h3>
          <div className="stats-cards">
            <div className="stat-card highlight">
              <div className="stat-value">{stats.realtime.activeRooms}</div>
              <div className="stat-label">活跃房间</div>
              <div className="stat-icon">🏠</div>
            </div>
            <div className="stat-card highlight">
              <div className="stat-value">{stats.realtime.activePlayers}</div>
              <div className="stat-label">在线玩家</div>
              <div className="stat-icon">👥</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.realtime.totalConnections}</div>
              <div className="stat-label">总连接数</div>
              <div className="stat-icon">🔗</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatTime(stats.realtime.averageGameTime)}</div>
              <div className="stat-label">平均游戏时长</div>
              <div className="stat-icon">⏱️</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatUptime(stats.realtime.systemUptime)}</div>
              <div className="stat-label">系统运行时间</div>
              <div className="stat-icon">🚀</div>
            </div>
          </div>
        </div>

        {/* 今日数据 */}
        <div className="stats-section daily">
          <h3>
            <span className="section-icon">📅</span>
            今日数据
          </h3>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-value">{stats.daily.gamesPlayed}</div>
              <div className="stat-label">游戏场次</div>
              <div className="stat-icon">🎮</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.daily.newPlayers}</div>
              <div className="stat-label">新增玩家</div>
              <div className="stat-icon">🆕</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatTime(stats.daily.averageSessionTime)}</div>
              <div className="stat-label">平均会话时长</div>
              <div className="stat-icon">⏰</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.daily.eventsTrigggered}</div>
              <div className="stat-label">触发事件</div>
              <div className="stat-icon">✨</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.daily.challengesCompleted}</div>
              <div className="stat-label">完成挑战</div>
              <div className="stat-icon">🏆</div>
            </div>
          </div>
        </div>

        {/* 本周数据 */}
        <div className="stats-section weekly">
          <h3>
            <span className="section-icon">📊</span>
            本周数据
          </h3>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-value">{stats.weekly.totalGames}</div>
              <div className="stat-label">总游戏数</div>
              <div className="stat-icon">🎯</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.weekly.uniquePlayers}</div>
              <div className="stat-label">独立玩家</div>
              <div className="stat-icon">👤</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.weekly.peakConcurrentUsers}</div>
              <div className="stat-label">峰值并发</div>
              <div className="stat-icon">📈</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatTime(stats.weekly.averageRoomDuration)}</div>
              <div className="stat-label">平均房间时长</div>
              <div className="stat-icon">🕐</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{(stats.weekly.errorRate * 100).toFixed(2)}%</div>
              <div className="stat-label">错误率</div>
              <div className="stat-icon">⚠️</div>
            </div>
          </div>
        </div>

        {/* 系统性能 */}
        <div className="stats-section performance">
          <h3>
            <span className="section-icon">💻</span>
            系统性能
          </h3>
          <div className="performance-grid">
            <div className="performance-item">
              <div className="performance-header">
                <span className="performance-label">CPU使用率</span>
                <span 
                  className="performance-value"
                  style={{ color: getStatusColor(stats.performance.cpuUsage, { warning: 70, danger: 90 }) }}
                >
                  {stats.performance.cpuUsage.toFixed(1)}%
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${stats.performance.cpuUsage}%`,
                    backgroundColor: getStatusColor(stats.performance.cpuUsage, { warning: 70, danger: 90 })
                  }}
                ></div>
              </div>
            </div>

            <div className="performance-item">
              <div className="performance-header">
                <span className="performance-label">内存使用率</span>
                <span 
                  className="performance-value"
                  style={{ color: getStatusColor(stats.performance.memoryUsage, { warning: 75, danger: 90 }) }}
                >
                  {stats.performance.memoryUsage.toFixed(1)}%
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${stats.performance.memoryUsage}%`,
                    backgroundColor: getStatusColor(stats.performance.memoryUsage, { warning: 75, danger: 90 })
                  }}
                ></div>
              </div>
            </div>

            <div className="performance-item">
              <div className="performance-header">
                <span className="performance-label">磁盘使用率</span>
                <span 
                  className="performance-value"
                  style={{ color: getStatusColor(stats.performance.diskUsage, { warning: 80, danger: 95 }) }}
                >
                  {stats.performance.diskUsage.toFixed(1)}%
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${stats.performance.diskUsage}%`,
                    backgroundColor: getStatusColor(stats.performance.diskUsage, { warning: 80, danger: 95 })
                  }}
                ></div>
              </div>
            </div>

            <div className="performance-item">
              <div className="performance-header">
                <span className="performance-label">网络延迟</span>
                <span 
                  className="performance-value"
                  style={{ color: getStatusColor(stats.performance.networkLatency, { warning: 100, danger: 200 }) }}
                >
                  {stats.performance.networkLatency}ms
                </span>
              </div>
            </div>

            <div className="performance-item">
              <div className="performance-header">
                <span className="performance-label">数据库连接</span>
                <span className="performance-value">
                  {stats.performance.databaseConnections}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics
