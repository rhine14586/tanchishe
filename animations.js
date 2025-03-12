// 动画效果模块
const animations = {
    // 粒子系统
    particles: [],
    
    // 初始化动画
    init: function() {
        // 预加载图像
        this.loadImages();
    },
    
    // 预加载所有图像
    loadImages: function() {
        this.images = {
            snakeHead: new Image(),
            snakeBody: new Image(),
            snakeTail: new Image(),
            food: new Image()
        };
        
        this.images.snakeHead.src = 'assets/images/snake_head.svg';
        this.images.snakeBody.src = 'assets/images/snake_body.svg';
        this.images.snakeTail.src = 'assets/images/snake_tail.svg';
        this.images.food.src = 'assets/images/food.svg';
    },
    
    // 创建食物吃掉时的粒子爆炸效果
    createFoodExplosion: function(x, y) {
        const particleCount = 20;
        const colors = ['#ff0080', '#ff00ff', '#ff3399', '#ff66b2'];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            const size = 2 + Math.random() * 3;
            const life = 30 + Math.random() * 30;
            
            this.particles.push({
                x: x * config.gridSize + config.gridSize / 2,
                y: y * config.gridSize + config.gridSize / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: life,
                maxLife: life
            });
        }
    },
    
    // 更新所有粒子
    updateParticles: function() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            // 如果粒子生命周期结束，从数组中移除
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },
    
    // 绘制所有粒子
    renderParticles: function(ctx) {
        ctx.save();
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            const alpha = p.life / p.maxLife;
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    },
    
    // 绘制蛇
    renderSnake: function(ctx, snake, direction) {
        // 绘制蛇身
        for (let i = 1; i < snake.length - 1; i++) {
            const segment = snake[i];
            ctx.drawImage(
                this.images.snakeBody,
                segment.x * config.gridSize - config.gridSize/4,
                segment.y * config.gridSize - config.gridSize/4,
                config.gridSize * 1.5,
                config.gridSize * 1.5
            );
        }
        
        // 绘制蛇尾
        if (snake.length > 1) {
            const tail = snake[snake.length - 1];
            ctx.drawImage(
                this.images.snakeTail,
                tail.x * config.gridSize - config.gridSize/4,
                tail.y * config.gridSize - config.gridSize/4,
                config.gridSize * 1.5,
                config.gridSize * 1.5
            );
        }
        
        // 绘制蛇头
        const head = snake[0];
        
        // 保存当前上下文状态
        ctx.save();
        
        // 移动到蛇头中心
        ctx.translate(
            head.x * config.gridSize + config.gridSize/2,
            head.y * config.gridSize + config.gridSize/2
        );
        
        // 根据方向旋转
        let rotation = 0;
        switch(direction) {
            case 'up': rotation = -Math.PI/2; break;
            case 'down': rotation = Math.PI/2; break;
            case 'left': rotation = Math.PI; break;
            case 'right': rotation = 0; break;
        }
        ctx.rotate(rotation);
        
        // 绘制蛇头
        ctx.drawImage(
            this.images.snakeHead,
            -config.gridSize * 0.75,
            -config.gridSize * 0.75,
            config.gridSize * 1.5,
            config.gridSize * 1.5
        );
        
        // 恢复上下文状态
        ctx.restore();
    },
    
    // 绘制食物
    renderFood: function(ctx, food) {
        // 添加脉动效果
        const pulseFactor = 1 + 0.1 * Math.sin(Date.now() / 200);
        
        ctx.drawImage(
            this.images.food,
            food.x * config.gridSize - config.gridSize/4 * pulseFactor,
            food.y * config.gridSize - config.gridSize/4 * pulseFactor,
            config.gridSize * 1.5 * pulseFactor,
            config.gridSize * 1.5 * pulseFactor
        );
    },
    
    // 游戏开始动画
    playStartAnimation: function(ctx, canvas, callback) {
        let alpha = 1;
        const fadeSpeed = 0.05;
        
        const animate = () => {
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 显示游戏标题
            ctx.fillStyle = '#0ff';
            ctx.font = '30px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText('贪吃蛇', canvas.width/2, canvas.height/2 - 20);
            
            // 显示开始提示
            ctx.font = '16px Orbitron';
            ctx.fillText('按任意方向键开始', canvas.width/2, canvas.height/2 + 20);
            
            alpha -= fadeSpeed;
            
            if (alpha > 0) {
                requestAnimationFrame(animate);
            } else {
                if (callback) callback();
            }
        };
        
        animate();
    },
    
    // 游戏结束动画
    playGameOverAnimation: function(ctx, canvas, score, callback) {
        let alpha = 0;
        const fadeSpeed = 0.05;
        
        const animate = () => {
            // 清空画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 绘制半透明黑色背景
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 显示游戏结束文本
            ctx.fillStyle = '#ff0080';
            ctx.font = '30px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText('游戏结束', canvas.width/2, canvas.height/2 - 40);
            
            // 显示分数
            ctx.fillStyle = '#0ff';
            ctx.font = '24px Orbitron';
            ctx.fillText(`得分: ${score}`, canvas.width/2, canvas.height/2);
            
            // 显示重新开始提示
            ctx.font = '16px Orbitron';
            ctx.fillText('按任意键重新开始', canvas.width/2, canvas.height/2 + 40);
            
            alpha += fadeSpeed;
            
            if (alpha < 0.8) {
                requestAnimationFrame(animate);
            } else {
                if (callback) callback();
            }
        };
        
        animate();
    },
    
    // 绘制数字雨背景
    renderDigitalRain: function(ctx, canvas) {
        // 如果数字雨数组不存在，初始化它
        if (!this.digitalRain) {
            this.digitalRain = [];
            const columns = Math.floor(canvas.width / 20);
            
            for (let i = 0; i < columns; i++) {
                this.digitalRain[i] = canvas.height + Math.random() * 100;
            }
        }
        
        // 半透明黑色背景，形成拖尾效果
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 设置文本样式
        ctx.fillStyle = '#0fa';
        ctx.font = '15px monospace';
        
        // 循环绘制每一列
        for (let i = 0; i < this.digitalRain.length; i++) {
            // 随机字符
            const text = String.fromCharCode(0x30A0 + Math.random() * 96);
            
            // 绘制字符
            ctx.fillText(text, i * 20, this.digitalRain[i]);
            
            // 如果该列到达底部或随机重置，将其重置到顶部
            if (this.digitalRain[i] > canvas.height + 100 || Math.random() > 0.99) {
                this.digitalRain[i] = 0;
            }
            
            // 更新位置
            this.digitalRain[i] += 1;
        }
    }
};