# 🚀 Chrome Customization

A custom Chrome New Tab page with quick links, current time and greeting, top news headlines, and a configurable stock watchlist.

---

## 🌟 Features

- **Quick links**: Add, remove, and customize shortcuts, including names, URLs, and icons.
- **Top headlines**: Shows up to five Google News headlines when the feed is available.
- **Stock watchlist**: Track up to ten symbols with current value and percentage change. Quotes may be delayed; US listings use Nasdaq data and other supported listings fall back to Yahoo Finance.
- **Search and clock**: Search with Google, Bing, or DuckDuckGo and view the current time, date, and greeting.
- **Local preferences**: Shortcut and stock selections are saved in the browser's local storage.

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
5. Review and allow the requested site access for Google News and the quote providers if Chrome asks. These permissions are used to load headlines and stock quotes.
6. Open a new tab. The extension overrides Chrome's default New Tab page.

You do not select or install `manifest.json` by itself. Chrome reads it from the project folder when you choose **Load unpacked**. After changing `manifest.json`, click the extension's **Reload** button on `chrome://extensions/`, then refresh the New Tab page.

For local development, you can also open `index.html` directly, but extension host permissions only apply when Chrome runs the page as an installed extension. Network-backed headlines and quotes may not load from a directly opened file.
---

## 📂 Folder Structure

      chrome_customization/
      ├── assests/
      │   ├── css/          # Stylesheets
      │   ├── img/          # Images and icons
      │   └── js/           # Page behavior
      ├── index.html        # New Tab page
      ├── manifest.json     # Chrome extension configuration
      └── README.md         # Project documentation

---

## ✨ Customization

   * Use **Manage links** on the New Tab page to edit shortcuts.
   * Use **Add stocks** or **Edit** in the Stocks panel to choose up to ten ticker symbols.
   * Edit `assests/css/style.css` for styling and `assests/js/script.js` for behavior.
   * Change extension metadata and requested host permissions in `manifest.json`.

---

## 📌 Tips

   * Enter ticker symbols, not company names, in the stock watchlist (for example, `AAPL` or `WIPRO`).
   * Headlines and stock quotes require an internet connection and can be unavailable if a provider is down or blocks requests.

---

## 🤝 Contributing

Pull requests are welcome! If you have ideas to improve this tool, feel free to fork and enhance it.

---

## 🧑‍💻 Author
Ruban Edward

## 📄 License
This project is licensed under the MIT License.
