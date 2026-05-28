# Chrome Web Store submission assets

Everything you need to paste into the Chrome Web Store listing form.

## Layout

```
chrome-store/
├── meta.txt                       Category, URLs, permission justifications
├── en/                            English texts
│   ├── title.txt
│   ├── summary.txt                ≤132 chars
│   └── description.txt            ≤16,000 chars
├── ru/                            Russian texts (for the localized listing)
│   ├── title.txt
│   ├── summary.txt
│   └── description.txt
├── icons/
│   └── store-icon-128.png         128×128, RGBA — store icon
├── screenshots/                   1280×800, 24-bit PNG (no alpha)
│   ├── 01-overview-1280x800.png
│   ├── 02-schedule-1280x800.png
│   ├── 03-blocked-1280x800.png
│   ├── 04-languages-1280x800.png
│   └── 05-textarea-1280x800.png
├── promo/
│   ├── small-tile-440x280.png     440×280, 24-bit PNG (no alpha)
│   └── marquee-1400x560.png       1400×560, 24-bit PNG (no alpha)
└── _sources/                      SVG sources + render.sh
```

## Mapping to the upload form

| Form field                         | File                                                 |
| ---------------------------------- | ---------------------------------------------------- |
| Title from package                 | auto from `manifest.json` `__MSG_extensionName__`    |
| Summary from package               | auto from `manifest.json` `__MSG_extensionDescription__` |
| Description (English – en)         | `en/description.txt`                                 |
| Description (Russian – ru)         | `ru/description.txt`                                 |
| Category                           | `meta.txt` — Productivity                            |
| Store icon                         | `icons/store-icon-128.png`                           |
| Global screenshots                 | `screenshots/01..05-*.png` (English UI, default fallback) |
| Localized screenshots (en)         | same 5 from `screenshots/` (English UI)              |
| Localized screenshots (ru)         | `screenshots/ru/01..05-*.png` (Russian UI)           |
| Small promo tile                   | `promo/small-tile-440x280.png`                       |
| Marquee promo tile                 | `promo/marquee-1400x560.png`                         |
| Official URL / Homepage URL        | `https://distract-blocker.marketmaker.cc`            |
| Support URL                        | `https://github.com/suenot/distract-blocker/issues`  |
| Mature content                     | No                                                   |

## Permission justifications

Paste the bottom block of `meta.txt` when Chrome asks why each permission is needed (each is short and reviewer-friendly).

## Re-rendering screenshots/tiles

If you edit any SVG in `_sources/`:

```
bash chrome-store/_sources/render.sh
```

The script renders each SVG via `rsvg-convert`, then flattens the alpha channel against the dark brand background (#0d0e11) using Pillow — Chrome Store wants 24-bit PNG, no alpha, for screenshots and tiles.

## Notes

- The five screenshots are stylized previews of the side panel rather than literal browser captures. Replace any of them with real screenshots later if you prefer — just keep 1280×800, 24-bit PNG, no alpha.
- Russian texts are bonus; English is the only one strictly required for the store. Other 19 locales the extension speaks will use the en description automatically (Chrome falls back to default locale).
