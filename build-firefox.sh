#!/bin/sh
# Build a Firefox package into dist-firefox/ (and dist-firefox.zip).
# Firefox has no sidePanel and no MV3 service worker: use sidebar_action and background.scripts.
set -e
cd "$(dirname "$0")"
rm -rf dist-firefox dist-firefox.zip
mkdir dist-firefox
cp -R _locales icons *.js *.html *.css dist-firefox/
python3 - <<'PY'
import json
m = json.load(open("manifest.json"))
m["permissions"] = [p for p in m["permissions"] if p != "sidePanel"]
m.pop("side_panel", None)
m["background"] = {"scripts": ["rules.js", "background.js"]}
m["sidebar_action"] = {
    "default_panel": "sidepanel.html",
    "default_title": "__MSG_extensionName__",
    "default_icon": {"16": "icons/icon16.png", "32": "icons/icon32.png"},
    "open_at_install": False,
}
m["browser_specific_settings"] = {"gecko": {
    "id": "distract-blocker@suenot.com",
    "strict_min_version": "121.0",
    "data_collection_permissions": {"required": ["none"]},
}}
json.dump(m, open("dist-firefox/manifest.json", "w"), indent=2)
PY
(cd dist-firefox && zip -qr ../dist-firefox.zip .)
echo "Built dist-firefox/ and dist-firefox.zip"
