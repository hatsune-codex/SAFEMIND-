document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.remove("light");
});

// =========================
// ESTILOS DE ANIMACIÓN (inyectados por JS, no toques el CSS)
// =========================

const estilosAnimacion = document.createElement("style");

estilosAnimacion.textContent = `

@keyframes sacudirPantalla{
    0%,100%{ transform:translate(0,0); }
    25%{ transform:translate(-4px,2px); }
    50%{ transform:translate(4px,-2px); }
    75%{ transform:translate(-3px,-2px); }
}

@keyframes sacudirTarjeta{
    0%,100%{ transform:translateX(0) rotate(0); }
    20%{ transform:translateX(-10px) rotate(-4deg); }
    40%{ transform:translateX(10px) rotate(4deg); }
    60%{ transform:translateX(-8px) rotate(-3deg); }
    80%{ transform:translateX(8px) rotate(3deg); }
}

@keyframes abrirCofre{
    0%{ transform:scale(1) rotate(0); }
    30%{ transform:scale(1.15) rotate(-6deg); }
    50%{ transform:scale(1.25) rotate(6deg); }
    70%{ transform:scale(1.35) rotate(-3deg); }
    100%{ transform:scale(1.3) rotate(0); }
}

@keyframes brillarCofre{
    0%,100%{ box-shadow:0 0 25px rgba(0,255,153,.5); }
    50%{ box-shadow:0 0 60px rgba(0,255,153,.9), 0 0 100px rgba(0,255,153,.4); }
}

@keyframes particula{
    0%{
        transform:translate(0,0) scale(1) rotate(0deg);
        opacity:1;
    }
    100%{
        transform:translate(var(--dx),var(--dy)) scale(0) rotate(var(--rot));
        opacity:0;
    }
}

@keyframes nubeHumo{
    0%{
        transform:translateY(0) scale(.5);
        opacity:0;
    }
    30%{
        opacity:1;
    }
    100%{
        transform:translateY(-70px) scale(1.6);
        opacity:0;
    }
}

@keyframes volarLlave{
    0%{
        transform:translate(0,0) rotate(0deg);
        opacity:1;
    }
    100%{
        transform:translate(var(--vx),var(--vy)) rotate(360deg);
        opacity:0;
    }
}

@keyframes entradaInsignia{
    0%{
        transform:scale(0) rotate(-20deg);
        opacity:0;
    }
    60%{
        transform:scale(1.2) rotate(8deg);
        opacity:1;
    }
    100%{
        transform:scale(1) rotate(0deg);
    }
}

.pantalla-sacudida{
    animation:sacudirPantalla .35s ease;
}

.sacudida{
    animation:sacudirTarjeta .5s ease;
}

.cofre-abriendo{
    animation:abrirCofre .8s ease forwards, brillarCofre 1.2s ease infinite;
}

.particula-estrella{
    position:fixed;
    font-size:24px;
    pointer-events:none;
    z-index:999;
    animation:particula .9s ease-out forwards;
}

.nube{
    position:fixed;
    font-size:28px;
    pointer-events:none;
    z-index:999;
    animation:nubeHumo 1s ease-out forwards;
}

.llave-volando{
    position:fixed;
    font-size:40px;
    color:#ffd43b;
    pointer-events:none;
    z-index:999;
    animation:volarLlave .5s ease-in forwards;
}

.pantallaFinal.mostrar{
    animation:entradaInsignia .6s ease;
}

#mensaje{
    position:fixed;
    top:22%;
    left:50%;
    z-index:1000;

    transform:translate(-50%,-15px) scale(.85);

    background:rgba(8,8,25,.92);
    border:2px solid currentColor;
    border-radius:18px;

    padding:18px 34px;

    max-width:85%;

    box-shadow:0 0 40px rgba(0,0,0,.5);

    opacity:0;
    pointer-events:none;

    transition:opacity .25s ease, transform .25s ease;
}

#mensaje.mostrar{
    opacity:1;
    transform:translate(-50%,0) scale(1);
}

`;

document.head.appendChild(estilosAnimacion);



// =========================
// JUEGO: EL CANDADO Y LAS LLAVES
// =========================

const llave = document.getElementById("llave");
const mensaje = document.getElementById("mensaje");
const cofre = document.getElementById("cofre");
const pantallaFinal = document.getElementById("pantallaFinal");
const siguienteNivel = document.getElementById("siguienteNivel");

const zonas = [...document.querySelectorAll(".personaje"), cofre];

let resuelto = false;

const frasesRobo = [
    "¡Buuu! Se llevó todos tus stickers 🧦",
    "¡Ups! Ahora tiene tu skin favorito del juego 🎮",
    "¡Oh no! Se comió tu snack imaginario 🍪",
    "¡Cuidado! Le regaló tu contraseña a su gato 🐱"
];


