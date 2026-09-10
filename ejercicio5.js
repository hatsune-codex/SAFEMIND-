document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const moduleBtn = document.getElementById('module-btn');
    const gameCard = document.getElementById('game-card');
    const scoreDisplay = document.getElementById('score');
    const bossPhaseDisplay = document.getElementById('boss-phase');
    const playerHpBar = document.getElementById('player-hp-bar');
    const bossHpBar = document.getElementById('boss-hp-bar');

    let score = 0;
    let isPlaying = false;
    let gameLoopId = null;

    // Entidades del Juego
    let player = { x: 250, y: 430, width: 30, height: 25, speed: 6, hp: 100 };
    let boss = { x: 225, y: 50, width: 100, height: 70, hp: 100, maxHp: 100, phase: 1, dir: 2 };
    let bullets = [];      
    let bossBullets = [];  
    let keys = {};
    let isShooting = false;
    let shootCooldown = 0;

    // Web Audio API para efectos de sonido
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playSound(type) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'laser') { 
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'bossHit') { 
            osc.type = 'square';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'playerHit') { 
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(50, now + 0.3);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'alarm') { 
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.setValueAtTime(150, now + 0.15);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    }

    // Controles por teclado mejorados (detección de mantener presionado)
    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if (e.code === 'Space') isShooting = true;
    });
    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
        if (e.code === 'Space') isShooting = false;
    });

    startBtn.addEventListener('click', initGame);
    restartBtn.addEventListener('click', initGame);

    function initGame() {
        startScreen.style.display = 'none';
        restartBtn.style.display = 'none';
        moduleBtn.style.display = 'none';
        score = 0;
        player.hp = 200;
        boss.hp = 100;
        boss.maxHp = 100;
        boss.phase = 1;
        boss.dir = 2;
        bullets = [];
        bossBullets = [];
        isShooting = false;
        scoreDisplay.textContent = score;
        bossPhaseDisplay.textContent = boss.phase;
        playerHpBar.style.width = '100%';
        bossHpBar.style.width = '100%';
        isPlaying = true;

        if (gameLoopId) cancelAnimationFrame(gameLoopId);
        gameLoop();
    }

    function shootBullet() {
        bullets.push({ x: player.x + player.width / 2 - 3, y: player.y, width: 6, height: 12, speed: 10 });
        playSound('laser');
    }

    let shootTimer = 0;
    function handleBossAttacks() {
        shootTimer++;
        let interval = boss.phase === 1 ? 45 : (boss.phase === 2 ? 30 : 20);

        if (shootTimer >= interval) {
            shootTimer = 0;
            const bossCenterX = boss.x + boss.width / 2;
            const bossCenterY = boss.y + boss.height;

            if (boss.phase === 1) {
                bossBullets.push({ x: bossCenterX - 3, y: bossCenterY, vx: 0, vy: 4, radius: 6 });
                bossBullets.push({ x: bossCenterX - 15, y: bossCenterY, vx: -1.5, vy: 3.5, radius: 6 });
                bossBullets.push({ x: bossCenterX + 15, y: bossCenterY, vx: 1.5, vy: 3.5, radius: 6 });
            } else if (boss.phase === 2) {
                for (let i = -2; i <= 2; i++) {
                    bossBullets.push({ x: bossCenterX, y: bossCenterY, vx: i * 1.5, vy: 4, radius: 6 });
                }
            } else {
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 / 8) * i + (Date.now() * 0.003);
                    bossBullets.push({ x: bossCenterX, y: bossCenterY, vx: Math.cos(angle) * 3, vy: Math.sin(angle) * 3, radius: 5 });
                }
            }
        }
    }

    function triggerScreenShake() {
        gameCard.classList.add('shake');
        setTimeout(() => { gameCard.classList.remove('shake'); }, 300);
    }

    function update() {
        if (!isPlaying) return;

        // Movimiento de la nave
        if ((keys['ArrowLeft'] || keys['KeyA']) && player.x > 10) player.x -= player.speed;
        if ((keys['ArrowRight'] || keys['KeyD']) && player.x < canvas.width - player.width - 10) player.x += player.speed;

        // Disparo automático continuo al mantener presionado ESPACIO
        if (isShooting) {
            shootCooldown++;
            if (shootCooldown >= 10) { // Dispara un láser cada 10 frames de forma automática
                shootBullet();
                shootCooldown = 0;
            }
        }

        // Movimiento del Jefe Ransomware
        boss.x += boss.dir;
        if (boss.x <= 20 || boss.x >= canvas.width - boss.width - 20) {
            boss.dir *= -1;
        }

        handleBossAttacks();

        // Actualizar proyectiles del jugador
        for (let i = bullets.length - 1; i >= 0; i--) {
            let b = bullets[i];
            b.y -= b.speed;
            if (b.y < 0) {
                bullets.splice(i, 1);
                continue;
            }

            // Colisión con el Jefe
            if (b.x < boss.x + boss.width && b.x + b.width > boss.x && b.y < boss.y + boss.height && b.y + b.height > boss.y) {
                bullets.splice(i, 1);
                boss.hp -= 2;
                score += 25;
                scoreDisplay.textContent = score;
                bossHpBar.style.width = `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%`;
                playSound('bossHit');
                triggerScreenShake();

                if (boss.hp <= 30 && boss.phase === 1) {
                    boss.phase = 2;
                    boss.dir = 3.5;
                    bossPhaseDisplay.textContent = boss.phase;
                } else if (boss.hp <= 33 && boss.phase === 2) {
                    boss.phase = 3;
                    boss.dir = 5;
                    bossPhaseDisplay.textContent = boss.phase;
                }

                if (boss.hp <= 0) {
                    endGame(true);
                }
            }
        }

        // Actualizar balas del jefe
        for (let i = bossBullets.length - 1; i >= 0; i--) {
            let bb = bossBullets[i];
            bb.x += bb.vx;
            bb.y += bb.vy;

            if (bb.y > canvas.height || bb.x < 0 || bb.x > canvas.width) {
                bossBullets.splice(i, 1);
                continue;
            }

            // Colisión con la nave
            if (bb.x + bb.radius > player.x && bb.x - bb.radius < player.x + player.width &&
                bb.y + bb.radius > player.y && bb.y - bb.radius < player.y + player.height) {
                bossBullets.splice(i, 1);
                player.hp -= 15;
                playerHpBar.style.width = `${Math.max(0, player.hp)}%`;
                playSound('playerHit');
                triggerScreenShake();

                if (player.hp <= 30) {
                    playSound('alarm');
                }

                if (player.hp <= 0) {
                    endGame(false);
                }
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fondo de cuadrícula cibernética
        ctx.strokeStyle = 'rgba(56, 44, 117, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 30) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        }

        // Nave del Jugador
        ctx.fillStyle = '#00d2ff';
        ctx.shadowColor = '#00d2ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(player.x + player.width / 2, player.y);
        ctx.lineTo(player.x, player.y + player.height);
        ctx.lineTo(player.x + player.width, player.y + player.height);
        ctx.closePath();
        ctx.fill();

        // Núcleo Ransomware (Jefe)
        ctx.shadowColor = '#ff3366';
        ctx.shadowBlur = boss.phase === 3 ? 25 : 15;
        ctx.fillStyle = boss.phase === 3 ? '#ff3366' : (boss.phase === 2 ? '#ff9900' : '#9c27b0');
        ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
        
        ctx.fillStyle = '#fff';
        ctx.fillRect(boss.x + 35, boss.y + 25, 30, 20);
        ctx.fillStyle = '#050612';
        ctx.fillRect(boss.x + 45, boss.y + 30, 10, 10);

        ctx.shadowBlur = 0;

        // Disparos del jugador
        ctx.fillStyle = '#00d2ff';
        for (let b of bullets) {
            ctx.fillRect(b.x, b.y, b.width, b.height);
        }

        // Proyectiles del jefe
        ctx.fillStyle = '#ff3366';
        for (let bb of bossBullets) {
            ctx.beginPath();
            ctx.arc(bb.x, bb.y, bb.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function gameLoop() {
        update();
        draw();
        if (isPlaying) {
            gameLoopId = requestAnimationFrame(gameLoop);
        }
    }

    function endGame(victory) {
        isPlaying = false;
        if (victory) SafeMindProgress.complete(1, 5);
        cancelAnimationFrame(gameLoopId);
        startScreen.style.display = 'flex';
        startScreen.innerHTML = victory ? `
            <h3 style="color: #00d2ff;">🎉 ¡SISTEMA DESINFECTADO!</h3>
            <p>Has eliminado el Núcleo Ransomware con éxito. Puntuación: <strong>${score}</strong></p>
        ` : `
            <h3 style="color: #ff3366;">💥 ¡SISTEMA SECUESTRADO!</h3>
            <p>El ransomware ha sobreescrito tus archivos. Puntuación: <strong>${score}</strong></p>
        `;
        restartBtn.style.display = 'block';
        moduleBtn.style.display = 'block';
    }
});