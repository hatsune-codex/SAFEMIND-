document.addEventListener("DOMContentLoaded", async () => {
  if (!window.SAFEMIND_SUPABASE_CONFIGURED || !window.supabaseClient) return;
  const { data: { user } } = await window.supabaseClient.auth.getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const email = user.email || "Invitado";
  const holder = document.createElement("div");
  holder.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:9999;background:rgba(5,8,22,.92);border:1px solid #00d5ff55;color:#fff;padding:9px 12px;border-radius:12px;font:12px Poppins,sans-serif;box-shadow:0 0 18px #00d5ff22";
  holder.innerHTML = `<span style="opacity:.75">${email}</span> <button id="smLogout" style="margin-left:8px;border:0;border-radius:8px;padding:6px 9px;cursor:pointer;background:#00d5ff;color:#04101a;font-weight:800">Salir</button>`;
  document.body.appendChild(holder);
  document.getElementById("smLogout").onclick = async () => {
    await window.supabaseClient.auth.signOut();
    window.location.href = "login.html";
  };
});
