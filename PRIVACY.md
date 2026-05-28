# Privacy Policy — Distract Blocker

_Last updated: 2026-05-28_

## TL;DR

Distract Blocker does **not collect, transmit, or share any personal data**. Everything happens locally on your device. There is no server, no analytics, no login, no advertising.

## What the extension stores locally

The extension uses `chrome.storage.local` to persist only the settings you enter or change yourself:

- Your blocklist of distracting domains
- Whether the master toggle is on or off
- Your schedule (mode + day-of-week + time ranges)
- The UI language you've selected
- Whether you prefer the list or text view for editing the blocklist

This data stays entirely on your device. It is **not** synced (we do not use `chrome.storage.sync`). It is **not** transmitted anywhere.

## What the extension does NOT do

- No analytics or telemetry
- No remote code, no third-party scripts loaded at runtime
- No tracking of which sites you visit
- No reading of page content
- No login or account
- No advertising
- No selling, transferring, or sharing of user data with any third party

## How blocking works

We use Chrome's native `declarativeNetRequest` API. Rules are derived from your blocklist and registered with Chrome. Chrome enforces the rules natively — the extension itself never sees the URLs you actually navigate to. The redirect action sends matched navigations to a local in-extension page (`blocked.html`) packaged with the extension.

## Permissions and why each is needed

- **`storage`** — to save your settings on your device
- **`declarativeNetRequest`** — to register blocking rules with Chrome
- **`sidePanel`** — to render the user interface (the side panel)
- **`alarms`** — to wake the service worker once per minute so the schedule can be re-evaluated
- **`host_permissions: <all_urls>`** — required by Chrome to authorize `declarativeNetRequest`'s `redirect` action against any domain on your blocklist; the extension itself never reads, modifies, or transmits page content

## Open source

Source code (MIT-licensed): https://github.com/suenot/distract-blocker

You can audit every line and re-build the extension yourself.

## Contact

- Issues: https://github.com/suenot/distract-blocker/issues
- Email: suenot@gmail.com

## Changes to this policy

Any future change will be reflected in this file and dated above. Because there is no server, you can always read the current policy by viewing this file in the GitHub repository.
