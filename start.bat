@echo off
echo ======================================
echo    Sky Journey for Two - 启动脚本
echo ======================================
echo.

echo 正在启动情侣飞行棋游戏...
echo.

echo [1/3] 安装服务器依赖...
cd server
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo 服务器依赖安装失败！
        pause
        exit /b 1
    )
) else (
    echo 服务器依赖已存在，跳过安装。
)

echo [2/3] 安装客户端依赖...
cd ..\client
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo 客户端依赖安装失败！
        pause
        exit /b 1
    )
) else (
    echo 客户端依赖已存在，跳过安装。
)

echo [3/3] 安装管理后台依赖...
cd ..\admin
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo 管理后台依赖安装失败！
        pause
        exit /b 1
    )
) else (
    echo 管理后台依赖已存在，跳过安装。
)

echo.
echo ✅ 所有依赖安装完成！
echo.

echo 正在启动所有服务...
echo.

REM 启动服务器
echo 🖥️  启动后端服务器...
start "Sky Journey 后端服务器" cmd /k "cd ..\server && echo 后端服务器启动中... && npm run dev"

REM 等待服务器启动
timeout /t 4 /nobreak >nul

REM 启动客户端
echo 🎮 启动游戏客户端...
start "Sky Journey 游戏客户端" cmd /k "cd ..\client && echo 游戏客户端启动中... && npm run dev"

REM 等待客户端启动
timeout /t 3 /nobreak >nul

REM 启动管理后台
echo 🛠️  启动管理后台...
start "Sky Journey 管理后台" cmd /k "cd ..\admin && echo 管理后台启动中... && npm run dev"

echo.
echo ======================================
echo           🚀 启动完成！
echo ======================================
echo.
echo 📱 游戏客户端: http://localhost:5173
echo 🛠️  管理后台:   http://localhost:5174
echo 🖥️  后端服务器: http://localhost:3001
echo.
echo 💡 提示：
echo   - 打开浏览器访问游戏客户端开始游戏
echo   - 管理员密钥默认为: admin123
echo   - 关闭此窗口不会停止服务
echo   - 要停止服务请关闭对应的命令行窗口
echo.
echo ❤️  享受与您的伴侣一起玩游戏的时光！
echo.
pause
