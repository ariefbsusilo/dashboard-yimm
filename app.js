"use strict";
(() => {
  const get = id => document.getElementById(id);
  const raw = String(window.DASHBOARD_CONFIG?.appsScriptUrl || "").trim();
  function showSetup(message) {
    get("setup").hidden = false;
    get("setupMessage").textContent = message;
    get("status").textContent = "Dashboard belum terhubung";
  }
  if (!raw) {
    showSetup("Isi appsScriptUrl pada config.js dengan URL deployment Apps Script yang berakhiran /exec.");
    return;
  }
  let url;
  try {
    url = new URL(raw);
    const path = /^\/(?:macros\/s|a\/macros\/[^/]+\/s)\/[A-Za-z0-9_-]+\/exec$/;
    if (url.protocol !== "https:" || url.hostname !== "script.google.com" || url.port || url.username || url.password || !path.test(url.pathname)) throw new Error("URL tidak valid");
    url.hash = "";
  } catch (_) {
    showSetup("URL pada config.js belum benar. Gunakan URL Web App https://script.google.com/macros/s/ID_DEPLOYMENT/exec dari menu Deploy.");
    return;
  }
  const frame = get("dashboard");
  const direct = get("direct");
  direct.href = url.href;
  direct.hidden = false;
  const reload = get("reload");
  reload.hidden = false;
  get("help").hidden = false;
  function openFrame() {
    get("status").textContent = "Membuka dashboard…";
    frame.src = url.href;
    frame.hidden = false;
  }
  frame.addEventListener("load", () => {
    get("status").textContent = "Jika layar kosong, pilih Buka langsung";
  });
  reload.addEventListener("click", openFrame);
  openFrame();
})();
