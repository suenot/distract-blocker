const LOCALES = [
  "en", "ru", "zh_CN", "ja", "ko",
  "es", "pt_BR", "hi", "ar",
  "fr", "de", "it", "nl", "tr",
  "kk", "uz", "ky",
  "id", "vi", "th", "ms"
];
const LOCALE_NAMES = {
  en: "English",
  ru: "Русский",
  zh_CN: "中文 (简体)",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
  pt_BR: "Português (BR)",
  hi: "हिन्दी",
  ar: "العربية",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  nl: "Nederlands",
  tr: "Türkçe",
  kk: "Қазақша",
  uz: "O‘zbek",
  ky: "Кыргызча",
  id: "Bahasa Indonesia",
  vi: "Tiếng Việt",
  th: "ไทย",
  ms: "Bahasa Melayu"
};
const LOCALE_CODES = {
  en: "EN", ru: "RU", zh_CN: "ZH", ja: "JA", ko: "KO",
  es: "ES", pt_BR: "PT", hi: "HI", ar: "AR",
  fr: "FR", de: "DE", it: "IT", nl: "NL", tr: "TR",
  kk: "KK", uz: "UZ", ky: "KY",
  id: "ID", vi: "VI", th: "TH", ms: "MS"
};
const RTL_LOCALES = new Set(["ar", "he", "fa", "ur"]);
const LOCALE_KEY = "locale";
const LOCALE_AUTO = "auto";

let currentMessages = null;
let currentLocale = "en";

function pickAutoLocale() {
  const ui = (chrome.i18n.getUILanguage?.() || "en").replace("-", "_");
  if (LOCALES.includes(ui)) return ui;
  const lower = ui.toLowerCase();
  const exact = LOCALES.find(l => l.toLowerCase() === lower);
  if (exact) return exact;
  const prefix = lower.split("_")[0];
  return LOCALES.find(l => {
    const ll = l.toLowerCase();
    return ll === prefix || ll.startsWith(prefix + "_");
  }) || "en";
}

async function loadMessages(locale) {
  const url = chrome.runtime.getURL(`_locales/${locale}/messages.json`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Cannot load locale ${locale}`);
  return await res.json();
}

async function resolveLocale() {
  const data = await chrome.storage.local.get(LOCALE_KEY);
  const stored = data[LOCALE_KEY];
  if (stored && stored !== LOCALE_AUTO && LOCALES.includes(stored)) return stored;
  return pickAutoLocale();
}

async function initI18n() {
  currentLocale = await resolveLocale();
  try {
    currentMessages = await loadMessages(currentLocale);
  } catch {
    currentLocale = "en";
    currentMessages = await loadMessages("en");
  }
  applyI18n();
}

function t(key, substitutions) {
  const entry = currentMessages?.[key];
  if (!entry) return chrome.i18n.getMessage(key, substitutions) || "";
  let msg = entry.message;
  if (substitutions !== undefined) {
    const subs = Array.isArray(substitutions) ? substitutions : [substitutions];
    if (entry.placeholders) {
      for (const [name, def] of Object.entries(entry.placeholders)) {
        const idx = parseInt(String(def.content).replace("$", ""), 10) - 1;
        const value = subs[idx] ?? "";
        msg = msg.replace(new RegExp(`\\$${name}\\$`, "gi"), value);
      }
    } else {
      subs.forEach((v, i) => {
        msg = msg.replace(new RegExp(`\\$${i + 1}`, "g"), v);
      });
    }
  }
  return msg;
}

function applyI18n(root = document) {
  for (const el of root.querySelectorAll("[data-i18n]")) {
    const msg = t(el.dataset.i18n);
    if (msg) el.textContent = msg;
  }
  for (const el of root.querySelectorAll("[data-i18n-placeholder]")) {
    const msg = t(el.dataset.i18nPlaceholder);
    if (msg) el.placeholder = msg;
  }
  for (const el of root.querySelectorAll("[data-i18n-title]")) {
    const msg = t(el.dataset.i18nTitle);
    if (msg) el.title = msg;
  }
  for (const el of root.querySelectorAll("[data-i18n-aria-label]")) {
    const msg = t(el.dataset.i18nAriaLabel);
    if (msg) el.setAttribute("aria-label", msg);
  }
  document.documentElement.lang = currentLocale.replace("_", "-");
  document.documentElement.dir = RTL_LOCALES.has(currentLocale.split("_")[0]) ? "rtl" : "ltr";
}

async function setLocale(locale) {
  await chrome.storage.local.set({ [LOCALE_KEY]: locale });
}

function getCurrentLocale() { return currentLocale; }

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== "local" || !changes[LOCALE_KEY]) return;
  await initI18n();
  window.dispatchEvent(new CustomEvent("localechange"));
});

const i18nReady = initI18n();
