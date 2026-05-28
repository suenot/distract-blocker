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

const STORAGE_KEYS = { ENABLED: "enabled", SITES: "sites" };

async function getState() {
  const data = await chrome.storage.local.get([STORAGE_KEYS.ENABLED, STORAGE_KEYS.SITES]);
  return {
    enabled: data.enabled ?? true,
    sites: data.sites ?? DEFAULT_SITES
  };
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
  const { enabled, sites } = await getState();
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map(r => r.id);
  const addRules = enabled ? buildRules(sites) : [];
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
  await updateBadge(enabled);
  if (enabled) await reloadBlockedTabs(sites);
}

async function updateBadge(enabled) {
  await chrome.action.setBadgeText({ text: enabled ? "ON" : "OFF" });
  await chrome.action.setBadgeBackgroundColor({ color: enabled ? "#d9534f" : "#5cb85c" });
}

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(err => console.error("sidePanel.setPanelBehavior failed:", err));

chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get([STORAGE_KEYS.ENABLED, STORAGE_KEYS.SITES]);
  const updates = {};
  if (data.enabled === undefined) updates.enabled = true;
  if (data.sites === undefined) updates.sites = DEFAULT_SITES;
  if (Object.keys(updates).length) await chrome.storage.local.set(updates);
  await applyRules();
});

chrome.runtime.onStartup.addListener(applyRules);

chrome.commands.onCommand.addListener(async command => {
  if (command !== "toggle-blocking") return;
  const { enabled } = await getState();
  await chrome.storage.local.set({ enabled: !enabled });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.sites || changes.enabled) applyRules();
});
