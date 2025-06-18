class Lightning {
    constructor(x, y, speed, height) {
        this.x = x;
        this.y = y - height / 2; // Центрируем молнию относительно позиции стрельбы
        this.width = Math.abs(speed); // Используем абсолютное значение скорости как ширину
        this.height = height;
        this.speed = speed * 40; // Увеличиваем скорость в 40 раз для быстрого движения
        this.color = '#00FFFF'; // Голубой цвет для молнии
        this.pulse = 0;
        this.pulseSpeed = 0.15;
        this.originalWidth = this.width;
        this.originalHeight = height;
    }
    
    update(deltaTime) {
        // Движение молнии в зависимости от направления
        const moveDistance = (this.speed * deltaTime) / 1000;
        this.x += moveDistance;
        
        // Пульсация
        this.pulse += this.pulseSpeed * deltaTime / 16;
    }
    
    render(ctx, showDebug = true) {
        const pulseSize = Math.sin(this.pulse) * 3;
        const currentWidth = this.originalWidth + pulseSize;
        const currentHeight = this.originalHeight + pulseSize;
        
        // Внешнее свечение (самое большое)
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20 + pulseSize * 2;
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.fillRect(this.x - pulseSize, this.y - pulseSize, currentWidth + pulseSize * 2, currentHeight + pulseSize * 2);
        
        // Среднее свечение
        ctx.shadowBlur = 15 + pulseSize;
        ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.fillRect(this.x - pulseSize / 2, this.y - pulseSize / 2, currentWidth + pulseSize, currentHeight + pulseSize);
        
        // Основная молния
        ctx.shadowBlur = 10;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, currentWidth, currentHeight);
        
        // Яркая сердцевина молнии
        ctx.shadowBlur = 5;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + currentWidth * 0.2, this.y + currentHeight * 0.2, currentWidth * 0.6, currentHeight * 0.6);
        
        // Сброс тени
        ctx.shadowBlur = 0;
        
        // Электрические разряды (случайные линии)
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const startX = this.x + Math.random() * currentWidth;
            const startY = this.y + Math.random() * currentHeight;
            const endX = startX + (Math.random() - 0.5) * 20;
            const endY = startY + (Math.random() - 0.5) * 20;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        // Хвост молнии (эффект движения) - зависит от направления
        ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
        if (this.speed > 0) {
            // Движение вправо - хвост слева
            ctx.fillRect(this.x - currentWidth / 2, this.y, currentWidth / 2, currentHeight);
        } else {
            // Движение влево - хвост справа
            ctx.fillRect(this.x + currentWidth, this.y, currentWidth / 2, currentHeight);
        }
        
        // Дополнительные искры
        for (let i = 0; i < 5; i++) {
            const sparkX = this.x + Math.random() * currentWidth;
            const sparkY = this.y + Math.random() * currentHeight;
            const sparkSize = Math.random() * 3 + 1;
            
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Красная обводка границ молнии (только если включена отладка)
        if (showDebug) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, currentWidth, currentHeight);
        }
    }
} 