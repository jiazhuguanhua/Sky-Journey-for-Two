#!/bin/bash

echo "======================================"
echo "   Sky Journey for Two - 启动脚本"
echo "======================================"
echo

echo "正在启动情侣飞行棋游戏..."
echo

# 函数：检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查Node.js和npm
if ! command_exists node; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ 错误: 未找到 npm，请先安装 npm"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"
echo

# 安装依赖
echo "[1/3] 安装服务器依赖..."
cd server
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 服务器依赖安装失败！"
        exit 1
    fi
else
    echo "✅ 服务器依赖已存在，跳过安装。"
fi

echo "[2/3] 安装客户端依赖..."
cd ../client
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 客户端依赖安装失败！"
        exit 1
    fi
else
    echo "✅ 客户端依赖已存在，跳过安装。"
fi

echo "[3/3] 安装管理后台依赖..."
cd ../admin
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 管理后台依赖安装失败！"
        exit 1
    fi
else
    echo "✅ 管理后台依赖已存在，跳过安装。"
fi

echo
echo "✅ 所有依赖安装完成！"
echo

echo "正在启动所有服务..."
echo

# 启动服务器
echo "🖥️  启动后端服务器..."
cd ../server
npm run dev &
SERVER_PID=$!
echo "后端服务器 PID: $SERVER_PID"

# 等待服务器启动
sleep 4

# 启动客户端
echo "🎮 启动游戏客户端..."
cd ../client
npm run dev &
CLIENT_PID=$!
echo "游戏客户端 PID: $CLIENT_PID"

# 等待客户端启动
sleep 3

# 启动管理后台
echo "🛠️  启动管理后台..."
cd ../admin
npm run dev &
ADMIN_PID=$!
echo "管理后台 PID: $ADMIN_PID"

# 等待所有服务启动
sleep 3

echo
echo "======================================"
echo "           🚀 启动完成！"
echo "======================================"
echo
echo "📱 游戏客户端: http://localhost:5173"
echo "🛠️  管理后台:   http://localhost:5174"
echo "🖥️  后端服务器: http://localhost:3001"
echo
echo "💡 提示："
echo "  - 打开浏览器访问游戏客户端开始游戏"
echo "  - 管理员密钥默认为: admin123"
echo "  - 按 Ctrl+C 停止所有服务"
echo
echo "❤️  享受与您的伴侣一起玩游戏的时光！"
echo

# 处理中断信号
trap "echo; echo '正在停止所有服务...'; kill $SERVER_PID $CLIENT_PID $ADMIN_PID 2>/dev/null; echo '✅ 所有服务已停止'; exit 0" INT TERM

# 检查进程状态
check_processes() {
    local active=0
    
    if kill -0 $SERVER_PID 2>/dev/null; then
        active=$((active + 1))
    else
        echo "⚠️  后端服务器已停止"
    fi
    
    if kill -0 $CLIENT_PID 2>/dev/null; then
        active=$((active + 1))
    else
        echo "⚠️  游戏客户端已停止"
    fi
    
    if kill -0 $ADMIN_PID 2>/dev/null; then
        active=$((active + 1))
    else
        echo "⚠️  管理后台已停止"
    fi
    
    if [ $active -eq 0 ]; then
        echo "ℹ️  所有服务均已停止"
        exit 0
    fi
}

# 监控进程
while true; do
    sleep 30
    check_processes
done
