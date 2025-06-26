# Sky Journey for Two 🌟
情侣专属飞行棋网页游戏

## 📋 项目概述
为情侣用户打造的轻松、活泼的飞行棋网页游戏，支持离线和在线实时对战模式。

## 🏗️ 项目结构
```
Sky Journey for Two/
├── client/                     # 前端代码
│   ├── public/
│   ├── src/
│   │   ├── components/        # React 组件
│   │   ├── contexts/          # Context 状态管理
│   │   ├── hooks/            # 自定义 Hooks
│   │   ├── services/         # API 和 Socket 服务
│   │   ├── styles/           # 样式文件
│   │   └── utils/            # 工具函数
│   ├── package.json
│   └── vite.config.js
├── server/                    # 后端代码
│   ├── src/
│   │   ├── config/           # 配置文件
│   │   ├── controllers/      # 控制器
│   │   ├── middleware/       # 中间件
│   │   ├── models/           # 数据模型
│   │   ├── routes/           # 路由
│   │   ├── services/         # 业务逻辑
│   │   └── socket/           # Socket.IO 处理
│   ├── logs/                 # 日志文件
│   ├── data/                 # 数据存储
│   ├── package.json
│   └── server.js
├── admin/                     # 后台管理面板
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── styles/
│   ├── package.json
│   └── vite.config.js
├── shared/                    # 共享组件和类型
│   ├── constants/
│   ├── types/
│   └── utils/
└── docs/                      # 文档
    ├── deployment.md
    └── api.md
```

## 🚀 快速开始

### 安装依赖
```bash
# 安装前端依赖
cd client && npm install

# 安装后端依赖
cd ../server && npm install

# 安装后台管理依赖
cd ../admin && npm install
```

### 启动开发环境
```bash
# 启动后端服务器 (端口 3001)
cd server && npm run dev

# 启动前端开发服务器 (端口 5173)
cd client && npm run dev

# 启动后台管理面板 (端口 5174)
cd admin && npm run dev
```

## 🎮 功能特性
- ✅ 角色设置（男性/女性，自定义昵称/头像）
- ✅ 骰子机制（1-6随机数）
- ✅ 棋子移动动画
- ✅ 真心话大冒险事件触发
- ✅ AI生成内容支持
- ✅ 终极挑战倒计时
- ✅ 实时日志和状态监控
- ✅ 后台参数调整
- ✅ 离线/在线模式支持

## 🛠️ 技术栈
- **前端**: React 18 + Vite + Socket.IO Client
- **后端**: Node.js + Express + Socket.IO
- **状态管理**: React Context + Hooks
- **样式**: CSS Modules + CSS变量
- **部署**: Vercel (前端) + Railway/Heroku (后端)
