import { useState, useEffect } from 'react';
import { TASK_LIBRARIES, generateNickname } from '../data/taskLibrary.js';
import { getTaskLibrary } from '../utils/taskLibraryManager.js';
import { createBoardPositions, assignTaskCells, generateTasksForCells, getNewTask } from '../utils/gameLogic.js';

export const useGame = () => {
  // 游戏阶段
  const [gamePhase, setGamePhase] = useState('home'); // home, setup, playing, finished
  const [selectedTaskType, setSelectedTaskType] = useState('couple');
  
  // 玩家设置
  const [players, setPlayers] = useState({
    player1: { name: '', avatar: '🤴', position: 0, color: '#FF6B9D' },
    player2: { name: '', avatar: '👸', position: 0, color: '#4ECDC4' }
  });
  
  // 游戏状态
  const [gameState, setGameState] = useState({
    currentPlayer: 'player1',
    diceValue: null,
    isRolling: false,
    canRoll: true,
    winner: null,
    turn: 0,
    totalPositions: 40,
    selectedTaskCategory: null,
    canChangeTaskType: true,
    boardTasks: null
  });
  
  // 任务系统
  const [currentTask, setCurrentTask] = useState(null);
  const [taskTimeLeft, setTaskTimeLeft] = useState(0);
  const [isTaskActive, setIsTaskActive] = useState(false);
  const [isTimerStarted, setIsTimerStarted] = useState(false);
  
  // 动画状态
  const [showTimerAnimation, setShowTimerAnimation] = useState(false);
  const [showCompleteAnimation, setShowCompleteAnimation] = useState(false);
  const [showSkipAnimation, setShowSkipAnimation] = useState(false);
  const [showTaskCongrats, setShowTaskCongrats] = useState(false);
  const [showTaskTypeSelect, setShowTaskTypeSelect] = useState(false);
  const [justMoved, setJustMoved] = useState(false);
  
  // 任务格比例和棋盘
  const [taskRatio, setTaskRatio] = useState(0.3);
  const [boardPositions, setBoardPositions] = useState(() => createBoardPositions());
  const [selectedCell, setSelectedCell] = useState(null);

  // 任务倒计时
  useEffect(() => {
    if (isTaskActive && isTimerStarted && taskTimeLeft > 0 && currentTask?.category === 'dare') {
      const timer = setTimeout(() => {
        setTaskTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (taskTimeLeft === 0 && isTaskActive && isTimerStarted && currentTask?.category === 'dare') {
      setShowTimerAnimation(true);
      setTimeout(() => {
        setShowTimerAnimation(false);
        setIsTaskActive(false);
        setCurrentTask(null);
        setIsTimerStarted(false);
        switchPlayer();
      }, 2000);
    }
  }, [taskTimeLeft, isTaskActive, isTimerStarted, currentTask]);

  // 检查任务触发
  useEffect(() => {
    if (justMoved && !isTaskActive && !currentTask && !gameState.winner) {
      const currentPlayerKey = gameState.currentPlayer;
      const currentPos = players[currentPlayerKey]?.position;
      const targetPosition = boardPositions[currentPos];
      
      if (targetPosition && targetPosition.hasTask && gameState.boardTasks?.[currentPos]) {
        setShowTaskCongrats(true);
        setTimeout(() => {
          setShowTaskCongrats(false);
          setShowTaskTypeSelect(true);
        }, 1200);
      }
      
      setJustMoved(false);
    }
  }, [justMoved, players, gameState, isTaskActive, currentTask, boardPositions]);

  // 初始化游戏
  const initializeGame = () => {
    // 确保玩家都有名字，并重置位置到起点
    const updatedPlayers = { ...players };
    if (!updatedPlayers.player1.name) {
      updatedPlayers.player1.name = generateNickname();
    }
    if (!updatedPlayers.player2.name) {
      updatedPlayers.player2.name = generateNickname();
    }
    
    // 确保棋子位置重置到起点
    updatedPlayers.player1.position = 0;
    updatedPlayers.player2.position = 0;
    
    setPlayers(updatedPlayers);

    // 创建棋盘并分配任务格
    let positions = createBoardPositions(taskRatio, 40);
    positions = assignTaskCells(positions, taskRatio);
    setBoardPositions(positions);

    // 生成任务内容 - 使用任务库管理器获取自定义任务
    const taskLibrary = getTaskLibrary(selectedTaskType);
    const tasks = generateTasksForCells(positions, taskLibrary);
    setGameState(prev => ({ 
      ...prev, 
      boardTasks: tasks, 
      canRoll: true,
      currentPlayer: 'player1', // 确保从玩家1开始
      turn: 0, // 重置回合数
      winner: null // 清除胜利者状态
    }));
    
    setGamePhase('playing');
  };

  // 切换玩家
  const switchPlayer = () => {
    setGameState(prev => ({
      ...prev,
      currentPlayer: prev.currentPlayer === 'player1' ? 'player2' : 'player1',
      turn: prev.turn + 1,
      canRoll: true,
      selectedTaskCategory: null,
      canChangeTaskType: true
    }));
  };

  // 掷骰子
  const rollDice = () => {
    if (!gameState.canRoll || gameState.isRolling) return;
    
    setGameState(prev => ({ ...prev, isRolling: true, canRoll: false }));
    
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      const newValue = Math.floor(Math.random() * 6) + 1;
      setGameState(prev => ({ ...prev, diceValue: newValue }));
      rollCount++;
      
      if (rollCount >= 10) {
        clearInterval(rollInterval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        
        setTimeout(() => {
          setGameState(prev => ({ ...prev, isRolling: false, diceValue: finalValue }));
          movePlayer(finalValue);
        }, 200);
      }
    }, 100);
  };

  // 移动玩家
  const movePlayer = (steps) => {
    const currentPlayerKey = gameState.currentPlayer;
    const currentPos = players[currentPlayerKey].position;
    const finalPos = Math.min(currentPos + steps, gameState.totalPositions - 1);
    
    // 逐格移动动画
    let currentStep = 0;
    const moveInterval = setInterval(() => {
      if (currentStep >= steps || currentPos + currentStep >= gameState.totalPositions - 1) {
        clearInterval(moveInterval);
        
        setPlayers(prev => ({
          ...prev,
          [currentPlayerKey]: { ...prev[currentPlayerKey], position: finalPos }
        }));
        
        // 检查是否到达终点
        if (finalPos >= gameState.totalPositions - 1) {
          setGameState(prev => ({ ...prev, winner: currentPlayerKey }));
          setGamePhase('finished');
          return;
        }
        
        setJustMoved(true);
        
        const targetPosition = boardPositions[finalPos];
        if (!targetPosition || !targetPosition.hasTask) {
          setTimeout(() => {
            switchPlayer();
          }, 300);
        }
        return;
      }
      
      currentStep++;
      const nextPos = Math.min(currentPos + currentStep, gameState.totalPositions - 1);
      setPlayers(prev => ({
        ...prev,
        [currentPlayerKey]: { ...prev[currentPlayerKey], position: nextPos }
      }));
      
    }, 400);
  };

  // 选择任务类型
  const selectTaskCategory = (category) => {
    setGameState(prev => ({
      ...prev,
      selectedTaskCategory: category,
      canChangeTaskType: false
    }));
    setShowTaskTypeSelect(false);
    
    const currentPlayerKey = gameState.currentPlayer;
    const currentPos = players[currentPlayerKey].position;
    const cellTasks = gameState.boardTasks[currentPos];
    
    if (cellTasks) {
      const taskText = cellTasks[category];
      
      setCurrentTask({
        text: taskText,
        category: category,
        duration: 60
      });
      setTaskTimeLeft(category === 'dare' ? 60 : 0);
      setIsTaskActive(true);
      setIsTimerStarted(false);
    }
  };

  // 开始计时
  const startTimer = () => {
    if (currentTask?.category === 'dare') {
      setIsTimerStarted(true);
    }
  };

  // 完成任务
  const completeTask = () => {
    setShowCompleteAnimation(true);
    setTimeout(() => {
      setShowCompleteAnimation(false);
      setIsTaskActive(false);
      setCurrentTask(null);
      setIsTimerStarted(false);
      switchPlayer();
    }, 1500);
  };

  // 跳过任务
  const skipTask = () => {
    setShowSkipAnimation(true);
    setTimeout(() => {
      setShowSkipAnimation(false);
      setIsTaskActive(false);
      setCurrentTask(null);
      setIsTimerStarted(false);
      switchPlayer();
    }, 1500);
  };

  // 换任务
  const changeTask = () => {
    if (!currentTask) return;
    
    const currentPlayerKey = gameState.currentPlayer;
    const currentPos = players[currentPlayerKey].position;
    const taskCategory = currentTask.category;
    const currentTaskText = currentTask.text;
    
    const taskLibrary = TASK_LIBRARIES[selectedTaskType];
    const newTask = getNewTask(currentTaskText, taskLibrary, taskCategory);
    
    if (newTask === currentTaskText) {
      alert('当前任务库中没有其他任务可选择了！');
      return;
    }
    
    // 更新棋盘任务
    setGameState(prev => ({
      ...prev,
      boardTasks: {
        ...prev.boardTasks,
        [currentPos]: {
          ...prev.boardTasks[currentPos],
          [taskCategory]: newTask
        }
      }
    }));
    
    // 更新当前任务
    setCurrentTask({
      text: newTask,
      category: taskCategory,
      duration: 60
    });
    
    if (taskCategory === 'dare') {
      setTaskTimeLeft(60);
      setIsTimerStarted(false);
    } else {
      setTaskTimeLeft(0);
      setIsTimerStarted(false);
    }
  };

  // 重置游戏
  const resetGame = () => {
    // 重置游戏阶段
    setGamePhase('home');
    
    // 重置游戏状态
    setGameState({
      currentPlayer: 'player1',
      diceValue: null,
      isRolling: false,
      canRoll: true,
      winner: null,
      turn: 0,
      totalPositions: 40,
      selectedTaskCategory: null,
      canChangeTaskType: true,
      boardTasks: null
    });
    
    // 重置玩家位置到起点
    setPlayers({
      player1: { name: '', avatar: '🤴', position: 0, color: '#FF6B9D' },
      player2: { name: '', avatar: '👸', position: 0, color: '#4ECDC4' }
    });
    
    // 重置任务类型
    setSelectedTaskType('couple');
    
    // 重置任务相关状态
    setCurrentTask(null);
    setIsTaskActive(false);
    setIsTimerStarted(false);
    setTaskTimeLeft(0);
    
    // 重置动画状态
    setShowTimerAnimation(false);
    setShowCompleteAnimation(false);
    setShowSkipAnimation(false);
    setShowTaskCongrats(false);
    setShowTaskTypeSelect(false);
    setJustMoved(false);
    
    // 重置棋盘和选中状态
    setBoardPositions(createBoardPositions()); // 重新创建初始棋盘
    setSelectedCell(null);
  };

  return {
    // 状态
    gamePhase,
    setGamePhase,
    selectedTaskType,
    setSelectedTaskType,
    players,
    setPlayers,
    gameState,
    setGameState,
    currentTask,
    taskTimeLeft,
    isTaskActive,
    isTimerStarted,
    showTimerAnimation,
    showCompleteAnimation,
    showSkipAnimation,
    showTaskCongrats,
    showTaskTypeSelect,
    taskRatio,
    setTaskRatio,
    boardPositions,
    selectedCell,
    setSelectedCell,
    
    // 方法
    initializeGame,
    rollDice,
    selectTaskCategory,
    startTimer,
    completeTask,
    skipTask,
    changeTask,
    resetGame
  };
};
