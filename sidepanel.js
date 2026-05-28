const $mascot = document.getElementById("mascot");
const $toggle = document.getElementById("enabledToggle");
const $card = document.getElementById("statusCard");
const $statusValue = document.getElementById("statusValue");
const $statusSub = document.getElementById("statusSub");
const $schedModeBtns = document.querySelectorAll("[data-sched-mode]");
const $schedRanges = document.getElementById("schedRanges");
const $rangeList = document.getElementById("rangeList");
const $addRangeBtn = document.getElementById("addRangeBtn");
const $list = document.getElementById("sitesList");
const $form = document.getElementById("addForm");
const $input = document.getElementById("newSite");
const $counter = document.getElementById("counter");
const $empty = document.getElementById("emptyHint");
const $listPane = document.getElementById("listPane");
const $textPane = document.getElementById("textPane");
const $sitesText = document.getElementById("sitesText");
const $saveText = document.getElementById("saveText");
const $textStatus = document.getElementById("textStatus");
const $modeBtns = document.querySelectorAll(".mode-btn");
const $shortcutText = document.getElementById("shortcutText");
const $infoBtn = document.getElementById("infoBtn");
const $tooltip = document.getElementById("shortcutTooltip");
const $shortcutsBtn = document.getElementById("shortcutsBtn");
const $langBtn = document.getElementById("langBtn");
const $langAside = document.getElementById("languageAside");
const $langBackBtn = document.getElementById("langBackBtn");
const $langList = document.getElementById("langList");

const MODE_KEY = "editMode";
const DEFAULT_SCHEDULE = { mode: "always", ranges: [] };

renderMascot($mascot);

function normalize(raw) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

function isValidDomain(d) {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(d);
}

function parseTextSites(text) {
  const seen = new Set();
  const out = [];
  for (const line of text.split("\n")) {
    const d = normalize(line);
    if (d && isValidDomain(d) && !seen.has(d)) {
      seen.add(d);
      out.push(d);
    }
  }
  return out;
}

async function getState() {
  const data = await chrome.storage.local.get(["enabled", "sites", MODE_KEY, "schedule"]);
  return {
    enabled: data.enabled ?? true,
    sites: Array.isArray(data.sites) ? data.sites : [],
    mode: data[MODE_KEY] === "text" ? "text" : "list",
    schedule: data.schedule ?? DEFAULT_SCHEDULE
  };
}

function timeToMinutes(t) {
  const [h, m] = String(t).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function rangeActive(range, date) {
  if (Array.isArray(range.days) && range.days.length > 0 && !range.days.includes(date.getDay())) return false;
  const cur = date.getHours() * 60 + date.getMinutes();
  const start = timeToMinutes(range.start);
  const end = timeToMinutes(range.end);
  return start < end && cur >= start && cur < end;
}

function isBlockingNow(enabled, schedule, date = new Date()) {
  if (!enabled) return false;
  if (!schedule || schedule.mode === "always") return true;
  const anyActive = (schedule.ranges || []).some(r => rangeActive(r, date));
  return schedule.mode === "blockDuring" ? anyActive : !anyActive;
}

function getDayNames(locale) {
  const tag = locale.replace("_", "-");
  const fmt = new Intl.DateTimeFormat(tag, { weekday: "short" });
  const names = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(2024, 0, 7 + i);
    names.push(fmt.format(d));
  }
  return names;
}

function renderToggle(enabled, schedule) {
  $toggle.checked = enabled;
  $card.classList.toggle("on", enabled);
  $statusValue.textContent = t(enabled ? "stateOn" : "stateOff");

  const showSub = enabled && schedule && schedule.mode !== "always";
  if (showSub) {
    const blocking = isBlockingNow(enabled, schedule);
    $statusSub.textContent = t(blocking ? "statusActive" : "statusIdle");
    $statusSub.classList.toggle("is-active", blocking);
    $statusSub.hidden = false;
    $mascot.dataset.state = blocking ? "on" : "off";
  } else {
    $statusSub.hidden = true;
    $mascot.dataset.state = enabled ? "on" : "off";
  }
}

function renderSchedule(schedule) {
  for (const b of $schedModeBtns) {
    const active = b.dataset.schedMode === schedule.mode;
    b.classList.toggle("is-active", active);
    b.setAttribute("aria-selected", String(active));
  }
  $schedRanges.hidden = schedule.mode === "always";

  const dayNames = getDayNames(getCurrentLocale());
  const items = (schedule.ranges || []).map((range, i) => buildRangeItem(range, i, dayNames));
  $rangeList.replaceChildren(...items);
}

