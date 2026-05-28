const DEFAULT_SITES = [
  "youtube.com",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
  "reddit.com",
  "vk.com",
  "ok.ru"
];

const DEFAULT_SCHEDULE = { mode: "always", ranges: [] };

const STORAGE_KEYS = { ENABLED: "enabled", SITES: "sites", SCHEDULE: "schedule" };

async function getState() {
  const data = await chrome.storage.local.get([
    STORAGE_KEYS.ENABLED,
    STORAGE_KEYS.SITES,
    STORAGE_KEYS.SCHEDULE
  ]);
  return {
    enabled: data.enabled ?? true,
    sites: data.sites ?? DEFAULT_SITES,
    schedule: data.schedule ?? DEFAULT_SCHEDULE
  };
}

function timeToMinutes(t) {
  const [h, m] = String(t).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function rangeActive(range, date) {
  if (Array.isArray(range.days) && range.days.length > 0 && !range.days.includes(date.getDay())) {
    return false;
  }
  const cur = date.getHours() * 60 + date.getMinutes();
  const start = timeToMinutes(range.start);
  const end = timeToMinutes(range.end);
  if (start >= end) return false;
  return cur >= start && cur < end;
}

function shouldBlockNow(state, date = new Date()) {
  if (!state.enabled) return false;
  const sched = state.schedule || DEFAULT_SCHEDULE;
  if (sched.mode === "always") return true;
  const anyActive = (sched.ranges || []).some(r => rangeActive(r, date));
  if (sched.mode === "blockDuring") return anyActive;
  if (sched.mode === "allowDuring") return !anyActive;
  return true;
}

function buildRules(sites) {
  const rules = [];
  let id = 1;
  for (const domain of sites) {
    rules.push({
      id: id++,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          url: chrome.runtime.getURL(`blocked.html?d=${encodeURIComponent(domain)}`)
        }
      },
      condition: {
        urlFilter: `||${domain}^`,
        resourceTypes: ["main_frame"]
      }
    });
    rules.push({
      id: id++,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: `||${domain}^`,
        resourceTypes: ["sub_frame"]
      }
    });
  }
  return rules;
}

function tabMatchesBlocked(tab, sites) {
  if (!tab.url) return null;
  let host;
  try { host = new URL(tab.url).hostname; } catch { return null; }
  return sites.find(s => host === s || host.endsWith(`.${s}`)) ?? null;
}

async function reloadBlockedTabs(sites) {
  if (!sites.length) return;
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.id) continue;
    if (tabMatchesBlocked(tab, sites)) {
      chrome.tabs.reload(tab.id).catch(() => {});
    }
  }
}

async function applyRules() {
  const state = await getState();
  const blocking = shouldBlockNow(state);
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map(r => r.id);
  const addRules = blocking ? buildRules(state.sites) : [];
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
  await updateBadge(state.enabled, blocking);
  if (blocking) await reloadBlockedTabs(state.sites);
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
  await applyRules();
});

chrome.runtime.onStartup.addListener(async () => {
  await ensureScheduleAlarm();
  await applyRules();
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === "schedule-tick") applyRules();
});

chrome.commands.onCommand.addListener(async command => {
  if (command !== "toggle-blocking") return;
  const { enabled } = await getState();
  await chrome.storage.local.set({ enabled: !enabled });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.sites || changes.enabled || changes.schedule) applyRules();
});
