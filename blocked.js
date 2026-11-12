renderMascot(document.getElementById("mascot"));

const params = new URLSearchParams(location.search);
const domain = params.get("d") || "";
// "u" is the original URL: everything after "&u=" (it may hold "&" itself).
const uIdx = location.search.indexOf("&u=");
const origin = uIdx >= 0 ? location.search.slice(uIdx + 3) + location.hash : "";
let state = {};
let locked = false;

function originOk() {
  try {
    const u = new URL(origin);
    return (u.protocol === "http:" || u.protocol === "https:") && DBRules.hostInSite(u.hostname.toLowerCase(), domain);
  } catch { return false; }
}

async function loadState() {
  const d = await chrome.storage.local.get(["unlockLimit", "unlockLog", "unlockUntil", "allow", "lock"]);
  state = d;
  locked = !!d.lock;
}

function renderAllowed() {
  const links = DBRules.allowLinks(domain, (state.allow || {})[domain]);
  const box = document.getElementById("allowed");
  const wrap = document.getElementById("allowedLinks");
  box.hidden = links.length === 0;
  wrap.replaceChildren(...links.map((l) => {
    const a = document.createElement("a");
    a.href = l.href;
    a.textContent = l.label;
    return a;
  }));
}

function renderUnlock() {
  const btn = document.getElementById("unlockBtn");
  const note = document.getElementById("unlockNote");
  const left = DBRules.unlocksLeft(state);
  btn.textContent = t("unlockButton", [String(left)]);
  btn.disabled = locked || left === 0;
  note.hidden = !(locked || left === 0);
  note.textContent = locked ? t("unlockLocked") : t("unlockNone");
}

async function doUnlock() {
  const btn = document.getElementById("unlockBtn");
  btn.disabled = true;
  const res = await chrome.runtime.sendMessage({ type: "unlock" });
  if (res && res.ok) {
    if (originOk()) location.replace(origin);
    else location.replace("https://" + domain + "/");
    return;
  }
  await loadState();
  renderUnlock();
}

function renderSubtitle() {
  const subtitleEl = document.getElementById("subtitle");
  const fullText = t("blockedSubtitle", [domain]);
  const parts = fullText.split(domain);

  subtitleEl.replaceChildren();
  parts.forEach((part, i) => {
    subtitleEl.appendChild(document.createTextNode(part));
    if (i < parts.length - 1 && domain) {
      const span = document.createElement("span");
      span.className = "domain";
      span.textContent = domain;
      subtitleEl.appendChild(span);
    }
  });
}

document.getElementById("backBtn").addEventListener("click", () => {
  if (history.length > 1) history.back();
  else window.close();
});

document.getElementById("unlockBtn").addEventListener("click", doUnlock);

window.addEventListener("localechange", () => { renderSubtitle(); renderAllowed(); renderUnlock(); });

i18nReady.then(async () => {
  await loadState();
  renderSubtitle();
  renderAllowed();
  renderUnlock();
  document.body.classList.add("ready");
});
