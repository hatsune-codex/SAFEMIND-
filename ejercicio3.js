document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.remove('light-mode');

    // --- ELEMENTOS DEL DOM ---
    const chatBody = document.getElementById('chat-body');
    const decisionPanel = document.getElementById('decision-panel');
    const outcomePanel = document.getElementById('outcome-panel');
    const outcomeIcon = document.getElementById('outcome-icon');
    const outcomeTitle = document.getElementById('outcome-title');
    const outcomeText = document.getElementById('outcome-text');
    const resetBtn = document.getElementById('reset-btn');
    const choiceButtons = document.querySelectorAll('.choice-btn');

    // --- GENERADOR DE EFECTOS DE SONIDO AVANZADOS ---
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playSound(type) {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;

        if (type === 'good') {
            // Sonido "¡Yeeeeiiii!" (Arpegio ascendente alegre estilo victoria)
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, index) => {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                oscillator.type = 'triangle'; // Sonido más suave y dulce
                oscillator.frequency.setValueAtTime(freq, now + (index * 0.08));
                
                gainNode.gain.setValueAtTime(0.15, now + (index * 0.08));
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + (index * 0.08) + 0.2);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                oscillator.start(now + (index * 0.08));
                oscillator.stop(now + (index * 0.08) + 0.2);
            });
        } else {
            // Sonido "¡Ouuu!" (Tono descendente triste y burlón)
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'sawtooth';
            // Empieza agudo y cae de golpe
            oscillator.frequency.setValueAtTime(300, now);
            oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.4);
            
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start(now);
            oscillator.stop(now + 0.45);
        }
    }

    // --- BASE DE DATOS DE DECISIONES ---
    const outcomes = {
        'A': {
            type: 'bad',
            icon: '🤡',
            title: '¡Uy, caíste en la trampa!',
            text: 'Resulta que no era Alex. Alguien entró a tu cuenta, te cambió tu skin favorita por un traje de gallina gigante y para colmo, ¡se gastó tu preciada fruta Yeti en Blox Fruits! 🐔❄️ Nunca compartas tu contraseña.'
        },
        'B': {
            type: 'good',
            icon: '🛡️',
            title: '¡Excelente decisión!',
            text: 'Le dijiste que no. Resulta que la cuenta de Alex había sido hackeada y alguien más estaba pidiendo contraseñas a todos sus contactos. ¡Tu cuenta y tu inventario están a salvo!'
        },
        'C': {
            type: 'good',
            icon: '🌟',
            title: '¡La mejor jugada!',
            text: 'Un adulto te ayudó a llamar al verdadero Alex por teléfono. Descubrieron que alguien se estaba haciendo pasar por él en línea. ¡Eres un detective experto en ciberseguridad!'
        }
    };

    // --- LÓGICA DEL JUEGO ---
    choiceButtons.forEach(button => {
        button.addEventListener('click', function() {
            const choice = this.getAttribute('data-choice');
            const result = outcomes[choice];

            // Reproducir sonido mejorado
            playSound(result.type);

            // 1. Mostrar la respuesta del usuario en el chat
            const userReply = document.createElement('div');
            userReply.classList.add('message', 'outgoing');
            userReply.textContent = this.textContent;
            chatBody.appendChild(userReply);

            // Hacer scroll hacia abajo
            chatBody.scrollTop = chatBody.scrollHeight;

            // Ocultar botones temporalmente
            decisionPanel.style.opacity = '0';
            decisionPanel.style.pointerEvents = 'none';

            // 2. Esperar 1.5 segundos y mostrar la consecuencia
            setTimeout(() => {
                showOutcome(result);
            }, 1500);
        });
    });

    function showOutcome(result) {
        outcomeIcon.textContent = result.icon;
        outcomeTitle.textContent = result.title;
        outcomeText.textContent = result.text;
        
        // Aplicar color dependiendo si fue buena o mala decisión
        outcomePanel.classList.remove('outcome-bad', 'outcome-good');
        outcomePanel.classList.add(result.type === 'bad' ? 'outcome-bad' : 'outcome-good');

        outcomePanel.classList.remove('hidden');

        if (result.type === 'good') {
            SafeMindProgress.complete(1, 3);
        }
    }

    // Reiniciar la historia
    resetBtn.addEventListener('click', () => {
        outcomePanel.classList.add('hidden');
        
        // Limpiar chat (dejando solo el primer mensaje)
        while (chatBody.children.length > 1) {
            chatBody.removeChild(chatBody.lastChild);
        }

        // Mostrar botones de nuevo
        decisionPanel.style.opacity = '1';
        decisionPanel.style.pointerEvents = 'auto';
    });
});