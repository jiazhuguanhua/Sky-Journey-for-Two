# ☁️ 云端任务同步功能

本功能为 Sky Journey for Two 添加了任务库的云端同步、分享和协作功能。

## 🌟 新功能特性

### 云端同步
- ✅ **实时保存**: 任务编辑后自动同步到云端
- ✅ **跨设备访问**: 在任何设备上都能访问您的自定义任务
- ✅ **版本控制**: 智能冲突检测和版本管理
- ✅ **离线支持**: 离线时保存到本地，联网后自动同步

### 分享协作  
- ✅ **分享任务库**: 生成分享链接，与朋友分享创意任务
- ✅ **导入分享**: 一键导入其他玩家分享的任务库
- ✅ **冲突解决**: 智能处理同步冲突，支持多种解决方案

### 状态监控
- ✅ **同步状态**: 实时显示云端连接和同步状态
- ✅ **版本追踪**: 查看每个任务库的版本和修改时间
- ✅ **待同步队列**: 显示离线时的待同步更改

## 🚀 快速开始

### 1. 安装依赖
```bash
# 安装前端和后端依赖
npm run setup

# 或者分别安装
npm install                    # 前端依赖
npm run server:install        # 后端依赖
```

### 2. 环境配置
```bash
# 复制环境变量文件
cp .env.example .env

# 配置后端环境变量
cp server/.env.example server/.env
```

### 3. 启动服务

#### 开发环境（推荐）
```bash
# 同时启动前端和后端
npm run dev:full

# 或者分别启动
npm run dev          # 前端 (http://localhost:5173)
npm run server:dev   # 后端 (http://localhost:3001)
```

#### 仅前端（本地模式）
```bash
npm run dev
# 将自动降级到本地存储模式
```

## 🔧 技术架构

### 前端 (React + Vite)
- **同步服务**: `src/services/cloudSyncService.js`
- **任务管理**: `src/utils/taskLibraryManager.js` (已升级)
- **UI组件**: `src/components/TaskEditor.jsx` (已升级)
- **状态面板**: `src/components/SyncStatusPanel.jsx`

### 后端 (Node.js + Express + MongoDB)
- **API服务**: `server/index.js`
- **数据库**: MongoDB (本地或云端)
- **部署**: 支持 Vercel、Railway 等平台

## 📱 使用指南

### 任务编辑器新功能

1. **☁️ 保存到云端**: 替代原来的"保存到本地"，支持云端同步
2. **🔗 分享任务库**: 生成分享链接，其他玩家可以导入
3. **📥 导入分享**: 输入分享ID导入其他玩家的任务库
4. **📊 同步状态**: 查看详细的同步状态和版本信息

### 冲突解决

当检测到同步冲突时，系统会显示冲突解决界面：
- **使用本地版本**: 用您的本地任务覆盖云端
- **使用云端版本**: 用云端任务覆盖本地
- **合并两个版本**: 智能合并去重后的任务

### 离线支持

- 📦 **离线编辑**: 网络断开时任务仍可编辑和保存
- 🔄 **自动同步**: 网络恢复后自动同步待处理的更改
- 💾 **本地备份**: 所有数据都有本地备份，确保不丢失

## 🌐 部署说明

### 前端部署（GitHub Pages）
前端保持原有的自动部署，云端同步为可选功能：
```bash
npm run deploy
```

### 后端部署

#### MongoDB Atlas（推荐）
1. 注册 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费集群（512MB，永久免费）
3. 获取连接字符串
4. 在部署平台设置环境变量

#### Vercel 部署
```bash
cd server
vercel --prod
```

#### Railway 部署
1. 连接 GitHub 仓库
2. 选择 `server` 目录
3. 设置环境变量
4. 自动部署

### 环境变量配置

#### 前端
```env
VITE_API_URL=https://your-backend-url.vercel.app/api
```

#### 后端
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sky-journey
NODE_ENV=production
ALLOWED_ORIGINS=https://yourusername.github.io
```

## 🔒 安全考虑

- 🛡️ **CORS保护**: 限制允许的前端域名
- ⚡ **请求限流**: 防止API滥用（15分钟100次请求）
- ✅ **输入验证**: 所有用户输入都经过验证
- 📝 **简单认证**: 基于用户ID的轻量级认证

## 📊 监控和调试

### 同步状态监控
- 🟢 **云端同步已启用**: 功能正常
- 🟡 **本地存储模式**: 后端不可用，仅本地存储
- 🔴 **离线模式**: 网络断开，使用缓存

### 调试信息
- 浏览器控制台会显示详细的同步日志
- 同步状态面板显示版本和修改时间
- 可查看待同步队列中的更改

## 🆕 版本更新

### v1.2.0 新增功能
- ☁️ 云端任务同步
- 🔗 任务库分享功能  
- 📊 同步状态监控
- 🔄 智能冲突解决
- 📱 离线支持
- 🎯 版本控制

### 兼容性
- ✅ **向下兼容**: 现有本地任务自动迁移
- ✅ **优雅降级**: 后端不可用时自动使用本地模式
- ✅ **无缝升级**: 用户无需任何操作即可享受新功能

## 🤝 贡献指南

按照项目的协作流程开发：

1. **创建功能分支**
```bash
git checkout -b feature/your-feature-name
```

2. **开发和测试**
```bash
npm run dev:full  # 测试前后端集成
```

3. **提交和推送**
```bash
git add .
git commit -m "feat: 添加新功能"
git push origin feature/your-feature-name
```

4. **创建 Pull Request**

## 🎯 未来规划

- 📊 **使用统计**: 任务库的使用频率分析
- 👥 **协作编辑**: 多人实时协作编辑任务库
- 🏷️ **标签系统**: 为任务添加标签和分类
- 🎨 **主题定制**: 自定义任务库外观主题
- 📈 **云端备份**: 定期自动备份到多个云端
- 🔐 **用户系统**: 完整的用户注册和认证系统
