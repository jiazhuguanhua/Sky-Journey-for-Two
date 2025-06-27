#!/bin/bash

# Sky Journey for Two 部署脚本
echo "🌟 开始部署 Sky Journey for Two..."

# 检查 Node.js 环境
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js"
    exit 1
fi

# 检查 npm 环境
if ! command -v npm &> /dev/null; then
    echo "❌ 请先安装 npm"
    exit 1
fi

echo "✅ Node.js 环境检查通过"

# 安装依赖
echo "📦 安装依赖包..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 构建项目
echo "🔨 构建生产版本..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建完成"

# 启动预览服务器（可选）
echo "🚀 启动预览服务器..."
echo "📱 访问 http://localhost:4173 查看应用"
echo "🛑 按 Ctrl+C 停止服务器"

npm run preview
