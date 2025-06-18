class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Игровое состояние
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.selectedCharacter = 'harry'; // Выбранный персонаж по умолчанию
        
        // Игровые объекты
        this.player = null;
        this.clouds = [];
        this.lightnings = []; // Переименовано с bullets
        this.targets = [];
        
        // Управление
        this.keys = {};
        this.lastTime = 0;
        this.lastDirection = 'forward'; // Направление последнего движения
        
        // Настройки игры
        this.cloudSpawnRate = 2000; // миллисекунды
        this.lastCloudSpawn = 0;
        this.targetSpawnChance = 0.3; // 30% шанс появления цели на облаке
        
        // Настройки коллизий
        this.usePixelCollision = true; // Всегда пиксельные коллизии
        this.showCollisionDebug = false; // По умолчанию не показывать красные границы
        
        this.init();
    }
    
    init() {
        // Инициализация игрока в левой части экрана с выбранным персонажем
        this.player = new Player(50, this.height / 2, this.selectedCharacter);
        
        // Привязка обработчиков событий
        this.bindEvents();
        
        // Запуск игрового цикла
        this.gameLoop();
    }
    
    bindEvents() {
        // Обработка нажатий клавиш
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Обновляем направление при движении
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.lastDirection = 'forward';
            } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.lastDirection = 'backward';
            }
            
            // Стрельба (только пробел)
            if (e.code === 'Space' && this.gameState === 'playing') {
                e.preventDefault();
                this.shoot(this.lastDirection);
            }
            
            // Переключение отображения границ (клавиша B)
            if (e.code === 'KeyB' && this.gameState === 'playing') {
                this.showCollisionDebug = !this.showCollisionDebug;
                console.log('Отображение границ:', this.showCollisionDebug ? 'Включено' : 'Выключено');
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Обработка кнопок меню
        document.getElementById('startButton').addEventListener('click', () => {
            this.showCharacterSelect();
        });
        
        document.getElementById('instructionsButton').addEventListener('click', () => {
            this.showInstructions();
        });
        
        document.getElementById('backButton').addEventListener('click', () => {
            this.showMenu();
        });
        
        document.getElementById('backToMenuButton').addEventListener('click', () => {
            this.showMenu();
        });
        
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('menuButton').addEventListener('click', () => {
            this.showMenu();
        });
        
        // Обработка выбора персонажа
        document.querySelectorAll('.character-option').forEach(option => {
            option.addEventListener('click', () => {
                // Убираем выделение со всех опций
                document.querySelectorAll('.character-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Выделяем выбранную опцию
                option.classList.add('selected');
                
                // Сохраняем выбранного персонажа
                this.selectedCharacter = option.dataset.character;
                
                // Автоматически начинаем игру через небольшую задержку
                setTimeout(() => {
                    this.startGame();
                }, 500);
            });
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        // Очистка игровых объектов
        this.clouds = [];
        this.lightnings = []; // Переименовано с bullets
        this.targets = [];
        
        // Создание игрока с выбранным персонажем
        this.player = new Player(50, this.height / 2, this.selectedCharacter);
        
        // Скрытие всех меню
        document.getElementById('gameMenu').style.display = 'none';
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('characterSelect').style.display = 'none';
        
        this.updateUI();
    }
    
    showInstructions() {
        document.getElementById('gameMenu').style.display = 'none';
        document.getElementById('instructions').style.display = 'block';
    }
    
    showMenu() {
        this.gameState = 'menu';
        document.getElementById('gameMenu').style.display = 'block';
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('characterSelect').style.display = 'none';
    }
    
    showCharacterSelect() {
        this.gameState = 'characterSelect';
        document.getElementById('gameMenu').style.display = 'none';
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('characterSelect').style.display = 'block';
        
        // Сбрасываем выделение персонажей
        document.querySelectorAll('.character-option').forEach(opt => {
            opt.classList.remove('selected');
        });
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
    }
    
    restartGame() {
        this.startGame();
    }
    
    shoot(direction = 'forward') {
        // Молния запускается из метлы в зависимости от направления персонажа
        let lightningX, lightningY, lightningSpeed;
        
        if (direction === 'forward' || this.player.facingRight) {
            // Стрельба вперед (вправо) - из правой части персонажа
            lightningX = this.player.x + this.player.width - 15;
            lightningY = this.player.y + this.player.height / 2;
            lightningSpeed = 15;
        } else {
            // Стрельба назад (влево) - из левой части персонажа
            lightningX = this.player.x + 15;
            lightningY = this.player.y + this.player.height / 2;
            lightningSpeed = -15;
        }
        
        const lightning = new Lightning(
            lightningX,
            lightningY,
            lightningSpeed,
            8
        );
        this.lightnings.push(lightning);
    }
    
    spawnCloud() {
        const now = Date.now();
        if (now - this.lastCloudSpawn > this.cloudSpawnRate) {
            const cloud = new Cloud(
                this.width + 100,
                Math.random() * (this.height - 200) + 50,
                Math.random() * 50 + 30
            );
            
            // Добавляем цель на облако с определенной вероятностью
            if (Math.random() < this.targetSpawnChance) {
                const target = new Target(
                    cloud.x + cloud.width / 2,
                    cloud.y + cloud.height / 2,
                    40 // Увеличиваем радиус до 40 (размер 80x80 как у персонажа)
                );
                this.targets.push(target);
            }
            
            this.clouds.push(cloud);
            this.lastCloudSpawn = now;
        }
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Проверяем, движется ли персонаж влево
        const isMovingLeft = this.keys['ArrowLeft'] || this.keys['KeyA'];
        const timeScale = isMovingLeft ? 0.6 : 1.0; // Замедление до 60% при движении влево
        const adjustedDeltaTime = deltaTime * timeScale;
        
        // Обновление игрока с полным движением (без замедления)
        this.player.update(deltaTime, this.keys, this.width, this.height);
        
        // Спавн облаков (замедляется при движении влево)
        this.spawnCloud();
        
        // Обновление облаков (замедляется при движении влево)
        this.clouds.forEach((cloud, index) => {
            cloud.update(adjustedDeltaTime);
            
            // Удаление облаков, вышедших за пределы экрана
            if (cloud.x + cloud.width < 0) {
                this.clouds.splice(index, 1);
            }
            
            // Проверка столкновения с игроком
            if (this.checkCollision(this.player, cloud)) {
                this.lives--;
                this.clouds.splice(index, 1);
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });
        
        // Обновление молний (без замедления)
        this.lightnings.forEach((lightning, lightningIndex) => {
            lightning.update(deltaTime);
            
            // Удаление молний, вышедших за пределы экрана
            if (lightning.speed > 0 && lightning.x > this.width) {
                // Молния движется вправо и вышла за правую границу
                this.lightnings.splice(lightningIndex, 1);
                return;
            } else if (lightning.speed < 0 && lightning.x + lightning.width < 0) {
                // Молния движется влево и вышла за левую границу
                this.lightnings.splice(lightningIndex, 1);
                return;
            }
            
            // Проверка попадания в цели
            this.targets.forEach((target, targetIndex) => {
                if (this.checkCollision(lightning, target)) {
                    this.score += 10;
                    this.lightnings.splice(lightningIndex, 1);
                    this.targets.splice(targetIndex, 1);
                    this.updateUI();
                }
            });
        });
        
        // Обновление целей (замедляется при движении влево)
        this.targets.forEach((target, index) => {
            target.update(adjustedDeltaTime);
            
            // Удаление целей, вышедших за пределы экрана
            if (target.x < 0) {
                this.targets.splice(index, 1);
                // Штраф за пропущенную цель
                this.score = Math.max(0, this.score - 30);
                this.updateUI();
            }
        });
        
        // Увеличение сложности
        if (this.score > this.level * 100) {
            this.level++;
            this.cloudSpawnRate = Math.max(500, this.cloudSpawnRate - 100);
        }
    }
    
    render() {
        // Очистка canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        if (this.gameState === 'playing') {
            // Отрисовка синего градиентного неба
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#4682B4');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Отрисовка игрока
            this.player.render(this.ctx, this.showCollisionDebug);
            
            // Отрисовка облаков
            this.clouds.forEach(cloud => cloud.render(this.ctx, this.showCollisionDebug));
            
            // Отрисовка молний
            this.lightnings.forEach(lightning => lightning.render(this.ctx, this.showCollisionDebug));
            
            // Отрисовка целей
            this.targets.forEach(target => target.render(this.ctx, this.showCollisionDebug));
        }
    }
    
    checkCollision(obj1, obj2) {
        // Сначала проверяем прямоугольную коллизию для оптимизации
        if (!this.boundingBoxCollision(obj1, obj2)) {
            return false;
        }
        
        // Если включена пиксельная коллизия, используем её
        if (this.usePixelCollision) {
            return this.shapeCollision(obj1, obj2);
        }
        
        // Иначе используем обычную прямоугольную коллизию
        return true;
    }
    
    boundingBoxCollision(obj1, obj2) {
        // Специальная обработка для игрока - уменьшаем верхнюю границу на 10%
        let obj1Y = obj1.y;
        let obj1Height = obj1.height;
        let obj1X = obj1.x;
        let obj1Width = obj1.width;
        
        // Если obj1 - это игрок, уменьшаем границы для более точной коллизии
        if (obj1 === this.player) {
            const topReduction = obj1.height * 0.1; // 10% от высоты
            const sideReduction = obj1.width * 0.1; // 10% от ширины
            obj1Y = obj1.y + topReduction;
            obj1Height = obj1.height - topReduction;
            obj1X = obj1.x + sideReduction;
            obj1Width = obj1.width - sideReduction * 2;
        }
        
        // Уменьшаем размеры второго объекта для более точной коллизии
        let obj2X = obj2.x;
        let obj2Y = obj2.y;
        let obj2Width = obj2.width;
        let obj2Height = obj2.height;
        
        // Уменьшаем границы облаков
        if (obj2.size) {
            const reduction = obj2.size * 0.2; // 20% уменьшение
            obj2X = obj2.x + reduction;
            obj2Y = obj2.y + reduction;
            obj2Width = obj2.width - reduction * 2;
            obj2Height = obj2.height - reduction * 2;
        }
        
        // Уменьшаем границы целей
        if (obj2.radius) {
            const reduction = obj2.radius * 0.3; // 30% уменьшение
            obj2X = obj2.x + reduction;
            obj2Y = obj2.y + reduction;
            obj2Width = obj2.width - reduction * 2;
            obj2Height = obj2.height - reduction * 2;
        }
        
        return obj1X < obj2X + obj2Width &&
               obj1X + obj1Width > obj2X &&
               obj1Y < obj2Y + obj2Height &&
               obj1Y + obj1Height > obj2Y;
    }
    
    shapeCollision(obj1, obj2) {
        // Упрощенная проверка формы для разных типов объектов
        
        // Специальная обработка для игрока - уменьшаем верхнюю границу на 10%
        let obj1Y = obj1.y;
        let obj1Height = obj1.height;
        let obj1CenterY = obj1.y + obj1.height / 2;
        
        // Если obj1 - это игрок, уменьшаем верхнюю границу
        if (obj1 === this.player) {
            const topReduction = obj1.height * 0.1; // 10% от высоты
            obj1Y = obj1.y + topReduction;
            obj1Height = obj1.height - topReduction;
            obj1CenterY = obj1Y + obj1Height / 2;
        }
        
        // Для целей (круглые) - проверяем расстояние между центрами
        if (obj2.radius) {
            const center1X = obj1.x + obj1.width / 2;
            const center1Y = obj1CenterY;
            const center2X = obj2.x + obj2.radius;
            const center2Y = obj2.y + obj2.radius;
            
            const distance = Math.sqrt(
                Math.pow(center1X - center2X, 2) + 
                Math.pow(center1Y - center2Y, 2)
            );
            
            // Уменьшаем радиус коллизии для более точного попадания
            const minDistance = obj2.radius * 0.8 + Math.min(obj1.width, obj1Height) * 0.4;
            return distance < minDistance;
        }
        
        // Для облаков - используем более точную эллиптическую коллизию
        if (obj2.size) {
            const center1X = obj1.x + obj1.width / 2;
            const center1Y = obj1CenterY;
            const center2X = obj2.x + obj2.size;
            const center2Y = obj2.y + obj2.size / 2;
            
            const distanceX = Math.abs(center1X - center2X);
            const distanceY = Math.abs(center1Y - center2Y);
            
            // Уменьшаем размеры коллизии для более точного соответствия визуалу
            const cloudRadiusX = obj2.size * 0.7; // Уменьшаем с 1.0 до 0.7
            const cloudRadiusY = obj2.size * 0.35; // Уменьшаем с 0.5 до 0.35
            const playerRadiusX = obj1.width * 0.4; // Уменьшаем с 0.5 до 0.4
            const playerRadiusY = obj1Height * 0.4; // Уменьшаем с 0.5 до 0.4
            
            return (distanceX / (cloudRadiusX + playerRadiusX)) ** 2 + 
                   (distanceY / (cloudRadiusY + playerRadiusY)) ** 2 < 1;
        }
        
        // Для остальных объектов - прямоугольная коллизия с уменьшенными размерами
        return this.boundingBoxCollision(obj1, obj2);
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
} 