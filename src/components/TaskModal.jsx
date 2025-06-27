import React from 'react';

const TaskModal = ({
  currentTask,
  taskTimeLeft,
  isTimerStarted,
  onStartTimer,
  onCompleteTask,
  onSkipTask,
  onChangeTask,
  playButtonSound
}) => {
  if (!currentTask) return null;

  const isTruth = currentTask.category === 'truth';
  const isDare = currentTask.category === 'dare';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.5s'
    }}>
      <div className="modal-enter" style={{
        background: isTruth 
          ? 'linear-gradient(135deg, #FF6B9D 0%, #FF8E53 100%)'
          : 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
        borderRadius: '25px',
        padding: '40px 30px',
        textAlign: 'center',
        minWidth: '400px',
        maxWidth: '600px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        position: 'relative'
      }}>
        <div className="animate-bounce" style={{ fontSize: '3rem', marginBottom: '20px' }}>
          {isTruth ? '💭' : '🎪'}
        </div>
        <h3 className="animate-pulse" style={{ marginBottom: '20px', fontSize: '1.5rem' }}>
          {isTruth ? '真心话时间' : '大冒险时间'}
        </h3>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '20px',
          fontSize: '1.2rem',
          lineHeight: '1.6'
        }}>
          {currentTask.text}
        </div>
        
        {/* 计时器区域 - 只有大冒险显示 */}
        {isDare && (
          <div style={{ marginBottom: '25px' }}>
            {!isTimerStarted ? (
              <button
                className="btn"
                style={{
                  background: 'rgba(255,255,255,0.3)',
                  border: '2px solid white',
                  padding: '12px 25px',
                  fontSize: '16px'
                }}
                onClick={() => {
                  playButtonSound();
                  onStartTimer();
                }}
              >
                ⏰ 点击开始计时
              </button>
            ) : (
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold',
                color: taskTimeLeft <= 10 ? '#ff4444' : 'white',
                animation: taskTimeLeft <= 10 ? 'pulse 1s infinite' : 'none'
              }}>
                ⏰ {Math.floor(taskTimeLeft / 60)}:{(taskTimeLeft % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-success animate-glow"
            onClick={() => {
              playButtonSound();
              onCompleteTask();
            }}
            onMouseEnter={(e) => {
              e.target.classList.add('animate-rubber');
            }}
            onMouseLeave={(e) => {
              e.target.classList.remove('animate-rubber');
            }}
          >
            ✅ 完成任务
          </button>
          
          <button
            className="btn btn-warning animate-twinkle"
            onClick={() => {
              playButtonSound();
              onSkipTask();
            }}
            onMouseEnter={(e) => {
              e.target.classList.add('animate-jello');
            }}
            onMouseLeave={(e) => {
              e.target.classList.remove('animate-jello');
            }}
          >
            🍷 喝一口酒跳过
          </button>
          
          <button
            className="btn animate-float"
            style={{
              background: 'linear-gradient(135deg, #AB47BC, #8E24AA)'
            }}
            onClick={() => {
              playButtonSound();
              onChangeTask();
            }}
            onMouseEnter={(e) => {
              e.target.classList.add('animate-bounce');
            }}
            onMouseLeave={(e) => {
              e.target.classList.remove('animate-bounce');
            }}
          >
            🔄 换一个任务
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
