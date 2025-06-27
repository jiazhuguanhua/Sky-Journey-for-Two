import React from 'react';

// 任务类型选择弹窗
export const TaskTypeSelectModal = ({ onSelectTaskCategory, playButtonSound }) => (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
  }}>
    <div style={{
      background: 'white',
      borderRadius: '25px',
      padding: '40px 30px',
      textAlign: 'center',
      minWidth: '320px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      animation: 'bounceIn 0.6s'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '20px', color: '#764ba2' }}>
        请选择挑战类型
      </div>
      <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
        <button
          className="btn btn-secondary"
          style={{ padding: '18px 36px', fontSize: '1.2rem' }}
          onClick={() => {
            playButtonSound();
            onSelectTaskCategory('truth');
          }}
        >
          💭 真心话
        </button>
        <button
          className="btn btn-success"
          style={{ padding: '18px 36px', fontSize: '1.2rem' }}
          onClick={() => {
            playButtonSound();
            onSelectTaskCategory('dare');
          }}
        >
          🎪 大冒险
        </button>
      </div>
    </div>
  </div>
);

// 任务恭喜动画
export const TaskCongratsModal = () => (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
    animation: 'fadeIn 0.5s',
  }}>
    <div style={{
      textAlign: 'center',
      color: 'white',
      fontSize: '2.5rem',
      fontWeight: 'bold',
      padding: '60px 40px',
      borderRadius: '30px',
      background: 'linear-gradient(135deg, #FFD700 0%, #FF6B9D 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      position: 'relative',
      overflow: 'hidden',
      animation: 'bounceIn 0.8s'
    }}>
      🎉 恭喜你触发了任务！
      <div style={{ fontSize: '1.5rem', marginTop: '20px' }}>准备迎接挑战吧！</div>
      {/* 彩带动画 */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, top: 0, height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}>
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${8 + i * 7}%`,
            top: '-40px',
            width: '18px',
            height: '80px',
            background: `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)} 0%, #${Math.floor(Math.random()*16777215).toString(16)} 100%)`,
            borderRadius: '10px',
            opacity: 0.7,
            transform: `rotate(${Math.random()*60-30}deg)`,
            animation: `confetti-fall 1.2s cubic-bezier(.6,.2,.4,1) forwards`,
            animationDelay: `${i*0.08}s`
          }} />
        ))}
      </div>
    </div>
  </div>
);

// 计时完成动画
export const TimerAnimationModal = () => (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.5s'
  }}>
    <div style={{
      textAlign: 'center',
      color: 'white',
      fontSize: '3rem',
      fontWeight: 'bold',
      padding: '60px 40px',
      borderRadius: '30px',
      background: 'linear-gradient(135deg, #FF4444 0%, #FF8888 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      position: 'relative',
      overflow: 'hidden',
      animation: 'pulse 0.8s ease-in-out infinite alternate'
    }}>
      ⏰ 时间到！
      <div style={{ fontSize: '1.5rem', marginTop: '20px' }}>任务时间已结束</div>
      {/* 爆炸动画效果 */}
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '20px',
          height: '20px',
          background: '#FFD700',
          borderRadius: '50%',
          transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-60px)`,
          animation: `explosion 1.5s ease-out forwards`,
          animationDelay: `${i * 0.1}s`
        }} />
      ))}
    </div>
  </div>
);

// 完成任务动画
export const CompleteAnimationModal = () => (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.5s'
  }}>
    <div style={{
      textAlign: 'center',
      color: '#FFD700',
      fontSize: '3rem',
      fontWeight: 'bold',
      padding: '60px 40px',
      borderRadius: '30px',
      background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      position: 'relative',
      overflow: 'hidden',
      animation: 'bounceIn 0.8s'
    }}>
      🎉 完成任务！
      <div style={{ fontSize: '1.5rem', marginTop: '20px', color: '#333' }}>奖励一枚小星星！</div>
      {/* 星星动画 */}
      {[...Array(10)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${30 + Math.random()*40}%`,
          top: `${30 + Math.random()*40}%`,
          width: '18px',
          height: '18px',
          background: 'yellow',
          borderRadius: '50%',
          boxShadow: '0 0 12px 4px #FFD700',
          opacity: 0.8,
          animation: `star-pop 1.2s cubic-bezier(.6,.2,.4,1) forwards`,
          animationDelay: `${i*0.07}s`,
          zIndex: 2
        }} />
      ))}
    </div>
  </div>
);

// 跳过任务动画
export const SkipAnimationModal = () => (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.5s'
  }}>
    <div style={{
      textAlign: 'center',
      color: '#fff',
      fontSize: '3rem',
      fontWeight: 'bold',
      padding: '60px 40px',
      borderRadius: '30px',
      background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      position: 'relative',
      overflow: 'hidden',
      animation: 'shake 0.8s'
    }}>
      🍻 喝一口酒跳过！
      <div style={{ fontSize: '1.5rem', marginTop: '20px', color: '#FFD700' }}>下次加油！</div>
      {/* 酒杯动画 */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${40 + Math.random()*20}%`,
          top: `${40 + Math.random()*20}%`,
          width: '22px',
          height: '22px',
          background: 'linear-gradient(135deg, #fffbe7 60%, #FFD700 100%)',
          borderRadius: '6px 6px 12px 12px',
          border: '2px solid #FFD700',
          opacity: 0.9,
          animation: `cup-pop 1.2s cubic-bezier(.6,.2,.4,1) forwards`,
          animationDelay: `${i*0.09}s`,
          zIndex: 2
        }} />
      ))}
    </div>
  </div>
);

// 格子任务预览弹窗
export const CellPreviewModal = ({ selectedCell, onClose, onRegenerateTask, playButtonSound }) => {
  if (!selectedCell) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      animation: 'fadeIn 0.5s'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '600px',
        width: '90%',
        textAlign: 'center',
        color: 'white',
        border: '2px solid rgba(255,255,255,0.3)',
        animation: 'slideIn 0.6s ease-out'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🎪</div>
        
        <h3 style={{ marginBottom: '25px', fontSize: '1.3rem' }}>
          第 {selectedCell.position.id} 格任务预览
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
          {/* 真心话 */}
          <div style={{
            background: 'rgba(255,107,157,0.3)',
            borderRadius: '15px',
            padding: '20px',
            border: '2px solid rgba(255,107,157,0.5)'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>💭</div>
            <h4 style={{ marginBottom: '10px', color: '#FFB6C1' }}>真心话</h4>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.4', margin: 0 }}>
              {selectedCell.tasks.truth}
            </p>
          </div>
          
          {/* 大冒险 */}
          <div style={{
            background: 'rgba(78,205,196,0.3)',
            borderRadius: '15px',
            padding: '20px',
            border: '2px solid rgba(78,205,196,0.5)'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>🎪</div>
            <h4 style={{ marginBottom: '10px', color: '#98E4E0' }}>大冒险</h4>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.4', margin: 0 }}>
              {selectedCell.tasks.dare}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              playButtonSound();
              onRegenerateTask(selectedCell.position.id);
            }}
          >
            🔄 换一换
          </button>
          
          <button
            className="btn"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
            onClick={() => {
              playButtonSound();
              onClose();
            }}
          >
            ✖️ 关闭
          </button>
        </div>
      </div>
    </div>
  );
};
