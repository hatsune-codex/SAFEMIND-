// =============================================================
// SafeMind · Progreso de los 15 niveles con Supabase
// Tabla esperada: public."Progreso_niveles"
// Columnas: id, usuario_id, correo, modulo, nivel,
//           porcentaje, completado, actualizado
// =============================================================

window.SafeMindProgress = (() => {
  const TABLE = "Progreso_niveles";

  function client() {
    if (!window.SAFEMIND_SUPABASE_CONFIGURED || !window.supabaseClient) {
      console.warn("SafeMind: Supabase todavía no está configurado.");
      return null;
    }
    return window.supabaseClient;
  }

  async function getUser() {
    const sb = client();
    if (!sb) return null;
    const { data, error } = await sb.auth.getUser();
    if (error) {
      console.error("No se pudo leer el usuario:", error.message);
      return null;
    }
    return data.user || null;
  }

  async function requireAuth() {
    if (!window.SAFEMIND_SUPABASE_CONFIGURED) return null;
    const user = await getUser();
    if (!user) {
      window.location.href = "login.html";
      return null;
    }
    return user;
  }

  // Un usuario "invitado" es el que entró con signInAnonymously().
  // Supabase marca esos usuarios con is_anonymous = true.
  function isGuest(user) {
    return Boolean(user && user.is_anonymous);
  }

  async function load() {
    const sb = client();
    const user = await getUser();
    if (!sb || !user) return [];

    const { data, error } = await sb
      .from(TABLE)
      .select("*")
      .order("modulo", { ascending: true })
      .order("nivel", { ascending: true });

    if (error) {
      console.error("Error cargando progreso:", error.message);
      return [];
    }
    return data || [];
  }

  async function save(modulo, nivel, porcentaje = 100, completado = true) {
    const sb = client();
    const user = await getUser();
    if (!sb || !user) return { ok: false, error: "Usuario no autenticado" };

    modulo = Number(modulo);
    nivel = Number(nivel);
    porcentaje = Math.max(0, Math.min(100, Number(porcentaje) || 0));

    const row = {
      usuario_id: user.id,
      correo: user.email || "Invitado",
      modulo,
      nivel,
      porcentaje,
      completado: Boolean(completado),
      actualizado: new Date().toISOString()
    };

    // Requiere UNIQUE(usuario_id, modulo, nivel), que es la estructura
    // recomendada para evitar registros duplicados.
    const { data, error } = await sb
      .from(TABLE)
      .upsert(row, { onConflict: "usuario_id,modulo,nivel" })
      .select()
      .single();

    if (error) {
      console.error(`Error guardando M${modulo} N${nivel}:`, error.message);
      return { ok: false, error: error.message };
    }

    window.dispatchEvent(new CustomEvent("safemind:progreso", { detail: data }));
    return { ok: true, data };
  }

  async function complete(modulo, nivel) {
    return save(modulo, nivel, 100, true);
  }

  function completedSet(rows) {
    return new Set(
      rows.filter(r => r.completado).map(r => `${Number(r.modulo)}-${Number(r.nivel)}`)
    );
  }

  function totalPercent(rows) {
    const done = new Set(
      rows.filter(r => r.completado).map(r => `${Number(r.modulo)}-${Number(r.nivel)}`)
    ).size;
    return Math.min(100, Math.round((done / 15) * 100));
  }

  async function initKidsDashboard() {
    let user = null;
    if (window.SAFEMIND_SUPABASE_CONFIGURED) {
      user = await requireAuth();
      if (!user) return;
    }
    const guest = isGuest(user);

    const rows = await load();
    const done = completedSet(rows);
    const count = done.size;
    const pct = totalPercent(rows);

    const fill = document.getElementById("kidsProgressFill");
    const text = document.getElementById("kidsProgressText");
    const countEl = document.getElementById("kidsProgressCount");
    if (fill) fill.style.width = `${pct}%`;
    if (text) text.textContent = `${pct}%`;
    if (countEl) countEl.textContent = `${count} / 15 niveles completados`;

    document.querySelectorAll(".modulo[data-modulo-real]").forEach(card => {
      const mod = Number(card.dataset.moduloReal);
      const moduleDone = [1,2,3,4,5].filter(n => done.has(`${mod}-${n}`)).length;
      let badge = card.querySelector(".sm-module-progress");
      if (!badge) {
        badge = document.createElement("div");
        badge.className = "sm-module-progress";
        card.appendChild(badge);
      }
      badge.textContent = `${moduleDone}/5 completados`;

      const unlocked = guest || mod === 1 || done.has(`${mod-1}-5`);
      card.classList.toggle("sm-locked", !unlocked);
      card.dataset.locked = unlocked ? "false" : "true";
      if (!unlocked) {
        card.title = `Completa el Módulo ${mod-1} para desbloquearlo`;
      }
    });
  }

  async function initModulePage(modulo) {
    let user = null;
    if (window.SAFEMIND_SUPABASE_CONFIGURED) {
      user = await requireAuth();
      if (!user) return;
    }
    const guest = isGuest(user);

    const rows = await load();
    const done = completedSet(rows);

    document.querySelectorAll(".module-card[data-module]").forEach(card => {
      const nivel = Number(card.dataset.module);
      const isDone = done.has(`${modulo}-${nivel}`);
      const unlocked = guest || nivel === 1 || done.has(`${modulo}-${nivel-1}`);

      card.dataset.locked = unlocked ? "false" : "true";
      card.classList.toggle("sm-level-locked", !unlocked);
      card.classList.toggle("sm-level-done", isDone);

      let badge = card.querySelector(".sm-level-badge");
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "sm-level-badge";
        card.appendChild(badge);
      }
      badge.textContent = isDone ? "✓ COMPLETADO" : (unlocked ? "DISPONIBLE" : "🔒 BLOQUEADO");
    });
  }

  return { getUser, requireAuth, load, save, complete, totalPercent, isGuest, initKidsDashboard, initModulePage };
})();
