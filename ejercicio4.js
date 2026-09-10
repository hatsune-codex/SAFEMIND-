document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.remove('light-mode');

    const passwordScreen = document.getElementById('password-screen');
    const legoShield = document.getElementById('lego-shield');
    const shieldIcon = document.getElementById('shield-icon');
    const shieldVerdict = document.getElementById('shield-verdict');
    const clearBtn = document.getElementById('clear-btn');
    const testBtn = document.getElementById('test-btn');
    const legoBricks = document.querySelectorAll('.lego-brick');

    let passwordBlocks = [];

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playSound(type) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'click') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.1);
            osc.frequency.setValueAtTime(783.99, now + 0.2);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
        } else if (type === 'fail') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    }

    legoBricks.forEach(brick => {
        brick.addEventListener('click', () => {
            const val = brick.getAttribute('data-val');
            passwordBlocks.push(val);
            playSound('click');
            updateDisplay();
        });
    });

    function updateDisplay() {
        passwordScreen.innerHTML = '';
        if (passwordBlocks.length === 0) {
            const placeholder = document.createElement('span');
            placeholder.className = 'placeholder-text';
            placeholder.textContent = 'Toca los bloques de abajo...';
            passwordScreen.appendChild(placeholder);
            testBtn.disabled = true;
            setShieldAppearance("empty");
        } else {
            passwordBlocks.forEach((text, index) => {
                const pill = document.createElement('div');
                pill.className = 'lego-pill';
                pill.innerHTML = `${text} <span data-index="${index}">×</span>`;
                pill.querySelector('span').addEventListener('click', (e) => {
                    e.stopPropagation();
                    passwordBlocks.splice(index, 1);
                    playSound('click');
                    updateDisplay();
                });
                passwordScreen.appendChild(pill);
            });
            testBtn.disabled = false;
            setShieldAppearance("building");
        }
    }

    function setShieldAppearance(state, score = 0) {
        if (state === "empty") {
            legoShield.style.background = "#555";
            shieldIcon.textContent = "🛡️";
            shieldVerdict.textContent = "¡Vacío!";
        } else if (state === "building") {
            legoShield.style.background = "#3f51b5";
            shieldIcon.textContent = "🧱";
            shieldVerdict.textContent = "Armando...";
        } else if (state === "bad") {
            legoShield.style.background = "#e53935"; // Rojo LEGO
            shieldIcon.textContent = "💥";
            shieldVerdict.textContent = "¡Muy Débil!";
        } else if (state === "good") {
            legoShield.style.background = "#fbc02d"; // Amarillo LEGO
            shieldIcon.textContent = "⚠️";
            shieldVerdict.textContent = "¡Regular!";
        } else if (state === "perfect") {
            legoShield.style.background = "#43a047"; // Verde LEGO
            shieldIcon.textContent = "🌟🛡️";
            shieldVerdict.textContent = "¡Impenetrable!";
        }
    }

    clearBtn.addEventListener('click', () => {
        passwordBlocks = [];
        playSound('click');
        updateDisplay();
    });

    testBtn.addEventListener('click', () => {
        const fullString = passwordBlocks.join('');
        const length = fullString.length;

        let score = 0;
        if (length >= 8) score += 40;
        if (/[0-9]/.test(fullString)) score += 20;
        if (/[#$!_@*]/.test(fullString)) score += 20;
        if (/[🔥🧊🚀]/.test(fullString)) score += 20;

        if (score < 40) {
            playSound('fail');
            setShieldAppearance("bad");
            alert(`¡Cuidado! Tu contraseña ("${fullString}") es muy corta o simple. ¡Los hackers la romperán en segundos! 💥`);
        } else if (score < 80) {
            playSound('success');
            setShieldAppearance("good");
            alert(`¡Vas por buen camino! Tu contraseña ("${fullString}") es decente, pero le faltan más símbolos o números para ser perfecta. 👍`);
        } else {
            playSound('success');
            setShieldAppearance("perfect");
            SafeMindProgress.complete(1, 4);
            alert(`¡INCREÍBLE! Tu escudo LEGO ("${fullString}") es totalmente indestructible. ¡Ningún hacker podrá con esto! 🛡️✨🚀`);
        }
    });
});