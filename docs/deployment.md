# 🚀 Sky Journey for Two - 部署文档

## 📋 部署方案概览

本项目采用前后端分离架构，支持多种部署方式：

- **前端**: 静态托管 (Vercel/Netlify/GitHub Pages)
- **后端**: Node.js 服务器 (Vercel/Railway/Heroku)
- **管理后台**: 静态托管 (独立部署)

## 🌐 方案一：Vercel 部署（推荐）

### 前端部署到 Vercel

1. **准备前端代码**
```bash
cd client
npm run build
```

2. **创建 vercel.json**
```json
{
  "name": "sky-journey-client",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_SERVER_URL": "@server-url"
  }
}
```

3. **部署命令**
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel --prod

# 设置环境变量
vercel env add VITE_SERVER_URL production
# 输入你的后端URL，例如: https://your-backend.vercel.app
```

### 后端部署到 Vercel

1. **创建 vercel.json**
```json
{
  "name": "sky-journey-server",
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "CLIENT_URL": "@client-url",
    "ADMIN_KEY": "@admin-key"
  },
  "functions": {
    "server.js": {
      "maxDuration": 30
    }
  }
}
```

2. **修改 package.json**
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "echo 'No build step required'",
    "vercel-build": "echo 'No build step required'"
  }
}
```

3. **部署命令**
```bash
cd server
vercel --prod

# 设置环境变量
vercel env add CLIENT_URL production
vercel env add ADMIN_KEY production
```

### 管理后台部署

```bash
cd admin
vercel --prod

# 设置环境变量
vercel env add VITE_SERVER_URL production
```

## 🚂 方案二：Railway 部署

### 后端部署到 Railway

1. **创建 railway.json**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **环境变量设置**
```bash
# 在 Railway Dashboard 设置环境变量
NODE_ENV=production
PORT=3001
CLIENT_URL=https://your-frontend-url.vercel.app
ADMIN_KEY=your-secure-admin-key
```

3. **部署步骤**
```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 部署
railway up
```

## 🐳 方案三：Docker 部署

### 创建 Dockerfiles

#### 前端 Dockerfile
```dockerfile
# client/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 后端 Dockerfile
```dockerfile
# server/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# 创建日志目录
RUN mkdir -p logs

USER node

EXPOSE 3001
CMD ["npm", "start"]
```

#### Nginx 配置
```nginx
# client/nginx.conf
server {
    listen 80;
    server_name localhost;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  server:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - CLIENT_URL=http://localhost
      - ADMIN_KEY=admin123
    volumes:
      - ./server/logs:/app/logs
    restart: unless-stopped

  client:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - server
    restart: unless-stopped

  admin:
    build: ./admin
    ports:
      - "8080:80"
    depends_on:
      - server
    restart: unless-stopped
```

### 部署命令
```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## ☁️ 方案四：云平台部署

### AWS 部署

#### 前端 (S3 + CloudFront)
```bash
# 构建前端
npm run build

# 上传到 S3
aws s3 sync dist/ s3://your-bucket-name

# 配置 CloudFront 分发
```

#### 后端 (EC2 + PM2)
```bash
# 在 EC2 实例上
git clone your-repo
cd server
npm install --production

# 使用 PM2 管理进程
npm install -g pm2
pm2 start server.js --name "sky-journey-server"
pm2 startup
pm2 save
```

### Google Cloud Platform

```yaml
# app.yaml (App Engine)
runtime: nodejs18

env_variables:
  NODE_ENV: production
  CLIENT_URL: https://your-frontend-url
  ADMIN_KEY: your-admin-key

automatic_scaling:
  min_instances: 1
  max_instances: 10
```

## 🔧 CI/CD 自动部署

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd client
          npm ci
          
      - name: Build
        run: |
          cd client
          npm run build
        env:
          VITE_SERVER_URL: ${{ secrets.SERVER_URL }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./client

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@v1.0.0
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: ${{ secrets.RAILWAY_SERVICE_ID }}
```

## 🌍 域名配置

### 自定义域名设置

1. **购买域名** (推荐 Namecheap, Cloudflare)

2. **DNS 配置**
```
# 前端
CNAME www your-frontend.vercel.app
A @ 76.76.19.19

# 后端
CNAME api your-backend.railway.app

# 管理后台
CNAME admin your-admin.vercel.app
```

3. **SSL 证书**
大多数平台会自动提供 SSL 证书

## 🔒 安全配置

### 环境变量安全

```bash
# 生产环境必须设置的环境变量
NODE_ENV=production
ADMIN_KEY=your-very-secure-random-key
CLIENT_URL=https://your-actual-domain.com
LOG_LEVEL=warn
```

### 安全建议

1. **使用强密码**作为 ADMIN_KEY
2. **启用 HTTPS** (平台通常自动提供)
3. **设置 CORS** 只允许前端域名
4. **限制日志级别** 在生产环境
5. **定期更新依赖** `npm audit fix`

## 📊 监控与日志

### 应用监控

```javascript
// 添加健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
})
```

### 日志管理

```javascript
// 生产环境日志配置
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
```

## 🔄 备份与恢复

### 数据备份

```bash
# 导出游戏日志
curl -H "x-admin-key: your-admin-key" \
     https://your-api.com/api/admin/export/logs > backup.json
```

### 数据库备份 (如果使用)

```bash
# MongoDB
mongodump --uri="mongodb://your-connection-string"

# PostgreSQL
pg_dump your-database > backup.sql
```

## 🚨 故障排除

### 常见部署问题

1. **构建失败**
   - 检查 Node.js 版本兼容性
   - 确认所有依赖已安装

2. **Socket 连接失败**
   - 确认后端支持 WebSocket
   - 检查 CORS 配置

3. **环境变量未生效**
   - 重新部署应用
   - 检查变量名拼写

### 性能优化

```javascript
// 启用 gzip 压缩
app.use(compression())

// 设置缓存头
app.use(express.static('public', {
  maxAge: '1d'
}))
```

## 📞 部署支持

需要部署帮助时：
1. 检查平台文档
2. 查看部署日志
3. 验证环境配置
4. 测试网络连接

---

🚀 选择适合你的部署方案，开始你们的云端爱情之旅！
