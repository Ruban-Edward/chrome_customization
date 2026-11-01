# 🚀 Chrome Customization

A sleek, fast, and privacy-focused Chrome New Tab extension featuring quick links, current time and greeting, and quick web search.

---

## 🌟 Features

- **Quick links**: Add, remove, and customize shortcuts, including custom names, URLs, and local or site icons.
- **Search and clock**: Search with Google, Bing, or DuckDuckGo with animated loader and view current time, date, and greeting.
- **100% Offline & Private**: Zero background network requests; all fonts and resources are stored locally.
- **Local preferences**: Shortcut selections and search engine preferences are stored in the browser's local storage.
- **Privacy-first**: Site icons are loaded via Chrome's native local `_favicon` cache (no browsing data or link list is sent to any third party).

---

## 🛠️ Install in Chrome

1. Clone the repository and enter its directory:
   ```bash
   git clone https://github.com/Ruban-Edward/chrome_customization.git
   cd chrome_customization
   ```

2. In Chrome, open `chrome://extensions/`.
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the `chrome_customization` project folder (the folder containing `manifest.json`).
5. Open a new tab. The extension overrides Chrome's default New Tab page.

After editing files or `manifest.json`, click the extension's **Reload** button on `chrome://extensions/`, then refresh the New Tab page.

---

## 📂 Folder Structure

      chrome_customization/
      ├── assets/
      │   ├── css/          # Stylesheets (style.css, font.css)
      │   ├── fonts/        # Self-hosted fonts (Poppins, Saira Stencil One, Anurati)
      │   ├── img/          # Extension icons and shortcut graphics
      │   └── js/           # Page behavior (script.js)
      ├── .gitignore
      ├── REVIEW.md         # Security audit, optimizations, and vulnerability log
      ├── index.html        # New Tab page
      ├── manifest.json     # Chrome extension Manifest V3 configuration
      └── README.md         # Project documentation

---

## ✨ Customization

* Use **Manage links** on the New Tab page to add or edit shortcuts.
* Edit `assets/css/style.css` for styling and `assets/js/script.js` for behavior.
* Change extension metadata in `manifest.json`.

---

## 🔒 Security & Privacy

* **Strict Content Security Policy (CSP)**:
  `default-src 'none'; script-src 'self'; object-src 'none'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'`
* **Zero Host Permissions**: No external domain access requested or allowed.
* **No Unauthorized/Scraping APIs**: Undocumented or unauthorized background scraping endpoints (Nasdaq, Yahoo Finance) and external RSS feeds were removed.
* **Self-hosted Fonts**: Web fonts (`Poppins`, `Saira Stencil One`, `Anurati`) are bundled locally under `assets/fonts/` for instant offline rendering and zero tracking.
* **Input Validation & Sanitization**: Strict URL validation (blocks `javascript:`, data URL navigation, credential embeddings) and icon data sanitization (blocks SVG XSS vectors, validates PNG/JPEG/WebP raster data <= 200 KB).
* **Safe DOM Injection**: All dynamic labels, clock, and greeting text are injected via DOM text nodes / `textContent` (never `innerHTML`).

See `REVIEW.md` for full review details and test verification.

---

## 🤝 Contributing

Pull requests are welcome! If you have ideas to improve this tool, feel free to fork and enhance it.

---

## 🧑‍💻 Author
Ruban Edward

## 📄 License
This project is licensed under the MIT License.
