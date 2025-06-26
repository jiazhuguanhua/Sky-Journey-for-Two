import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { GameProvider } from './contexts/GameContext'
import { SocketProvider } from './contexts/SocketContext'
import HomePage from './components/HomePage'
import GameContainer from './components/GameContainer'
import './styles/App.css'

function App() {
  return (
    <Router>
      <SocketProvider>
        <GameProvider>
          <div className="app">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/game/:roomId?" element={<GameContainer />} />
            </Routes>
          </div>
        </GameProvider>
      </SocketProvider>
    </Router>
  )
}

export default App
