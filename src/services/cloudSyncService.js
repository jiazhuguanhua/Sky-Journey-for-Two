/**
 * 云端任务同步服务
 * 负责前端与后端API的通信和数据同步
 */

class CloudSyncService {
  constructor() {
    // 根据环境自动设置API基础URL
    this.baseURL = this.getBaseURL();
    this.userId = this.getUserId();
    this.isOnline = navigator.onLine;
    
    // 监听网络状态
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingChanges();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * 获取API基础URL
   */
  getBaseURL() {
    // 生产环境
    if (import.meta.env.PROD) {
      return import.meta.env.VITE_API_URL || 'https://sky-journey-api.vercel.app/api';
    }
    // 开发环境
    return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  /**
   * 获取或生成用户ID
   */
  getUserId() {
    let userId = localStorage.getItem('sky-journey-user-id');
    if (!userId) {
      userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sky-journey-user-id', userId);
    }
    return userId;
  }

  /**
   * 通用HTTP请求方法
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API请求失败 [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * 检查服务是否可用
   */
  async checkHealth() {
    try {
      const result = await this.request('/health');
      return result.status === 'ok';
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取云端任务库
   */
  async getTasks(taskType, category) {
    try {
      const result = await this.request(`/tasks/${this.userId}/${taskType}/${category}`);
      return {
        tasks: result.tasks || [],
        lastModified: result.lastModified ? new Date(result.lastModified) : null,
        version: result.version || 0
      };
    } catch (error) {
      console.warn('获取云端任务失败，使用本地数据:', error);
      return null;
    }
  }

  /**
   * 同步任务库到云端
   */
  async syncTasks(taskType, category, tasks, clientVersion = 0) {
    if (!this.isOnline) {
      // 离线时保存到待同步队列
      this.addToPendingSync(taskType, category, tasks, clientVersion);
      return { success: false, offline: true };
    }

    try {
      const result = await this.request('/tasks/sync', {
        method: 'POST',
        body: JSON.stringify({
          userId: this.userId,
          taskType,
          category,
          tasks,
          clientVersion
        })
      });

      // 如果有冲突，返回冲突信息让前端处理
      if (result.conflict) {
        return {
          success: false,
          conflict: true,
          serverTasks: result.serverTasks,
          serverVersion: result.serverVersion,
          clientTasks: result.clientTasks
        };
      }

      return {
        success: true,
        tasks: result.tasks,
        version: result.version,
        lastModified: new Date(result.lastModified)
      };
    } catch (error) {
      console.error('同步任务失败:', error);
      // 同步失败时保存到待同步队列
      this.addToPendingSync(taskType, category, tasks, clientVersion);
      return { success: false, error: error.message };
    }
  }

  /**
   * 更新任务库
   */
  async updateTasks(taskType, category, tasks) {
    if (!this.isOnline) {
      this.addToPendingSync(taskType, category, tasks);
      return { success: false, offline: true };
    }

    try {
      const result = await this.request(`/tasks/${this.userId}/${taskType}/${category}`, {
        method: 'PUT',
        body: JSON.stringify({ tasks })
      });

      return {
        success: true,
        tasks: result.tasks,
        version: result.version,
        lastModified: new Date(result.lastModified)
      };
    } catch (error) {
      console.error('更新任务失败:', error);
      this.addToPendingSync(taskType, category, tasks);
      return { success: false, error: error.message };
    }
  }

  /**
   * 删除任务库
   */
  async deleteTasks(taskType, category) {
    if (!this.isOnline) {
      return { success: false, offline: true };
    }

    try {
      await this.request(`/tasks/${this.userId}/${taskType}/${category}`, {
        method: 'DELETE'
      });
      return { success: true };
    } catch (error) {
      console.error('删除任务失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 分享任务库
   */
  async shareTasks(taskType, category) {
    if (!this.isOnline) {
      return { success: false, offline: true };
    }

    try {
      const result = await this.request('/tasks/share', {
        method: 'POST',
        body: JSON.stringify({
          userId: this.userId,
          taskType,
          category
        })
      });

      return {
        success: true,
        shareId: result.shareId,
        shareUrl: result.shareUrl
      };
    } catch (error) {
      console.error('分享任务失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取分享的任务库
   */
  async getSharedTasks(shareId) {
    try {
      const result = await this.request(`/tasks/shared/${shareId}`);
      return {
        success: true,
        taskType: result.taskType,
        category: result.category,
        tasks: result.tasks,
        lastModified: new Date(result.lastModified)
      };
    } catch (error) {
      console.error('获取分享任务失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 添加到待同步队列
   */
  addToPendingSync(taskType, category, tasks, version = 0) {
    const pendingKey = 'sky-journey-pending-sync';
    const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]');
    
    // 去重：如果已经有相同的任务类型和分类，替换它
    const existingIndex = pending.findIndex(
      item => item.taskType === taskType && item.category === category
    );
    
    const syncItem = {
      taskType,
      category,
      tasks,
      version,
      timestamp: Date.now()
    };
    
    if (existingIndex >= 0) {
      pending[existingIndex] = syncItem;
    } else {
      pending.push(syncItem);
    }
    
    localStorage.setItem(pendingKey, JSON.stringify(pending));
  }

  /**
   * 同步待处理的更改
   */
  async syncPendingChanges() {
    if (!this.isOnline) return;

    const pendingKey = 'sky-journey-pending-sync';
    const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]');
    
    if (pending.length === 0) return;

    console.log(`开始同步 ${pending.length} 个待处理更改...`);
    
    const successfulSyncs = [];
    
    for (const item of pending) {
      try {
        const result = await this.syncTasks(
          item.taskType, 
          item.category, 
          item.tasks, 
          item.version
        );
        
        if (result.success) {
          successfulSyncs.push(item);
          console.log(`同步成功: ${item.taskType}/${item.category}`);
        }
      } catch (error) {
        console.error(`同步失败: ${item.taskType}/${item.category}`, error);
      }
    }
    
    // 移除成功同步的项目
    if (successfulSyncs.length > 0) {
      const remainingPending = pending.filter(
        item => !successfulSyncs.some(
          synced => synced.taskType === item.taskType && synced.category === item.category
        )
      );
      
      localStorage.setItem(pendingKey, JSON.stringify(remainingPending));
      console.log(`成功同步 ${successfulSyncs.length} 个更改`);
    }
  }

  /**
   * 获取同步状态信息
   */
  getSyncStatus() {
    const pendingKey = 'sky-journey-pending-sync';
    const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]');
    
    return {
      isOnline: this.isOnline,
      pendingChanges: pending.length,
      userId: this.userId,
      lastSync: localStorage.getItem('sky-journey-last-sync')
    };
  }

  /**
   * 处理同步冲突
   * @param {string} resolution - 'client' | 'server' | 'merge'
   * @param {Array} serverTasks - 服务器端任务
   * @param {Array} clientTasks - 客户端任务
   */
  resolveConflict(resolution, serverTasks, clientTasks) {
    switch (resolution) {
      case 'client':
        return clientTasks;
      case 'server':
        return serverTasks;
      case 'merge':
        // 简单的合并策略：去重后合并
        const allTasks = [...serverTasks, ...clientTasks];
        return [...new Set(allTasks)];
      default:
        return clientTasks;
    }
  }
}

// 创建全局实例
export const cloudSyncService = new CloudSyncService();

// 导出类以便测试
export { CloudSyncService };
