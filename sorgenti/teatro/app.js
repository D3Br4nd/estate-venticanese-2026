// Default theater events data derived from the spreadsheet / elenco-eventi.md
let events = [
    {
        dateDay: "05",
        dateMonth: "Luglio",
        dateDayName: "Domenica",
        time: "21:00",
        title: "inVenticano",
        artist: "Contest Teatrale",
        venue: "Cavea Teatrale"
    },
    {
        dateDay: "18",
        dateMonth: "Luglio",
        dateDayName: "Sabato",
        time: "21:00",
        title: "Terroni si nasce",
        artist: "Paolo Caiazzo — Spettacolo di Teatro-Canzone",
        venue: "Cavea Teatrale"
    },
    {
        dateDay: "06",
        dateMonth: "Agosto",
        dateDayName: "Giovedi",
        time: "21:00",
        title: "Opera Lirica",
        artist: "Compagnia Lirica Internazionale",
        venue: "Cavea Teatrale"
    },
    {
        dateDay: "09",
        dateMonth: "Agosto",
        dateDayName: "Domenica",
        time: "21:00",
        title: "Nu Bambiniello e tre San Giuseppe",
        artist: "Commedia Teatrale Classica",
        venue: "Cavea Teatrale"
    },
    {
        dateDay: "22",
        dateMonth: "Agosto",
        dateDayName: "Sabato",
        time: "20:30",
        title: "Corto e a Capo",
        artist: "Festival Internazionale del Cinema",
        venue: "Cavea Teatrale"
    },
    {
        dateDay: "02",
        dateMonth: "Settembre",
        dateDayName: "Mercoledi",
        time: "20:30",
        title: "Teatro Amatoriale",
        artist: "Rassegna Compagnie Locali",
        venue: "Cavea Teatrale"
    },
    {
        dateDay: "06",
        dateMonth: "Settembre",
        dateDayName: "Domenica",
        time: "20:30",
        title: "La prova del N9ve",
        artist: "Casagrande in Scena",
        venue: "Cavea Teatrale"
    }
];

// DOM Elements
const poster = document.getElementById("poster-element");
const programContainer = document.getElementById("poster-program-container");
const editorListContainer = document.getElementById("events-editor-list");
const btnAddEvent = document.getElementById("btn-add-event");
const btnPrint = document.getElementById("btn-print");

// Input Bindings
const inputTitle = document.getElementById("input-title");
const inputSubtitle = document.getElementById("input-subtitle");
const inputSlogan = document.getElementById("input-slogan");
const inputYear = document.getElementById("input-year");
const inputLogo = document.getElementById("input-logo");
const inputFooterInfo = document.getElementById("input-footer-info");
const inputFooterWeb = document.getElementById("input-footer-web");

// Display Bindings on Poster
const displayTitle = document.getElementById("display-title");
const displaySubtitle = document.getElementById("display-subtitle");
const displaySlogan = document.getElementById("display-slogan");
const displayYear = document.getElementById("display-year");
const displayFooterInfo = document.getElementById("display-footer-info");
const displayFooterWeb = document.getElementById("display-footer-web");
const posterEmblem = document.getElementById("poster-emblem");

// Zoom controls
const wrapper = document.querySelector(".poster-canvas-wrapper");
const previewArea = document.querySelector(".preview-area");
const btnZoomIn = document.getElementById("btn-zoom-in");
const btnZoomOut = document.getElementById("btn-zoom-out");
const btnZoomFit = document.getElementById("btn-zoom-fit");
const zoomIndicator = document.getElementById("zoom-indicator");

let scale = 0.5; // Default initial visual scale for display

// Initialize Application
function init() {
    setupHeaderBindings();
    setupThemeSelector();
    setupZoomControls();
    renderAll();
    
    // Auto-fit after rendering has finished and styles are applied
    setTimeout(fitToScreen, 100);
    window.addEventListener("resize", fitToScreen);
}

