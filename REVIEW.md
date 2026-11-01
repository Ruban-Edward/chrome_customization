# Review: Chrome Customization (New Tab extension)

Scope: `manifest.json`, `index.html`, `assets/js/script.js`, `assets/css/*`, `assets/fonts/*`, image assets, and git tracking.

## Summary of Changes & Fixes

### 1. Unauthorized APIs & External Network Removal
- **Problem**: Undocumented private scraping APIs (`https://api.nasdaq.com/*` and `https://query2.finance.yahoo.com/*`) were being hit in the background for stock quotes, violating provider Terms of Service, creating high-risk extension permission prompts in Chrome, and introducing failure points. External Google News RSS feed also requested host permissions.
- **Fix**: Removed all unauthorized scraping APIs and the unused stock/news modules. Removed `host_permissions` entirely from `manifest.json`.
- **Security Impact**: Set `connect-src 'none'` in CSP. The extension now makes zero background network requests.

### 2. Local Font Bundling & Zero External Font CDN Calls
- **Problem**: Fonts (`Poppins`, `Saira Stencil One`, and `Anurati`) were fetched over the network from `fonts.gstatic.com` and `fonts.cdnfonts.com` on every new tab, which delayed page display, failed offline, and leaked user IP / referrers to third-party CDNs.
- **Fix**:
  - Downloaded the exact required font files locally into `assets/fonts/`:
    - `Poppins` (300, 400, 500, 600, 700) WOFF2
    - `Saira Stencil One` (400) WOFF2
    - `Anurati` (400) WOFF
  - Rewrote `assets/css/font.css` to load from `../fonts/` locally.
  - Hardened CSP: `font-src 'self'`.

### 3. Duplicate `assests/` Folder Removal
- **Problem**: A legacy duplicate directory with a typo name (`assests/`) containing ~1.6 MB of outdated scripts, stylesheets, and images was still tracked in git.
- **Fix**: Removed `assests/` completely with `git rm -r assests/`.

### 4. Bloat Elimination: 292 KB Bootstrap Removed
- **Problem**: `bootstrap.min.css` (292 KB) was loaded on every new tab, but only 5 simple utility classes (`container-fluid`, `row`, `col-12`, `text-center`, `visually-hidden`) were used.
- **Fix**: Implemented those 5 lightweight CSS rules directly in `assets/css/style.css` and removed `bootstrap.min.css`. This reduced CSS payload by ~90% and eliminated render-blocking delay.

### 5. Asset Optimization & Extension Icons
- **Problem**: `background.png` was 1.1 MB uncompressed and `chatgpt.png` was a 1080x1080 image (193 KB) used as a 60px thumbnail. `manifest.json` lacked declared icons.
- **Fix**:
  - Optimized `background.png` and resized `chatgpt.png` (saving over 400 KB).
  - Generated standard extension icons (`icon-16.png`, `icon-48.png`, `icon-128.png`) in `assets/img/` and configured them in `manifest.json`.

### 6. Security Hardening Summary
| Layer | Policy |
|---|---|
| **CSP** | `default-src 'none'; script-src 'self'; object-src 'none'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'` |
| **Permissions** | Only `favicon` (local Chrome cache via `_favicon`); zero `host_permissions` |
| **Referrer** | `<meta name="referrer" content="no-referrer">`, link `referrerPolicy: 'no-referrer'`, `rel="noopener noreferrer"` |
| **Input Validation** | URLs validated (http/https only, no credentials, <=2048 chars); search query capped at 2000 chars; link names capped at 40 chars; max 24 shortcuts |
| **Icon Sanitization** | Custom icons strictly limited to bundled paths or validated raster data URLs (`data:image/(png|jpeg|webp|gif|avif);base64,...`) <= 200 KB; SVG blocked |
| **DOM Manipulation** | Pure text nodes and `textContent`; no `innerHTML` execution |

## Verification
- `node --check assets/js/script.js` passed with zero errors.
- HTML validated with no missing resources or broken links.
- Verified all font files exist on disk, are valid WOFF/WOFF2 formats, and are correctly referenced.
