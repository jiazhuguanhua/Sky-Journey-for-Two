# Sky Journey 云端同步服务

Sky Journey for Two 游戏的后端服务，提供任务库的云端同步功能。

## 功能特性

- 🔄 **实时同步**: 任务库云端同步，跨设备访问
- 🔒 **版本控制**: 智能冲突检测和版本管理
- 🚀 **高性能**: 基于 Express.js 和 MongoDB
- 🛡️ **安全防护**: 请求限流、CORS 保护
- 📤 **分享功能**: 生成分享链接，与其他玩家共享任务库
- 🌐 **云端部署**: 支持 Vercel、Railway 等平台部署

## 快速开始

### 本地开发

1. **安装依赖**
```bash
cd server
npm install
```

2. **环境配置**
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接
```

3. **启动服务**
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 数据库设置

#### 本地 MongoDB
```bash
# 使用 Docker 启动 MongoDB
docker run -d -p 27017:27017 --name sky-journey-mongo mongo:latest

# 或者安装本地 MongoDB
# 参考: https://docs.mongodb.com/manual/installation/
```

#### MongoDB Atlas (推荐)
1. 注册 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费集群
3. 获取连接字符串
4. 更新 `.env` 文件中的 `MONGODB_URI`

## API 文档

### 基础信息
- **Base URL**: `http://localhost:3001/api`
- **认证方式**: 基于用户ID的简单认证
- **数据格式**: JSON

### 端点列表

#### 健康检查
```
GET /api/health
```
**响应示例**:
```json
{
  "status": "ok",
  "timestamp": "2025-06-28T10:00:00.000Z",
  "version": "1.0.0"
}
```

#### 获取任务库
```
GET /api/tasks/:userId/:taskType/:category
```
**参数**:
- `userId`: 用户唯一标识
- `taskType`: 任务类型 (couple, funny, romantic, adventurous, intimate)
- `category`: 分类 (truth, dare)

**响应示例**:
```json
{
  "tasks": ["任务1", "任务2"],
  "lastModified": "2025-06-28T10:00:00.000Z",
  "version": 3
}
```

#### 同步任务库
```
POST /api/tasks/sync
```
**请求体**:
```json
{
  "userId": "user123",
  "taskType": "couple",
  "category": "truth",
  "tasks": ["任务1", "任务2"],
  "clientVersion": 2
}
```

**成功响应**:
```json
{
  "success": true,
  "tasks": ["任务1", "任务2"],
  "version": 3,
  "lastModified": "2025-06-28T10:00:00.000Z"
}
```

**冲突响应**:
```json
{
  "conflict": true,
  "serverTasks": ["服务器任务1", "服务器任务2"],
  "serverVersion": 4,
  "clientTasks": ["客户端任务1", "客户端任务2"]
}
```

#### 分享任务库
```
POST /api/tasks/share
```
**请求体**:
```json
{
  "userId": "user123",
  "taskType": "couple",
  "category": "truth"
}
```

**响应示例**:
```json
{
  "success": true,
  "shareId": "abc123-def456",
  "shareUrl": "http://localhost:3001/api/tasks/shared/abc123-def456"
}
```

#### 获取分享的任务库
```
GET /api/tasks/shared/:shareId
```

**响应示例**:
```json
{
  "taskType": "couple",
  "category": "truth",
  "tasks": ["分享的任务1", "分享的任务2"],
  "lastModified": "2025-06-28T10:00:00.000Z"
}
```

## 部署指南

### Vercel 部署 (推荐)

1. **安装 Vercel CLI**
```bash
npm i -g vercel
```

2. **配置 vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.js"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "NODE_ENV": "production"
  }
}
```

3. **部署**
```bash
cd server
vercel --prod
```

### Railway 部署

1. 连接 GitHub 仓库到 Railway
2. 设置环境变量
3. 自动部署

### 环境变量设置

生产环境需要设置以下环境变量：
- `MONGODB_URI`: MongoDB 连接字符串
- `NODE_ENV`: production
- `ALLOWED_ORIGINS`: 允许的前端域名

## 开发指南

### 项目结构
```
server/
├── index.js              # 主服务文件
├── package.json           # 依赖配置
├── .env.example          # 环境变量示例
├── vercel.json           # Vercel 部署配置
└── README.md             # 文档
```

### 代码规范
- 使用 ES6+ 语法
- 错误处理：所有异步操作都要有 try-catch
- 日志记录：使用 console.log/error 记录关键操作
- 接口响应：统一的 JSON 格式

### 测试
```bash
# 运行测试
npm test

# 手动测试 API
curl http://localhost:3001/api/health
```

## 安全考虑

- ✅ CORS 配置：限制允许的域名
- ✅ 请求限流：防止滥用
- ✅ 输入验证：验证所有用户输入
- ✅ 错误处理：不暴露敏感信息
- ⚠️ 认证系统：当前使用简单的用户ID，未来可升级

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 MongoDB 服务是否启动
   - 验证 `MONGODB_URI` 配置是否正确
   - 检查网络连接

2. **CORS 错误**
   - 确认前端域名在 `ALLOWED_ORIGINS` 中
   - 检查请求头设置

3. **请求超时**
   - 检查服务器负载
   - 优化数据库查询
   - 增加超时设置

### 日志查看
```bash
# 开发环境
npm run dev

# 生产环境日志
vercel logs [deployment-url]
```

## 更新日志

### v1.0.0 (2025-06-28)
- ✨ 初始版本发布
- 🚀 基础的任务库CRUD功能
- 🔄 智能同步和冲突检测
- 📤 任务库分享功能
- 🛡️ 基础安全防护
