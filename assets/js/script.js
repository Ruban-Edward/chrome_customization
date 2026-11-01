const display = document.getElementById("display");
const searchForm = document.getElementById("searchForm");
const searchEngine = document.getElementById("searchEngine");
const searchPage = document.getElementById("searchPage");
const landingPage = document.getElementById("landingPage");
const loaderOverlay = document.getElementById("loader-overlay");
const imageContainer = document.getElementById("imageContainer");
const shortcutDialog = document.getElementById("shortcutDialog");
const shortcutList = document.getElementById("shortcutList");
const googleAppsBtn = document.getElementById("googleAppsBtn");
const googleAppsMenu = document.getElementById("googleAppsMenu");
let navigationTimer;
let renderedDateKey = '';

const KEYS = {
    shortcuts: 'home.shortcuts.v1',
    engine: 'home.searchEngine'
};
const MAX_SHORTCUTS = 24;
const MAX_QUERY_LENGTH = 2000;
const INTERACTIVE_SELECTOR = 'a, button, select, input, textarea, [contenteditable="true"]';

const defaultShortcuts = [
    { src: 'assets/img/youtube.png', url: 'https://www.youtube.com/', text: 'YouTube' },
    { src: 'assets/img/github.png', url: 'https://github.com/', text: 'GitHub' },
    { src: 'assets/img/chatgpt.png', url: 'https://chatgpt.com/', text: 'ChatGPT' },
    { src: 'assets/img/telegram.png', url: 'https://web.telegram.org/a/', text: 'Telegram' },
    { src: 'assets/img/whatsapp.png', url: 'https://web.whatsapp.com/', text: 'WhatsApp' },
    { src: 'assets/img/linkedin.png', url: 'https://www.linkedin.com/', text: 'LinkedIn' },
];

function validWebURL(value, { httpsOnly = false } = {}) {
    if (typeof value !== 'string' || value.length > 2048) return null;
    try {
        const parsed = new URL(value);
        const allowed = httpsOnly ? ['https:'] : ['http:', 'https:'];
        if (!allowed.includes(parsed.protocol)) return null;
        if (parsed.username || parsed.password) return null;
        return parsed.href;
    } catch {
        return null;
    }
}

// Only bundled icons or small raster data URLs are accepted as custom icons.
// (Older saved data that may have used "assests/" is safely migrated to "assets/".)
function safeIconSrc(value) {
    if (typeof value !== 'string' || !value) return '';
    const migrated = value.replace(/^assests\//, 'assets/');
    if (/^assets\/img\/[\w-]+\.(png|ico)$/.test(migrated)) return migrated;
    if (migrated.length <= 200000 && /^data:image\/(png|jpeg|webp|gif|avif);base64,[A-Za-z0-9+/=]+$/.test(migrated)) return migrated;
    return '';
}

// Uses Chrome's local favicon cache, so no site list is sent to any third party.
function siteIconURL(pageURL) {
    if (typeof chrome === 'undefined' || !chrome.runtime?.id) return '';
    const icon = new URL(chrome.runtime.getURL('/_favicon/'));
    icon.searchParams.set('pageUrl', pageURL);
    icon.searchParams.set('size', '64');
    return icon.href;
}

function loadShortcuts() {
    try {
        const saved = JSON.parse(localStorage.getItem(KEYS.shortcuts));
        if (Array.isArray(saved)) {
            return saved.filter(item => item && typeof item.text === 'string' && validWebURL(item.url))
                .slice(0, MAX_SHORTCUTS)
                .map(item => ({ text: item.text.slice(0, 40), url: validWebURL(item.url), src: safeIconSrc(item.src) }));
        }
    } catch {
        return defaultShortcuts;
    }
    return defaultShortcuts;
}

let shortcuts = loadShortcuts();

function switchPage(showPage) {
    if (showPage === 'search') {
        landingPage.classList.remove('visible');
        landingPage.classList.add('hidden');
        searchPage.classList.remove('hidden');
        searchPage.classList.add('visible', 'active');
        landingPage.inert = true;
        searchPage.inert = false;
    } else {
        searchPage.classList.remove('visible', 'active');
        searchPage.classList.add('hidden');
        landingPage.classList.remove('hidden');
        landingPage.classList.add('visible');
        searchPage.inert = true;
        landingPage.inert = false;
    }
}

function updateSearchPage() {
    switchPage(display.value.trim() ? 'search' : 'landing');
}

function submitSearch(query) {
    const searchQuery = query.trim().slice(0, MAX_QUERY_LENGTH);
    if (!searchQuery || loaderOverlay.classList.contains('visible')) return;

    const searchURLs = {
        google: 'https://www.google.com/search',
        bing: 'https://www.bing.com/search',
        duckduckgo: 'https://duckduckgo.com/'
    };
    const searchURL = new URL(Object.hasOwn(searchURLs, searchEngine.value) ? searchURLs[searchEngine.value] : searchURLs.google);
    searchURL.searchParams.set('q', searchQuery);
    loaderOverlay.classList.add('visible');

    navigationTimer = setTimeout(() => {
        document.body.classList.add('page-fade-out');
        navigationTimer = setTimeout(() => window.location.assign(searchURL.toString()), 500);
    }, 300);
}

// Returning with the Back button restores this page from the back/forward cache;
// without this reset the loader overlay and fade-out would stay stuck on screen.
window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    clearTimeout(navigationTimer);
    loaderOverlay.classList.remove('visible');
    document.body.classList.remove('page-fade-out');
    display.focus();
});

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    submitSearch(display.value);
});

