// 任务库管理器 - 统一处理原始任务和自定义任务
import { TASK_LIBRARIES } from '../data/taskLibrary.js';
import { cloudSyncService } from '../services/cloudSyncService.js';

class TaskLibraryManager {
  constructor() {
    this.customTasks = new Map();
    this.cloudEnabled = false;
    this.syncVersions = new Map(); // 跟踪版本号
    this.loadSyncVersions(); // 先加载版本信息
    this.loadCustomTasks();
    this.initCloudSync();
  }

  // 初始化云端同步
  async initCloudSync() {
    try {
      this.cloudEnabled = await cloudSyncService.checkHealth();
      if (this.cloudEnabled) {
        console.log('✅ 云端同步服务已连接');
        await this.syncFromCloud();
      } else {
        console.log('📦 使用本地存储模式');
      }
    } catch (error) {
      console.warn('云端同步初始化失败，使用本地模式:', error);
      this.cloudEnabled = false;
    }
  }

  // 从云端同步所有任务库
  async syncFromCloud() {
    const libraryKeys = Object.keys(TASK_LIBRARIES);
    const categories = ['truth', 'dare'];
    
    for (const library of libraryKeys) {
      for (const category of categories) {
        try {
          const cloudData = await cloudSyncService.getTasks(library, category);
          if (cloudData && cloudData.tasks.length > 0) {
            // 检查本地版本
            const localVersion = this.getSyncVersion(library, category);
            
            if (cloudData.version > localVersion) {
              // 云端版本更新，使用云端数据
              this.setCustomTasks(library, category, cloudData.tasks);
              this.setSyncVersion(library, category, cloudData.version);
              console.log(`📥 从云端同步: ${library}/${category} (v${cloudData.version})`);
            }
          }
        } catch (error) {
          console.warn(`同步失败 ${library}/${category}:`, error);
        }
      }
    }
  }

