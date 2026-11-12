// Shared rules logic: loaded by the service worker (importScripts), the
// per-site guard content script, the blocked page and the side panel.
// Single source of truth for schedule, allow-list and unlock-limit maths.
(function (root) {
  const UNLOCK_MS = 5 * 60 * 1000;
  const DEFAULT_UNLOCK_LIMIT = 3;
  const DEFAULT_SCHEDULE = { mode: "always", ranges: [] };

  // ---- schedule ----------------------------------------------------------

  function timeToMinutes(t) {
    const [h, m] = String(t).split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  function rangeActive(range, date) {
    const days = range.days;
    const hasDays = Array.isArray(days) && days.length > 0;
    const cur = date.getHours() * 60 + date.getMinutes();
    const start = timeToMinutes(range.start);
    const end = timeToMinutes(range.end);
    if (start === end) return false;
    if (start < end) {
      if (hasDays && !days.includes(date.getDay())) return false;
      return cur >= start && cur < end;
    }
    // Overnight window crossing midnight.
    if (cur >= start) return !hasDays || days.includes(date.getDay());
    if (cur < end) return !hasDays || days.includes((date.getDay() + 6) % 7);
    return false;
  }

  function scheduleBlocks(schedule, date) {
    const sched = schedule || DEFAULT_SCHEDULE;
    if (sched.mode === "always") return true;
    const anyActive = (sched.ranges || []).some((r) => rangeActive(r, date));
    if (sched.mode === "blockDuring") return anyActive;
    if (sched.mode === "allowDuring") return !anyActive;
    return true;
  }

  // ---- unlocks -----------------------------------------------------------

  const dayKey = (date = new Date()) => date.toLocaleDateString("sv"); // local YYYY-MM-DD

  function unlockLimit(state) {
    const n = Number(state.unlockLimit);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : DEFAULT_UNLOCK_LIMIT;
  }

  function unlocksUsedToday(state, date = new Date()) {
    const log = state.unlockLog;
    return log && log.day === dayKey(date) ? Number(log.count) || 0 : 0;
  }

  function unlocksLeft(state, date = new Date()) {
    return Math.max(0, unlockLimit(state) - unlocksUsedToday(state, date));
  }

  function isUnlocked(state, now = Date.now()) {
    return Number(state.unlockUntil) > now;
  }

  // ---- blocking decision -------------------------------------------------

  function shouldBlockNow(state, date = new Date()) {
    if (!state.enabled) return false;
    if (isUnlocked(state, date.getTime())) return false;
    return scheduleBlocks(state.schedule, date);
  }

  // ---- allow list --------------------------------------------------------
  // An entry is one of:
  //   host    "studio.youtube.com"   (a subdomain or other host of the site)
  //   path    "/channel_switcher"    (a path prefix on any host of the site)
  //   handle  "@mychannel"           (same as the path "/@mychannel")
  //   id      "UCxxxxxxxxxxxxxxxxxxxxxx" (same as the path "/channel/UC...")

  function parseAllowEntry(raw) {
    let s = String(raw || "").trim();
    if (!s) return null;
    s = s.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
    // Pasted full URL with a host: split into host and path.
    const m = s.match(/^([a-z0-9-]+(?:\.[a-z0-9-]+)+)(\/.*)?$/i);
    if (m) {
      const host = m[1].toLowerCase();
      const path = (m[2] || "").replace(/[?#].*$/, "").replace(/\/+$/, "");
      // "youtube.com/@handle" keeps its path as a path entry; "studio.youtube.com" is a host entry.
      return path ? { type: "path-on-host", host, path } : { type: "host", host };
    }
    if (/^@[\w.\-]+$/.test(s)) return { type: "path", path: "/" + s };
    if (/^UC[\w-]{22}$/.test(s)) return { type: "path", path: "/channel/" + s };
    if (s.startsWith("/")) {
      const path = s.replace(/[?#].*$/, "").replace(/\/+$/, "");
      return path ? { type: "path", path } : null;
    }
    return null;
  }

  // Normalise to the canonical stored string, or null when invalid.
  function canonicalAllow(raw) {
    const e = parseAllowEntry(raw);
    if (!e) return null;
    if (e.type === "host") return e.host;
    if (e.type === "path-on-host") return e.host + e.path;
    return e.path.startsWith("/@") ? e.path.slice(1) : e.path.startsWith("/channel/UC") ? e.path.slice(9) : e.path;
  }

  function parseAllowText(text) {
    const seen = new Set();
    const out = [];
    for (const part of String(text || "").split(/[\n,]+/)) {
      const c = canonicalAllow(part);
      if (c && !seen.has(c)) { seen.add(c); out.push(c); }
    }
    return out;
  }

  const hostInSite = (host, site) => host === site || host.endsWith("." + site);

  function matchSite(host, sites) {
    return (sites || []).find((s) => hostInSite(host, s)) ?? null;
  }

  function urlMatchesEntry(url, site, raw) {
    const e = parseAllowEntry(raw);
    if (!e) return false;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const path = url.pathname.toLowerCase();
    const under = (p) => path === p || path.startsWith(p + "/");
    if (e.type === "host") return hostInSite(host, e.host);
    if (e.type === "path-on-host") return hostInSite(host, e.host) && under(e.path.toLowerCase());
    return hostInSite(host, site) && under(e.path.toLowerCase());
  }

  function isUrlAllowed(urlStr, site, entries) {
    let url;
    try { url = new URL(urlStr); } catch { return false; }
    return (entries || []).some((e) => urlMatchesEntry(url, site, e));
  }

  // Is this URL one the blocker would stop right now (ignoring schedule)?
  function isBlockedUrl(urlStr, state) {
    let url;
    try { url = new URL(urlStr); } catch { return null; }
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const site = matchSite(url.hostname.toLowerCase(), state.sites);
    if (!site) return null;
    return isUrlAllowed(urlStr, site, (state.allow || {})[site]) ? null : site;
  }

  // Links the blocked page offers for a site's allow list.
  function allowLinks(site, entries) {
    const out = [];
    for (const raw of entries || []) {
      const e = parseAllowEntry(raw);
      if (!e) continue;
      if (e.type === "host") out.push({ label: e.host, href: "https://" + e.host + "/" });
      else if (e.type === "path-on-host") out.push({ label: e.host + e.path, href: "https://" + e.host + e.path });
      else out.push({ label: raw, href: "https://www." + site + e.path });
    }
    return out;
  }

  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // declarativeNetRequest regexFilter for one allow entry (RE2 syntax).
  function allowRegex(site, raw) {
    const e = parseAllowEntry(raw);
    if (!e) return null;
    const tail = "([/?#].*)?$";
    if (e.type === "host") return `^https?://([^/?#]+\\.)?${escRe(e.host)}(:[0-9]+)?${tail}`;
    const host = e.type === "path-on-host" ? e.host : site;
    return `^https?://([^/?#]+\\.)?${escRe(host)}(:[0-9]+)?${escRe(e.path)}${tail}`;
  }

  root.DBRules = {
    UNLOCK_MS, DEFAULT_UNLOCK_LIMIT, DEFAULT_SCHEDULE,
    rangeActive, scheduleBlocks, dayKey, unlockLimit, unlocksUsedToday, unlocksLeft, isUnlocked,
    shouldBlockNow, parseAllowEntry, canonicalAllow, parseAllowText, hostInSite, matchSite,
    isUrlAllowed, isBlockedUrl, allowLinks, allowRegex, escRe,
  };
})(typeof self !== "undefined" ? self : globalThis);