display.addEventListener('input', updateSearchPage);
display.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        submitSearch(display.value);
    }
});

function isInteractiveTarget(target) {
    return target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR));
}

function appendToSearch(text) {
    display.value = (display.value + text).slice(0, MAX_QUERY_LENGTH);
    display.focus();
    display.setSelectionRange(display.value.length, display.value.length);
    updateSearchPage();
}

// Toggle Google Apps Launcher Menu
function toggleGoogleApps(force) {
    if (!googleAppsBtn || !googleAppsMenu) return;
    const shouldOpen = typeof force === 'boolean' ? force : googleAppsMenu.hidden;
    googleAppsMenu.hidden = !shouldOpen;
    googleAppsBtn.setAttribute('aria-expanded', String(shouldOpen));
}

if (googleAppsBtn && googleAppsMenu) {
    googleAppsBtn.addEventListener('click', event => {
        event.stopPropagation();
        toggleGoogleApps();
    });

    document.addEventListener('click', event => {
        if (!googleAppsMenu.hidden && !googleAppsMenu.contains(event.target) && !googleAppsBtn.contains(event.target)) {
            toggleGoogleApps(false);
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !googleAppsMenu.hidden) {
            toggleGoogleApps(false);
            googleAppsBtn.focus();
        }
    });
}

// Type anywhere on the page to start searching.
document.addEventListener('keydown', event => {
    if (loaderOverlay.classList.contains('visible')) {
        if (!event.ctrlKey && !event.metaKey) event.preventDefault();
        return;
    }
    if (shortcutDialog.open || (googleAppsMenu && !googleAppsMenu.hidden) || event.isComposing || isInteractiveTarget(event.target)) return;
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        appendToSearch(event.key);
    }
});

document.addEventListener('paste', event => {
    if (loaderOverlay.classList.contains('visible') || shortcutDialog.open || (googleAppsMenu && !googleAppsMenu.hidden) || isInteractiveTarget(event.target)) return;
    const text = event.clipboardData?.getData('text/plain');
    if (!text) return;
    event.preventDefault();
    appendToSearch(text);
});

try {
    const savedEngine = localStorage.getItem(KEYS.engine);
    if (['google', 'bing', 'duckduckgo'].includes(savedEngine)) searchEngine.value = savedEngine;
} catch {
    searchEngine.value = 'google';
}

