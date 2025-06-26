# Sky Journey for Two - 快速开始指南

欢迎使用 Sky Journey for Two 情侣飞行棋游戏！本指南将帮助您快速运行整个项目。

## 🚀 快速开始

### 1. 环境要求

- **Node.js**: 16.0.0 或更高版本
- **npm**: 7.0.0 或更高版本
- **现代浏览器**: Chrome 90+, Firefox 88+, Safari 14+

### 2. 项目下载与安装

```bash
# 克隆项目（如果从Git仓库）
git clone <repository-url>
cd "Sky Journey for Two"

# 或者如果是本地项目，直接进入目录
cd "Sky Journey for Two"
```

### 3. 一键启动脚本

我们提供了便捷的启动脚本，您可以选择以下方式之一：

#### Windows 用户

创建 `start.bat` 文件：

```batch
@echo off
echo Starting Sky Journey for Two...
echo.

echo [1/3] Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo Failed to install server dependencies
    pause
    exit /b 1
)

echo [2/3] Installing client dependencies...
cd ../client
call npm install
if errorlevel 1 (
    echo Failed to install client dependencies
    pause
    exit /b 1
)

echo [3/3] Installing admin dependencies...
cd ../admin
call npm install
if errorlevel 1 (
    echo Failed to install admin dependencies
    pause
    exit /b 1
)

echo.
echo All dependencies installed successfully!
echo.
echo Starting all services...

start "Server" cmd /k "cd ../server && npm run dev"
timeout /t 3 /nobreak >nul
start "Client" cmd /k "cd ../client && npm run dev"
timeout /t 2 /nobreak >nul
start "Admin" cmd /k "cd ../admin && npm run dev"

echo.
echo All services are starting...
echo Server: http://localhost:3001
echo Client: http://localhost:5173
echo Admin: http://localhost:5174
echo.
echo Press any key to close this window...
pause >nul
```

#### macOS/Linux 用户

创建 `start.sh` 文件：

```bash
#!/bin/bash

echo "Starting Sky Journey for Two..."
echo

echo "[1/3] Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install server dependencies"
    exit 1
fi

echo "[2/3] Installing client dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install client dependencies"
    exit 1
fi

echo "[3/3] Installing admin dependencies..."
cd ../admin
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install admin dependencies"
    exit 1
fi

echo
echo "All dependencies installed successfully!"
echo

echo "Starting all services..."

# 启动服务器
cd ../server
npm run dev &
SERVER_PID=$!

# 等待服务器启动
sleep 3

# 启动客户端
cd ../client
npm run dev &
CLIENT_PID=$!

# 等待客户端启动
sleep 2

# 启动管理后台
cd ../admin
npm run dev &
ADMIN_PID=$!

echo
echo "All services are running!"
echo "Server: http://localhost:3001"
echo "Client: http://localhost:5173"
echo "Admin: http://localhost:5174"
echo
echo "Press Ctrl+C to stop all services..."

# 等待中断信号
trap "kill $SERVER_PID $CLIENT_PID $ADMIN_PID; exit" INT
wait
```

### 4. 手动启动（分步执行）

如果您喜欢手动控制，可以按以下步骤操作：

#### 步骤 1: 启动后端服务器

```bash
# 进入服务器目录
cd server

# 安装依赖
npm install

# 创建环境配置文件
cp .env.example .env

# 编辑 .env 文件（可选）
# 设置端口、管理员密钥等

# 启动开发服务器
npm run dev
```

服务器将在 `http://localhost:3001` 启动

#### 步骤 2: 启动前端客户端

```bash
# 新开一个终端窗口
# 进入客户端目录
cd client

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

客户端将在 `http://localhost:5173` 启动

#### 步骤 3: 启动管理后台

```bash
# 新开一个终端窗口
# 进入管理后台目录
cd admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

管理后台将在 `http://localhost:5174` 启动

### 5. 访问应用

启动完成后，您可以访问以下地址：

- **游戏客户端**: [http://localhost:5173](http://localhost:5173)
- **管理后台**: [http://localhost:5174](http://localhost:5174)
- **API接口**: [http://localhost:3001](http://localhost:3001)

## 🎮 开始游戏

### 创建游戏

1. 打开游戏客户端 `http://localhost:5173`
2. 点击"创建房间"
3. 设置玩家信息：
   - 输入昵称
   - 选择角色头像
   - 选择游戏模式（本地/在线）
4. 等待另一位玩家加入

### 加入游戏

1. 打开游戏客户端
2. 点击"加入房间"
3. 输入房间ID
4. 设置玩家信息
5. 开始游戏

### 游戏规则

- 🎲 轮流掷骰子移动
- ✨ 特殊格子触发事件
- 💕 真心话/大冒险挑战
- 🏆 率先到达终点获胜

## 🛠️ 管理后台

### 管理员登录

1. 访问 `http://localhost:5174`
2. 输入管理员密钥（默认：`admin123`）
3. 点击登录

### 主要功能

- **房间管理**: 查看、关闭房间，踢出玩家
- **系统设置**: 调整游戏参数
- **实时日志**: 监控系统运行状态
- **数据统计**: 查看游戏数据和性能指标

## 🔧 配置说明

### 服务器配置 (.env)

```env
# 服务器端口
PORT=3001

# 管理员密钥
ADMIN_KEY=admin123

# 跨域设置
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# 日志级别
LOG_LEVEL=info

# AI设置（可选）
OPENAI_API_KEY=your_api_key_here
```

### 客户端配置

客户端会自动连接到 `http://localhost:3001`，如需修改请编辑：
- `client/src/contexts/SocketContext.jsx`

### 管理后台配置

管理后台会自动连接到 `http://localhost:3001`，如需修改请编辑：
- `admin/src/App.jsx`

## 📱 移动端支持

项目采用响应式设计，支持移动设备访问：

- 在手机浏览器中访问相同地址
- 支持触摸操作
- 自适应屏幕尺寸

## 🚨 常见问题

### 端口被占用

如果遇到端口被占用的问题：

```bash
# 查看端口占用
netstat -ano | findstr :3001
netstat -ano | findstr :5173
netstat -ano | findstr :5174

# 终止占用进程（Windows）
taskkill /PID <进程ID> /F

# 或者修改端口配置
```

### 依赖安装失败

```bash
# 清理npm缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules
npm install
```

### 网络连接问题

- 检查防火墙设置
- 确保WebSocket连接正常
- 查看浏览器控制台错误信息

## 📦 生产部署

详细的生产部署指南请参考：
- [部署文档](../docs/deployment.md)

支持多种部署方式：
- 静态文件部署
- Docker容器化部署
- 云平台部署（Vercel、Railway等）

## 💡 开发指南

如需进行二次开发，请参考：
- [API文档](../docs/api.md)
- [组件文档](../docs/components.md)
- [贡献指南](../docs/contributing.md)

## 🎉 享受游戏！

现在您可以与您的伴侣一起享受这个温馨的飞行棋游戏了！

如有任何问题，请查看 [FAQ](../docs/faq.md) 或提交 Issue。
