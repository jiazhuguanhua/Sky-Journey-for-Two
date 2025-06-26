import React, { useState, useEffect, useRef } from 'react'
import './LiveLogs.css'

const LiveLogs = ({ socket }) => {
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterText, setFilterText] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [maxLogs, setMaxLogs] = useState(1000)
  const [isConnected, setIsConnected] = useState(true)
  const logsEndRef = useRef(null)
  const logsContainerRef = useRef(null)

  useEffect(() => {
    if (!socket) return

    // 监听新日志
    socket.on('new-log', (logEntry) => {
      setLogs(prev => {
        const newLogs = [...prev, {
          ...logEntry,
          id: Date.now() + Math.random(),
          timestamp: new Date(logEntry.timestamp)
        }].slice(-maxLogs) // 保持最大日志数量
        return newLogs
      })
    })

    // 监听历史日志
    socket.on('log-history', (logHistory) => {
      setLogs(logHistory.map(log => ({
        ...log,
        id: Date.now() + Math.random(),
        timestamp: new Date(log.timestamp)
      })))
    })

    // 监听连接状态
    socket.on('connect', () => setIsConnected(true))
    socket.on('disconnect', () => setIsConnected(false))

    // 请求历史日志
    socket.emit('get-log-history', { limit: 100 })

    return () => {
      socket.off('new-log')
      socket.off('log-history')
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [socket, maxLogs])

  // 过滤日志
  useEffect(() => {
    let filtered = logs

    // 按级别过滤
    if (filterLevel !== 'all') {
      filtered = filtered.filter(log => log.level === filterLevel)
    }

    // 按文本过滤
    if (filterText.trim()) {
      const searchText = filterText.toLowerCase()
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchText) ||
        log.service?.toLowerCase().includes(searchText) ||
        log.userId?.toLowerCase().includes(searchText) ||
        log.roomId?.toLowerCase().includes(searchText)
      )
    }

    setFilteredLogs(filtered)
  }, [logs, filterLevel, filterText])

  // 自动滚动
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [filteredLogs, autoScroll])

  // 检测用户是否在底部
  const handleScroll = () => {
    if (!logsContainerRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
    setAutoScroll(isAtBottom)
  }

  const clearLogs = () => {
    if (confirm('确定要清空所有日志吗？')) {
      setLogs([])
      socket.emit('clear-logs')
    }
  }

  const exportLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.service || 'System'}: ${log.message}`
    ).join('\n')
    
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sky-journey-logs-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'error': return '#f44336'
      case 'warn': return '#ff9800'
      case 'info': return '#2196f3'
      case 'debug': return '#9e9e9e'
      default: return '#333'
    }
  }

  const getLogLevelIcon = (level) => {
    switch (level) {
      case 'error': return '❌'
      case 'warn': return '⚠️'
      case 'info': return 'ℹ️'
      case 'debug': return '🔍'
      default: return '📝'
    }
  }

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString('zh-CN', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    })
  }

  return (
    <div className="live-logs">
      <div className="logs-header">
        <div className="header-left">
          <h3>实时日志</h3>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {isConnected ? '实时同步' : '连接断开'}
          </div>
        </div>
        
        <div className="header-controls">
          <div className="log-count">
            显示 {filteredLogs.length} / {logs.length} 条日志
          </div>
          <button className="export-btn" onClick={exportLogs}>
            💾 导出日志
          </button>
          <button className="clear-btn" onClick={clearLogs}>
            🗑️ 清空日志
          </button>
        </div>
      </div>

      <div className="logs-filters">
        <div className="filter-group">
          <label>级别过滤</label>
          <select 
            value={filterLevel} 
            onChange={(e) => setFilterLevel(e.target.value)}
            className="filter-select"
          >
            <option value="all">所有级别</option>
            <option value="error">错误</option>
            <option value="warn">警告</option>
            <option value="info">信息</option>
            <option value="debug">调试</option>
          </select>
        </div>

        <div className="filter-group">
          <label>文本搜索</label>
          <input
            type="text"
            placeholder="搜索日志内容、用户ID、房间ID..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>最大条数</label>
          <select 
            value={maxLogs} 
            onChange={(e) => setMaxLogs(parseInt(e.target.value))}
            className="filter-select"
          >
            <option value="500">500条</option>
            <option value="1000">1000条</option>
            <option value="2000">2000条</option>
            <option value="5000">5000条</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            自动滚动
          </label>
        </div>
      </div>

      <div 
        className="logs-container"
        ref={logsContainerRef}
        onScroll={handleScroll}
      >
        {filteredLogs.length === 0 ? (
          <div className="empty-logs">
            <span className="empty-icon">📝</span>
            <p>暂无日志数据</p>
            {filterLevel !== 'all' || filterText.trim() ? (
              <small>尝试调整过滤条件</small>
            ) : (
              <small>等待系统生成日志...</small>
            )}
          </div>
        ) : (
          <div className="logs-list">
            {filteredLogs.map(log => (
              <div 
                key={log.id} 
                className={`log-entry log-${log.level}`}
              >
                <div className="log-timestamp">
                  {formatTimestamp(log.timestamp)}
                </div>
                
                <div className="log-level">
                  <span 
                    className="level-badge"
                    style={{ backgroundColor: getLogLevelColor(log.level) }}
                  >
                    {getLogLevelIcon(log.level)} {log.level.toUpperCase()}
                  </span>
                </div>
                
                <div className="log-service">
                  {log.service || 'System'}
                </div>
                
                <div className="log-message">
                  {log.message}
                </div>
                
                {(log.userId || log.roomId) && (
                  <div className="log-metadata">
                    {log.userId && <span className="meta-tag">用户: {log.userId}</span>}
                    {log.roomId && <span className="meta-tag">房间: {log.roomId}</span>}
                  </div>
                )}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      <div className="logs-footer">
        <div className="footer-stats">
          <span>错误: {logs.filter(log => log.level === 'error').length}</span>
          <span>警告: {logs.filter(log => log.level === 'warn').length}</span>
          <span>信息: {logs.filter(log => log.level === 'info').length}</span>
          <span>调试: {logs.filter(log => log.level === 'debug').length}</span>
        </div>
        
        <div className="footer-actions">
          <button 
            className="scroll-bottom-btn"
            onClick={() => {
              setAutoScroll(true)
              logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            ⬇️ 滚动到底部
          </button>
        </div>
      </div>
    </div>
  )
}

export default LiveLogs
