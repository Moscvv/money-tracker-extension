# Money Tracker — Chrome Browser Extension

A lightweight, finance tracker that  is built locally. Log expenses manually or auto-detect prices from the page you're currently viewing — all data stays 100% local, with no server, no account, and no network calls of any kind.

## Features

- **Quick manual entry** — amount, category, and currency, logged in seconds via the toolbar popup
- **Automatic price detection** — a content script scans the visible text of the current page for price-like patterns and offers them as one-click suggestions
- **Multi-currency support** — detects USD, GBP, EUR, JPY, and AUD based on symbols/format found on the page, with a manual override dropdown since currency symbols are sometimes ambiguous (e.g. `$` alone doesn't tell you *which* dollar)
- **Local-only storage** — everything is saved with the browser's `chrome.storage.local` API; nothing ever leaves your machine
- **Dashboard view** — a full-page summary showing totals grouped by currency, a daily spending breakdown, and an itemized, deletable list of every expense

## Local-only

There's no backend, no login, and no analytics. This was a deliberate design choice: spending data is sensitive, and the simplest way to guarantee privacy is to never transmit it anywhere in the first place.

## How it works

| Piece | Role |
|---|---|
| `manifest.json` | Extension configuration — permissions, popup, content script registration |
| `popup.html` / `popup.js` | Toolbar popup UI for manual entry and displaying auto-detected price suggestions |
| `content.js` | Injected into every webpage; scans visible text for price patterns (regex-based, per-currency) and responds to requests from the popup via message passing |
| `dashboard.html` / `dashboard.js` | Full-page view that reads all saved expenses and renders totals, daily grouping, and a deletable itemized list |

## A known limitation, by design

Currency detection relies on symbols/text visible on the page (`£`, `€`, `¥`, `A$`, `AUD`). A bare `$` is inherently ambiguous — it could be USD, AUD, CAD, etc. — so the extension makes a best-effort guess and always shows an editable currency dropdown rather than silently assuming. This sots of mirrors a real constraint in scraping/data-pipeline work: some ambiguity in source data can only be resolved with human judgment or external context (e.g. site locale).

## Installation (development mode)

1. Clone or download this repository
2. Open `chrome://extensions` (or `about:debugging` in Firefox)
3. Enable **Developer mode**
4. Click **Load unpacked** and select this project folder

## Tech notes

- Manifest V3
- No external dependencies, no build step — plain HTML/CSS/JS
- Uses `chrome.storage.local`, `chrome.tabs`, and `chrome.runtime` messaging APIs
- Price detection via per-currency regular expressions, merged and deduplicated
