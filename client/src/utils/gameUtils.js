// 智能昵称生成器
export const generateNickname = () => {
  const prefixes = ['甜心', '宝贝', '小可爱', '小天使', '小公主', '小王子']
  const words = ['兔子', '猫咪', '狐狸', '熊猫', '企鹅', '樱花', '星星', '月亮']
  const suffixes = ['酱', '君', '喵', '宝宝', '妹妹', '哥哥']
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const word = words[Math.floor(Math.random() * words.length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
  
  return Math.random() > 0.5 ? `${prefix}${word}` : `${word}${suffix}`
}

// 创建飞行棋棋盘
export const createBoardPositions = (taskRatio = 0.3, totalPositions = 40) => {
  const positions = []
  const boardSize = 600
  const cellSize = 50
  const perSide = 10
  const availableSpace = boardSize - (2 * cellSize)
  const spacing = availableSpace / (perSide - 2)
  
  for (let i = 0; i < totalPositions; i++) {
    let x, y, side
    
    if (i < perSide) {
      side = 'bottom'
      if (i === 0) {
        x = 0; y = boardSize - cellSize
      } else if (i === perSide - 1) {
        x = boardSize - cellSize; y = boardSize - cellSize
      } else {
        x = cellSize + (i - 1) * spacing; y = boardSize - cellSize
      }
    } else if (i < perSide * 2) {
      side = 'right'
      const rightIndex = i - perSide
      if (rightIndex === 0) {
        x = boardSize - cellSize; y = boardSize - cellSize
      } else if (rightIndex === perSide - 1) {
        x = boardSize - cellSize; y = 0
      } else {
        x = boardSize - cellSize; y = boardSize - cellSize - (rightIndex * spacing)
      }
    } else if (i < perSide * 3) {
      side = 'top'
      const topIndex = i - (perSide * 2)
      if (topIndex === 0) {
        x = boardSize - cellSize; y = 0
      } else if (topIndex === perSide - 1) {
        x = 0; y = 0
      } else {
        x = boardSize - cellSize - (topIndex * spacing); y = 0
      }
    } else {
      side = 'left'
      const leftIndex = i - (perSide * 3)
      if (leftIndex === 0) {
        x = 0; y = 0
      } else if (leftIndex === perSide - 1) {
        x = 0; y = boardSize - cellSize
      } else {
        x = 0; y = leftIndex * spacing
      }
    }
    
    positions.push({
      id: i,
      x: Math.round(x),
      y: Math.round(y),
      side: side,
      isStart: i === 0,
      isFinish: i === totalPositions - 1,
      hasTask: false,
      tasks: null
    })
  }
  
  return positions
}

// 随机分配任务格
export const assignTaskCells = (positions, taskRatio) => {
  const candidateIds = positions.filter(p => !p.isStart && !p.isFinish).map(p => p.id)
  const taskCount = Math.max(1, Math.floor(candidateIds.length * taskRatio))
  const shuffled = [...candidateIds].sort(() => Math.random() - 0.5)
  const taskIds = new Set(shuffled.slice(0, taskCount))
  
  return positions.map(p => ({ ...p, hasTask: taskIds.has(p.id) }))
}
