const display = document.getElementById("display");
const searchForm = document.getElementById("searchForm");
const searchEngine = document.getElementById("searchEngine");
const searchPage = document.getElementById("searchPage");
const landingPage = document.getElementById("landingPage");
const loaderOverlay = document.getElementById("loader-overlay");
const imageContainer = document.getElementById("imageContainer");
const shortcutDialog = document.getElementById("shortcutDialog");
const shortcutList = document.getElementById("shortcutList");

const defaultShortcuts = [
    { src: 'assests/img/youtube.png', url: 'https://www.youtube.com/', text: 'YouTube' },
    { src: 'assests/img/github.png', url: 'https://github.com/', text: 'GitHub' },
    { src: 'assests/img/chatgpt.png', url: 'https://chatgpt.com/', text: 'ChatGPT' },
    { src: 'assests/img/telegram.png', url: 'https://web.telegram.org/a/', text: 'Telegram' },
    { src: 'assests/img/whatsapp.png', url: 'https://web.whatsapp.com/', text: 'WhatsApp' },
    { src: 'assests/img/linkedin.png', url: 'https://www.linkedin.com/', text: 'LinkedIn' },
];

function validWebURL(value) {
    try {
        const parsed = new URL(value);
        return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
    } catch {
        return null;
    }
}

function loadShortcuts() {
    try {
        const saved = JSON.parse(localStorage.getItem('home.shortcuts.v1'));
        if (Array.isArray(saved)) {
            return saved.filter(item => item && typeof item.text === 'string' && validWebURL(item.url))
                .map(item => ({ text: item.text, url: validWebURL(item.url), src: item.src || '' }));
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
    } else {
        searchPage.classList.remove('visible', 'active');
        searchPage.classList.add('hidden');
        landingPage.classList.remove('hidden');
        landingPage.classList.add('visible');
    }
}

function updateSearchPage() {
    switchPage(display.value.trim() ? 'search' : 'landing');
}

function submitSearch(query) {
    const searchQuery = query.trim();
    if (!searchQuery || loaderOverlay.classList.contains('visible')) return;

    const searchURLs = {
        google: 'https://www.google.com/search',
        bing: 'https://www.bing.com/search',
        duckduckgo: 'https://duckduckgo.com/'
    };
    const searchURL = new URL(searchURLs[searchEngine.value] || searchURLs.google);
    searchURL.searchParams.set('q', searchQuery);
    loaderOverlay.classList.add('visible');

    setTimeout(() => {
        document.body.classList.add('page-fade-out');
        setTimeout(() => window.location.assign(searchURL.toString()), 500);
    }, 300);
}

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

document.addEventListener('keydown', event => {
    if (loaderOverlay.classList.contains('visible')) {
        event.preventDefault();
        return;
    }
    if (event.target.closest('a, button, select, input, textarea, [contenteditable="true"]')) return;
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        display.value += event.key;
        display.focus();
        display.setSelectionRange(display.value.length, display.value.length);
        updateSearchPage();
    }
});

try {
    const savedEngine = localStorage.getItem('home.searchEngine');
    if (['google', 'bing', 'duckduckgo'].includes(savedEngine)) searchEngine.value = savedEngine;
} catch {
    searchEngine.value = 'google';
}

searchEngine.addEventListener('change', () => {
    try {
        localStorage.setItem('home.searchEngine', searchEngine.value);
    } catch {
        return;
    }
});

function updateClock() {
    const clock = document.getElementById("clock");
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const amPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedHours = String(hours).padStart(2, '0');
    clock.innerHTML = `${formattedHours} : ${minutes} : ${seconds} <span class="ampm">${amPm}</span>`;

    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    document.getElementById('greeting').textContent = greeting;
}

function updateDate() {
    const dateElement = document.getElementById("date");
    const now = new Date();
    const day = now.toLocaleString('default', { weekday: 'long' }).toUpperCase();
    const date = now.getDate();
    const month = now.toLocaleString('default', { month: 'short' });
    const year = now.getFullYear();
    dateElement.innerHTML = `<span class="anurati">${day}</span> <div class="day"><span class="poppins">${date}</span> <span class="poppins">${month}</span> <span class="poppins">${year}</span></div>`;
}

