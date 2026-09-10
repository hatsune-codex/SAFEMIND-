/* =========================================================
   SafeMind · Modo Kids — Modulo_1.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Botón Regresar ---------- */
  const btnBack = document.getElementById('btnBack');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      window.location.href = 'modo_kids.html';
    });
  }

  document.body.classList.remove('theme-light');

  /* ---------- Tarjetas de módulos ---------- */
  const moduleCards = document.querySelectorAll('.module-card');

  const moduleNames = {
    1: 'Módulo 01',
    2: 'Módulo 02',
    3: 'Módulo 03',
    4: 'Módulo 04',
    5: 'Módulo 05'
  };

  function selectModule(card) {
    if (card.dataset.locked === "true") {
      alert("🔒 Completa el nivel anterior para desbloquear este nivel.");
      return;
    }
    moduleCards.forEach(c => c.classList.remove('is-selected'));
    card.classList.add('is-selected');

    const id = card.dataset.module;
    const name = moduleNames[id] || `Módulo ${id}`;

    // Evento personalizado
    document.dispatchEvent(new CustomEvent('modulo:seleccionado', {
      detail: { modulo: Number(id), nombre: name }
    }));

    console.log(`SafeMind → Abriendo ${name}...`);

    // Redirección dinámica según el data-module (ejercicio1.html, ejercicio2.html, etc.)
    window.location.href = `ejercicio${id}.html`;
  }

  moduleCards.forEach(card => {
    card.addEventListener('click', () => selectModule(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectModule(card);
      }
    });
  });

});