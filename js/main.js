// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    
    // Проверка поддержки Canvas
    if (!canvas.getContext) {
        alert('Ваш браузер не поддерживает Canvas. Пожалуйста, обновите браузер.');
        return;
    }
    
    // Создание экземпляра игры
    const game = new Game(canvas);
    
    // Адаптация размера canvas для мобильных устройств
    function resizeCanvas() {
        const container = document.querySelector('.game-container');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        if (window.innerWidth <= 768) {
            // На мобильных устройствах используем полный экран
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        } else {
            // На десктопе используем фиксированный размер
            canvas.width = 800;
            canvas.height = 600;
        }
        
        // Обновляем размеры в игре
        if (game) {
            game.width = canvas.width;
            game.height = canvas.height;
        }
    }
    
    // Обработка изменения размера окна
    window.addEventListener('resize', resizeCanvas);
    
    // Первоначальная настройка размера
    resizeCanvas();
    
    // Предотвращение контекстного меню на canvas
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Обработка касаний для мобильных устройств
    let touchStartX = 0;
    let touchStartY = 0;
    let isMoving = false;
    let isTouchingPlayer = false; // Флаг для отслеживания касания персонажа
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        isMoving = false;
        
        if (game.gameState === 'playing') {
            const canvasWidth = canvas.width;
            const touchX = touch.clientX;
            const touchY = touch.clientY;
            
            // Проверяем, касается ли палец персонажа или его области
            const player = game.player;
            const playerArea = {
                x: player.x - 20, // Расширяем область персонажа для удобства
                y: player.y - 20,
                width: player.width + 40,
                height: player.height + 40
            };
            
            isTouchingPlayer = (
                touchX >= playerArea.x && 
                touchX <= playerArea.x + playerArea.width &&
                touchY >= playerArea.y && 
                touchY <= playerArea.y + playerArea.height
            );
            
            // Стрельба при касании правой части экрана (только если не касаемся персонажа)
            if (!isTouchingPlayer && touchX > canvasWidth * 0.67) {
                game.shoot();
            }
        }
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (game.gameState === 'playing' && isTouchingPlayer) {
            const touch = e.touches[0];
            const touchX = touch.clientX;
            const touchY = touch.clientY;
            
            // Получаем позицию персонажа
            const player = game.player;
            
            // Сброс всех направлений
            game.keys['ArrowUp'] = false;
            game.keys['ArrowDown'] = false;
            game.keys['ArrowLeft'] = false;
            game.keys['ArrowRight'] = false;
            
            // Определяем направление движения относительно текущей позиции персонажа
            const deltaX = touchX - (player.x + player.width / 2);
            const deltaY = touchY - (player.y + player.height / 2);
            
            // Минимальное расстояние для начала движения
            const minDistance = 10;
            
            if (Math.abs(deltaX) > minDistance || Math.abs(deltaY) > minDistance) {
                isMoving = true;
                
                // Устанавливаем направление движения
                if (Math.abs(deltaY) > Math.abs(deltaX)) {
                    // Вертикальное движение
                    if (deltaY > 0) {
                        game.keys['ArrowDown'] = true;
                    } else {
                        game.keys['ArrowUp'] = true;
                    }
                } else {
                    // Горизонтальное движение
                    if (deltaX > 0) {
                        game.keys['ArrowRight'] = true;
                    } else {
                        game.keys['ArrowLeft'] = true;
                    }
                }
            }
        }
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        
        // Если не было движения и касались персонажа, это может быть двойное касание для стрельбы
        if (!isMoving && isTouchingPlayer) {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 500 && tapLength > 0) {
                // Двойное касание персонажа - стрельба
                if (game.gameState === 'playing') {
                    game.shoot();
                }
            }
            lastTap = currentTime;
        }
        
        // Сброс всех направлений движения
        game.keys['ArrowUp'] = false;
        game.keys['ArrowDown'] = false;
        game.keys['ArrowLeft'] = false;
        game.keys['ArrowRight'] = false;
        isMoving = false;
        isTouchingPlayer = false;
    });
    
    // Переменная для отслеживания двойного касания
    let lastTap = 0;
    
    console.log('Игра "Гарри Поттер: Облачная Стрельба" успешно загружена!');
}); 