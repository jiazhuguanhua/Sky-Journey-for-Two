# ✈️ Sky Journey for Two

**情侣专属的浪漫飞行棋网页游戏**

## 🎮 游戏简介

一款专为情侣设计的飞行棋游戏，结合真心话大冒险元素，让两个人的互动更加有趣和浪漫。

### ✨ 核心特性

- 🎯 **简单易玩**: 经典飞行棋规则，轻松上手
- 💕 **情侣专属**: 专为两人设计的任务和挑战
- 🎪 **真心话大冒险**: 丰富的任务库，增加游戏趣味性
- 🎨 **精美UI**: 现代化设计，流畅动画效果
- 🔧 **可定制**: 支持任务格比例调整和任务类型选择
- 🎵 **音效支持**: 沉浸式游戏体验

### 🎲 游戏玩法

1. **设置玩家**: 输入昵称，选择头像（支持自动生成）
2. **选择任务类型**: 五种不同风格的任务库
3. **调整难度**: 自定义任务格在棋盘中的比例
4. **开始游戏**: 掷骰子移动，触发任务挑战
5. **完成挑战**: 真心话或大冒险，增进感情

## 🚀 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/yourusername/sky-journey-for-two.git
cd sky-journey-for-two

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 一键部署

```bash
# 使用部署脚本
./deploy.sh
```

或手动部署：

```bash
npm install
npm run build
npm run preview  # 本地预览
```

### 在线访问

访问 `http://localhost:5173` (开发模式) 或 `http://localhost:4173` (预览模式)

项目基于 Vite 构建，支持各种部署平台：

- **Vercel**: 推荐，零配置部署
- **Netlify**: 简单快捷
- **GitHub Pages**: 免费托管

## 🏗️ 项目结构

```
sky-journey-for-two/
├── public/              # 静态资源
│   ├── heart.svg       # 爱心图标
│   └── bgm.wav         # 背景音乐
├── src/
│   ├── components/     # React 组件
│   │   ├── GameBoard.jsx
│   │   ├── PlayerSetup.jsx
│   │   ├── TaskModal.jsx
│   │   └── ...
│   ├── hooks/          # 自定义 Hooks
│   │   ├── useAudio.js
│   │   ├── useGame.js
│   │   └── ...
│   ├── utils/          # 工具函数
│   │   ├── gameLogic.js
│   │   ├── animations.js
│   │   └── ...
│   ├── data/           # 游戏数据
│   │   └── taskLibrary.js
│   ├── styles/         # 样式文件
│   │   ├── global.css
│   │   └── animations.css
│   ├── App.jsx         # 主应用组件
│   └── main.jsx        # 入口文件
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **样式方案**: CSS Modules + 内联样式
- **动画**: CSS Animation + React状态管理
- **音效**: Web Audio API
- **状态管理**: React Hooks + Context

## 🎪 任务库类型

1. **💕 甜蜜情侣版**: 温馨浪漫的情侣互动
2. **🌸 温柔淑女版**: 优雅文艺的轻松挑战
3. **🤝 好友兄弟版**: 友谊深厚的兄弟互动
4. **🔥 热恋火花版**: 激情四射的恋人专属
5. **🌪️ 狂野挑战版**: 刺激有趣的极限挑战

## 🔧 自定义配置

### 任务格比例
通过主页滑块调整任务格在棋盘中的占比（10%-70%）

### 添加背景音乐
将音频文件命名为 `bgm.mp3`、`bgm.mp4` 或 `bgm.wav` 放入 `public` 目录

### 自定义任务
编辑 `src/data/taskLibrary.js` 文件添加自己的任务内容

## 🎯 开发计划

- [x] ✅ 核心游戏逻辑完成
- [x] ✅ 组件化架构重构
- [x] ✅ 音效系统集成
- [x] ✅ 响应式设计优化
- [x] ✅ 任务库系统完善
- [ ] 🔄 在线对战模式
- [ ] 🔄 自定义任务编辑器
- [ ] 🔄 游戏记录与统计
- [ ] 🔄 主题皮肤系统
- [ ] 🔄 多语言支持

## 🧪 测试

项目包含功能测试页面，访问 `test.html` 可以测试核心功能：

```bash
# 启动开发服务器后访问
http://localhost:5173/test.html
```

测试内容包括：
- 🎲 游戏逻辑（骰子、任务生成、棋盘计算）
- 🎵 音效系统（按钮音效、骰子音效、BGM）
- 📱 响应式设计
- ✅ 核心功能检查表
- [ ] 自定义任务编辑器
- [ ] 游戏记录与统计
- [ ] 主题皮肤系统
- [ ] 多语言支持

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**❤️ 享受你们的浪漫游戏时光！**
