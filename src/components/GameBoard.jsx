import React from 'react';
import { TASK_LIBRARIES } from '../data/taskLibrary.js';

const GameBoard = ({
  players,
  gameState,
  boardPositions,
  onRollDice,
  onCellClick,
  onExitGame,
  selectedTaskType,
  playButtonSound,
  isBGMPlaying,
  toggleBGM
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '2rem' }}>
        ✈️ Sky Journey 飞行棋
      </h2>
      
      {/* 全局BGM控制按钮 */}
      <div style={{ position: 'absolute', top: 20, right: 40, zIndex: 100 }}>
        <button
          className="btn animate-float"
          style={{
            background: isBGMPlaying ? '#e74c3c' : '#27ae60',
            padding: '10px 22px',
            fontSize: '18px',
            border: 'none',
            borderRadius: '25px',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
          onClick={() => {
            playButtonSound();
            toggleBGM();
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.classList.add('animate-pulse');
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.classList.remove('animate-pulse');
          }}
        >
          {isBGMPlaying ? '🔇 BGM' : '🔊 BGM'}
        </button>
      </div>
      
      {/* 当前玩家信息 */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        color: 'white',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '650px',
        maxWidth: '100%'
      }}>
        <div>
          <p style={{ fontSize: '1.2rem', margin: '0 0 10px 0' }}>
            当前玩家: {players[gameState.currentPlayer].avatar} {players[gameState.currentPlayer].name}
          </p>
          <p style={{ fontSize: '1rem', margin: 0 }}>
            任务类型: {TASK_LIBRARIES[selectedTaskType].name}
          </p>
        </div>
        <button
          className="btn"
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '8px 16px',
            fontSize: '14px'
          }}
          onClick={() => {
            playButtonSound();
            if (confirm('确定要退出游戏吗？')) {
              onExitGame();
            }
          }}
        >
          🏠 退出
        </button>
      </div>

      {/* 骰子区域 */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '15px',
          animation: gameState.isRolling ? 'spin 0.1s linear infinite' : 'none'
        }}>
          🎲
        </div>
        <div style={{ color: 'white', fontSize: '2rem', marginBottom: '15px' }}>
          {gameState.diceValue || '?'}
        </div>
        <button
          className="btn"
          style={{
            background: gameState.canRoll 
              ? 'linear-gradient(135deg, #FF6B9D, #FF8E53)' 
              : 'rgba(128,128,128,0.5)',
            padding: '15px 30px',
            fontSize: '18px',
            cursor: gameState.canRoll ? 'pointer' : 'not-allowed',
          }}
          disabled={!gameState.canRoll || gameState.isRolling}
          onClick={onRollDice}
        >
          {gameState.isRolling ? '🎲 掷骰中...' : '🎯 掷骰子'}
        </button>
      </div>

      {/* 棋盘 */}
      <div style={{
        position: 'relative',
        width: '650px',
        height: '650px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        borderRadius: '20px',
        border: '3px solid rgba(255,255,255,0.3)',
        backdropFilter: 'blur(20px)',
        margin: '0 auto',
        padding: '25px'
      }}>
        {/* 中央区域 */}
        <div style={{
          position: 'absolute',
          top: '75px',
          left: '75px',
          width: '450px',
          height: '450px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✈️</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
            Sky Journey
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.8 }}>
            for Two
          </div>
          <div style={{ fontSize: '0.9rem', marginTop: '20px', opacity: 0.6 }}>
            点击格子查看任务
          </div>
        </div>

        {/* 棋盘格子 */}
        {boardPositions.map((position, index) => {
          const hasTask = position.hasTask;
          const isPlayerHere = Object.values(players).some(player => player.position === index);
          
          return (
            <div
              key={position.id}
              style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                width: '50px',
                height: '50px',
                borderRadius: '8px',
                background: position.isStart 
                  ? 'linear-gradient(135deg, #4ECDC4, #44A08D)'
                  : position.isFinish 
                  ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                  : hasTask
                  ? 'linear-gradient(135deg, #FF6B9D, #FF8E53)'
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                border: isPlayerHere ? '3px solid #FFD700' : '2px solid white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
                cursor: hasTask ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                zIndex: 5
              }}
              onClick={() => hasTask && onCellClick(position)}
              onMouseEnter={(e) => {
                if (hasTask) {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (hasTask) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 3px 10px rgba(0,0,0,0.3)';
                }
              }}
            >
              <div style={{ fontSize: '12px', marginBottom: '2px' }}>
                {position.isStart ? '🏠' : 
                 position.isFinish ? '🏆' : 
                 hasTask ? '🎪' : index}
              </div>
              <div style={{ fontSize: '8px' }}>
                {position.isStart ? '起点' : 
                 position.isFinish ? '终点' : 
                 hasTask ? '任务' : ''}
              </div>
              
              {/* 显示玩家棋子 */}
              {Object.entries(players).map(([playerKey, player]) => {
                if (player.position === index) {
                  return (
                    <div
                      key={playerKey}
                      style={{
                        position: 'absolute',
                        top: playerKey === 'player1' ? '-8px' : 'auto',
                        bottom: playerKey === 'player2' ? '-8px' : 'auto',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: player.color,
                        border: '2px solid white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                        zIndex: 10,
                        animation: 'pulse 1s infinite'
                      }}
                    >
                      {player.avatar}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameBoard;
