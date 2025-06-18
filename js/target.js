class Target {
    constructor(x, y, radius) {
        this.x = x - radius; // Центрируем цель
        this.y = y - radius;
        this.radius = radius;
        this.width = radius * 2;
        this.height = radius * 2;
        this.speed = 100; // та же скорость, что и у облаков
        this.color = '#FF4444';
        this.pulse = 0;
        this.pulseSpeed = 0.1;
        
        // Загружаем изображение дементора
        this.image = new Image();
        this.image.src = 'assets/images/dementor.png';
        this.imageLoaded = false;
        
        // Обработчик загрузки изображения
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        
        // Обработчик ошибки загрузки
        this.image.onerror = () => {
            console.warn('Не удалось загрузить изображение dementor.png, используется стандартная отрисовка');
            this.imageLoaded = false;
        };
    }
    
    update(deltaTime) {
        // Движение цели вместе с облаком
        const moveDistance = (this.speed * deltaTime) / 1000;
        this.x -= moveDistance;
        
        // Пульсация для привлечения внимания
        this.pulse += this.pulseSpeed * deltaTime / 16;
    }
    
    render(ctx, showDebug = true) {
        const pulseSize = Math.sin(this.pulse) * 2;
        const currentRadius = this.radius + pulseSize;
        
        if (this.imageLoaded) {
            // Отрисовка изображения дементора с пульсацией
            ctx.save();
            
            // Добавляем свечение
            ctx.shadowColor = '#FF0000';
            ctx.shadowBlur = 15 + pulseSize * 2;
            
            // Отрисовка изображения с масштабированием
            ctx.drawImage(
                this.image, 
                this.x - pulseSize, 
                this.y - pulseSize, 
                this.width + pulseSize * 2, 
                this.height + pulseSize * 2
            );
            
            ctx.restore();
        } else {
            // Fallback - стандартная отрисовка, если изображение не загрузилось
            // Внешний круг (обводка)
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x + this.radius, this.y + this.radius, currentRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Внутренний круг
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x + this.radius, this.y + this.radius, currentRadius - 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Центральная точка
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(this.x + this.radius, this.y + this.radius, currentRadius / 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Свечение
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(this.x + this.radius, this.y + this.radius, currentRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        // Красная обводка границ цели (прямоугольник) - только если включена отладка
        if (showDebug) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
} 