function lanzarParticulas(origen, emojis, cantidad){

    let rect = origen.getBoundingClientRect();

    let cx = rect.left + rect.width/2;
    let cy = rect.top + rect.height/2;

    for(let i=0; i<cantidad; i++){

        let p = document.createElement("div");

        let emoji = emojis[Math.floor(Math.random()*emojis.length)];

        p.className = "particula-estrella";
        p.textContent = emoji;

        let angulo = Math.random() * Math.PI * 2;
        let distancia = 80 + Math.random()*120;

        let dx = Math.cos(angulo) * distancia;
        let dy = Math.sin(angulo) * distancia;

        p.style.left = cx + "px";
        p.style.top = cy + "px";

        p.style.setProperty("--dx", dx+"px");
        p.style.setProperty("--dy", dy+"px");
        p.style.setProperty("--rot", (Math.random()*360)+"deg");

        p.style.animationDelay = (Math.random()*0.15)+"s";

        document.body.appendChild(p);

        setTimeout(()=> p.remove(), 1100);

    }

}


function lanzarNube(origen){

    let rect = origen.getBoundingClientRect();

    let n = document.createElement("div");

    n.className = "nube";
    n.textContent = "💨";

    n.style.left = (rect.left + rect.width/2 - 14) + "px";
    n.style.top = (rect.top + rect.height/2) + "px";

    document.body.appendChild(n);

    setTimeout(()=> n.remove(), 1000);

}


function volarLlaveHacia(origen, destino){

    let r1 = origen.getBoundingClientRect();
    let r2 = destino.getBoundingClientRect();

    let k = document.createElement("i");

    k.className = "fa-solid fa-key llave-volando";

    let x1 = r1.left + r1.width/2 - 20;
    let y1 = r1.top + r1.height/2 - 20;

    let x2 = r2.left + r2.width/2 - 20;
    let y2 = r2.top + r2.height/2 - 20;

    k.style.left = x1 + "px";
    k.style.top = y1 + "px";

    k.style.setProperty("--vx", (x2-x1)+"px");
    k.style.setProperty("--vy", (y2-y1)+"px");

    document.body.appendChild(k);

    setTimeout(()=> k.remove(), 550);

}


function sacudirPantalla(){

    document.body.classList.add("pantalla-sacudida");

    setTimeout(()=> document.body.classList.remove("pantalla-sacudida"), 350);

}


// =========================
// EFECTOS DE AUDIO CON EFECTOS DE YOUTUBE (Sin voz robótica)
// =========================

const audioExito = new Audio("https://www.myinstants.com/media/sounds/yay-sound-effect.mp3");
const audioError = new Audio("https://www.myinstants.com/media/sounds/lego-yoda-death-sound.mp3");

function sonidoCorrecto(){
    audioExito.currentTime = 0;
    audioExito.play().catch(e => console.log("Audio bloqueado por navegador", e));
}

function sonidoIncorrecto(){
    audioError.currentTime = 0;
    audioError.play().catch(e => console.log("Audio bloqueado por navegador", e));
}


let temporizadorMensaje = null;

function mostrarMensaje(texto, color, duracion){

    clearTimeout(temporizadorMensaje);

    mensaje.textContent = texto;
    mensaje.style.color = color;

    mensaje.classList.add("mostrar");

    if(duracion){

        temporizadorMensaje = setTimeout(()=>{

            mensaje.classList.remove("mostrar");

        }, duracion);

    }

}

function ocultarMensaje(){

    clearTimeout(temporizadorMensaje);

    mensaje.classList.remove("mostrar");

}


llave.addEventListener("dragstart", (e)=>{

    e.dataTransfer.setData("text/plain", "llave");

});


zonas.forEach((zona)=>{

    zona.addEventListener("dragover", (e)=>{

        e.preventDefault();

        if(resuelto) return;

        zona.classList.add("sobre");

    });

    zona.addEventListener("dragleave", ()=>{

        zona.classList.remove("sobre");

    });

    zona.addEventListener("drop", (e)=>{

        e.preventDefault();

        zona.classList.remove("sobre");

        if(resuelto) return;

        let esCorrecto = zona.dataset.correcto === "true";

        if(esCorrecto){

            resuelto = true;

            zona.classList.add("correcto");

            volarLlaveHacia(llave, zona);

            llave.classList.add("oculta");

            sonidoCorrecto();

            mostrarMensaje("¡Bien hecho! Esa llave solo se la das a un adulto de confianza, o mejor aún, no la compartes.", "#00ff99");

            setTimeout(()=>{

                cofre.classList.add("cofre-abriendo");

                lanzarParticulas(zona, ["⭐","✨","🔒","✅"], 18);

            }, 350);

            setTimeout(()=>{

                ocultarMensaje();

                pantallaFinal.style.display = "flex";
                pantallaFinal.classList.add("mostrar");
                SafeMindProgress.complete(1, 1);

            }, 1300);

        }else{

            zona.classList.add("incorrecto", "sacudida");

            sacudirPantalla();

            lanzarNube(zona);

            sonidoIncorrecto();

            let frase = frasesRobo[Math.floor(Math.random() * frasesRobo.length)];

            mostrarMensaje(frase + " — Nunca compartas tu llave con esta persona.", "#ff4444", 1800);

            setTimeout(()=>{

                zona.classList.remove("incorrecto", "sacudida");

            }, 600);

        }

    });

});


siguienteNivel.onclick = ()=>{

    window.location.href = "modulo1.html";

};