// 1. Text Inputs Synchronization
function setupHeaderBindings() {
    inputTitle.addEventListener("input", (e) => displayTitle.innerText = e.target.value);
    inputSubtitle.addEventListener("input", (e) => displaySubtitle.innerText = e.target.value);
    inputSlogan.addEventListener("input", (e) => displaySlogan.innerText = e.target.value);
    inputYear.addEventListener("input", (e) => displayYear.innerText = e.target.value);
    inputFooterInfo.addEventListener("input", (e) => displayFooterInfo.innerText = e.target.value);
    inputFooterWeb.addEventListener("input", (e) => displayFooterWeb.innerText = e.target.value);

    // Custom Logo Uploader
    inputLogo.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                posterEmblem.innerHTML = `<img src="${event.target.result}" alt="Logo Comune" />`;
            };
            reader.readAsDataURL(file);
        }
    });

    btnAddEvent.addEventListener("click", addNewEvent);
    btnPrint.addEventListener("click", () => window.print());
}

// 2. Theme selector functionality
function setupThemeSelector() {
    const themeButtons = document.querySelectorAll(".theme-btn");
    themeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active class from all buttons
            themeButtons.forEach(b => b.classList.remove("active"));
            // Add active class to clicked button
            btn.classList.add("active");
            
            // Apply theme class to poster
            const selectedTheme = btn.dataset.theme;
            poster.className = `poster-page ${selectedTheme}`;
        });
    });
}

// 3. Zoom / Scale controls
function setupZoomControls() {
    btnZoomIn.addEventListener("click", () => {
        scale = Math.min(scale + 0.05, 1.5);
        applyScale();
    });

    btnZoomOut.addEventListener("click", () => {
        scale = Math.max(scale - 0.05, 0.25);
        applyScale();
    });

    btnZoomFit.addEventListener("click", fitToScreen);
}

function applyScale() {
    wrapper.style.transform = `scale(${scale})`;
    zoomIndicator.innerText = `${Math.round(scale * 100)}%`;
}

function fitToScreen() {
    if (!previewArea || !wrapper) return;
    const parentWidth = previewArea.clientWidth - 80; // Padding offset
    const parentHeight = previewArea.clientHeight - 80;
    
    // Poster raw dimensions in pixels (approx A3 size in screen px at 96dpi)
    const posterWidth = 1122; // 297mm at 96 dpi
    const posterHeight = 1587; // 420mm at 96 dpi
    
    const scaleX = parentWidth / posterWidth;
    const scaleY = parentHeight / posterHeight;
    
    // Pick the smaller scale factor to fit both width and height
    scale = Math.min(scaleX, scaleY);
    scale = Math.max(0.15, Math.min(scale, 1.2)); // Boundaries
    applyScale();
}

// 4. Rendering logic for events list
function renderAll() {
    renderPosterEvents();
    renderEditorEvents();
}

// Render dynamic program items onto the A3 Poster
function renderPosterEvents() {
    programContainer.innerHTML = "";
    
    events.forEach((evt) => {
        const item = document.createElement("div");
        item.className = "poster-event-item";
        
        item.innerHTML = `
            <div class="event-date-box">
                <span class="date-month">${evt.dateMonth}</span>
                <span class="date-day-number">${evt.dateDay}</span>
                <span class="date-day-name">${evt.dateDayName}</span>
            </div>
            <div class="event-vertical-line"></div>
            <div class="event-time-box">
                <span class="time-badge">${evt.time}</span>
            </div>
            <div class="event-details-box">
                <div class="event-details-title-row">
                    <h3 class="event-title">${evt.title}</h3>
                    ${evt.artist ? `<span class="event-artist">${evt.artist}</span>` : ""}
                </div>
                <span class="event-venue">${evt.venue}</span>
            </div>
        `;
        
        programContainer.appendChild(item);
    });
}

