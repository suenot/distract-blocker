#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

shots=(
  "screenshots/01-overview:1280:800"
  "screenshots/02-schedule:1280:800"
  "screenshots/03-blocked:1280:800"
  "screenshots/04-languages:1280:800"
  "screenshots/05-textarea:1280:800"
  "promo/small-tile:440:280"
  "promo/marquee:1400:560"
)

for entry in "${shots[@]}"; do
  IFS=":" read -r path w h <<<"$entry"
  src="_sources/${path}.svg"
  dst="${path}-${w}x${h}.png"
  # render SVG to PNG (still RGBA at this point)
  rsvg-convert -w "$w" -h "$h" "$src" -o "${dst}.tmp.png"
  # flatten alpha onto solid dark bg (Chrome Store: 24-bit PNG, no alpha)
  python3 - "${dst}.tmp.png" "$dst" <<'PY'
import sys
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
img = Image.open(src).convert("RGBA")
bg = Image.new("RGB", img.size, (13, 14, 17))  # matches our dark background
bg.paste(img, mask=img.split()[3])
bg.save(dst, "PNG", optimize=True)
PY
  rm "${dst}.tmp.png"
  echo "✓ $dst"
done