function buildRangeItem(range, index, dayNames) {
  const li = document.createElement("li");
  li.className = "range-item";

  const times = document.createElement("div");
  times.className = "range-times";

  const startInput = document.createElement("input");
  startInput.type = "time";
  startInput.value = range.start || "09:00";
  startInput.addEventListener("change", () => updateRange(index, { start: startInput.value }));

  const sep = document.createElement("span");
  sep.className = "range-sep";
  sep.textContent = "–";

  const endInput = document.createElement("input");
  endInput.type = "time";
  endInput.value = range.end || "18:00";
  endInput.addEventListener("change", () => updateRange(index, { end: endInput.value }));

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove";
  removeBtn.textContent = "×";
  removeBtn.setAttribute("aria-label", t("removeRangeAria", [String(index + 1)]));
  removeBtn.addEventListener("click", () => removeRange(index));

  times.append(startInput, sep, endInput, removeBtn);

  const chips = document.createElement("div");
  chips.className = "day-chips";
  const days = new Set(range.days || []);
  for (let d = 0; d < 7; d++) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "day-chip";
    if (days.has(d)) chip.classList.add("is-active");
    chip.textContent = dayNames[d];
    chip.addEventListener("click", () => toggleDay(index, d));
    chips.append(chip);
  }

  li.append(times, chips);
  return li;
}

function renderSites(sites) {
  const items = sites.map(domain => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.className = "domain";
    span.textContent = domain;
    const btn = document.createElement("button");
    btn.className = "remove";
    btn.type = "button";
    btn.setAttribute("aria-label", t("removeAria", [domain]));
    btn.textContent = "×";
    btn.addEventListener("click", () => removeSite(domain));
    li.append(span, btn);
    return li;
  });
  $list.replaceChildren(...items);
  $counter.textContent = String(sites.length);
  $empty.hidden = sites.length > 0;

  if (document.activeElement !== $sitesText) {
    $sitesText.value = sites.join("\n");
  }
}

function renderMode(mode) {
  const isText = mode === "text";
  $listPane.hidden = isText;
  $textPane.hidden = !isText;
  for (const b of $modeBtns) {
    const active = b.dataset.mode === mode;
    b.classList.toggle("is-active", active);
    b.setAttribute("aria-selected", String(active));
  }
}

async function render() {
  const { enabled, sites, mode, schedule } = await getState();
  renderToggle(enabled, schedule);
  renderSites(sites);
  renderMode(mode);
  renderSchedule(schedule);
}

async function setSchedule(patch) {
  const data = await chrome.storage.local.get("schedule");
  const cur = data.schedule || DEFAULT_SCHEDULE;
  await chrome.storage.local.set({ schedule: { ...cur, ...patch } });
}

async function setSchedMode(mode) {
  const data = await chrome.storage.local.get("schedule");
  const cur = data.schedule || DEFAULT_SCHEDULE;
  const next = { ...cur, mode };
  if (mode !== "always" && (!next.ranges || next.ranges.length === 0)) {
    next.ranges = [{ days: [1, 2, 3, 4, 5], start: "09:00", end: "18:00" }];
  }
  await chrome.storage.local.set({ schedule: next });
}

async function updateRange(index, patch) {
  const data = await chrome.storage.local.get("schedule");
  const sched = { ...(data.schedule || DEFAULT_SCHEDULE) };
  sched.ranges = [...(sched.ranges || [])];
  sched.ranges[index] = { ...sched.ranges[index], ...patch };
  await chrome.storage.local.set({ schedule: sched });
}

async function toggleDay(index, day) {
  const data = await chrome.storage.local.get("schedule");
  const sched = { ...(data.schedule || DEFAULT_SCHEDULE) };
  sched.ranges = [...(sched.ranges || [])];
  const r = { ...sched.ranges[index] };
  const days = new Set(r.days || []);
  if (days.has(day)) days.delete(day); else days.add(day);
  r.days = [...days].sort((a, b) => a - b);
  sched.ranges[index] = r;
  await chrome.storage.local.set({ schedule: sched });
}

async function removeRange(index) {
  const data = await chrome.storage.local.get("schedule");
  const sched = { ...(data.schedule || DEFAULT_SCHEDULE) };
  sched.ranges = [...(sched.ranges || [])];
  sched.ranges.splice(index, 1);
  await chrome.storage.local.set({ schedule: sched });
}

async function addRange() {
  const data = await chrome.storage.local.get("schedule");
  const sched = { ...(data.schedule || DEFAULT_SCHEDULE) };
  sched.ranges = [...(sched.ranges || []), { days: [1, 2, 3, 4, 5], start: "09:00", end: "18:00" }];
  await chrome.storage.local.set({ schedule: sched });
}

