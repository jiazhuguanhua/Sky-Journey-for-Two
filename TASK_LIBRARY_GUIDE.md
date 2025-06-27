# 🎪 任务库管理指南

本文档说明如何自定义和管理Sky Journey for Two游戏中的任务库。

## 📚 任务库结构

### 1. 任务库配置

任务库位于 `client/src/App.improved.jsx` 中的 `TASK_LIBRARIES` 对象：

```javascript
const TASK_LIBRARIES = {
  // 任务类型标识符
  'couple': {
    name: '情侣专用',
    emoji: '💕',
    description: '专为情侣设计的甜蜜任务',
    tasks: {
      truth: [...], // 真心话任务数组
      dare: [...]   // 大冒险任务数组
    }
  },
  // 更多任务类型...
}
```

### 2. 任务类型

目前支持的任务类型：

- **couple**: 情侣专用 💕
- **mild**: 温和友好 😊
- **friend**: 好友模式 👫
- **passionate**: 热恋情侣 🔥
- **wild**: 狂热挑战 🎭

## 🛠️ 自定义任务

### 添加新任务

1. **找到对应任务类型**
   ```javascript
   const TASK_LIBRARIES = {
     'couple': {
       // ...
       tasks: {
         truth: [
           // 在这里添加新的真心话任务
           '你最喜欢我的哪个特点？',
           '新任务内容...'
         ],
         dare: [
           // 在这里添加新的大冒险任务
           '对我唱一首歌',
           '新任务内容...'
         ]
       }
     }
   }
   ```

2. **任务内容要求**
   - 适合目标用户群体
   - 语言积极正面
   - 避免过于私人或不适当的内容
   - 长度适中（建议50字以内）

### 创建新任务类型

1. **添加新类型定义**
   ```javascript
   const TASK_LIBRARIES = {
     // 现有任务类型...
     'custom': {
       name: '自定义',
       emoji: '🎨',
       description: '用户自定义任务集合',
       tasks: {
         truth: [
           '自定义真心话1',
           '自定义真心话2'
         ],
         dare: [
           '自定义大冒险1',
           '自定义大冒险2'
         ]
       }
     }
   }
   ```

2. **更新UI选择器**
   在PlayerSetup组件中，任务类型选择器会自动读取所有可用类型。

## ⚙️ 任务抽取逻辑

### 1. 初始化阶段

游戏开始时，系统会为所有任务格子预设任务：

```javascript
const initializeBoardTasks = () => {
  const tasks = {}
  
  boardPositions.forEach(position => {
    if (position.hasTask || position.isSpecial) {
      // 为每个任务格子随机选择真心话和大冒险
      const truthTasks = TASK_LIBRARIES[selectedTaskType].tasks.truth
      const dareTasks = TASK_LIBRARIES[selectedTaskType].tasks.dare
      
      tasks[position.id] = {
        truth: truthTasks[Math.floor(Math.random() * truthTasks.length)],
        dare: dareTasks[Math.floor(Math.random() * dareTasks.length)]
      }
    }
  })
  
  setGameState(prev => ({ ...prev, boardTasks: tasks }))
}
```

### 2. 任务选择机制

- **预设机制**: 每个任务格子在游戏开始时就预设了真心话和大冒险任务
- **玩家选择**: 玩家到达任务格子时，可以选择真心话或大冒险
- **换一换功能**: 支持重新随机选择任务（格子预览和任务执行时都可以）

### 3. 随机算法

使用简单的随机数生成：
```javascript
const randomIndex = Math.floor(Math.random() * taskArray.length)
const selectedTask = taskArray[randomIndex]
```

## 🎯 任务分级系统

### 难度等级

每个任务类型都有不同的难度倾向：

1. **温和 (mild)**: 适合初次游戏的用户
2. **情侣 (couple)**: 适合情侣间的互动
3. **好友 (friend)**: 适合朋友聚会
4. **热恋 (passionate)**: 适合亲密关系的情侣
5. **狂热 (wild)**: 适合追求刺激的用户

### 倒计时配置

部分任务支持自定义倒计时：

```javascript
// 在任务对象中可以添加倒计时配置
{
  text: '在30秒内完成这个动作',
  duration: 30 // 秒数
}
```

## 🔧 高级配置

### 任务权重系统

可以为不同任务设置权重，影响抽取概率：

```javascript
// 未来功能：任务权重
const weightedTasks = [
  { text: '常见任务', weight: 10 },
  { text: '稀有任务', weight: 1 }
]
```

### 任务标签系统

可以为任务添加标签，支持更精细的分类：

```javascript
// 未来功能：任务标签
{
  text: '说出你的一个秘密',
  tags: ['intimate', 'revealing', 'couple'],
  difficulty: 3
}
```

## 📝 最佳实践

### 任务设计原则

1. **积极正面**: 所有任务都应该促进正面互动
2. **尊重边界**: 避免可能让人不舒服的内容
3. **趣味性**: 任务应该有趣且容易执行
4. **多样性**: 保持任务类型的多样性

### 任务库维护

1. **定期更新**: 定期添加新任务保持新鲜感
2. **用户反馈**: 根据用户反馈调整任务内容
3. **版本控制**: 记录任务库的变更历史
4. **测试验证**: 新任务应该经过测试验证

## 🚀 扩展功能

### 未来计划

1. **后台管理界面**: 通过Web界面管理任务库
2. **用户自定义**: 允许用户创建和分享自己的任务
3. **任务评分系统**: 用户可以对任务进行评分
4. **智能推荐**: 根据游戏历史推荐合适的任务
5. **多语言支持**: 支持不同语言的任务库

### API接口设计

```javascript
// 未来API接口
GET /api/tasks/:type          // 获取指定类型的任务
POST /api/tasks               // 创建新任务
PUT /api/tasks/:id           // 更新任务
DELETE /api/tasks/:id        // 删除任务
GET /api/tasks/random/:type  // 随机获取任务
```

## 📊 数据统计

### 任务使用统计

可以收集以下数据来优化任务库：

1. **任务执行频率**: 哪些任务被执行得最多
2. **任务完成率**: 哪些任务容易被跳过
3. **用户偏好**: 用户更喜欢哪种类型的任务
4. **游戏时长**: 不同任务对游戏时长的影响

---

📧 如有任何问题或建议，请参考项目README或提交Issue。
