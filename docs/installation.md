# 🚀 Sky Journey for Two - 安装与运行指南

## 📋 系统要求

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **操作系统**: Windows/macOS/Linux
- **浏览器**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+

## 🛠️ 快速开始

### 1. 克隆项目（或已有项目文件）

```bash
cd "Sky Journey for Two"
```

### 2. 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install

# 安装管理后台依赖
cd ../admin
npm install
```

### 3. 环境配置

#### 后端环境配置
```bash
cd ../server
cp .env.example .env
```

编辑 `.env` 文件：
```env
# 服务器配置
PORT=3001
NODE_ENV=development

# 客户端URL
CLIENT_URL=http://localhost:5173

# 管理员密钥
ADMIN_KEY=admin123

# 日志级别
LOG_LEVEL=info
```

#### 前端环境配置
在 `client` 目录创建 `.env` 文件：
```env
VITE_SERVER_URL=http://localhost:3001
```

#### 管理后台环境配置
在 `admin` 目录创建 `.env` 文件：
```env
VITE_SERVER_URL=http://localhost:3001
```

### 4. 启动应用

#### 方法一：分别启动（推荐开发时使用）

```bash
# 1. 启动后端服务器
cd server
npm run dev
# 服务器将在 http://localhost:3001 启动

# 2. 新终端窗口 - 启动前端
cd client
npm run dev
# 前端将在 http://localhost:5173 启动

# 3. 新终端窗口 - 启动管理后台
cd admin
npm run dev
# 管理后台将在 http://localhost:5174 启动
```

#### 方法二：一键启动（需要安装 concurrently）

在项目根目录创建 `package.json`：
```json
{
  "name": "sky-journey-for-two",
  "scripts": {
    "dev": "concurrently \"cd server && npm run dev\" \"cd client && npm run dev\" \"cd admin && npm run dev\"",
    "install-all": "cd server && npm install && cd ../client && npm install && cd ../admin && npm install"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

然后运行：
```bash
# 安装 concurrently
npm install

# 一键启动所有服务
npm run dev
```

## 🌐 访问应用

启动成功后，可以访问以下地址：

- **游戏前端**: http://localhost:5173
- **管理后台**: http://localhost:5174 (管理员密钥: admin123)
- **API健康检查**: http://localhost:3001/health

## 🎮 使用指南

### 游戏前端功能
1. **首页**: 选择本地对战或在线对战模式
2. **角色设置**: 配置玩家昵称、性别、头像
3. **游戏界面**: 掷骰子、移动棋子、完成挑战
4. **事件系统**: 真心话大冒险随机触发
5. **终极挑战**: 落后玩家的逆转机会

### 管理后台功能
1. **实时监控**: 查看活跃房间和玩家
2. **游戏统计**: 总游戏数、平均时长等
3. **日志查看**: 实时游戏日志流
4. **参数调整**: 地图布局、事件概率等
5. **房间管理**: 踢出玩家、关闭房间

## 🔧 开发工具

### 推荐的 VS Code 扩展
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Prettier - Code formatter
- ESLint
- Thunder Client (API测试)

### 调试技巧

#### 前端调试
```bash
# 在浏览器开发者工具中查看
console.log('Socket状态:', socket.connected)
```

#### 后端调试
```bash
# 查看服务器日志
cd server
tail -f logs/combined.log
```

#### Socket连接调试
```bash
# 在浏览器控制台测试Socket连接
const socket = io('http://localhost:3001')
socket.on('connect', () => console.log('连接成功'))
```

## 📂 项目结构说明

```
Sky Journey for Two/
├── client/                 # React前端
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── contexts/      # Context状态管理
│   │   ├── hooks/         # 自定义Hooks
│   │   └── styles/        # CSS样式
│   └── package.json
├── server/                # Node.js后端
│   ├── src/
│   │   ├── config/        # 配置文件
│   │   ├── routes/        # API路由
│   │   ├── services/      # 业务逻辑
│   │   └── socket/        # Socket.IO处理
│   ├── logs/             # 日志文件
│   └── package.json
├── admin/                # 管理后台
│   ├── src/
│   │   ├── components/   # 管理界面组件
│   │   └── styles/       # 样式文件
│   └── package.json
└── README.md
```

## 🚨 常见问题

### 1. 端口占用
```bash
# 查看端口占用
netstat -ano | findstr :3001

# 杀死进程 (Windows)
taskkill /PID <PID> /F

# 杀死进程 (Mac/Linux)
kill -9 <PID>
```

### 2. Socket连接失败
- 检查后端服务是否启动
- 确认端口配置正确
- 检查防火墙设置

### 3. 依赖安装失败
```bash
# 清除缓存重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 4. 热重载不工作
```bash
# 重启开发服务器
# Ctrl+C 停止，然后重新运行 npm run dev
```

## 📊 性能监控

### 查看内存使用
```bash
# 在后端添加监控
process.memoryUsage()
```

### 查看连接数
```bash
# 访问健康检查接口
curl http://localhost:3001/health
```

## 🔄 更新部署

### 开发环境更新
```bash
# 拉取最新代码后
npm run install-all
npm run dev
```

### 生产环境部署
```bash
# 构建前端
cd client
npm run build

# 构建管理后台
cd ../admin
npm run build

# 启动生产服务器
cd ../server
NODE_ENV=production npm start
```

## 📞 技术支持

如果遇到问题，请：
1. 查看浏览器控制台错误
2. 检查服务器日志文件
3. 确认网络连接正常
4. 验证环境配置正确

---

🎮 现在开始享受你们的专属飞行棋游戏吧！
