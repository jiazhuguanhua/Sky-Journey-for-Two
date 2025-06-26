import React, { useState, useEffect } from 'react'
import './SystemSettings.css'

const SystemSettings = ({ socket }) => {
  const [settings, setSettings] = useState({
    maxRooms: 100,
    maxPlayersPerRoom: 2,
    gameTimeout: 3600000, // 1小时
    diceRollDelay: 2000,
    eventProbability: 0.3,
    challengeProbability: 0.2,
    boardSize: 50,
    winCondition: 50,
    enableAI: false,
    aiApiKey: '',
    logLevel: 'info',
    enableMetrics: true,
    autoCleanup: true,
    cleanupInterval: 86400000 // 24小时
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changes, setChanges] = useState({})
  const [activeSection, setActiveSection] = useState('game')

  useEffect(() => {
    if (!socket) return

    // 监听设置更新
    socket.on('system-settings', (serverSettings) => {
      setSettings(serverSettings)
      setLoading(false)
    })

    // 监听保存结果
    socket.on('settings-updated', (result) => {
      setSaving(false)
      if (result.success) {
        setChanges({})
        alert('设置保存成功！')
      } else {
        alert('保存失败：' + result.error)
      }
    })

    // 请求当前设置
    socket.emit('get-system-settings')

    return () => {
      socket.off('system-settings')
      socket.off('settings-updated')
    }
  }, [socket])

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setChanges(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    if (Object.keys(changes).length === 0) return
    
    setSaving(true)
    socket.emit('update-system-settings', changes)
  }

  const handleReset = () => {
    if (confirm('确定要重置为默认设置吗？')) {
      socket.emit('reset-system-settings')
    }
  }

  const sections = [
    { id: 'game', label: '游戏设置', icon: '🎮' },
    { id: 'server', label: '服务器设置', icon: '🖥️' },
    { id: 'ai', label: 'AI设置', icon: '🤖' },
    { id: 'monitoring', label: '监控设置', icon: '📊' }
  ]

  const renderGameSettings = () => (
    <div className="settings-section">
      <h3>🎮 游戏配置</h3>
      
      <div className="setting-group">
        <label>棋盘大小（格子数）</label>
        <input
          type="number"
          min="20"
          max="100"
          value={settings.boardSize}
          onChange={(e) => handleChange('boardSize', parseInt(e.target.value))}
          className="setting-input"
        />
        <small>建议范围：20-100</small>
      </div>

      <div className="setting-group">
        <label>胜利条件（到达格子）</label>
        <input
          type="number"
          min="10"
          max="100"
          value={settings.winCondition}
          onChange={(e) => handleChange('winCondition', parseInt(e.target.value))}
          className="setting-input"
        />
        <small>玩家到达此格子即获胜</small>
      </div>

      <div className="setting-group">
        <label>骰子延迟（毫秒）</label>
        <input
          type="number"
          min="500"
          max="5000"
          step="100"
          value={settings.diceRollDelay}
          onChange={(e) => handleChange('diceRollDelay', parseInt(e.target.value))}
          className="setting-input"
        />
        <small>骰子动画持续时间</small>
      </div>

      <div className="setting-group">
        <label>事件触发概率</label>
        <div className="slider-container">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.eventProbability}
            onChange={(e) => handleChange('eventProbability', parseFloat(e.target.value))}
            className="setting-slider"
          />
          <span className="slider-value">{(settings.eventProbability * 100).toFixed(0)}%</span>
        </div>
        <small>玩家移动后触发事件的概率</small>
      </div>

      <div className="setting-group">
        <label>挑战触发概率</label>
        <div className="slider-container">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.challengeProbability}
            onChange={(e) => handleChange('challengeProbability', parseFloat(e.target.value))}
            className="setting-slider"
          />
          <span className="slider-value">{(settings.challengeProbability * 100).toFixed(0)}%</span>
        </div>
        <small>触发挑战模式的概率</small>
      </div>
    </div>
  )

  const renderServerSettings = () => (
    <div className="settings-section">
      <h3>🖥️ 服务器配置</h3>
      
      <div className="setting-group">
        <label>最大房间数</label>
        <input
          type="number"
          min="1"
          max="1000"
          value={settings.maxRooms}
          onChange={(e) => handleChange('maxRooms', parseInt(e.target.value))}
          className="setting-input"
        />
        <small>服务器允许的最大房间数量</small>
      </div>

      <div className="setting-group">
        <label>每房间最大玩家数</label>
        <input
          type="number"
          min="2"
          max="4"
          value={settings.maxPlayersPerRoom}
          onChange={(e) => handleChange('maxPlayersPerRoom', parseInt(e.target.value))}
          className="setting-input"
        />
        <small>目前仅支持2人游戏</small>
      </div>

      <div className="setting-group">
        <label>游戏超时时间（分钟）</label>
        <input
          type="number"
          min="10"
          max="360"
          value={settings.gameTimeout / 60000}
          onChange={(e) => handleChange('gameTimeout', parseInt(e.target.value) * 60000)}
          className="setting-input"
        />
        <small>游戏无操作自动结束时间</small>
      </div>

      <div className="setting-group">
        <label>日志级别</label>
        <select
          value={settings.logLevel}
          onChange={(e) => handleChange('logLevel', e.target.value)}
          className="setting-select"
        >
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
        <small>控制日志详细程度</small>
      </div>

      <div className="setting-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.autoCleanup}
            onChange={(e) => handleChange('autoCleanup', e.target.checked)}
            className="setting-checkbox"
          />
          启用自动清理
        </label>
        <small>自动清理过期房间和数据</small>
      </div>

      <div className="setting-group">
        <label>清理间隔（小时）</label>
        <input
          type="number"
          min="1"
          max="168"
          value={settings.cleanupInterval / 3600000}
          onChange={(e) => handleChange('cleanupInterval', parseInt(e.target.value) * 3600000)}
          className="setting-input"
          disabled={!settings.autoCleanup}
        />
        <small>自动清理执行间隔</small>
      </div>
    </div>
  )

  const renderAISettings = () => (
    <div className="settings-section">
      <h3>🤖 AI配置</h3>
      
      <div className="setting-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.enableAI}
            onChange={(e) => handleChange('enableAI', e.target.checked)}
            className="setting-checkbox"
          />
          启用AI功能
        </label>
        <small>启用AI生成的事件和对话</small>
      </div>

      <div className="setting-group">
        <label>AI API密钥</label>
        <input
          type="password"
          value={settings.aiApiKey}
          onChange={(e) => handleChange('aiApiKey', e.target.value)}
          className="setting-input"
          disabled={!settings.enableAI}
          placeholder="输入您的AI服务API密钥"
        />
        <small>用于调用外部AI服务（如OpenAI）</small>
      </div>

      <div className="ai-test-section">
        <h4>AI连接测试</h4>
        <button 
          className="test-btn"
          disabled={!settings.enableAI || !settings.aiApiKey}
          onClick={() => socket.emit('test-ai-connection')}
        >
          🧪 测试AI连接
        </button>
        <small>测试AI服务是否正常工作</small>
      </div>
    </div>
  )

  const renderMonitoringSettings = () => (
    <div className="settings-section">
      <h3>📊 监控配置</h3>
      
      <div className="setting-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.enableMetrics}
            onChange={(e) => handleChange('enableMetrics', e.target.checked)}
            className="setting-checkbox"
          />
          启用性能监控
        </label>
        <small>收集系统性能指标</small>
      </div>

      <div className="metrics-info">
        <h4>监控指标</h4>
        <ul>
          <li>实时连接数</li>
          <li>房间创建/销毁率</li>
          <li>平均游戏时长</li>
          <li>服务器内存使用</li>
          <li>WebSocket连接质量</li>
        </ul>
      </div>
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case 'game': return renderGameSettings()
      case 'server': return renderServerSettings()
      case 'ai': return renderAISettings()
      case 'monitoring': return renderMonitoringSettings()
      default: return renderGameSettings()
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载系统设置...</p>
      </div>
    )
  }

  return (
    <div className="system-settings">
      <div className="settings-header">
        <h2>系统设置</h2>
        <div className="header-actions">
          <button 
            className="reset-btn"
            onClick={handleReset}
          >
            🔄 重置默认
          </button>
          <button 
            className="save-btn"
            onClick={handleSave}
            disabled={Object.keys(changes).length === 0 || saving}
          >
            {saving ? '保存中...' : '💾 保存设置'}
          </button>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-nav">
          {sections.map(section => (
            <button
              key={section.id}
              className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="nav-icon">{section.icon}</span>
              <span className="nav-label">{section.label}</span>
              {changes[section.id] && <span className="change-indicator">●</span>}
            </button>
          ))}
        </div>

        <div className="settings-panel">
          {renderSection()}
        </div>
      </div>

      {Object.keys(changes).length > 0 && (
        <div className="changes-indicator">
          <span className="change-count">{Object.keys(changes).length}</span>
          项设置已修改，请保存更改
        </div>
      )}
    </div>
  )
}

export default SystemSettings