searchEngine.addEventListener('change', () => {
    try {
        localStorage.setItem(KEYS.engine, searchEngine.value);
    } catch {
        return;
    }
});

function makeSpan(className, text) {
    const span = document.createElement('span');
    if (className) span.className = className;
    span.textContent = text;
    return span;
}

function updateClock() {
    const clock = document.getElementById('clock');
    const now = new Date();
    const hour = now.getHours();
    const hours12 = String(hour % 12 || 12).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clock.replaceChildren(
        document.createTextNode(`${hours12} : ${minutes} : ${seconds} `),
        makeSpan('ampm', hour >= 12 ? 'PM' : 'AM')
    );

    document.getElementById('greeting').textContent =
        hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    // Keep the date correct if the tab stays open past midnight.
    const dateKey = now.toDateString();
    if (dateKey !== renderedDateKey) updateDate(now);
}

function updateDate(now = new Date()) {
    renderedDateKey = now.toDateString();
    const dateElement = document.getElementById('date');
    const day = makeSpan('anurati', now.toLocaleString('default', { weekday: 'long' }).toUpperCase());
    const parts = document.createElement('div');
    parts.className = 'day';
    parts.append(
        makeSpan('poppins', String(now.getDate())), ' ',
        makeSpan('poppins', now.toLocaleString('default', { month: 'short' })), ' ',
        makeSpan('poppins', String(now.getFullYear()))
    );
    dateElement.replaceChildren(day, ' ', parts);
}

function renderShortcuts() {
    imageContainer.replaceChildren();
    shortcuts.forEach(shortcut => {
        const card = document.createElement('div');
        card.className = 'card';
        const link = document.createElement('a');
        link.href = shortcut.url;
        link.rel = 'noopener noreferrer';
        link.referrerPolicy = 'no-referrer';
        link.setAttribute('aria-label', shortcut.text);
        const img = document.createElement('img');
        img.alt = '';
        const iconSources = [safeIconSrc(shortcut.src), siteIconURL(shortcut.url)].filter(Boolean);
        let iconIndex = 0;
        const showPlaceholder = () => {
            const placeholder = document.createElement('span');
            placeholder.className = 'shortcut-placeholder';
            placeholder.textContent = shortcut.text.slice(0, 1).toUpperCase();
            img.replaceWith(placeholder);
        };
        img.addEventListener('error', () => {
            iconIndex++;
            if (iconIndex < iconSources.length) {
                img.src = iconSources[iconIndex];
            } else {
                showPlaceholder();
            }
        });
        link.appendChild(img);
        if (iconSources.length) {
            img.src = iconSources[0];
        } else {
            showPlaceholder();
        }
        const label = document.createElement('span');
        label.className = 'shortcut-name';
        label.textContent = shortcut.text;
        card.append(link, label);
        imageContainer.appendChild(card);
    });
}

const ICON_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];

