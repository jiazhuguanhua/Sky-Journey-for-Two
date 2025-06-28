import React, { useState, useEffect } from 'react';
import { TASK_LIBRARIES } from '../data/taskLibrary.js';
import { taskLibraryManager, hasCustomTasks } from '../utils/taskLibraryManager.js';
import SyncStatusPanel from './SyncStatusPanel.jsx';

const TaskEditor = ({ onBack, playButtonSound, playNotificationSound, playErrorSound }) => {
  const [selectedLibrary, setSelectedLibrary] = useState('couple');
  const [selectedCategory, setSelectedCategory] = useState('truth');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSyncStatus, setShowSyncStatus] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, saving, conflict
  const [conflictData, setConflictData] = useState(null);

  // 加载当前选中库的任务
  useEffect(() => {
    // 直接从任务库管理器获取任务（包括自定义任务）
    const taskStrings = taskLibraryManager.getTasks(selectedLibrary, selectedCategory);
    const taskObjects = taskStrings.map((taskStr, index) => ({
      id: `${selectedLibrary}_${selectedCategory}_${index}`,
      title: taskStr.length > 30 ? taskStr.substring(0, 30) + '...' : taskStr,
      description: taskStr,
      type: selectedCategory
    }));
    setTasks(taskObjects);
  }, [selectedLibrary, selectedCategory]);

  // 过滤任务
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 添加新任务
  const handleAddTask = () => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      playErrorSound();
      alert('请填写完整的任务标题和描述');
      return;
    }

    const task = {
      id: Date.now(),
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      type: selectedCategory
    };

    setTasks(prev => [...prev, task]);
    setNewTask({ title: '', description: '' });
    setShowAddForm(false);
    playNotificationSound();
  };

  // 编辑任务
  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask({ title: task.title, description: task.description });
    setShowAddForm(true);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      playErrorSound();
      alert('请填写完整的任务标题和描述');
      return;
    }

    setTasks(prev => prev.map(task => 
      task.id === editingTask.id 
        ? { ...task, title: newTask.title.trim(), description: newTask.description.trim() }
        : task
    ));
    
    setEditingTask(null);
    setNewTask({ title: '', description: '' });
    setShowAddForm(false);
    playNotificationSound();
  };

  // 删除任务
  const handleDeleteTask = (taskId) => {
    if (confirm('确定要删除这个任务吗？')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      playNotificationSound();
    }
  };

  // 保存到云端（新的云端同步版本）
  const handleSaveLibrary = async () => {
    setSyncStatus('saving');
    
    try {
      // 转换任务对象数组为字符串数组
      const taskStrings = tasks.map(task => task.description);
      
      // 使用任务库管理器保存（支持云端同步）
      const result = await taskLibraryManager.saveCustomTasks(selectedLibrary, selectedCategory, taskStrings);
      
      if (result.success) {
        if (result.synced) {
          playNotificationSound();
          alert(`✅ 任务库已保存并同步到云端！\n\n📍 保存内容：${selectedLibrary} - ${selectedCategory === 'truth' ? '真心话' : '大冒险'}\n📊 任务数量：${taskStrings.length} 个\n☁️ 版本号：v${result.version}\n\n这些任务可以在任何设备上访问！`);
        } else {
          playNotificationSound();
          const errorMsg = result.error ? `\n⚠️ 云端同步失败：${result.error}` : '';
          alert(`💾 任务库已保存到本地！\n\n📍 保存内容：${selectedLibrary} - ${selectedCategory === 'truth' ? '真心话' : '大冒险'}\n📊 任务数量：${taskStrings.length} 个\n💽 保存位置：浏览器本地存储${errorMsg}\n\n这些自定义任务将在下次游戏时自动使用。`);
        }
      } else if (result.conflict) {
        // 处理同步冲突
        setSyncStatus('conflict');
        setConflictData(result);
        playErrorSound();
        return; // 不清除保存状态，等待用户处理冲突
      } else {
        throw new Error(result.error || '保存失败');
      }
    } catch (error) {
      playErrorSound();
      alert('保存失败：' + error.message);
    } finally {
      if (syncStatus !== 'conflict') {
        setSyncStatus('idle');
      }
    }
  };

  // 处理同步冲突
  const handleResolveConflict = async (resolution) => {
    if (!conflictData) return;
    
    try {
      const result = await conflictData.resolve(resolution);
      if (result.success) {
        setConflictData(null);
        setSyncStatus('idle');
        playNotificationSound();
        alert(`✅ 冲突已解决！任务库已更新到版本 v${result.version}`);
        
        // 刷新任务列表
        const taskObjects = result.tasks.map((taskStr, index) => ({
          id: `${selectedLibrary}_${selectedCategory}_${index}`,
          title: taskStr.length > 30 ? taskStr.substring(0, 30) + '...' : taskStr,
          description: taskStr,
          type: selectedCategory
        }));
        setTasks(taskObjects);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      playErrorSound();
      alert('解决冲突失败：' + error.message);
    }
  };

  // 分享任务库
  const handleShareLibrary = async () => {
    try {
      // 先保存到云端
      if (tasks.length === 0) {
        alert('请先添加一些任务再分享！');
        return;
      }

      const taskStrings = tasks.map(task => task.description);
      const saveResult = await taskLibraryManager.saveCustomTasks(selectedLibrary, selectedCategory, taskStrings);
      
      if (!saveResult.synced) {
        alert('分享功能需要云端同步支持，请检查网络连接！');
        return;
      }

      // 生成分享链接
      const shareResult = await taskLibraryManager.shareTaskLibrary(selectedLibrary, selectedCategory);
      
      if (shareResult.success) {
        // 复制到剪贴板
        await navigator.clipboard.writeText(shareResult.shareUrl);
        playNotificationSound();
        alert(`🎉 分享链接已生成并复制到剪贴板！\n\n🔗 分享ID：${shareResult.shareId}\n📋 任务数量：${taskStrings.length} 个\n\n其他玩家可以使用这个链接导入您的任务库。`);
      } else {
        throw new Error(shareResult.error);
      }
    } catch (error) {
      playErrorSound();
      alert('分享失败：' + error.message);
    }
  };

  // 导入分享的任务库
  const handleImportShared = async () => {
    const shareId = prompt('请输入分享ID或完整的分享链接：');
    if (!shareId) return;

    // 提取shareId（如果是完整URL）
    const extractedId = shareId.includes('/') ? shareId.split('/').pop() : shareId;
    
    try {
      const result = await taskLibraryManager.importSharedTasks(extractedId);
      
      if (result.success) {
        playNotificationSound();
        alert(`✅ 成功导入任务库！\n\n📚 类型：${result.taskType}\n📂 分类：${result.category}\n📊 任务数量：${result.tasksCount} 个\n\n任务已保存，您可以在相应的分类中查看。`);
        
        // 如果导入的是当前选择的类型，刷新任务列表
        if (result.taskType === selectedLibrary && result.category === selectedCategory) {
          location.reload(); // 简单粗暴的刷新方法
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      playErrorSound();
      alert('导入失败：' + error.message);
    }
  };

  // 导出任务库
  const handleExportTasks = () => {
    try {
      const exportData = taskLibraryManager.exportTasks(selectedLibrary, selectedCategory);
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `tasks_${selectedLibrary}_${selectedCategory}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      playNotificationSound();
    } catch (error) {
      playErrorSound();
      alert('导出失败：' + error.message);
    }
  };

  // 导入任务库
  const handleImportTasks = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        // 使用任务库管理器导入
        const success = taskLibraryManager.importTasks(importData);
        
        if (success) {
          // 如果导入的是当前选中的库和类别，刷新显示
          if (importData.library === selectedLibrary && importData.category === selectedCategory) {
            const taskStrings = taskLibraryManager.getTasks(selectedLibrary, selectedCategory);
            const taskObjects = taskStrings.map((taskStr, index) => ({
              id: `${selectedLibrary}_${selectedCategory}_${index}`,
              title: taskStr.length > 30 ? taskStr.substring(0, 30) + '...' : taskStr,
              description: taskStr,
              type: selectedCategory
            }));
            setTasks(taskObjects);
          }
          
          playNotificationSound();
          alert(`任务库导入成功！\n\n导入内容：${importData.libraryName || importData.library} - ${importData.category === 'truth' ? '真心话' : '大冒险'}\n任务数量：${importData.tasks.length} 个\n\n导入的任务已自动保存，下次游戏时将使用这些任务。`);
        }
      } catch (error) {
        playErrorSound();
        alert('导入失败：' + error.message);
      }
    };
    reader.readAsText(file);
    
    // 清空文件输入，允许重复导入同一文件
    event.target.value = '';
  };

  return (
    <div className="task-editor">
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        color: 'white'
      }}>
        {/* 顶部导航 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              📝 任务库编辑器
            </h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>自定义你的游戏任务</p>
          </div>
          <button
            onClick={() => { playButtonSound(); onBack(); }}
            className="btn animate-pulse"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.3s ease'
            }}
          >
            ← 返回主页
          </button>
        </div>

        {/* 控制面板 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* 库选择 */}
          <div style={{
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)'
          }}>
            <h3>🎪 任务库类型</h3>
            <select
              value={selectedLibrary}
              onChange={(e) => { setSelectedLibrary(e.target.value); playButtonSound(); }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '16px'
              }}
            >
              <option value="couple">💕 甜蜜情侣版</option>
              <option value="gentle">🌸 温柔淑女版</option>
              <option value="friend">🤝 好友兄弟版</option>
              <option value="passionate">🔥 热恋火花版</option>
              <option value="wild">🌪️ 狂野挑战版</option>
            </select>
          </div>

          {/* 类别选择 */}
          <div style={{
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)'
          }}>
            <h3>🎯 任务类别</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setSelectedCategory('truth'); playButtonSound(); }}
                className={selectedCategory === 'truth' ? 'btn animate-glow' : 'btn'}
                style={{
                  flex: 1,
                  background: selectedCategory === 'truth' ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                🗣️ 真心话
              </button>
              <button
                onClick={() => { setSelectedCategory('dare'); playButtonSound(); }}
                className={selectedCategory === 'dare' ? 'btn animate-glow' : 'btn'}
                style={{
                  flex: 1,
                  background: selectedCategory === 'dare' ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                🎭 大冒险
              </button>
            </div>
          </div>

          {/* 搜索 */}
          <div style={{
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)'
          }}>
            <h3>🔍 搜索任务</h3>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="输入关键词搜索..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '16px'
              }}
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => { setShowAddForm(true); setEditingTask(null); setNewTask({ title: '', description: '' }); playButtonSound(); }}
            className="btn animate-bounce"
            style={{
              background: '#4CAF50',
              border: 'none',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ➕ 添加新任务
          </button>
          
          <button
            onClick={() => { handleSaveLibrary(); playButtonSound(); }}
            className="btn animate-pulse"
            style={{
              background: syncStatus === 'saving' ? '#FFA500' : '#2196F3',
              border: 'none',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: syncStatus === 'saving' ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              opacity: syncStatus === 'saving' ? 0.7 : 1
            }}
            disabled={syncStatus === 'saving'}
          >
            {syncStatus === 'saving' ? '⏳ 保存中...' : '☁️ 保存到云端'}
          </button>

          <button
            onClick={() => { handleShareLibrary(); playButtonSound(); }}
            className="btn animate-bounce"
            style={{
              background: '#FF9800',
              border: 'none',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🔗 分享任务库
          </button>

          <button
            onClick={() => { setShowSyncStatus(true); playButtonSound(); }}
            className="btn"
            style={{
              background: '#6C757D',
              border: 'none',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            📊 同步状态
          </button>

          <button
            onClick={() => { handleImportShared(); playButtonSound(); }}
            className="btn"
            style={{
              background: '#28A745',
              border: 'none',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            📥 导入分享
          </button>
          
          <button
            onClick={() => { 
              if (confirm('确定要重置为默认任务吗？这将删除所有自定义任务！')) {
                taskLibraryManager.resetToDefault(selectedLibrary, selectedCategory);
                // 重新加载任务
                const taskStrings = taskLibraryManager.getTasks(selectedLibrary, selectedCategory);
                const taskObjects = taskStrings.map((taskStr, index) => ({
                  id: `${selectedLibrary}_${selectedCategory}_${index}`,
                  title: taskStr.length > 30 ? taskStr.substring(0, 30) + '...' : taskStr,
                  description: taskStr,
                  type: selectedCategory
                }));
                setTasks(taskObjects);
                playNotificationSound();
                alert('已重置为默认任务库！');
              }
              playButtonSound(); 
            }}
            className="btn"
            style={{
              background: '#ff5722',
              border: 'none',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🔄 重置为默认
          </button>
          
          <button
            onClick={() => { handleExportTasks(); playButtonSound(); }}
            className="btn"
            style={{
              background: '#FF9800',
              border: 'none',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            📤 导出任务库
          </button>
          
          <label className="btn" style={{
            background: '#9C27B0',
            border: 'none',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'inline-block'
          }}>
            📥 导入任务库
            <input
              type="file"
              accept=".json"
              onChange={handleImportTasks}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* 添加/编辑表单 */}
        {showAddForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div className="animate-slideInDown" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '30px',
              borderRadius: '20px',
              maxWidth: '500px',
              width: '90%',
              color: '#333'
            }}>
              <h3>{editingTask ? '编辑任务' : '添加新任务'}</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  任务标题：
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入任务标题..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  任务描述：
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="输入详细的任务描述..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setShowAddForm(false); setEditingTask(null); playButtonSound(); }}
                  style={{
                    background: '#ccc',
                    border: 'none',
                    color: '#333',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  取消
                </button>
                <button
                  onClick={() => { editingTask ? handleSaveEdit() : handleAddTask(); playButtonSound(); }}
                  className="animate-pulse"
                  style={{
                    background: '#4CAF50',
                    border: 'none',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  {editingTask ? '保存修改' : '添加任务'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 任务列表 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)',
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3>
              {selectedCategory === 'truth' ? '🗣️ 真心话' : '🎭 大冒险'} 
              任务列表 ({filteredTasks.length} 个)
            </h3>
          </div>
          
          <div style={{
            display: 'grid',
            gap: '15px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {filteredTasks.map((task, index) => (
              <div
                key={task.id || index}
                className="animate-slideInLeft"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '15px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      margin: '0 0 10px 0',
                      color: '#ffeb3b',
                      fontSize: '18px'
                    }}>
                      {task.title}
                    </h4>
                    <p style={{
                      margin: 0,
                      opacity: 0.9,
                      lineHeight: '1.5'
                    }}>
                      {task.description}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => { handleEditTask(task); playButtonSound(); }}
                      className="animate-pulse"
                      style={{
                        background: '#2196F3',
                        border: 'none',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      ✏️ 编辑
                    </button>
                    <button
                      onClick={() => { handleDeleteTask(task.id || index); playButtonSound(); }}
                      style={{
                        background: '#f44336',
                        border: 'none',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      🗑️ 删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredTasks.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                opacity: 0.7
              }}>
                <p style={{ fontSize: '18px' }}>
                  {searchTerm ? '没有找到匹配的任务' : '暂无任务，点击"添加新任务"开始创建吧！'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 同步状态面板 */}
      {showSyncStatus && (
        <SyncStatusPanel onClose={() => setShowSyncStatus(false)} />
      )}

      {/* 冲突解决界面 */}
      {syncStatus === 'conflict' && conflictData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ color: '#E74C3C', marginBottom: '20px' }}>
              ⚠️ 检测到同步冲突
            </h2>
            
            <p style={{ marginBottom: '20px', color: '#555' }}>
              您的本地任务与云端任务发生了冲突。请选择如何处理：
            </p>

            <div style={{ display: 'grid', gap: '15px', marginBottom: '25px' }}>
              <div style={{
                border: '2px solid #3498DB',
                borderRadius: '10px',
                padding: '15px'
              }}>
                <h4 style={{ color: '#3498DB', marginBottom: '10px' }}>
                  💻 本地版本 ({conflictData.clientTasks.length} 个任务)
                </h4>
                <div style={{ maxHeight: '150px', overflow: 'auto', fontSize: '14px' }}>
                  {conflictData.clientTasks.map((task, index) => (
                    <div key={index} style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                      {task.length > 60 ? task.substring(0, 60) + '...' : task}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                border: '2px solid #E67E22',
                borderRadius: '10px',
                padding: '15px'
              }}>
                <h4 style={{ color: '#E67E22', marginBottom: '10px' }}>
                  ☁️ 云端版本 ({conflictData.serverTasks.length} 个任务)
                </h4>
                <div style={{ maxHeight: '150px', overflow: 'auto', fontSize: '14px' }}>
                  {conflictData.serverTasks.map((task, index) => (
                    <div key={index} style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                      {task.length > 60 ? task.substring(0, 60) + '...' : task}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleResolveConflict('client')}
                style={{
                  background: '#3498DB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  flex: 1,
                  minWidth: '120px'
                }}
              >
                使用本地版本
              </button>
              
              <button
                onClick={() => handleResolveConflict('server')}
                style={{
                  background: '#E67E22',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  flex: 1,
                  minWidth: '120px'
                }}
              >
                使用云端版本
              </button>
              
              <button
                onClick={() => handleResolveConflict('merge')}
                style={{
                  background: '#27AE60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  flex: 1,
                  minWidth: '120px'
                }}
              >
                合并两个版本
              </button>
            </div>

            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: '#FFF3CD',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#856404'
            }}>
              💡 提示：合并会将两个版本的任务去重后合并在一起
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskEditor;
