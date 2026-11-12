// Content script for sites that have an allow list. Network rules cannot see
// in-page navigation (YouTube is a SPA), so this watches the address and sends
// the tab to the blocked page when it leaves the allowed pages.
(function () {
  if (window.__dbGuard) return;
  window.__dbGuard = true;

  let state = null;
  let last = "";

  async function load() {
    try {
      state = await chrome.storage.local.get(["enabled", "sites", "schedule", "allow", "unlockUntil"]);
      state.enabled = state.enabled ?? true;
      state.sites = state.sites || [];
      state.allow = state.allow || {};
    } catch {
      state = null; // extension reloaded: stop guarding this stale script
    }
  }

  function check() {
    if (!state || location.href === last) return;
    last = location.href;
    if (!DBRules.shouldBlockNow(state)) return;
    const site = DBRules.isBlockedUrl(location.href, state);
    if (!site) return;
    const target = chrome.runtime.getURL("blocked.html") + "?d=" + encodeURIComponent(site) + "&u=" + location.href;
    location.replace(target);
  }

  try {
    chrome.storage.onChanged.addListener(async () => { await load(); last = ""; check(); });
  } catch {}
  load().then(check);
  setInterval(() => { last === location.href || check(); }, 400);
  addEventListener("popstate", () => { last = ""; check(); });
  addEventListener("yt-navigate-start", () => { last = ""; check(); });
  addEventListener("yt-navigate-finish", () => { last = ""; check(); });
})();