  // 从localStorage加载自定义任务
  loadCustomTasks() {
    const libraryKeys = Object.keys(TASK_LIBRARIES);
    const categories = ['truth', 'dare'];
    
    libraryKeys.forEach(library => {
      categories.forEach(category => {
        const key = `customTasks_${library}_${category}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const customTaskObjects = JSON.parse(stored);
            // 转换对象数组为字符串数组（游戏期望的格式）
            const taskStrings = customTaskObjects.map(task => task.description || task.title);
            this.setCustomTasks(library, category, taskStrings);
          } catch (error) {
            console.warn(`Failed to load custom tasks for ${library}.${category}:`, error);
          }
        }
      });
    });
  }

  // 设置自定义任务
  setCustomTasks(library, category, tasks) {
    const key = `${library}.${category}`;
    this.customTasks.set(key, tasks);
  }

  // 获取任务库（优先使用自定义任务）
  getTaskLibrary(libraryKey) {
    const baseLibrary = TASK_LIBRARIES[libraryKey];
    if (!baseLibrary) return null;

    const customLibrary = {
      ...baseLibrary,
      tasks: {
        truth: this.getTasks(libraryKey, 'truth'),
        dare: this.getTasks(libraryKey, 'dare')
      }
    };

    return customLibrary;
  }

  // 获取特定类别的任务
  getTasks(library, category) {
    const key = `${library}.${category}`;
    const customTasks = this.customTasks.get(key);
    
    if (customTasks && customTasks.length > 0) {
      return customTasks;
    }
    
    // 如果没有自定义任务，返回原始任务
    return TASK_LIBRARIES[library]?.tasks?.[category] || [];
  }

  // 保存自定义任务 (支持云端同步)
  async saveCustomTasks(library, category, tasks) {
    // 保存到内存
    this.setCustomTasks(library, category, tasks);
    
    // 保存到localStorage (作为备份)
    this.saveToLocalStorage(library, category, tasks);
    
    // 云端同步
    if (this.cloudEnabled) {
      const currentVersion = this.getSyncVersion(library, category);
      const result = await cloudSyncService.syncTasks(library, category, tasks, currentVersion);
      
      if (result.success) {
        this.setSyncVersion(library, category, result.version);
        console.log(`☁️ 云端同步成功: ${library}/${category} (v${result.version})`);
        return { success: true, synced: true, version: result.version };
      } else if (result.conflict) {
        // 处理同步冲突
        return this.handleSyncConflict(library, category, tasks, result);
      } else {
        console.warn(`云端同步失败: ${library}/${category}`, result.error);
        return { success: true, synced: false, error: result.error };
      }
    }
    
    return { success: true, synced: false };
  }

  // 处理同步冲突
  async handleSyncConflict(library, category, localTasks, conflictResult) {
    return {
      success: false,
      conflict: true,
      serverTasks: conflictResult.serverTasks,
      clientTasks: localTasks,
      serverVersion: conflictResult.serverVersion,
      resolve: async (resolution) => {
        const resolvedTasks = cloudSyncService.resolveConflict(
          resolution, 
          conflictResult.serverTasks, 
          localTasks
        );
        
        // 强制更新到云端
        const result = await cloudSyncService.updateTasks(library, category, resolvedTasks);
        if (result.success) {
          this.setCustomTasks(library, category, resolvedTasks);
          this.setSyncVersion(library, category, result.version);
          this.saveToLocalStorage(library, category, resolvedTasks);
          return { success: true, tasks: resolvedTasks, version: result.version };
        }
        return { success: false, error: result.error };
      }
    };
  }

  // 保存到本地存储
  saveToLocalStorage(library, category, tasks) {
    const key = `customTasks_${library}_${category}`;
    const taskObjects = tasks.map((task, index) => ({
      id: `custom_${library}_${category}_${index}_${Date.now()}`,
      title: task.length > 30 ? task.substring(0, 30) + '...' : task,
      description: task,
      type: category
    }));
    
    try {
      localStorage.setItem(key, JSON.stringify(taskObjects));
      return true;
    } catch (error) {
      console.error('Failed to save custom tasks:', error);
      return false;
    }
  }

  // 获取和设置同步版本
  getSyncVersion(library, category) {
    const key = `${library}.${category}`;
    return this.syncVersions.get(key) || 0;
  }

  setSyncVersion(library, category, version) {
    const key = `${library}.${category}`;
    this.syncVersions.set(key, version);
    // 持久化版本信息
    localStorage.setItem(`syncVersion_${library}_${category}`, version.toString());
  }

  loadSyncVersions() {
    const libraryKeys = Object.keys(TASK_LIBRARIES);
    const categories = ['truth', 'dare'];
    
    libraryKeys.forEach(library => {
      categories.forEach(category => {
        const versionStr = localStorage.getItem(`syncVersion_${library}_${category}`);
        if (versionStr) {
          this.setSyncVersion(library, category, parseInt(versionStr, 10));
        }
      });
    });
  }

  // 获取同步状态
  getSyncStatus() {
    const status = cloudSyncService.getSyncStatus();
    const libraryStatus = {};
    
    Object.keys(TASK_LIBRARIES).forEach(library => {
      ['truth', 'dare'].forEach(category => {
        const key = `${library}.${category}`;
        libraryStatus[key] = {
          hasCustomTasks: this.customTasks.has(key),
          version: this.getSyncVersion(library, category),
          lastModified: localStorage.getItem(`lastModified_${library}_${category}`)
        };
      });
    });
    
    return {
      ...status,
      cloudEnabled: this.cloudEnabled,
      libraries: libraryStatus
    };
  }

  // 手动触发云端同步
  async forceSyncToCloud(library, category) {
    if (!this.cloudEnabled) {
      return { success: false, error: '云端同步未启用' };
    }
    
    const tasks = this.getTasks(library, category);
    const currentVersion = this.getSyncVersion(library, category);
    
    const result = await cloudSyncService.updateTasks(library, category, tasks);
    
    if (result.success) {
      this.setSyncVersion(library, category, result.version);
      return { success: true, version: result.version };
    }
    
    return { success: false, error: result.error };
  }

  // 分享任务库
  async shareTaskLibrary(library, category) {
    if (!this.cloudEnabled) {
      return { success: false, error: '需要云端同步功能' };
    }
    
    // 确保任务库已同步到云端
    const syncResult = await this.forceSyncToCloud(library, category);
    if (!syncResult.success) {
      return { success: false, error: '同步到云端失败' };
    }
    
    return await cloudSyncService.shareTasks(library, category);
  }

  // 导入分享的任务库
  async importSharedTasks(shareId) {
    if (!this.cloudEnabled) {
      return { success: false, error: '需要云端同步功能' };
    }
    
    const result = await cloudSyncService.getSharedTasks(shareId);
    if (result.success) {
      // 保存到本地
      await this.saveCustomTasks(result.taskType, result.category, result.tasks);
      return { 
        success: true, 
        taskType: result.taskType, 
        category: result.category,
        tasksCount: result.tasks.length
      };
    }
    
    return result;
  }
}

// 创建全局实例
export const taskLibraryManager = new TaskLibraryManager();

// 便捷函数
export const getTaskLibrary = (libraryKey) => taskLibraryManager.getTaskLibrary(libraryKey);
export const saveCustomTasks = (library, category, tasks) => taskLibraryManager.saveCustomTasks(library, category, tasks);
export const hasCustomTasks = (library, category) => taskLibraryManager.hasCustomTasks(library, category);
