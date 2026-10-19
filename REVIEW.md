# Review: Chrome Customization (New Tab extension)

Scope: `manifest.json`, `index.html`, `assets/js/script.js`, `assets/css/*`, git history.
No secrets were found in the git history. All 22 checks in the verification run passed (see bottom).

## Bugs fixed

| # | Problem | Fix |
|---|---------|-----|
| 1 | **Wrong stock % for Yahoo-sourced quotes.** `chartPreviousClose` with `range=5d` is the close *before the 5-day window*, so the "daily" change was really a ~5-day change (all Indian `.NS/.BO` symbols). | Use the previous session's close from the candle series. |
| 2 | **Back button left the page stuck** (loader overlay + fade-out remained) after a search, because the page is restored from bfcache. | `pageshow` handler resets state. |
| 3 | `data.data?.primaryData` threw when the Nasdaq response was not OK (relied on an accidental catch). | `data?.data?.…`, with validated output. |
| 4 | Typing while the **Manage links dialog** was open leaked characters into the hidden search box. | Ignored while dialog open; IME composition ignored too. |
| 5 | Date never updated if the tab stayed open past midnight. | Re-rendered on day change. |
| 6 | ETFs / bare symbols (e.g. `SPY`) never resolved because Yahoo was only tried with `.NS/.BO`. | Bare-symbol fallback added last. |
| 7 | Hidden page stayed keyboard-focusable (Tab reached invisible links). | `inert` on the inactive page. |
| 8 | Pasting (Ctrl+V) with focus on the page did nothing. | Paste starts a search like typing does. |
| 9 | Icon upload could exhaust the ~5 MB localStorage quota (256 KB data URLs x unlimited links). | Max 24 links; images re-encoded to <=128 px PNG. |
| 10 | `@import` in CSS delayed font loading; 72 unused italic font faces shipped. | `<link>` in `<head>`, italics removed (32 KB -> 17 KB). |

## Security hardening

| Risk | Change |
|------|--------|
| No CSP | Strict `extension_pages` CSP: `default-src 'none'`, scripts/styles/images from `'self'` only, `connect-src` limited to the 3 providers, `object-src 'none'`, `base-uri 'none'`, `form-action 'none'`. |
| Privacy leak: every shortcut domain was sent to `google.com/s2/favicons` and each site's `/favicon.ico` was fetched | Replaced with Chrome's local `_favicon` API (`favicon` permission). |
| `innerHTML` in clock/date | Replaced with DOM/`textContent` (also lets CSP stay strict). |
| Untrusted data from storage / network | `safeIconSrc()` allow-list (bundled icons or raster `data:image` only; SVG blocked); URLs must be http(s), no embedded credentials, <= 2048 chars; news links https-only; Nasdaq values must match numeric patterns; currency must be a 3-letter code. |
| Cookies/referrer sent to providers | All `fetch` calls use `credentials: 'omit'` and `referrerPolicy: 'no-referrer'`; `<meta name="referrer">` added; links use `noopener noreferrer`. |
| Excess requests / tracking surface | News cached 10 min; quote refresh throttled to once per minute for non-forced refreshes. |
| Unbounded input | Search capped at 2000 chars, link names at 40, 24 links, 10 tickers. |
| Dead third-party reference | Removed `sourceMappingURL` comment from bootstrap. |

## Design-level issues

Fixed: folder typo `assests` -> `assets` (existing saved icons are migrated automatically); `.gitignore` added; `minimum_chrome_version` set (needed by the favicon API); version bumped to 1.1.0.

Not fixed (need your decision or network access):
1. **Third-party fonts.** `fonts.gstatic.com` and especially `fonts.cdnfonts.com` (Anurati) are loaded on every new tab. Bundle the `.woff2` files locally and drop both hosts from `font-src` to remove the remaining third-party requests. (I had no network access to download them.)
2. **Unofficial APIs.** Nasdaq's `api.nasdaq.com` and Yahoo's chart endpoint are undocumented and can change or block at any time. Consider a documented provider (user-supplied API key stored in `chrome.storage.local`).
3. **Bootstrap (298 KB)** is used only for `container-fluid`/`row`/`col-12`; replacing it with a few CSS rules would cut load time.
4. **Images:** `background.png` (1.1 MB, blurred anyway) and `chatgpt.png` (1080x1080, 193 KB for a 60 px icon) can be shrunk >10x.
5. **localStorage -> `chrome.storage.sync/local`** would give cross-device sync and a bigger quota.
6. No manifest `icons`; add 16/32/48/128 PNGs before publishing to the Chrome Web Store.
7. No automated tests; consider a small Playwright smoke test.

## Verification

`node --check` passes. A stubbed-DOM harness covered: URL/icon validation (javascript:, data:, SVG, traversal, credentials), tampered localStorage, old-path migration, Yahoo daily-change math, Nasdaq payload rejection, and provider fallback order - 22/22 pass. It has **not** been run in a real browser; please load it via *Load unpacked* and check the new tab, Manage links, stocks, and the Back-button behaviour.
