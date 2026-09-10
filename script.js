const kids = document.getElementById("kids");
const master = document.getElementById("master");
const verificar = document.getElementById("verificar");
const borrarUrl = document.getElementById("borrar-url");
const url = document.getElementById("url");
const modo = document.getElementById("modo");

const loaderBox = document.querySelector(".loaderBox");
const progress = document.getElementById("progress");
const estado = document.getElementById("estado");

kids.onclick = () => {

    window.location.href = "modo_kids.html";

}

master.onclick = () => {

    window.location.href = "modo_master.html";

}

borrarUrl.onclick = () => {
    url.value = "";
    progress.style.width = "0%";
    estado.textContent = "";
    estado.style.color = "white";
    loaderBox.style.display = "none";
    verificar.disabled = false;
    url.focus();
};

verificar.onclick = async () => {
    const pagina = url.value.trim();

    if (pagina === "") {
        estado.textContent = "Ingresa una URL para analizarla.";
        estado.style.color = "#ff4444";
        return;
    }

    loaderBox.style.display = "block";
    verificar.disabled = true;
    progress.style.width = "10%";
    estado.style.color = "white";
    estado.textContent = "Enviando URL a VirusTotal...";

    const progreso = setInterval(() => {
        const actual = parseFloat(progress.style.width) || 10;
        if (actual < 90) {
            progress.style.width = `${actual + 5}%`;
        }
    }, 800);

    try {
        const response = await fetch("http://localhost:3000/api/check-url", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: pagina })
        });
        const resultado = await response.json().catch(() => ({}));

        if (!response.ok) {
            const error = new Error(resultado.error || "No se pudo verificar la URL.");
            error.virustotalUrl = resultado.virustotalUrl;
            throw error;
        }

        const { malicious, suspicious, harmless } = resultado.stats;
        const hayRiesgo = malicious > 0 || suspicious > 0;

        progress.style.width = "100%";
        estado.style.color = hayRiesgo ? "#ff4444" : "#00ff99";
        estado.replaceChildren();

        const encabezado = document.createElement("span");
        encabezado.className = "resultado-encabezado";
        encabezado.textContent = hayRiesgo
            ? "VirusTotal: riesgo detectado"
            : "VirusTotal: sin amenazas detectadas";
        estado.appendChild(encabezado);

        const estadisticas = document.createElement("span");
        estadisticas.className = "resultado-estadisticas";
        [
            ["Maliciosos", malicious],
            ["Sospechosos", suspicious],
            ["Seguros", harmless]
        ].forEach(([nombre, valor], index) => {
            const ficha = document.createElement("span");
            ficha.className = "split-flap-ficha";
            ficha.style.animationDelay = `${index * 80}ms`;

            const etiqueta = document.createElement("span");
            etiqueta.className = "split-flap-etiqueta";
            etiqueta.textContent = nombre;

            const numero = document.createElement("strong");
            numero.className = "split-flap-numero";
            numero.textContent = valor;

            ficha.append(etiqueta, numero);
            estadisticas.appendChild(ficha);
        });
        estado.appendChild(estadisticas);

        if (resultado.virustotalUrl) {
            const evidencia = document.createElement("a");
            evidencia.href = resultado.virustotalUrl;
            evidencia.target = "_blank";
            evidencia.rel = "noopener noreferrer";
            evidencia.textContent = " Ver informe oficial en VirusTotal";
            evidencia.style.display = "block";
            evidencia.style.color = "#00d5ff";
            evidencia.style.marginTop = "12px";
            estado.appendChild(evidencia);
        }
    } catch (error) {
        progress.style.width = "0%";
        estado.style.color = "#ff4444";
        estado.textContent = error.message || "No se pudo conectar con el servidor.";
        if (error.virustotalUrl) {
            const evidencia = document.createElement("a");
            evidencia.href = error.virustotalUrl;
            evidencia.target = "_blank";
            evidencia.rel = "noopener noreferrer";
            evidencia.textContent = " Ver estado en VirusTotal";
            evidencia.style.display = "block";
            evidencia.style.color = "#00d5ff";
            estado.appendChild(evidencia);
        }
    } finally {
        clearInterval(progreso);
        verificar.disabled = false;
    }
};



// =========================
// MODO CLARO / OSCURO
// =========================

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.remove('light');
    localStorage.setItem('tema', 'oscuro');
});



