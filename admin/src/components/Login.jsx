import React, { useState } from 'react'
import './Login.css'

const Login = ({ onLogin, isConnecting, error }) => {
  const [adminKey, setAdminKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (adminKey.trim()) {
      onLogin(adminKey.trim())
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="admin-icon">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L17.5 6.5H6.5L10.5 2.5L9 1L3 7V9H21ZM4 10V21H11V14H13V21H20V10H4Z" fill="currentColor"/>
            </svg>
          </div>
          <h1>Sky Journey 管理后台</h1>
          <p>请输入管理员密钥以访问系统</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="adminKey">管理员密钥</label>
            <div className="password-input">
              <input
                type={showKey ? "text" : "password"}
                id="adminKey"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="请输入管理员密钥"
                disabled={isConnecting}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowKey(!showKey)}
                disabled={isConnecting}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={isConnecting || !adminKey.trim()}
          >
            {isConnecting ? (
              <>
                <span className="loading-spinner"></span>
                连接中...
              </>
            ) : (
              '登录管理后台'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>🔒 安全提示：请妥善保管您的管理员密钥</p>
          <div className="version-info">
            Sky Journey for Two - Admin v1.0.0
          </div>
        </div>
      </div>

      <div className="background-animation">
        <div className="cloud cloud-1">☁️</div>
        <div className="cloud cloud-2">☁️</div>
        <div className="cloud cloud-3">☁️</div>
        <div className="heart heart-1">💖</div>
        <div className="heart heart-2">💕</div>
      </div>
    </div>
  )
}

export default Login