async function setEnabled(enabled) {
  await chrome.storage.local.set({ enabled });
}

async function addSite(raw) {
  const domain = normalize(raw);
  if (!isValidDomain(domain)) {
    $input.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }],
      { duration: 180 }
    );
    return;
  }
  const { sites } = await getState();
  if (sites.includes(domain)) return;
  await chrome.storage.local.set({ sites: [...sites, domain] });
  $input.value = "";
}

async function removeSite(domain) {
  const { sites } = await getState();
  await chrome.storage.local.set({ sites: sites.filter(s => s !== domain) });
}

async function saveTextarea() {
  const sites = parseTextSites($sitesText.value);
  await chrome.storage.local.set({ sites });
  $sitesText.value = sites.join("\n");
  $textStatus.textContent = t("savedStatus");
  $textStatus.classList.add("is-shown");
  setTimeout(() => $textStatus.classList.remove("is-shown"), 1400);
}

async function updateShortcutDisplay() {
  try {
    const commands = await chrome.commands.getAll();
    const cmd = commands.find(c => c.name === "toggle-blocking");
    if (cmd?.shortcut) {
      $shortcutText.textContent = t("currentShortcut", [cmd.shortcut]);
      $shortcutText.classList.add("is-set");
    } else {
      $shortcutText.textContent = t("shortcutNotSet");
      $shortcutText.classList.remove("is-set");
    }
  } catch (err) {
    console.error("commands.getAll failed:", err);
  }
}

async function populateLangList() {
  const data = await chrome.storage.local.get("locale");
  const current = data.locale || "auto";
  const opts = [{ value: "auto", label: t("localeAuto"), code: "" }];
  for (const code of LOCALES) {
    opts.push({ value: code, label: LOCALE_NAMES[code], code: LOCALE_CODES[code] });
  }

  const items = opts.map(o => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.locale = o.value;
    if (o.value === current) btn.classList.add("is-active");

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = o.label;

    const right = document.createElement("span");
    right.className = "right";

    if (o.code) {
      const badge = document.createElement("span");
      badge.className = "code";
      badge.textContent = o.code;
      right.appendChild(badge);
    }

    const check = document.createElement("span");
    check.className = "check";
    check.textContent = "✓";
    right.appendChild(check);

    btn.append(label, right);
    btn.addEventListener("click", () => {
      setLocale(o.value);
      closeLangAside();
    });
    li.append(btn);
    return li;
  });
  $langList.replaceChildren(...items);
}

function openLangAside() {
  $langAside.hidden = false;
  $langBackBtn.focus();
}
function closeLangAside() {
  $langAside.hidden = true;
  $langBtn.focus();
}

$toggle.addEventListener("change", () => setEnabled($toggle.checked));

$form.addEventListener("submit", e => {
  e.preventDefault();
  if ($input.value.trim()) addSite($input.value);
});

$saveText.addEventListener("click", saveTextarea);

for (const b of $modeBtns) {
  b.addEventListener("click", () => {
    chrome.storage.local.set({ [MODE_KEY]: b.dataset.mode });
  });
}

for (const b of $schedModeBtns) {
  b.addEventListener("click", () => setSchedMode(b.dataset.schedMode));
}
$addRangeBtn.addEventListener("click", addRange);

$infoBtn.addEventListener("click", e => {
  e.stopPropagation();
  const open = !$tooltip.hidden;
  $tooltip.hidden = open;
  $infoBtn.classList.toggle("is-active", !open);
});
document.addEventListener("click", e => {
  if (!$tooltip.contains(e.target) && e.target !== $infoBtn) {
    $tooltip.hidden = true;
    $infoBtn.classList.remove("is-active");
  }
});

$shortcutsBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
});

$langBtn.addEventListener("click", openLangAside);
$langBackBtn.addEventListener("click", closeLangAside);
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !$langAside.hidden) closeLangAside();
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) updateShortcutDisplay();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.enabled || changes.sites || changes[MODE_KEY] || changes.schedule) render();
});

setInterval(async () => {
  const { enabled, schedule } = await getState();
  if (!enabled || !schedule || schedule.mode === "always") return;
  renderToggle(enabled, schedule);
}, 30000);

window.addEventListener("localechange", async () => {
  await populateLangList();
  await render();
  await updateShortcutDisplay();
});

i18nReady.then(async () => {
  await populateLangList();
  await render();
  await updateShortcutDisplay();
  document.body.classList.add("ready");
});
