# 🚀 Chrome Customization

A custom Chrome New Tab page with quick links, current time and greeting, top news headlines, and a configurable stock watchlist.

---

## 🌟 Features

- **Quick links**: Add, remove, and customize shortcuts, including names, URLs, and icons.
- **Top headlines**: Shows up to five Google News headlines when the feed is available.
- **Stock watchlist**: Track up to ten symbols with current value and percentage change. Quotes may be delayed; US listings use Nasdaq data and other supported listings fall back to Yahoo Finance.
- **Search and clock**: Search with Google, Bing, or DuckDuckGo and view the current time, date, and greeting.
- **Local preferences**: Shortcut and stock selections are saved in the browser's local storage.
- **Privacy-minded**: Site icons come from Chrome's local favicon cache (no list of your links is sent to a third party), requests send no cookies or referrer, and headlines are cached for 10 minutes.

---

## 🛠️ Install in Chrome

1. Clone the repository and enter its directory:
   ```bash
   git clone https://github.com/Ruban-Edward/chrome_customization.git
   cd chrome_customization
   ```

2. In Chrome, open `chrome://extensions/`.
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the `chrome_customization` project folder, the folder that contains `manifest.json`.
5. Review and allow the requested permissions if Chrome asks: site access for Google News and the quote providers (headlines and stock quotes), and `favicon` (to show site icons from Chrome's local cache).
6. Open a new tab. The extension overrides Chrome's default New Tab page.

You do not select or install `manifest.json` by itself. Chrome reads it from the project folder when you choose **Load unpacked**. After changing `manifest.json`, click the extension's **Reload** button on `chrome://extensions/`, then refresh the New Tab page.

For local development, you can also open `index.html` directly, but extension host permissions only apply when Chrome runs the page as an installed extension. Network-backed headlines and quotes may not load from a directly opened file.
---

## 📂 Folder Structure

      chrome_customization/
      ├── assets/
      │   ├── css/          # Stylesheets
      │   ├── img/          # Images and icons
      │   └── js/           # Page behavior
      ├── .gitignore
      ├── REVIEW.md         # Review findings, fixes and security notes
      ├── index.html        # New Tab page
      ├── manifest.json     # Chrome extension configuration
      └── README.md         # Project documentation

---

## ✨ Customization

   * Use **Manage links** on the New Tab page to edit shortcuts.
   * Use **Add stocks** or **Edit** in the Stocks panel to choose up to ten ticker symbols.
   * Edit `assets/css/style.css` for styling and `assets/js/script.js` for behavior.
   * Change extension metadata and requested host permissions in `manifest.json`.

---

## 📌 Tips

   * Enter ticker symbols, not company names, in the stock watchlist (for example, `AAPL` or `WIPRO`).
   * Headlines and stock quotes require an internet connection and can be unavailable if a provider is down or blocks requests.

---

## 🔒 Security notes

   * A strict Content-Security-Policy is set in `manifest.json` (scripts, styles and images only from the extension itself; network access only to the three data providers).
   * Everything from the network or local storage is rendered as text (never as HTML) and URLs are restricted to `http(s)`.
   * Custom link icons are re-encoded to small PNGs; only bundled or `data:image` icons are accepted.
   * Fonts are still loaded from `fonts.gstatic.com` and `fonts.cdnfonts.com`. For full offline use and zero third-party requests, download the `.woff2` files into `assets/fonts/`, point `assets/css/font.css` at them and remove the two hosts from `font-src`.

See `REVIEW.md` for the full list.

---

## 🤝 Contributing

Pull requests are welcome! If you have ideas to improve this tool, feel free to fork and enhance it.

---

## 🧑‍💻 Author
Ruban Edward

## 📄 License
This project is licensed under the MIT License.
