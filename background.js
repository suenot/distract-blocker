// The blocklist starts empty — users add their own distracting sites.
const DEFAULT_SITES = [];

importScripts("rules.js");

const DEFAULT_SCHEDULE = DBRules.DEFAULT_SCHEDULE;

const STORAGE_KEYS = {
  ENABLED: "enabled", SITES: "sites", SCHEDULE: "schedule",
  ALLOW: "allow", UNLOCK_LIMIT: "unlockLimit", UNLOCK_LOG: "unlockLog", UNLOCK_UNTIL: "unlockUntil"
};

async function getState() {
  const data = await chrome.storage.local.get(Object.values(STORAGE_KEYS));
  return {
    enabled: data.enabled ?? true,
    sites: data.sites ?? DEFAULT_SITES,
    schedule: data.schedule ?? DEFAULT_SCHEDULE,
    allow: data.allow ?? {},
    unlockLimit: data.unlockLimit,
    unlockLog: data.unlockLog,
    unlockUntil: data.unlockUntil ?? 0
  };
}

const shouldBlockNow = (state, date = new Date()) => DBRules.shouldBlockNow(state, date);

const blockedPageUrl = () => chrome.runtime.getURL("blocked.html");

function buildRules(state) {
  const rules = [];
  let id = 1;
  for (const domain of state.sites) {
    const entries = state.allow[domain] || [];
    const host = DBRules.escRe(domain);
    // Full-page navigations land on the blocked page; "u" carries the original URL.
    rules.push({
      id: id++,
      priority: 1,
      action: {
        type: "redirect",
        redirect: { regexSubstitution: `${blockedPageUrl()}?d=${encodeURIComponent(domain)}&u=\\1` }
      },
      condition: {
        regexFilter: `^(https?://([^/?#]+\\.)?${host}(:[0-9]+)?([/?#].*)?)$`,
        isUrlFilterCaseSensitive: false,
        resourceTypes: ["main_frame"]
      }
    });
    if (entries.length === 0) {
      // Plain blocklist entry: also block the site embedded in other pages.
      rules.push({
        id: id++,
        priority: 1,
        action: { type: "block" },
        condition: { urlFilter: `||${domain}^`, resourceTypes: ["sub_frame"] }
      });
    }
    // Allow list: exceptions beat the redirect rule.
    for (const entry of entries) {
      const re = DBRules.allowRegex(domain, entry);
      if (!re) continue;
      rules.push({
        id: id++,
        priority: 2,
        action: { type: "allow" },
        condition: { regexFilter: re, isUrlFilterCaseSensitive: false, resourceTypes: ["main_frame"] }
      });
    }
  }
  return rules;
}

async function reloadBlockedTabs(state) {
  if (!state.sites.length) return;
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.id || !tab.url) continue;
    if (DBRules.isBlockedUrl(tab.url, state)) chrome.tabs.reload(tab.id).catch(() => {});
  }
}

// Sites with an allow list also need a guard script: YouTube-style sites
// navigate inside the page, which network rules cannot see.
async function syncGuardScripts(state) {
  const domains = state.sites.filter(s => (state.allow[s] || []).length);
  try { await chrome.scripting.unregisterContentScripts({ ids: ["db-guard"] }); } catch {}
  if (!domains.length) return;
  const matches = domains.map(d => `*://*.${d}/*`);
  await chrome.scripting.registerContentScripts([{
    id: "db-guard", matches, js: ["rules.js", "guard.js"], runAt: "document_start", persistAcrossSessions: true
  }]);
  const tabs = await chrome.tabs.query({ url: matches });
  for (const tab of tabs) {
    if (!tab.id) continue;
    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["rules.js", "guard.js"] }).catch(() => {});
  }
}

async function applyRules(force = false) {
  const state = await getState();
  const blocking = shouldBlockNow(state);
  await updateBadge(state.enabled, blocking);
  const sig = JSON.stringify([blocking, state.sites, state.allow]);
  const { sig: prev } = await chrome.storage.session.get("sig");
  if (!force && sig === prev) return;
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map(r => r.id);
  const addRules = blocking ? buildRules(state) : [];
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
  await chrome.storage.session.set({ sig });
  await syncGuardScripts(state);
  if (blocking) await reloadBlockedTabs(state);
}

async function updateBadge(enabled, blockingNow) {
  let text, color;
  if (!enabled) { text = "OFF"; color = "#5cb85c"; }
  else if (blockingNow) { text = "ON"; color = "#d9534f"; }
  else { text = "ON"; color = "#888888"; }
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color });
}

async function ensureScheduleAlarm() {
  await chrome.alarms.create("schedule-tick", { periodInMinutes: 1 });
}

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(err => console.error("sidePanel.setPanelBehavior failed:", err));

chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(Object.values(STORAGE_KEYS));
  const updates = {};
  if (data.enabled === undefined) updates.enabled = true;
  if (data.sites === undefined) updates.sites = DEFAULT_SITES;
  if (data.schedule === undefined) updates.schedule = DEFAULT_SCHEDULE;
  if (Object.keys(updates).length) await chrome.storage.local.set(updates);
  await ensureScheduleAlarm();
  await applyRules(true);
});

chrome.runtime.onStartup.addListener(async () => {
  await ensureScheduleAlarm();
  await applyRules(true);
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === "schedule-tick" || alarm.name === "unlock-end") applyRules();
});

chrome.commands.onCommand.addListener(async command => {
  if (command !== "toggle-blocking") return;
  // Protected mode: while a lock is set, the shortcut can't change blocking.
  const { lock } = await chrome.storage.local.get("lock");
  if (lock) return;
  const { enabled } = await getState();
  await chrome.storage.local.set({ enabled: !enabled });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.sites || changes.enabled || changes.schedule || changes.allow || changes.unlockUntil) applyRules();
});

// Spend one daily unlock: pause blocking for 5 minutes. Done here, not in the
// page, so the count and the limit are enforced in one place.
async function doUnlock() {
  const { lock } = await chrome.storage.local.get("lock");
  if (lock) return { ok: false, reason: "locked" };
  const state = await getState();
  if (DBRules.isUnlocked(state)) return { ok: true, left: DBRules.unlocksLeft(state) };
  if (DBRules.unlocksLeft(state) === 0) return { ok: false, reason: "limit" };
  const until = Date.now() + DBRules.UNLOCK_MS;
  const used = DBRules.unlocksUsedToday(state) + 1;
  await chrome.storage.local.set({ unlockUntil: until, unlockLog: { day: DBRules.dayKey(), count: used } });
  await chrome.alarms.create("unlock-end", { when: until + 1000 });
  await applyRules();
  return { ok: true, left: DBRules.unlocksLeft({ ...state, unlockLog: { day: DBRules.dayKey(), count: used } }) };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id || msg?.type !== "unlock") return;
  doUnlock().then(sendResponse, () => sendResponse({ ok: false, reason: "error" }));
  return true;
});