function renderShortcuts() {
    imageContainer.replaceChildren();
    shortcuts.forEach(shortcut => {
        const card = document.createElement('div');
        card.className = 'card';
        const link = document.createElement('a');
        link.href = validWebURL(shortcut.url);
        link.setAttribute('aria-label', shortcut.text);
        const img = document.createElement('img');
        img.alt = '';
        const fallbackIcons = [
            new URL('/favicon.ico', shortcut.url).href,
            `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(shortcut.url)}&sz=128`
        ];
        const iconSources = [shortcut.src, ...fallbackIcons].filter(Boolean);
        let iconIndex = 0;
        img.addEventListener('error', () => {
            iconIndex++;
            if (iconIndex < iconSources.length) {
                img.src = iconSources[iconIndex];
            } else {
                const placeholder = document.createElement('span');
                placeholder.className = 'shortcut-placeholder';
                placeholder.textContent = shortcut.text.slice(0, 1).toUpperCase();
                img.replaceWith(placeholder);
            }
        });
        link.appendChild(img);
        img.src = iconSources[0];
        const label = document.createElement('span');
        label.className = 'shortcut-name';
        label.textContent = shortcut.text;
        card.append(link, label);
        imageContainer.appendChild(card);
    });
}

function appendShortcutRow(shortcut = {}) {
    const row = document.createElement('div');
    row.className = 'shortcut-row';
    row.dataset.src = shortcut.src || '';

    const name = document.createElement('input');
    name.type = 'text';
    name.value = shortcut.text || '';
    name.placeholder = 'Name';
    name.setAttribute('aria-label', 'Shortcut name');

    const url = document.createElement('input');
    url.type = 'url';
    url.value = shortcut.url || '';
    url.placeholder = 'https://example.com';
    url.setAttribute('aria-label', 'Shortcut URL');

    const iconPicker = document.createElement('input');
    iconPicker.type = 'file';
    iconPicker.accept = 'image/png,image/jpeg,image/webp,image/gif,image/avif';
    iconPicker.setAttribute('aria-label', 'Choose shortcut icon image');
    iconPicker.addEventListener('change', () => {
        const file = iconPicker.files[0];
        if (!file) return;
        if (file.size > 256 * 1024) {
            window.alert('Choose an image smaller than 256 KB.');
            iconPicker.value = '';
            return;
        }
        if (!file.type.startsWith('image/')) {
            window.alert('Choose a supported image file.');
            iconPicker.value = '';
            return;
        }
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            row.dataset.src = reader.result;
            iconStatus.textContent = file.name;
        });
        reader.readAsDataURL(file);
    });

    const iconStatus = document.createElement('span');
    iconStatus.className = 'shortcut-icon-status';
    iconStatus.textContent = row.dataset.src ? 'Custom icon selected' : 'Using site icon';

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
    remove.addEventListener('click', () => row.remove());

    row.append(name, url, iconPicker, iconStatus, useSiteIcon, remove);
    shortcutList.appendChild(row);
}

function openShortcutManager() {
    shortcutList.replaceChildren();
    shortcuts.forEach(appendShortcutRow);
    shortcutDialog.showModal();
}

document.getElementById('manageShortcuts').addEventListener('click', openShortcutManager);
document.getElementById('addShortcut').addEventListener('click', () => {
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
        updatedShortcuts.push({ text: name, url: safeURL, src: row.dataset.src });
    }

    try {
        localStorage.setItem('home.shortcuts.v1', JSON.stringify(updatedShortcuts));
    } catch {
        window.alert('Could not save shortcuts in this browser.');
        return;
    }
    shortcuts = updatedShortcuts;
    renderShortcuts();
    shortcutDialog.close();
});

document.addEventListener("DOMContentLoaded", () => {
    landingPage.classList.add('visible');
    searchPage.classList.add('hidden');
});

setInterval(updateClock, 1000);
updateClock();
updateDate();
renderShortcuts();