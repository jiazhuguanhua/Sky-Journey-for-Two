// 任务库管理器 - 统一处理原始任务和自定义任务
import { TASK_LIBRARIES } from '../data/taskLibrary.js';

class TaskLibraryManager {
  constructor() {
    this.customTasks = new Map();
    this.loadCustomTasks();
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

  // 保存自定义任务
  saveCustomTasks(library, category, tasks) {
    // 保存到内存
    this.setCustomTasks(library, category, tasks);
    
    // 保存到localStorage
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

  // 获取可用的任务库列表
  getAvailableLibraries() {
    return Object.keys(TASK_LIBRARIES).map(key => ({
      key,
      ...TASK_LIBRARIES[key]
    }));
  }

  // 重置为默认任务库
  resetToDefault(library, category) {
    const key = `${library}.${category}`;
    this.customTasks.delete(key);
    
    // 从localStorage删除
    const storageKey = `customTasks_${library}_${category}`;
    localStorage.removeItem(storageKey);
  }

  // 检查是否有自定义任务
  hasCustomTasks(library, category) {
    const key = `${library}.${category}`;
    return this.customTasks.has(key) && this.customTasks.get(key).length > 0;
  }

  // 导出任务库
  exportTasks(library, category) {
    const tasks = this.getTasks(library, category);
    const libraryInfo = TASK_LIBRARIES[library];
    
    return {
      library: library,
      category: category,
      libraryName: libraryInfo?.name || library,
      tasks: tasks,
      exportTime: new Date().toISOString(),
      version: '1.0'
    };
  }

  // 导入任务库
  importTasks(importData) {
    if (!importData.library || !importData.category || !Array.isArray(importData.tasks)) {
      throw new Error('Invalid import data format');
    }

    const { library, category, tasks } = importData;
    
    // 验证library和category是否有效
    if (!TASK_LIBRARIES[library]) {
      throw new Error(`Unknown library: ${library}`);
    }

    if (!['truth', 'dare'].includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }

    // 保存导入的任务
    return this.saveCustomTasks(library, category, tasks);
  }
}

// 创建全局实例
export const taskLibraryManager = new TaskLibraryManager();

// 便捷函数
export const getTaskLibrary = (libraryKey) => taskLibraryManager.getTaskLibrary(libraryKey);
export const saveCustomTasks = (library, category, tasks) => taskLibraryManager.saveCustomTasks(library, category, tasks);
export const hasCustomTasks = (library, category) => taskLibraryManager.hasCustomTasks(library, category);
