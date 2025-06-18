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
    let lastTapTime = 0; // Время последнего касания для двойного касания
    let isDoubleTap = false; // Флаг двойного касания
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        
        // Получаем правильные координаты касания относительно canvas
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        
        touchStartX = touchX;
        touchStartY = touchY;
        isMoving = false;
        
        if (game.gameState === 'playing') {
            const canvasWidth = canvas.width;
            
            // Проверяем, касается ли палец персонажа или его области
            const player = game.player;
            const playerArea = {
                x: player.x - 30, // Расширяем область персонажа для удобства
                y: player.y - 30,
                width: player.width + 60,
                height: player.height + 60
            };
            
            isTouchingPlayer = (
                touchX >= playerArea.x && 
                touchX <= playerArea.x + playerArea.width &&
                touchY >= playerArea.y && 
                touchY <= playerArea.y + playerArea.height
            );
            
            // Проверяем двойное касание персонажа для стрельбы
            const currentTime = Date.now();
            if (isTouchingPlayer && currentTime - lastTapTime < 300) {
                isDoubleTap = true;
                game.shoot(); // Стреляем при двойном касании персонажа
                console.log('Double tap - shooting!');
            }
            lastTapTime = currentTime;
            
            // Стрельба при касании двумя пальцами одновременно
            if (e.touches.length >= 2) {
                game.shoot();
                console.log('Two finger tap - shooting!');
            }
            
            console.log('Touch start:', {
                touchX, touchY,
                playerX: player.x, playerY: player.y,
                playerArea,
                isTouchingPlayer,
                isDoubleTap,
                touchCount: e.touches.length
            });
            
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
            
            // Получаем правильные координаты касания относительно canvas
            const rect = canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            // Получаем позицию персонажа
            const player = game.player;
            
            // Сброс всех направлений
            game.keys['ArrowUp'] = false;
            game.keys['ArrowDown'] = false;
            game.keys['ArrowLeft'] = false;
            game.keys['ArrowRight'] = false;
            
            // Альтернативный способ: прямое позиционирование персонажа под пальцем
            const targetX = touchX - player.width / 2;
            const targetY = touchY - player.height / 2;
            
            // Ограничиваем движение в пределах экрана
            const maxX = canvas.width - player.width;
            const maxY = canvas.height - player.height;
            
            const clampedX = Math.max(0, Math.min(targetX, maxX));
            const clampedY = Math.max(0, Math.min(targetY, maxY));
            
            // Плавно перемещаем персонажа к цели
            const moveSpeed = 0.3; // Скорость следования (0-1)
            player.x += (clampedX - player.x) * moveSpeed;
            player.y += (clampedY - player.y) * moveSpeed;
            
            isMoving = true;
            
            console.log('Direct movement:', {
                touchX, touchY,
                targetX, targetY,
                clampedX, clampedY,
                playerX: player.x, playerY: player.y
            });
        }
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        
        // Если не было движения и касались персонажа, это может быть двойное касание для стрельбы
        if (!isMoving && isTouchingPlayer && !isDoubleTap) {
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
        isDoubleTap = false; // Сбрасываем флаг двойного касания
    });
    
    // Переменная для отслеживания двойного касания
    let lastTap = 0;
    
    console.log('Игра "Гарри Поттер: Облачная Стрельба" успешно загружена!');
}); 