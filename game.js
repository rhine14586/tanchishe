// 游戏配置
const config = {
    gridSize: 20,
    gameSpeed: 150,
    initialSnakeLength: 3,
    useHighResTextures: true,  // 使用高分辨率贴图
    enableAnimations: true     // 启用动画效果
};

// 游戏状态
let snake = [];
let food = null;
let direction = 'right';
let nextDirection = 'right';
let gameLoop = null;
let animationLoop = null;
let score = 0;
let gameState = 'start'; // 'start', 'playing', 'gameover'

// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// 初始化游戏
function initGame() {
    // 初始化动画
    if (config.enableAnimations) {
        animations.init();
    }
    
    // 设置游戏状态为开始
    gameState = 'start';
    
    // 初始化蛇
    snake = [];
    for (let i = config.initialSnakeLength - 1; i >= 0; i--) {
        snake.push({ x: i, y: 0 });
    }
    
    // 生成第一个食物
    generateFood();
    
    // 重置分数
    score = 0;
    updateScore();
    
    // 清除之前的游戏循环
    if (gameLoop) clearInterval(gameLoop);
    if (animationLoop) cancelAnimationFrame(animationLoop);
    
    // 显示开始动画
    if (config.enableAnimations) {
        animations.playStartAnimation(ctx, canvas, function() {
            startGameLoop();
        });
    } else {
        startGameLoop();
    }
}

// 生成食物
function generateFood() {
    while (true) {
        food = {
            x: Math.floor(Math.random() * (canvas.width / config.gridSize)),
            y: Math.floor(Math.random() * (canvas.height / config.gridSize))
        };
        
        // 确保食物不会生成在蛇身上
        if (!snake.some(segment => segment.x === food.x && segment.y === food.y)) {
            break;
        }
    }
}

// 更新分数
function updateScore() {
    scoreElement.textContent = score;
}

// 开始游戏循环
function startGameLoop() {
    gameState = 'playing';
    gameLoop = setInterval(gameStep, config.gameSpeed);
    
    // 如果启用动画，启动动画循环
    if (config.enableAnimations) {
        animationLoop = requestAnimationFrame(animationFrame);
    }
}

// 动画帧
function animationFrame() {
    // 更新粒子
    if (config.enableAnimations) {
        animations.updateParticles();
    }
    
    // 渲染游戏
    render();
    
    // 继续动画循环
    animationLoop = requestAnimationFrame(animationFrame);
}

// 游戏步骤
function gameStep() {
    // 如果游戏不在进行中，不执行游戏逻辑
    if (gameState !== 'playing') return;
    
    // 更新方向
    direction = nextDirection;
    
    // 获取蛇头
    const head = { ...snake[0] };
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // 检查碰撞
    if (isCollision(head)) {
        gameOver();
        return;
    }
    
    // 移动蛇
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        
        // 创建食物爆炸效果
        if (config.enableAnimations) {
            animations.createFoodExplosion(food.x, food.y);
        }
        
        generateFood();
    } else {
        snake.pop();
    }
    
    // 如果没有启用动画循环，在这里渲染游戏
    if (!config.enableAnimations) {
        render();
    }
}

// 碰撞检测
function isCollision(head) {
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= canvas.width / config.gridSize ||
        head.y < 0 || head.y >= canvas.height / config.gridSize) {
        return true;
    }
    
    // 检查自身碰撞
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
}

// 游戏结束
function gameOver() {
    clearInterval(gameLoop);
    gameState = 'gameover';
    
    if (config.enableAnimations) {
        // 播放游戏结束动画
        animations.playGameOverAnimation(ctx, canvas, score, function() {
            // 等待用户按键重新开始
            document.addEventListener('keydown', restartGame, { once: true });
        });
    } else {
        alert(`游戏结束！得分：${score}`);
        initGame();
    }
}

// 重新开始游戏
function restartGame() {
    initGame();
}

// 渲染游戏
function render() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制数字雨背景效果
    if (config.enableAnimations) {
        animations.renderDigitalRain(ctx, canvas);
    }
    
    // 绘制网格背景
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= canvas.width; i += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i <= canvas.height; i += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    // 根据是否使用高分辨率贴图选择渲染方式
    if (config.useHighResTextures && config.enableAnimations) {
        // 使用高分辨率贴图渲染蛇和食物
        animations.renderSnake(ctx, snake, direction);
        animations.renderFood(ctx, food);
    } else {
        // 使用原始方式渲染蛇
        snake.forEach(segment => {
            // 霓虹光晕效果
            const gradient = ctx.createRadialGradient(
                segment.x * config.gridSize + config.gridSize/2,
                segment.y * config.gridSize + config.gridSize/2,
                0,
                segment.x * config.gridSize + config.gridSize/2,
                segment.y * config.gridSize + config.gridSize/2,
                config.gridSize
            );
            gradient.addColorStop(0, '#0ff');
            gradient.addColorStop(0.6, '#0aa');
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(
                segment.x * config.gridSize - config.gridSize/2,
                segment.y * config.gridSize - config.gridSize/2,
                config.gridSize * 2,
                config.gridSize * 2
            );
            
            // 蛇身主体
            ctx.fillStyle = '#0ff';
            ctx.fillRect(
                segment.x * config.gridSize,
                segment.y * config.gridSize,
                config.gridSize - 1,
                config.gridSize - 1
            );
        });
        
        // 绘制食物
        // 食物光晕效果
        const foodGradient = ctx.createRadialGradient(
            food.x * config.gridSize + config.gridSize/2,
            food.y * config.gridSize + config.gridSize/2,
            0,
            food.x * config.gridSize + config.gridSize/2,
            food.y * config.gridSize + config.gridSize/2,
            config.gridSize
        );
        foodGradient.addColorStop(0, '#ff0080');
        foodGradient.addColorStop(0.6, '#800040');
        foodGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = foodGradient;
        ctx.fillRect(
            food.x * config.gridSize - config.gridSize/2,
            food.y * config.gridSize - config.gridSize/2,
            config.gridSize * 2,
            config.gridSize * 2
        );
        
        // 食物主体
        ctx.fillStyle = '#ff0080';
        ctx.fillRect(
            food.x * config.gridSize,
            food.y * config.gridSize,
            config.gridSize - 1,
            config.gridSize - 1
        );
    }
    
    // 绘制粒子效果
    if (config.enableAnimations) {
        animations.renderParticles(ctx);
    }
}

// 键盘控制
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
});

// 开始游戏
initGame();