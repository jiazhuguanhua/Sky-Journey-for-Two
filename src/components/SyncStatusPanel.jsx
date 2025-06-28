import React, { useState, useEffect } from 'react';
import { taskLibraryManager } from '../utils/taskLibraryManager.js';

const SyncStatusPanel = ({ onClose }) => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    updateSyncStatus();
    // 每5秒更新一次状态
    const interval = setInterval(updateSyncStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateSyncStatus = async () => {
    const status = taskLibraryManager.getSyncStatus();
    setSyncStatus(status);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await taskLibraryManager.initCloudSync();
      await updateSyncStatus();
    } catch (error) {
      console.error('刷新同步状态失败:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (isOnline, cloudEnabled) => {
    if (!isOnline) return '🔴';
    if (cloudEnabled) return '🟢';
    return '🟡';
  };

  const getStatusText = (isOnline, cloudEnabled) => {
    if (!isOnline) return '离线模式';
    if (cloudEnabled) return '云端同步已启用';
    return '本地存储模式';
  };

  if (!syncStatus) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div>⏳ 加载同步状态...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        {/* 标题栏 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: '15px'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>☁️ 同步状态</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999'
            }}
          >
            ✕
          </button>
        </div>

        {/* 总体状态 */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '18px', marginBottom: '5px' }}>
              {getStatusIcon(syncStatus.isOnline, syncStatus.cloudEnabled)} 
              {getStatusText(syncStatus.isOnline, syncStatus.cloudEnabled)}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              用户ID: {syncStatus.userId}
            </div>
            {syncStatus.pendingChanges > 0 && (
              <div style={{ fontSize: '14px', color: '#f39c12' }}>
                📤 待同步: {syncStatus.pendingChanges} 个更改
              </div>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              opacity: isRefreshing ? 0.6 : 1
            }}
          >
            {isRefreshing ? '⏳' : '🔄'} 刷新
          </button>
        </div>

        {/* 任务库状态详情 */}
        <div>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>📚 任务库状态</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {Object.entries(syncStatus.libraries).map(([key, info]) => {
              const [library, category] = key.split('.');
              const libraryNames = {
                couple: '情侣专用',
                funny: '搞笑逗趣',
                romantic: '浪漫温馨',
                adventurous: '刺激冒险',
                intimate: '亲密无间'
              };
              const categoryNames = {
                truth: '真心话',
                dare: '大冒险'
              };

              return (
                <div key={key} style={{
                  background: info.hasCustomTasks ? '#e8f5e8' : '#f0f0f0',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                      {libraryNames[library]} - {categoryNames[category]}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {info.hasCustomTasks ? 
                        `✏️ 已自定义 (v${info.version})` : 
                        '📋 使用默认任务'
                      }
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {info.hasCustomTasks ? (
                      syncStatus.cloudEnabled ? '☁️' : '💾'
                    ) : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 说明文字 */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#fff3cd',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#856404'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>💡 说明：</div>
          <div>• 🟢 云端同步：数据自动保存到云端，可跨设备访问</div>
          <div>• 🟡 本地模式：数据仅保存在当前设备</div>
          <div>• 🔴 离线模式：网络连接中断，使用本地缓存</div>
          <div>• ☁️ 表示已同步到云端，💾 表示仅保存在本地</div>
        </div>

        {/* 操作按钮 */}
        <div style={{
          marginTop: '20px',
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              cursor: 'pointer'
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncStatusPanel;
