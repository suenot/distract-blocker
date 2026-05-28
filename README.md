# Distract Blocker

A quiet Chrome extension that blocks distracting sites. Click the icon → a side panel slides in with a toggle, your blocklist, a custom shortcut, and a tiny guardian mascot.

## Features

- **Side panel UI** (Manifest V3) — toggle, list, textarea, language switcher
- **Custom keyboard shortcut** — toggle blocking instantly without opening the panel
- **Two list editors** — list view with add/remove, or paste a full textarea
- **21 languages** — English, Русский, 中文, 日本語, 한국어, Español, Português, हिन्दी, العربية, Français, Deutsch, Italiano, Nederlands, Türkçe, Қазақша, Oʻzbek, Кыргызча, Bahasa Indonesia, Tiếng Việt, ไทย, Bahasa Melayu (with RTL support for Arabic)
- **Friendly blocked page** — instead of a Chrome error, you get a polite "not now" page with the mascot
- **No remote code, no telemetry** — blocking uses `declarativeNetRequest` native rules

## Install (local)

1. `chrome://extensions/`
2. Enable **Developer mode**
3. **Load unpacked** → select the repository root

## Repo layout

```
.
├── manifest.json            Manifest V3
├── background.js            service worker (rules + tab reload + commands)
├── sidepanel.{html,css,js}  side panel UI
├── blocked.{html,css,js}    redirect target for blocked navigations
├── mascot.js                guardian mascot SVG
├── i18n.js                  runtime locale loader (overrides chrome.i18n)
├── _locales/<lang>/messages.json
├── icons/                   icon SVG + rendered PNGs
└── landing/                 Astro + Tailwind marketing site
```

## Landing

```
cd landing
npm install
npm run dev      # local dev server
npm run build    # static build to dist/
```

## License

MIT
