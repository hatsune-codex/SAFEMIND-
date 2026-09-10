document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.remove('light-mode');

    // --- ELEMENTOS DEL DOM ---
    const gameArea = document.getElementById('game-area');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const winScreen = document.getElementById('win-screen');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const nextBtn = document.getElementById('next-btn');
    const bgMusic = document.getElementById('bg-music');
    
    // Elementos del HUD (Marcador)
    const scoreEl = document.getElementById('score');
    const levelEl = document.getElementById('level');
    const livesEl = document.getElementById('lives');
    const finalScoreEl = document.getElementById('final-score');

    // --- BASE DE DATOS DE CONTRASEÑAS ---
    const passwordsData = [
        { text: '123456', secure: false },
        { text: 'password', secure: false },
        { text: 'admin123', secure: false },
        { text: 'qwerty', secure: false },
        { text: 'Gatito1', secure: false },
        { text: 'iloveyou', secure: false },
        { text: 'Drag0n$Az7!', secure: true },
        { text: 'Gat1t0#99', secure: true },
        { text: 'Pupusas#2026', secure: true }, 
        { text: 'M1P3rr0_L0k0', secure: true },
        { text: 'T1gr3*2024', secure: true },
        { text: 'S3cur3P@ss!', secure: true }
    ];

    // --- VARIABLES DE ESTADO DEL JUEGO ---
    let isPlaying = false;
    let score = 0;
    let level = 1;
    let lives = 3;
    let fallSpeed = 2; 
    let spawnRate = 1200; 
    let spawnInterval;
    let activeItems = [];
    let animationFrameId;
    
    // CONSTANTE PARA GANAR
    const SCORE_TO_WIN = 300; 

    // --- FUNCIONES DEL JUEGO ---

    // Actualizar Textos en Pantalla
    function updateHUD() {
        scoreEl.textContent = score;
        levelEl.textContent = level;
        livesEl.textContent = '❤️'.repeat(lives);
        
        if (lives <= 0) {
            gameOver();
        } else if (score >= SCORE_TO_WIN) {
            winGame(); // Llama a la pantalla de victoria
        }
    }

    // Iniciar Juego
    function startGame() {
        score = 0;
        level = 1;
        lives = 3;
        fallSpeed = 2;
        spawnRate = 1200;
        activeItems = [];
        isPlaying = true;

        updateHUD();
        
        // Limpiar área de contraseñas anteriores
        document.querySelectorAll('.password-item').forEach(el => el.remove());
        
        // Ocultar pantallas superpuestas
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        winScreen.classList.add('hidden');

        // Iniciar bucles
        spawnInterval = setInterval(spawnPassword, spawnRate);
        gameLoop();
    }

    // Terminar Juego (Derrota)
    function gameOver() {
        isPlaying = false;
        clearInterval(spawnInterval);
        cancelAnimationFrame(animationFrameId);
        bgMusic.pause(); // Detener música
        
        finalScoreEl.textContent = score;
        gameOverScreen.classList.remove('hidden');
    }

    // Terminar Juego (Victoria)
    function winGame() {
        isPlaying = false;
        clearInterval(spawnInterval);
        cancelAnimationFrame(animationFrameId);
        bgMusic.pause(); // Detener música
        
        winScreen.classList.remove('hidden');
        SafeMindProgress.complete(1, 2);
    }

    // Subir de nivel según la puntuación
    function checkLevelUp() {
        // Cada 60 puntos sube de nivel (Nivel 5 a los 300 puntos)
        let newLevel = Math.floor(score / 60) + 1;
        
        if (newLevel > level && newLevel <= 5) {
            level = newLevel;
            fallSpeed += 0.8; // Caen más rápido
            
            clearInterval(spawnInterval);
            spawnRate = Math.max(500, spawnRate - 200); 
            spawnInterval = setInterval(spawnPassword, spawnRate);
        }
        updateHUD();
    }

    // Crear una contraseña que cae
    function spawnPassword() {
        if (!isPlaying) return;

        const randomData = passwordsData[Math.floor(Math.random() * passwordsData.length)];
        const el = document.createElement('div');
        
        el.textContent = randomData.text;
        el.classList.add('password-item', 'pwd-style');
        el.dataset.secure = randomData.secure;
        
        el.style.top = '-50px';
        gameArea.appendChild(el);

        const maxLeft = gameArea.clientWidth - el.clientWidth;
        const randomLeft = Math.floor(Math.random() * maxLeft);
        el.style.left = randomLeft + 'px';

        activeItems.push(el);

        // Evento Click / Touch
        el.addEventListener('mousedown', function() {
            if (!isPlaying || this.classList.contains('correct-click') || this.classList.contains('wrong-click')) return;

            const isSecure = this.dataset.secure === "true";

            if (isSecure) {
                score += 20; // 20 puntos por acierto
                this.classList.add('correct-click');
                checkLevelUp();
            } else {
                lives--; // Penalización por tocar contraseña débil
                this.classList.add('wrong-click');
                updateHUD();
            }

            const index = activeItems.indexOf(this);
            if (index > -1) activeItems.splice(index, 1);
            setTimeout(() => this.remove(), 400); // Eliminar después de animación
        });
    }

    // Loop principal de movimiento
    function gameLoop() {
        if (!isPlaying) return;

        for (let i = activeItems.length - 1; i >= 0; i--) {
            let el = activeItems[i];
            let currentTop = parseFloat(el.style.top);
            currentTop += fallSpeed;
            el.style.top = currentTop + 'px';

            // Si la contraseña toca el suelo
            if (currentTop > gameArea.clientHeight) {
                const isSecure = el.dataset.secure === "true";
                
                // Si dejas caer una contraseña SEGURA, pierdes vida
                if (isSecure) {
                    lives--;
                    updateHUD();
                }

                el.remove();
                activeItems.splice(i, 1);
            }
        }
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // --- CONTROL DE AUDIO Y BOTONES ---

    // Función para arrancar la música de forma segura
    function playMusic() {
        bgMusic.volume = 0.5; // Volumen a la mitad
        bgMusic.currentTime = 0;
        bgMusic.play().then(() => {
            console.log("¡Música sonando brutal!");
        }).catch(error => {
            console.log("El navegador sigue bloqueando el audio:", error);
        });
    }

    // Listeners de botones (Inician el juego Y la música al mismo tiempo)
    startBtn.addEventListener('click', () => {
        playMusic();
        startGame();
    });
    
    restartBtn.addEventListener('click', () => {
        playMusic();
        startGame();
    });
    
    nextBtn.addEventListener('click', () => {
        playMusic();
        startGame();
    });
});