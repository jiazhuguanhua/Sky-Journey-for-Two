import React from 'react';
import { useGame } from './hooks/useGame.js';
import { useAudio } from './hooks/useAudio.js';
import { getNewTask } from './utils/gameLogic.js';
import { TASK_LIBRARIES } from './data/taskLibrary.js';
import HomePage from './components/HomePage.jsx';
import GameBoard from './components/GameBoard.jsx';
import TaskModal from './components/TaskModal.jsx';
import VictoryPage from './components/VictoryPage.jsx';
import {
  TaskTypeSelectModal,
  TaskCongratsModal,
  TimerAnimationModal,
  CompleteAnimationModal,
  SkipAnimationModal,
  CellPreviewModal
} from './components/Modals.jsx';
import './styles/global.css';

function App() {
  const {
    // 状态
    gamePhase,
    selectedTaskType,
    setSelectedTaskType,
    players,
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
  } = useGame();

  const {
    playButtonSound,
    playDiceSound,
    toggleBGM,
    stopBGM,
    isBGMPlaying
  } = useAudio();

  // 处理掷骰子
  const handleRollDice = () => {
    playDiceSound();
    rollDice();
  };

  // 处理格子点击
  const handleCellClick = (position) => {
    if (!gameState.boardTasks || !position.hasTask) return;
    
    const cellTasks = gameState.boardTasks[position.id];
    if (cellTasks) {
      setSelectedCell({
        position: position,
        tasks: cellTasks
      });
    }
  };

  // 处理任务换新
  const handleRegenerateTask = (cellId) => {
    const currentTasks = gameState.boardTasks[cellId];
    if (!currentTasks) return;
    
    const taskLibrary = TASK_LIBRARIES[selectedTaskType];
    
    const newTruthTask = getNewTask(currentTasks.truth, taskLibrary, 'truth');
    const newDareTask = getNewTask(currentTasks.dare, taskLibrary, 'dare');
    
    const newTasks = {
      truth: newTruthTask,
      dare: newDareTask
    };
    
    // 更新游戏状态中的棋盘任务
    setGameState(prev => ({
      ...prev,
      boardTasks: {
        ...prev.boardTasks,
        [cellId]: newTasks
      }
    }));
    
    // 更新当前预览的任务
    if (selectedCell && selectedCell.position.id === cellId) {
      setSelectedCell(prev => ({
        ...prev,
        tasks: newTasks
      }));
    }
  };

  // 处理退出游戏
  const handleExitGame = () => {
    stopBGM();
    resetGame();
  };

  return (
    <div className="app">
      {/* 主要页面 */}
      {gamePhase === 'home' && (
        <HomePage
          selectedTaskType={selectedTaskType}
          setSelectedTaskType={setSelectedTaskType}
          taskRatio={taskRatio}
          setTaskRatio={setTaskRatio}
          onStartGame={initializeGame}
          playButtonSound={playButtonSound}
        />
      )}
      
      {gamePhase === 'playing' && (
        <GameBoard
          players={players}
          gameState={gameState}
          boardPositions={boardPositions}
          onRollDice={handleRollDice}
          onCellClick={handleCellClick}
          onExitGame={handleExitGame}
          selectedTaskType={selectedTaskType}
          playButtonSound={playButtonSound}
          isBGMPlaying={isBGMPlaying}
          toggleBGM={toggleBGM}
        />
      )}
      
      {gamePhase === 'finished' && (
        <VictoryPage
          gameState={gameState}
          players={players}
          selectedTaskType={selectedTaskType}
          onRestart={resetGame}
          playButtonSound={playButtonSound}
        />
      )}
      
      {/* 弹窗组件 */}
      {showTaskCongrats && <TaskCongratsModal />}
      
      {showTaskTypeSelect && (
        <TaskTypeSelectModal
          onSelectTaskCategory={selectTaskCategory}
          playButtonSound={playButtonSound}
        />
      )}
      
      {isTaskActive && (
        <TaskModal
          currentTask={currentTask}
          taskTimeLeft={taskTimeLeft}
          isTimerStarted={isTimerStarted}
          onStartTimer={startTimer}
          onCompleteTask={completeTask}
          onSkipTask={skipTask}
          onChangeTask={changeTask}
          playButtonSound={playButtonSound}
        />
      )}
      
      {selectedCell && (
        <CellPreviewModal
          selectedCell={selectedCell}
          onClose={() => setSelectedCell(null)}
          onRegenerateTask={handleRegenerateTask}
          playButtonSound={playButtonSound}
        />
      )}
      
      {/* 动画弹窗 */}
      {showTimerAnimation && <TimerAnimationModal />}
      {showCompleteAnimation && <CompleteAnimationModal />}
      {showSkipAnimation && <SkipAnimationModal />}
    </div>
  );
}

export default App;
