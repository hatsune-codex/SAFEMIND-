document.documentElement.setAttribute("data-theme", "dark");

/* Preguntas de Ciberseguridad */
const questions = [
  { text: "<strong>EMAIL:</strong> soporte@banc0-oficial.com<br>Urgente: Cuenta suspendida. Confirma tus datos.", type: "phishing" },
  { text: "<strong>SMS:</strong> Tu paquete está retenido. Haz clic en bit.ly/3xX9zL para pagar.", type: "phishing" },
  { text: "<strong>EMAIL:</strong> no-reply@steamcommunity.com<br>Tu código de verificación es: 88X29.", type: "safe" },
  { text: "<strong>POP-UP:</strong> ¡ALERTA! Tu celular tiene 13 virus. Presiona para limpiar.", type: "phishing" },
  { text: "<strong>WHATSAPP:</strong> Hola, cambié de número. ¿Me transfieres para una emergencia?", type: "phishing" },
  { text: "<strong>EMAIL:</strong> accounts@google.com<br>Alerta de seguridad: Nuevo inicio de sesión.", type: "safe" },
  { text: "<strong>POP-UP:</strong> Felicitaciones, ganaste un iPhone 15. Completa la encuesta.", type: "phishing" },
  { text: "<strong>EMAIL:</strong> facturacion@netflix.com<br>Tu suscripción se renovó con éxito.", type: "safe" },
  { text: "<strong>SMS:</strong> BANCO: Transferencia de $850 realizada. Responde CANCELAR.", type: "phishing" },
  { text: "<strong>EMAIL:</strong> soporte@paypal-verificacion.org<br>Limitación de cuenta.", type: "phishing" },
  { text: "<strong>EMAIL:</strong> no-reply@github.com<br>Personal access token expired.", type: "safe" },
  { text: "<strong>WHATSAPP:</strong> Código de verificación de WhatsApp: 492-104.", type: "safe" },
  { text: "<strong>SMS:</strong> Factura de luz vencida. Pague en: pago-rapido.net", type: "phishing" },
  { text: "<strong>EMAIL:</strong> notifications@discord.com<br>Nuevo dispositivo detectado.", type: "safe" },
  { text: "<strong>EMAIL:</strong> soporte@soporte-apple-id.info<br>Apple ID bloqueado.", type: "phishing" }
];

let currentQ = 0;
let score = 0;
let speed = 0;
let maxSpeed = 0;
let correct = 0;
let playerX = 20;
let rivalX = 20;

const TOTAL_TIME = 25;
let timeLeft = TOTAL_TIME;
let timer = null;

const canvas = document.getElementById("raceCanvas");
const ctx = canvas.getContext("2d");
let roadOffset = 0;

function render() {
  roadOffset = (roadOffset + speed / 5) % 30;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const style = getComputedStyle(document.documentElement);
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";

  ctx.fillStyle = style.getPropertyValue('--canvas-bg').trim();
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Carriles
  ctx.strokeStyle = style.getPropertyValue('--border-sub').trim();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 53); ctx.lineTo(canvas.width, 53);
  ctx.moveTo(0, 106); ctx.lineTo(canvas.width, 106);
  ctx.stroke();

  // Línea discontinua
  ctx.strokeStyle = style.getPropertyValue('--border-cyan').trim();
  ctx.setLineDash([15, 15]);
  ctx.lineDashOffset = -roadOffset;
  ctx.beginPath();
  ctx.moveTo(0, 80); ctx.lineTo(canvas.width, 80);
  ctx.stroke();
  ctx.setLineDash([]);

  // Meta
  ctx.strokeStyle = style.getPropertyValue('--color-cyan').trim();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(500, 0); ctx.lineTo(500, canvas.height);
  ctx.stroke();

  // Autos
  drawCar(playerX, 26, style.getPropertyValue('--color-cyan').trim(), "TÚ");
  drawCar(rivalX, 80, isDark ? "#ff2a6d" : "#e63946", "RIVAL");

  requestAnimationFrame(render);
}

function drawCar(x, y, color, label) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 50, 18);
  ctx.fillStyle = "#000";
  ctx.fillRect(x + 12, y + 3, 22, 12);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-sub').trim();
  ctx.font = "bold 9px sans-serif";
  ctx.fillText(label, x, y - 4);
}

function startGame() {
  document.getElementById("overlay").style.display = "none";
  currentQ = 0;
  score = 0;
  speed = 70;
  maxSpeed = 70;
  correct = 0;
  playerX = 20;
  rivalX = 20;

  updateHUD();
  loadQuestion();
}

function loadQuestion() {
  if (currentQ >= questions.length) {
    endGame();
    return;
  }

  document.getElementById("roundVal").textContent = `${currentQ + 1}/${questions.length}`;
  document.getElementById("chatText").innerHTML = questions[currentQ].text;

  timeLeft = TOTAL_TIME;
  updateHUD();

  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft -= 0.1;
    if (timeLeft <= 0) {
      timeLeft = 0;
      clearInterval(timer);
      shakeCard();
      rivalX += 30;
      speed = Math.max(20, speed - 30);
      next();
      return;
    }
    updateHUD();
  }, 100);
}

function choose(type) {
  clearInterval(timer);
  if (type === questions[currentQ].type) {
    playerX += 30;
    rivalX += 8;
    correct++;
    score += 100 + Math.floor(timeLeft * 8);
    speed += 20;
    if (speed > maxSpeed) maxSpeed = speed;
  } else {
    shakeCard();
    rivalX += 30;
    speed = Math.max(20, speed - 30);
  }
  updateHUD();
  next();
}

function next() {
  currentQ++;
  setTimeout(loadQuestion, 300);
}

function shakeCard() {
  const card = document.getElementById("gameCard");
  card.classList.add("shake");
  setTimeout(() => card.classList.remove("shake"), 200);
}

function updateHUD() {
  document.getElementById("scoreVal").textContent = score;
  document.getElementById("speedVal").textContent = speed + " KM/H";
  let acc = currentQ > 0 ? Math.round((correct / currentQ) * 100) : 100;
  document.getElementById("accVal").textContent = acc + "%";
  document.getElementById("timeVal").textContent = timeLeft.toFixed(1) + "s";
  document.getElementById("nitroFill").style.width = ((timeLeft / TOTAL_TIME) * 100) + "%";
}

function endGame() {
  clearInterval(timer);
  const overlay = document.getElementById("overlay");
  document.getElementById("summaryBox").style.display = "block";
  document.getElementById("finalScore").textContent = score;
  document.getElementById("maxSpeed").textContent = maxSpeed + " KM/H";
  document.getElementById("ratio").textContent = `${correct}/15`;

  if (playerX > rivalX) {
    SafeMindProgress.complete(2, 2);
    document.getElementById("overlayTitle").textContent = "🏆 ¡VICTORIA!";
    document.getElementById("overlayDesc").textContent = "Has superado con éxito las amenazas cibernéticas.";
  } else {
    document.getElementById("overlayTitle").textContent = "💥 DERROTA";
    document.getElementById("overlayDesc").textContent = "El Atacante tomó el control de la red.";
  }

  overlay.style.display = "flex";
}

render();