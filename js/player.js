class Player {
    constructor(x, y, character = 'harry') {
        this.x = x;
        this.y = y;
        this.width = 80; // Увеличиваем размер в 2 раза
        this.height = 80; // Увеличиваем размер в 2 раза
        this.speed = 300; // пикселей в секунду
        this.color = '#FF6B6B';
        this.facingRight = true; // Направление персонажа
        this.character = character; // Выбранный персонаж
        
        // Загрузка изображения в зависимости от персонажа
        this.image = new Image();
        this.setCharacter(character);
        this.imageLoaded = false;
        
        // Обработчик загрузки изображения
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        
        // Обработчик ошибки загрузки
        this.image.onerror = () => {
            console.warn(`Не удалось загрузить изображение для ${character}, используется стандартная отрисовка`);
            this.imageLoaded = false;
        };
    }
    
    setCharacter(character) {
        this.character = character;
        switch(character) {
            case 'harry':
                this.image.src = 'assets/images/harry550.png';
                break;
            case 'germiona':
                this.image.src = 'assets/images/germiona.png';
                break;
            default:
                this.image.src = 'assets/images/harry550.png';
                break;
        }
        this.imageLoaded = false;
    }
    
    update(deltaTime, keys, canvasWidth, canvasHeight) {
        const moveDistance = (this.speed * deltaTime) / 1000;
        
        // Движение вверх
        if (keys['ArrowUp'] || keys['KeyW']) {
            this.y -= moveDistance;
        }
        
        // Движение вниз
        if (keys['ArrowDown'] || keys['KeyS']) {
            this.y += moveDistance;
        }
        
        // Движение влево
        if (keys['ArrowLeft'] || keys['KeyA']) {
            this.x -= moveDistance;
            this.facingRight = false; // Поворачиваем влево только при движении
        }
        
        // Движение вправо
        if (keys['ArrowRight'] || keys['KeyD']) {
            this.x += moveDistance;
            this.facingRight = true; // Поворачиваем вправо только при движении
        }
        
        // Если не нажаты клавиши влево/вправо, возвращаемся в положение "вперед"
        if (!(keys['ArrowLeft'] || keys['KeyA']) && !(keys['ArrowRight'] || keys['KeyD'])) {
            this.facingRight = true;
        }
        
        // Ограничение движения в пределах экрана
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > canvasWidth) {
            this.x = canvasWidth - this.width;
        }
        if (this.y < 0) {
            this.y = 0;
        }
        if (this.y + this.height > canvasHeight) {
            this.y = canvasHeight - this.height;
        }
    }
    
    render(ctx, showDebug = true) {
        if (this.imageLoaded) {
            // Отрисовка изображения Гарри Поттера с разворотом
            ctx.save();
            
            if (!this.facingRight) {
                // Разворачиваем изображение по горизонтали
                ctx.scale(-1, 1);
                ctx.drawImage(this.image, -this.x - this.width, this.y, this.width, this.height);
            } else {
                // Обычная отрисовка
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            }
            
            ctx.restore();
        } else {
            // Fallback: отрисовка стандартного персонажа, если изображение не загрузилось
            this.renderFallback(ctx);
        }
        
        // Красная обводка границ персонажа (только если включена отладка)
        if (showDebug) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
    
    renderFallback(ctx) {
        // Основное тело персонажа
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Голова персонажа
        ctx.fillStyle = '#FFE66D';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y - 20, 30, 0, Math.PI * 2); // Увеличиваем размер головы
        ctx.fill();
        
        // Глаза
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 - 10, this.y - 24, 6, 0, Math.PI * 2); // Увеличиваем глаза
        ctx.arc(this.x + this.width / 2 + 10, this.y - 24, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Рот
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4; // Увеличиваем толщину линии
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y - 16, 10, 0, Math.PI); // Увеличиваем рот
        ctx.stroke();
        
        // Руки
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 10, this.y + 20, 16, 40); // Увеличиваем руки
        ctx.fillRect(this.x + this.width - 6, this.y + 20, 16, 40);
        
        // Ноги
        ctx.fillRect(this.x + 10, this.y + this.height, 16, 30); // Увеличиваем ноги
        ctx.fillRect(this.x + this.width - 26, this.y + this.height, 16, 30);
        
        // Оружие (пушка) - теперь направлено вправо
        ctx.fillStyle = '#666';
        ctx.fillRect(this.x + this.width, this.y + this.height / 2 - 4, 30, 8); // Увеличиваем оружие
        
        // Обводка для лучшей видимости
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4; // Увеличиваем толщину обводки
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
} 