// Render inputs in the sidebar to edit each event
function renderEditorEvents() {
    editorListContainer.innerHTML = "";
    
    events.forEach((evt, index) => {
        const row = document.createElement("div");
        row.className = "event-editor-row";
        
        row.innerHTML = `
            <div class="row-header">
                <span class="row-title">Evento #${index + 1}</span>
                <button class="btn-remove" data-index="${index}">Elimina</button>
            </div>
            <div class="input-group">
                <input type="text" class="edit-title" placeholder="Titolo opera/spettacolo" value="${evt.title}" data-index="${index}">
            </div>
            <div class="input-group">
                <input type="text" class="edit-artist" placeholder="Compagnia / Artista" value="${evt.artist}" data-index="${index}">
            </div>
            <div class="editor-grid-3">
                <div class="input-group">
                    <input type="text" class="edit-day" placeholder="Giorno (Es. 18)" value="${evt.dateDay}" data-index="${index}">
                </div>
                <div class="input-group">
                    <input type="text" class="edit-month" placeholder="Mese (Es. Luglio)" value="${evt.dateMonth}" data-index="${index}">
                </div>
                <div class="input-group">
                    <input type="text" class="edit-time" placeholder="Ora (Es. 21:00)" value="${evt.time}" data-index="${index}">
                </div>
            </div>
            <div class="editor-grid-3" style="grid-template-columns: 1fr 2fr;">
                <div class="input-group">
                    <input type="text" class="edit-dayname" placeholder="Giorno Sett. (Es. Sabato)" value="${evt.dateDayName}" data-index="${index}">
                </div>
                <div class="input-group">
                    <input type="text" class="edit-venue" placeholder="Luogo (Es. Cavea Teatrale)" value="${evt.venue}" data-index="${index}">
                </div>
            </div>
        `;
        
        // Event Listeners for inline editing inputs
        row.querySelector(".edit-title").addEventListener("input", updateEventField);
        row.querySelector(".edit-artist").addEventListener("input", updateEventField);
        row.querySelector(".edit-day").addEventListener("input", updateEventField);
        row.querySelector(".edit-month").addEventListener("input", updateEventField);
        row.querySelector(".edit-time").addEventListener("input", updateEventField);
        row.querySelector(".edit-dayname").addEventListener("input", updateEventField);
        row.querySelector(".edit-venue").addEventListener("input", updateEventField);
        
        // Remove button handler
        row.querySelector(".btn-remove").addEventListener("click", removeEvent);
        
        editorListContainer.appendChild(row);
    });
}

// Helper to update a field in the events state and re-render only the poster display to keep input focus
function updateEventField(e) {
    const idx = parseInt(e.target.dataset.index);
    const value = e.target.value;
    
    if (e.target.classList.contains("edit-title")) events[idx].title = value;
    else if (e.target.classList.contains("edit-artist")) events[idx].artist = value;
    else if (e.target.classList.contains("edit-day")) events[idx].dateDay = value;
    else if (e.target.classList.contains("edit-month")) events[idx].dateMonth = value;
    else if (e.target.classList.contains("edit-time")) events[idx].time = value;
    else if (e.target.classList.contains("edit-dayname")) events[idx].dateDayName = value;
    else if (e.target.classList.contains("edit-venue")) events[idx].venue = value;
    
    // Only update poster rendering, so we do not lose keyboard focus inside the sidebar inputs
    renderPosterEvents();
}

// Add a new empty/template event to the list
function addNewEvent() {
    events.push({
        dateDay: "12",
        dateMonth: "Mese",
        dateDayName: "Giorno",
        time: "21:00",
        title: "Nuovo Spettacolo",
        artist: "Compagnia Teatrale",
        venue: "Cavea Teatrale"
    });
    renderAll();
}

// Delete an event by index
function removeEvent(e) {
    const idx = parseInt(e.target.dataset.index);
    events.splice(idx, 1);
    renderAll();
}

// Execute setup
window.onload = init;