// Re-encode the chosen image at a small size: keeps storage small and strips
// metadata, and fails for files that are not really decodable images.
async function fileToIconDataURL(file) {
    const bitmap = await createImageBitmap(file);
    try {
        const scale = Math.min(128 / bitmap.width, 128 / bitmap.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/png');
    } finally {
        bitmap.close?.();
    }
}

function updateAddShortcutState() {
    document.getElementById('addShortcut').disabled = shortcutList.children.length >= MAX_SHORTCUTS;
}

function appendShortcutRow(shortcut = {}) {
    const row = document.createElement('div');
    row.className = 'shortcut-row';
    row.dataset.src = safeIconSrc(shortcut.src);

    const name = document.createElement('input');
    name.type = 'text';
    name.maxLength = 40;
    name.value = shortcut.text || '';
    name.placeholder = 'Name';
    name.setAttribute('aria-label', 'Shortcut name');

    const url = document.createElement('input');
    url.type = 'url';
    url.maxLength = 2048;
    url.value = shortcut.url || '';
    url.placeholder = 'https://example.com';
    url.setAttribute('aria-label', 'Shortcut URL');

    const iconStatus = document.createElement('span');
    iconStatus.className = 'shortcut-icon-status';
    iconStatus.textContent = row.dataset.src ? 'Custom icon selected' : 'Using site icon';

    const iconPicker = document.createElement('input');
    iconPicker.type = 'file';
    iconPicker.accept = ICON_TYPES.join(',');
    iconPicker.setAttribute('aria-label', 'Choose shortcut icon image');
    iconPicker.addEventListener('change', async () => {
        const file = iconPicker.files[0];
        if (!file) return;
        if (!ICON_TYPES.includes(file.type)) {
            window.alert('Choose a PNG, JPEG, WebP, GIF or AVIF image.');
            iconPicker.value = '';
            return;
        }
        if (file.size > 1024 * 1024) {
            window.alert('Choose an image smaller than 1 MB.');
            iconPicker.value = '';
            return;
        }
        try {
            const dataURL = await fileToIconDataURL(file);
            if (!safeIconSrc(dataURL)) throw new Error('Icon too large');
            row.dataset.src = dataURL;
            iconStatus.textContent = file.name;
        } catch {
            window.alert('That image could not be used. Try a different file.');
            iconPicker.value = '';
        }
    });

    const useSiteIcon = document.createElement('button');
    useSiteIcon.type = 'button';
    useSiteIcon.className = 'use-site-icon';
    useSiteIcon.textContent = 'Use site icon';
    useSiteIcon.addEventListener('click', () => {
        row.dataset.src = '';
        iconPicker.value = '';
        iconStatus.textContent = 'Using site icon';
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-shortcut';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
        row.remove();
        updateAddShortcutState();
    });

    row.append(name, url, iconPicker, iconStatus, useSiteIcon, remove);
    shortcutList.appendChild(row);
    updateAddShortcutState();
}

function openShortcutManager() {
    shortcutList.replaceChildren();
    shortcuts.forEach(appendShortcutRow);
    updateAddShortcutState();
    shortcutDialog.showModal();
}

document.getElementById('manageShortcuts').addEventListener('click', openShortcutManager);
document.getElementById('addShortcut').addEventListener('click', () => {
    if (shortcutList.children.length >= MAX_SHORTCUTS) return;
    appendShortcutRow();
    shortcutList.lastElementChild.querySelector('input').focus();
});
document.getElementById('closeShortcutDialog').addEventListener('click', () => shortcutDialog.close());
document.getElementById('cancelShortcutChanges').addEventListener('click', () => shortcutDialog.close());

document.getElementById('shortcutForm').addEventListener('submit', event => {
    event.preventDefault();
    const updatedShortcuts = [];
    for (const row of shortcutList.querySelectorAll('.shortcut-row')) {
        const nameInput = row.querySelector('[aria-label="Shortcut name"]');
        const urlInput = row.querySelector('[aria-label="Shortcut URL"]');
        const name = nameInput.value.trim();
        const url = urlInput.value.trim();
        if (!name && !url) continue;
        const safeURL = validWebURL(url);
        if (!name || !safeURL) {
            window.alert('Each link needs a name and a valid http or https URL.');
            return;
        }
        updatedShortcuts.push({ text: name.slice(0, 40), url: safeURL, src: safeIconSrc(row.dataset.src) });
    }

    try {
        localStorage.setItem(KEYS.shortcuts, JSON.stringify(updatedShortcuts));
    } catch {
        window.alert('Could not save shortcuts in this browser.');
        return;
    }
    shortcuts = updatedShortcuts;
    renderShortcuts();
    shortcutDialog.close();
});

document.addEventListener('DOMContentLoaded', () => {
    landingPage.classList.add('visible');
    searchPage.classList.add('hidden');
    searchPage.inert = true;
});

setInterval(updateClock, 1000);
updateClock();
updateDate();
renderShortcuts();
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateClock();
    }
});
