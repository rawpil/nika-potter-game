class Cloud {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = 100; // Возвращаем прежнюю скорость
        this.width = size * 1.5; // Уменьшаем с 2 до 1.5 для менее растянутых облаков
        this.height = size;
        
        // Загружаем изображение облака
        this.image = new Image();
        this.image.src = 'assets/images/cloud-nobg.png';
    }
    
    update(deltaTime) {
        this.x -= this.speed * (deltaTime / 1000);
    }
    
    render(ctx, showDebug = false) {
        // Отрисовка изображения облака с прозрачностью
        if (this.image.complete) {
            ctx.save();
            ctx.globalAlpha = 0.8; // Добавляем прозрачность
            ctx.drawImage(
                this.image, 
                this.x, 
                this.y, 
                this.width, 
                this.height
            );
            ctx.restore();
        } else {
            // Fallback - белый прямоугольник с прозрачностью, если изображение не загрузилось
            ctx.save();
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        }
        
        // Отладочная информация
        if (showDebug) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
} 