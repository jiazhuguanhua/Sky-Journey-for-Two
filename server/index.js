const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175',
    'https://yourusername.github.io'  // 替换为实际的 GitHub Pages 地址
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// 限制请求频率
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);

// 数据库连接
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sky-journey';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 连接成功');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
    process.exit(1);
  }
};

// 任务数据模型
const TaskLibrarySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  taskType: {
    type: String,
    required: true,
    enum: ['couple', 'funny', 'romantic', 'adventurous', 'intimate']
  },
  category: {
    type: String,
    required: true,
    enum: ['truth', 'dare']
  },
  tasks: [{
    type: String,
    required: true
  }],
  lastModified: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
  },
  isShared: {
    type: Boolean,
    default: false
  },
  shareId: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// 复合索引
TaskLibrarySchema.index({ userId: 1, taskType: 1, category: 1 }, { unique: true });

const TaskLibrary = mongoose.model('TaskLibrary', TaskLibrarySchema);

// API 路由

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 获取用户的任务库
app.get('/api/tasks/:userId/:taskType/:category', async (req, res) => {
  try {
    const { userId, taskType, category } = req.params;
    
    const taskLibrary = await TaskLibrary.findOne({
      userId,
      taskType,
      category
    });

    if (!taskLibrary) {
      return res.json({
        tasks: [],
        lastModified: null,
        version: 0
      });
    }

    res.json({
      tasks: taskLibrary.tasks,
      lastModified: taskLibrary.lastModified,
      version: taskLibrary.version
    });
  } catch (error) {
    console.error('获取任务库失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 同步任务库（智能合并）
app.post('/api/tasks/sync', async (req, res) => {
  try {
    const { userId, taskType, category, tasks, clientVersion = 0 } = req.body;

    if (!userId || !taskType || !category || !Array.isArray(tasks)) {
      return res.status(400).json({ error: '参数不完整' });
    }

    // 查找现有的任务库
    let taskLibrary = await TaskLibrary.findOne({
      userId,
      taskType,
      category
    });

    if (!taskLibrary) {
      // 创建新的任务库
      taskLibrary = new TaskLibrary({
        userId,
        taskType,
        category,
        tasks,
        version: 1
      });
    } else {
      // 检查版本冲突
      if (clientVersion < taskLibrary.version) {
        // 客户端版本落后，返回服务器版本让客户端处理冲突
        return res.json({
          conflict: true,
          serverTasks: taskLibrary.tasks,
          serverVersion: taskLibrary.version,
          clientTasks: tasks
        });
      }

      // 更新任务库
      taskLibrary.tasks = tasks;
      taskLibrary.version += 1;
      taskLibrary.lastModified = new Date();
    }

    await taskLibrary.save();

    res.json({
      success: true,
      tasks: taskLibrary.tasks,
      version: taskLibrary.version,
      lastModified: taskLibrary.lastModified
    });
  } catch (error) {
    console.error('同步任务库失败:', error);
    res.status(500).json({ error: '同步失败' });
  }
});

// 更新任务库
app.put('/api/tasks/:userId/:taskType/:category', async (req, res) => {
  try {
    const { userId, taskType, category } = req.params;
    const { tasks, forceUpdate = false } = req.body;

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: '任务列表格式错误' });
    }

    const updateData = {
      tasks,
      lastModified: new Date(),
      $inc: { version: 1 }
    };

    const taskLibrary = await TaskLibrary.findOneAndUpdate(
      { userId, taskType, category },
      updateData,
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({
      success: true,
      tasks: taskLibrary.tasks,
      version: taskLibrary.version,
      lastModified: taskLibrary.lastModified
    });
  } catch (error) {
    console.error('更新任务库失败:', error);
    res.status(500).json({ error: '更新失败' });
  }
});

// 删除任务库
app.delete('/api/tasks/:userId/:taskType/:category', async (req, res) => {
  try {
    const { userId, taskType, category } = req.params;

    await TaskLibrary.deleteOne({
      userId,
      taskType,
      category
    });

    res.json({ success: true });
  } catch (error) {
    console.error('删除任务库失败:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

// 分享任务库
app.post('/api/tasks/share', async (req, res) => {
  try {
    const { userId, taskType, category } = req.body;
    const { v4: uuidv4 } = require('uuid');

    const shareId = uuidv4();
    
    const taskLibrary = await TaskLibrary.findOneAndUpdate(
      { userId, taskType, category },
      { 
        isShared: true,
        shareId: shareId
      },
      { new: true }
    );

    if (!taskLibrary) {
      return res.status(404).json({ error: '任务库不存在' });
    }

    res.json({
      success: true,
      shareId: shareId,
      shareUrl: `${req.protocol}://${req.get('host')}/api/tasks/shared/${shareId}`
    });
  } catch (error) {
    console.error('分享任务库失败:', error);
    res.status(500).json({ error: '分享失败' });
  }
});

// 获取分享的任务库
app.get('/api/tasks/shared/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;

    const taskLibrary = await TaskLibrary.findOne({
      shareId: shareId,
      isShared: true
    });

    if (!taskLibrary) {
      return res.status(404).json({ error: '分享的任务库不存在或已过期' });
    }

    res.json({
      taskType: taskLibrary.taskType,
      category: taskLibrary.category,
      tasks: taskLibrary.tasks,
      lastModified: taskLibrary.lastModified
    });
  } catch (error) {
    console.error('获取分享任务库失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('未处理的错误:', error);
  res.status(500).json({ error: '服务器内部错误' });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Sky Journey 云端同步服务启动成功`);
    console.log(`📍 服务地址: http://localhost:${PORT}`);
    console.log(`🔗 健康检查: http://localhost:${PORT}/api/health`);
    console.log(`📝 API 文档: /api/tasks`);
  });
};

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('⏹️  收到终止信号，正在关闭服务器...');
  await mongoose.connection.close();
  process.exit(0);
});

startServer().catch(console.error);

module.exports = app;
