#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# entries: <source-path-without-svg-ext>:<output-path-without-png-ext>:<W>:<H>
shots=(
  "_sources/screenshots/01-overview:screenshots/01-overview-1280x800:1280:800"
  "_sources/screenshots/02-schedule:screenshots/02-schedule-1280x800:1280:800"
  "_sources/screenshots/03-blocked:screenshots/03-blocked-1280x800:1280:800"
  "_sources/screenshots/04-languages:screenshots/04-languages-1280x800:1280:800"
  "_sources/screenshots/05-textarea:screenshots/05-textarea-1280x800:1280:800"
  "_sources/promo/small-tile:promo/small-tile-440x280:440:280"
  "_sources/promo/marquee:promo/marquee-1400x560:1400:560"

  "_sources/screenshots-ru/01-overview:screenshots/ru/01-overview-1280x800:1280:800"
  "_sources/screenshots-ru/02-schedule:screenshots/ru/02-schedule-1280x800:1280:800"
  "_sources/screenshots-ru/03-blocked:screenshots/ru/03-blocked-1280x800:1280:800"
  "_sources/screenshots-ru/04-languages:screenshots/ru/04-languages-1280x800:1280:800"
  "_sources/screenshots-ru/05-textarea:screenshots/ru/05-textarea-1280x800:1280:800"
  "_sources/promo-ru/small-tile:promo/ru/small-tile-440x280:440:280"
  "_sources/promo-ru/marquee:promo/ru/marquee-1400x560:1400:560"
)

for entry in "${shots[@]}"; do
  IFS=":" read -r src_base dst_base w h <<<"$entry"
  src="${src_base}.svg"
  dst="${dst_base}.png"
  mkdir -p "$(dirname "$dst")"
  rsvg-convert -w "$w" -h "$h" "$src" -o "${dst}.tmp.png"
  python3 - "${dst}.tmp.png" "$dst" <<'PY'
import sys
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
img = Image.open(src).convert("RGBA")
bg = Image.new("RGB", img.size, (13, 14, 17))
bg.paste(img, mask=img.split()[3])
bg.save(dst, "PNG", optimize=True)
PY
  rm "${dst}.tmp.png"
  echo "✓ $dst"
done
