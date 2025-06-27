import { BOARD_CONFIG } from '../data/taskLibrary.js';

// 创建棋盘位置
export const createBoardPositions = (taskRatio = BOARD_CONFIG.DEFAULT_TASK_RATIO, totalPositions = BOARD_CONFIG.TOTAL_POSITIONS) => {
  const positions = [];
  const { BOARD_SIZE, CELL_SIZE, PER_SIDE } = BOARD_CONFIG;
  
  // 计算格子间距
  const availableSpace = BOARD_SIZE - (2 * CELL_SIZE);
  const spacing = availableSpace / (PER_SIDE - 2);
  
  for (let i = 0; i < totalPositions; i++) {
    let x, y, side;
    
    if (i < PER_SIDE) {
      // 下边
      side = 'bottom';
      if (i === 0) {
        x = 0; y = BOARD_SIZE - CELL_SIZE;
      } else if (i === PER_SIDE - 1) {
        x = BOARD_SIZE - CELL_SIZE; y = BOARD_SIZE - CELL_SIZE;
      } else {
        x = CELL_SIZE + (i - 1) * spacing; y = BOARD_SIZE - CELL_SIZE;
      }
    } else if (i < PER_SIDE * 2) {
      // 右边
      side = 'right';
      const rightIndex = i - PER_SIDE;
      if (rightIndex === 0) {
        x = BOARD_SIZE - CELL_SIZE; y = BOARD_SIZE - CELL_SIZE;
      } else if (rightIndex === PER_SIDE - 1) {
        x = BOARD_SIZE - CELL_SIZE; y = 0;
      } else {
        x = BOARD_SIZE - CELL_SIZE; y = BOARD_SIZE - CELL_SIZE - (rightIndex * spacing);
      }
    } else if (i < PER_SIDE * 3) {
      // 上边
      side = 'top';
      const topIndex = i - (PER_SIDE * 2);
      if (topIndex === 0) {
        x = BOARD_SIZE - CELL_SIZE; y = 0;
      } else if (topIndex === PER_SIDE - 1) {
        x = 0; y = 0;
      } else {
        x = BOARD_SIZE - CELL_SIZE - (topIndex * spacing); y = 0;
      }
    } else {
      // 左边
      side = 'left';
      const leftIndex = i - (PER_SIDE * 3);
      if (leftIndex === 0) {
        x = 0; y = 0;
      } else if (leftIndex === PER_SIDE - 1) {
        x = 0; y = BOARD_SIZE - CELL_SIZE;
      } else {
        x = 0; y = leftIndex * spacing;
      }
    }
    
    positions.push({
      id: i,
      x: Math.round(x),
      y: Math.round(y),
      side: side,
      isStart: i === 0,
      isFinish: i === totalPositions - 1,
      hasTask: false, // 将在游戏开始时随机分配
      tasks: null
    });
  }
  
  return positions;
};

// 随机分配任务格
export const assignTaskCells = (positions, taskRatio) => {
  const candidateIds = positions.filter(p => !p.isStart && !p.isFinish).map(p => p.id);
  const taskCount = Math.max(1, Math.floor(candidateIds.length * taskRatio));
  
  // 随机选出任务格id
  const shuffled = [...candidateIds].sort(() => Math.random() - 0.5);
  const taskIds = new Set(shuffled.slice(0, taskCount));
  
  return positions.map(p => ({ ...p, hasTask: taskIds.has(p.id) }));
};

// 生成任务内容
export const generateTasksForCells = (positions, taskLibrary) => {
  const tasks = {};
  
  positions.forEach(position => {
    if (position.hasTask) {
      const truthTasks = taskLibrary.tasks.truth;
      const dareTasks = taskLibrary.tasks.dare;
      
      tasks[position.id] = {
        truth: truthTasks[Math.floor(Math.random() * truthTasks.length)],
        dare: dareTasks[Math.floor(Math.random() * dareTasks.length)]
      };
    }
  });
  
  return tasks;
};

// 获取新任务（避免重复）
export const getNewTask = (currentTask, taskLibrary, category) => {
  const availableTasks = taskLibrary.tasks[category].filter(task => task !== currentTask);
  
  if (availableTasks.length === 0) {
    return currentTask; // 如果没有其他任务，返回原任务
  }
  
  return availableTasks[Math.floor(Math.random() * availableTasks.length)];
};
