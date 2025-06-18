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
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        isMoving = false;
        
        // Стрельба при касании правой части экрана
        if (game.gameState === 'playing') {
            const canvasWidth = canvas.width;
            const touchX = touch.clientX;
            
            // Если касание в правой трети экрана - стреляем
            if (touchX > canvasWidth * 0.67) {
                game.shoot();
            }
        }
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (game.gameState === 'playing') {
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            
            // Определяем направление движения на основе большего смещения
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);
            
            if (absDeltaX > 10 || absDeltaY > 10) {
                isMoving = true;
                
                // Сброс всех направлений
                game.keys['ArrowUp'] = false;
                game.keys['ArrowDown'] = false;
                game.keys['ArrowLeft'] = false;
                game.keys['ArrowRight'] = false;
                
                // Устанавливаем направление движения
                if (absDeltaY > absDeltaX) {
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
        
        // Если не было движения, это может быть двойное касание для стрельбы (резервный метод)
        if (!isMoving) {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 500 && tapLength > 0) {
                // Двойное касание - стрельба (только если не было касания в правой части)
                if (game.gameState === 'playing') {
                    const touch = e.changedTouches[0];
                    const canvasWidth = canvas.width;
                    const touchX = touch.clientX;
                    
                    // Стреляем только если касание было не в правой части экрана
                    if (touchX <= canvasWidth * 0.67) {
                        game.shoot();
                    }
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
    });
    
    // Переменная для отслеживания двойного касания
    let lastTap = 0;
    
    console.log('Игра "Гарри Поттер: Облачная Стрельба" успешно загружена!');
}); 