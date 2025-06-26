import React, { useState, useEffect } from 'react'
import './RoomManagement.css'

const RoomManagement = ({ socket }) => {
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    if (!socket) return

    // 监听房间列表更新
    socket.on('rooms-list', (roomsList) => {
      setRooms(roomsList)
      setLoading(false)
    })

    // 监听房间更新
    socket.on('room-updated', (roomData) => {
      setRooms(prev => prev.map(room => 
        room.id === roomData.id ? roomData : room
      ))
      if (selectedRoom && selectedRoom.id === roomData.id) {
        setSelectedRoom(roomData)
      }
    })

    // 监听房间删除
    socket.on('room-deleted', (roomId) => {
      setRooms(prev => prev.filter(room => room.id !== roomId))
      if (selectedRoom && selectedRoom.id === roomId) {
        setSelectedRoom(null)
      }
    })

    // 请求房间列表
    socket.emit('get-rooms-list')

    // 定期更新房间列表
    const interval = setInterval(() => {
      socket.emit('get-rooms-list')
    }, 5000)

    return () => {
      clearInterval(interval)
      socket.off('rooms-list')
      socket.off('room-updated')
      socket.off('room-deleted')
    }
  }, [socket, selectedRoom])

  const handleCloseRoom = (roomId) => {
    if (confirm('确定要关闭这个房间吗？所有玩家将被断开连接。')) {
      socket.emit('admin-close-room', { roomId })
    }
  }

  const handleKickPlayer = (roomId, playerId) => {
    if (confirm('确定要踢出这个玩家吗？')) {
      socket.emit('admin-kick-player', { roomId, playerId })
    }
  }

  const handleResetGame = (roomId) => {
    if (confirm('确定要重置这个游戏吗？游戏进度将被清零。')) {
      socket.emit('admin-reset-game', { roomId })
    }
  }

  const handleBroadcastMessage = (roomId, message) => {
    if (message.trim()) {
      socket.emit('admin-broadcast', { roomId, message: message.trim() })
    }
  }

  // 过滤房间
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.players.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && room.status === 'playing') ||
                         (filterStatus === 'waiting' && room.status === 'waiting') ||
                         (filterStatus === 'finished' && room.status === 'finished')
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return '#ff9800'
      case 'playing': return '#4caf50'
      case 'finished': return '#9e9e9e'
      default: return '#2196f3'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'waiting': return '等待中'
      case 'playing': return '游戏中'
      case 'finished': return '已结束'
      default: return '未知'
    }
  }

  return (
    <div className="room-management">
      <div className="room-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索房间ID或玩家名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">所有状态</option>
          <option value="waiting">等待中</option>
          <option value="playing">游戏中</option>
          <option value="finished">已结束</option>
        </select>
      </div>

      <div className="room-content">
        <div className="room-list">
          <div className="room-list-header">
            <h3>房间列表 ({filteredRooms.length})</h3>
            <button 
              className="refresh-btn"
              onClick={() => socket.emit('get-rooms-list')}
            >
              🔄 刷新
            </button>
          </div>

          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              加载房间列表...
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🏠</span>
              <p>暂无房间</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {filteredRooms.map(room => (
                <div 
                  key={room.id} 
                  className={`room-card ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <div className="room-header">
                    <div className="room-id">#{room.id}</div>
                    <div 
                      className="room-status"
                      style={{ backgroundColor: getStatusColor(room.status) }}
                    >
                      {getStatusText(room.status)}
                    </div>
                  </div>
                  
                  <div className="room-info">
                    <div className="player-count">
                      👥 {room.players.length}/2 玩家
                    </div>
                    <div className="room-time">
                      ⏰ {formatTime(room.createdAt)}
                    </div>
                  </div>
                  
                  <div className="room-players">
                    {room.players.map(player => (
                      <div key={player.id} className="player-tag">
                        {player.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="room-details">
          {selectedRoom ? (
            <RoomDetailsPanel 
              room={selectedRoom}
              onCloseRoom={handleCloseRoom}
              onKickPlayer={handleKickPlayer}
              onResetGame={handleResetGame}
              onBroadcastMessage={handleBroadcastMessage}
            />
          ) : (
            <div className="no-selection">
              <span className="select-icon">👈</span>
              <p>选择一个房间查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const RoomDetailsPanel = ({ room, onCloseRoom, onKickPlayer, onResetGame, onBroadcastMessage }) => {
  const [message, setMessage] = useState('')

  const handleSendMessage = () => {
    if (message.trim()) {
      onBroadcastMessage(room.id, message)
      setMessage('')
    }
  }

  return (
    <div className="room-details-panel">
      <div className="details-header">
        <h3>房间详情: #{room.id}</h3>
        <div className="room-actions">
          <button 
            className="action-btn reset-btn"
            onClick={() => onResetGame(room.id)}
            disabled={room.status === 'waiting'}
          >
            🔄 重置游戏
          </button>
          <button 
            className="action-btn close-btn"
            onClick={() => onCloseRoom(room.id)}
          >
            ❌ 关闭房间
          </button>
        </div>
      </div>

      <div className="details-content">
        <div className="detail-section">
          <h4>基本信息</h4>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">状态:</span>
              <span className="value">{getStatusText(room.status)}</span>
            </div>
            <div className="detail-item">
              <span className="label">创建时间:</span>
              <span className="value">{formatTime(room.createdAt)}</span>
            </div>
            <div className="detail-item">
              <span className="label">玩家数量:</span>
              <span className="value">{room.players.length}/2</span>
            </div>
            {room.game && (
              <>
                <div className="detail-item">
                  <span className="label">当前轮次:</span>
                  <span className="value">{room.game.currentTurn}</span>
                </div>
                <div className="detail-item">
                  <span className="label">游戏回合:</span>
                  <span className="value">{room.game.round}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h4>玩家列表</h4>
          <div className="players-list">
            {room.players.map(player => (
              <div key={player.id} className="player-item">
                <div className="player-info">
                  <div className="player-avatar">{player.character || '👤'}</div>
                  <div className="player-details">
                    <div className="player-name">{player.name}</div>
                    <div className="player-meta">
                      ID: {player.id} | 位置: {player.position || 0}
                    </div>
                  </div>
                </div>
                <button 
                  className="kick-btn"
                  onClick={() => onKickPlayer(room.id, player.id)}
                >
                  踢出
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h4>管理员广播</h4>
          <div className="broadcast-section">
            <div className="message-input-group">
              <input
                type="text"
                placeholder="输入要广播的消息..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="message-input"
              />
              <button 
                className="send-btn"
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                📢 发送
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 工具函数
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString('zh-CN')
}

function getStatusText(status) {
  switch (status) {
    case 'waiting': return '等待中'
    case 'playing': return '游戏中'
    case 'finished': return '已结束'
    default: return '未知'
  }
}

export default RoomManagement
