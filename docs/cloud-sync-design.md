# 云端任务同步功能设计文档

## 功能概述

为 Sky Journey for Two 游戏添加云端任务编辑器同步功能，允许用户：
- 实时保存自定义任务到云端
- 跨设备同步任务库
- 分享任务库给其他玩家
- 备份和恢复任务数据

## 技术架构

### 后端服务
- **框架**: Node.js + Express
- **数据库**: MongoDB (Atlas 云端)
- **认证**: 简单的用户 ID 系统（暂不需要复杂的用户认证）
- **部署**: Vercel 或 Railway（免费云部署）

### 前端集成
- **存储策略**: 云端优先，本地缓存备份
- **同步机制**: 实时保存 + 冲突检测
- **离线支持**: 离线时使用本地存储，联网后自动同步

## API 设计

### 端点规划
```
POST   /api/tasks/sync          - 同步任务库
GET    /api/tasks/:userId/:type - 获取用户任务库
PUT    /api/tasks/:userId/:type - 更新任务库
DELETE /api/tasks/:userId/:type - 删除任务库
POST   /api/tasks/share         - 分享任务库
GET    /api/tasks/shared/:id    - 获取分享的任务库
```

### 数据结构
```javascript
{
  userId: String,           // 用户唯一标识
  taskType: String,         // 任务类型 (couple, funny, romantic等)
  category: String,         // 分类 (truth, dare)
  tasks: [String],          // 任务列表
  lastModified: Date,       // 最后修改时间
  version: Number,          // 版本号（用于冲突检测）
  isShared: Boolean,        // 是否公开分享
  shareId: String          // 分享ID
}
```

## 实现步骤

1. **创建后端服务** (server/ 目录)
2. **实现云端同步 API**
3. **更新前端任务管理器**
4. **添加同步状态 UI**
5. **实现离线支持**
6. **添加分享功能**

## 部署考虑

- 使用免费的云服务（保持项目的纯前端部署优势）
- 后端可选择性部署（不影响现有的 GitHub Pages 部署）
- 提供降级方案（云端不可用时使用本地存储）
