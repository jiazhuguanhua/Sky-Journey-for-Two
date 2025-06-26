import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import './styles/App.css'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

function App() {
  const [socket, setSocket] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (adminKey) => {
    setIsConnecting(true)
    setError(null)

    try {
      // 创建Socket连接
      const newSocket = io(SERVER_URL, {
        transports: ['websocket', 'polling']
      })

      // 监听连接事件
      newSocket.on('connect', () => {
        console.log('Connected to server')
        
        // 尝试加入管理频道
        newSocket.emit('join-admin', { adminKey })
      })

      // 监听管理员认证成功
      newSocket.on('admin-connected', (data) => {
        console.log('Admin authenticated successfully')
        setSocket(newSocket)
        setIsAuthenticated(true)
        setIsConnecting(false)
      })

      // 监听认证失败
      newSocket.on('admin-error', (error) => {
        console.error('Admin authentication failed:', error.message)
        setError(error.message)
        setIsConnecting(false)
        newSocket.disconnect()
      })

      // 监听连接错误
      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error)
        setError('无法连接到服务器')
        setIsConnecting(false)
      })

    } catch (error) {
      console.error('Login error:', error)
      setError('登录失败')
      setIsConnecting(false)
    }
  }

  const handleLogout = () => {
    if (socket) {
      socket.emit('leave-admin')
      socket.disconnect()
    }
    setSocket(null)
    setIsAuthenticated(false)
    setError(null)
  }

  useEffect(() => {
    // 清理函数
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [socket])

  if (!isAuthenticated) {
    return (
      <Login 
        onLogin={handleLogin}
        isConnecting={isConnecting}
        error={error}
      />
    )
  }

  return (
    <div className="admin-app">
      <Dashboard 
        socket={socket}
        onLogout={handleLogout}
      />
    </div>
  )
}

export default App
