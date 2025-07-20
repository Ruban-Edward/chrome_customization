const display = document.getElementById("display");
const searchPage = document.getElementById("searchPage");
const landingPage = document.getElementById("landingPage");
const loaderOverlay = document.getElementById("loader-overlay");

// --- STATE VARIABLES ---
let typedText = "";
let cursorPosition = 0;
let selectionAnchor = 0;

// --- HELPER FUNCTION TO INJECT CSS ---
function addEditorStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .display-char { display: inline; }
        .display-char.selected { background-color: #f0f3fa; color: #001331; }
        .cursor {
            display: inline-block; background: #f0f3fa; width: 2px; height: 1.2em;
            animation: blink 1s steps(1) infinite; vertical-align: middle; position: relative;
        }
        @keyframes blink { 50% { background: transparent; } }
    `;
    document.head.appendChild(style);
}

// --- RENDER FUNCTION ---
function renderDisplay() {
    const contentWrapper = document.createElement('div');
    contentWrapper.id = 'display-content-wrapper';
    const selectionStart = Math.min(cursorPosition, selectionAnchor);
    const selectionEnd = Math.max(cursorPosition, selectionAnchor);
    const hasSelection = selectionStart !== selectionEnd;
    for (let i = 0; i < typedText.length; i++) {
        if (i === cursorPosition) {
            const cursorEl = document.createElement('span');
            cursorEl.className = 'cursor';
            contentWrapper.appendChild(cursorEl);
        }
        const char = typedText[i];
        const charEl = document.createElement('span');
        charEl.className = 'display-char';
        charEl.textContent = char;
        if (hasSelection && i >= selectionStart && i < selectionEnd) {
            charEl.classList.add('selected');
        }
        contentWrapper.appendChild(charEl);
    }
    if (cursorPosition === typedText.length) {
        const cursorEl = document.createElement('span');
        cursorEl.className = 'cursor';
        contentWrapper.appendChild(cursorEl);
    }
    display.innerHTML = '';
    display.appendChild(contentWrapper);
}

// --- Page Switching Logic ---
function switchPage(showPage) {
    if (showPage === 'search') {
        landingPage.classList.remove('visible');
        landingPage.classList.add('hidden');
        searchPage.classList.remove('hidden');
        searchPage.classList.add('visible');
        searchPage.classList.add('active');
    } else {
        searchPage.classList.remove('visible');
        searchPage.classList.add('hidden');
        landingPage.classList.remove('hidden');
        landingPage.classList.add('visible');
        searchPage.classList.remove('active');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    landingPage.classList.add('visible');
    searchPage.classList.add('hidden');
    addEditorStyles();
    renderDisplay();
});

// --- KEYDOWN LISTENER ---
document.addEventListener("keydown", (event) => {
    let needsRender = true;
    const hasSelection = cursorPosition !== selectionAnchor;

    // Don't do anything if the loader is visible
    if (loaderOverlay.classList.contains('visible')) {
        event.preventDefault();
        return;
    }

    const deleteSelection = () => {
        if (!hasSelection) return;
        const start = Math.min(cursorPosition, selectionAnchor);
        const end = Math.max(cursorPosition, selectionAnchor);
        typedText = typedText.slice(0, start) + typedText.slice(end);
        cursorPosition = start;
        selectionAnchor = start;
    };

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        deleteSelection();
        typedText = typedText.slice(0, cursorPosition) + event.key + typedText.slice(cursorPosition);
        cursorPosition++;
        selectionAnchor = cursorPosition;
    } else {
        switch (event.key) {
            case "Backspace":
                event.preventDefault();
                if (hasSelection) {
                    deleteSelection();
                } else if (cursorPosition > 0) {
                    typedText = typedText.slice(0, cursorPosition - 1) + typedText.slice(cursorPosition);
                    cursorPosition--;
                    selectionAnchor = cursorPosition;
                }
                break;
            case "ArrowLeft":
                event.preventDefault();
                cursorPosition = Math.max(0, cursorPosition - 1);
                if (!event.shiftKey) {
                    selectionAnchor = cursorPosition;
                }
                break;
            case "ArrowRight":
                event.preventDefault();
                cursorPosition = Math.min(typedText.length, cursorPosition + 1);
                if (!event.shiftKey) {
                    selectionAnchor = cursorPosition;
                }
                break;
            // --- UPDATED ENTER KEY LOGIC ---
            case "Enter":
                event.preventDefault();
                if (typedText.trim() !== "") {
                    // 1. Show the loader
                    loaderOverlay.classList.add('visible');

                    // 2. Wait for 3 seconds
                    setTimeout(() => {
                        // 3. Fade the whole page out
                        document.body.classList.add('page-fade-out');

                        // 4. After the fade-out animation, navigate
                        setTimeout(() => {
                            const searchQuery = encodeURIComponent(typedText.trim());
                            window.location.href = `https://www.google.com/search?q=${searchQuery}`;
                        }, 500); // This timeout should match the CSS transition duration

                    }, 3000); // 3-second loader display
                }
                needsRender = false;
                break;
            case "a":
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    selectionAnchor = 0;
                    cursorPosition = typedText.length;
                } else {
                    needsRender = false;
                }
                break;
            default:
                needsRender = false;
                break;
        }
    }

    if (typedText.length > 0) {
        switchPage('search');
    } else {
        switchPage('landing');
    }

    if (needsRender) {
        renderDisplay();
    }
});


// --- Unchanged functions below ---
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

setInterval(updateClock, 1000);
updateClock();
updateDate();

const imageContainer = document.getElementById("imageContainer");
const images = [
    { src: 'assests/img/youtube.png', url: 'https://www.youtube.com/', text: 'Youtube' },
    { src: 'assests/img/github.png', url: 'https://github.com/', text: 'Github' },
    { src: 'assests/img/chatgpt.png', url: 'https://chatgpt.com/', text: 'Chatgpt' },
    { src: 'assests/img/telegram.png', url: 'https://web.telegram.org/a/', text: 'Telegram' },
    { src: 'assests/img/whatsapp.png', url: 'https://web.whatsapp.com/', text: 'Whatsapp' },
    { src: 'assests/img/linkedin.png', url: 'https://www.linkedin.com/', text: 'Linkedin' },
];

let currentIndex = 0;
const itemsPerPage = 12;

function displayImages() {
    imageContainer.innerHTML = '';
    const endIndex = Math.min(currentIndex + itemsPerPage, images.length);
    for (let i = currentIndex; i < endIndex; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        const link = document.createElement('a');
        link.href = images[i].url;
        link.target = '_self';
        const img = document.createElement('img');
        img.src = images[i].src;
        img.alt = images[i].text;
        link.appendChild(img);
        card.appendChild(link);
        imageContainer.appendChild(card);
    }
}
displayImages();    