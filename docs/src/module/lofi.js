// docs/src/module/lofi.js

/* DOM */
const introBtn = document.getElementById("intro");
const music = document.getElementById("backgroundMusic");

const timerDisplay = document.getElementById("timerDisplay");
const timerStatus  = document.getElementById("timerStatus");

const startBtn = document.getElementById("startBtn");
document.getElementById("startBtn").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    document.getElementById("startBtn").click();
  }
});
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const focusInput = document.getElementById("focusTimeInput");
const muteBtn    = document.getElementById("muteBtn");

const timerPage  = document.getElementById("timerPage");

/* State */
const STORAGE_KEY = "lofi_timer_state_v1";
let intervalId = null;

let state = {
  durationMs: 25 * 60 * 1000,  // default 25 minutes
  remainingMs: 25 * 60 * 1000,
  endTime: null,               // timestamp when running
  running: false
};

/* Utils */
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function formatTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const loaded = JSON.parse(raw);
    if (typeof loaded.durationMs === "number") state.durationMs = loaded.durationMs;
    if (typeof loaded.remainingMs === "number") state.remainingMs = loaded.remainingMs;
    if (typeof loaded.endTime === "number" || loaded.endTime === null) state.endTime = loaded.endTime;
    if (typeof loaded.running === "boolean") state.running = loaded.running;

    // Recalculate remaining if it was running
    if (state.running && state.endTime) {
      const delta = state.endTime - Date.now();
      state.remainingMs = Math.max(0, delta);
      if (state.remainingMs <= 0) {
        state.running = false;
        state.endTime = null;
      }
    }
  } catch {}
}

/* Rendering */
function render() {
  timerDisplay.textContent = formatTime(state.remainingMs);
  if (state.running) {
    timerStatus.textContent = "Focusing…";
  } else if (state.remainingMs === 0) {
    timerStatus.textContent = "Done! 🎉";
  } else {
    timerStatus.textContent = "Ready to Focus";
  }
}

/* Timer loop */
function startLoop() {
  stopLoop();
  intervalId = setInterval(() => {
    if (!state.running || !state.endTime) return;
    const left = state.endTime - Date.now();
    state.remainingMs = Math.max(0, left);
    if (state.remainingMs <= 0) {
      state.running = false;
      state.endTime = null;
      stopLoop();
    }
    render();
    saveState();
  }, 250);
}

function stopLoop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

/* Actions */
function startTimer() {
  if (state.running) return;
  if (state.remainingMs <= 0) {
    state.remainingMs = state.durationMs;
  }
  state.endTime = Date.now() + state.remainingMs;
  state.running = true;
  startLoop();
  render();
  saveState();
}

function pauseTimer() {
  if (!state.running) return;
  // snapshot remaining at pause moment
  const left = Math.max(0, state.endTime - Date.now());
  state.remainingMs = left;
  state.running = false;
  state.endTime = null;
  stopLoop();
  render();
  saveState();
}

function resetTimer() {
  state.running = false;
  state.endTime = null;
  state.remainingMs = state.durationMs;
  stopLoop();
  render();
  saveState();
}

function setDurationFromInput() {
  const mins = clamp(parseInt(focusInput.value, 10) || 25, 1, 90);
  focusInput.value = String(mins);
  state.durationMs = mins * 60 * 1000;
  if (!state.running) {
    state.remainingMs = state.durationMs;
  }
  render();
  saveState();
}

/* Page show/hide */
function showTimerPage() {
  timerPage.classList.add("active");
}

/* Events */
introBtn.addEventListener("click", async () => {
  // Start music (user gesture)
  try { await music.play(); } catch { /* autoplay may fail; that's ok */ }
  // Fade out and remove intro overlay
  introBtn.classList.add("fade-out");
  introBtn.addEventListener("transitionend", () => introBtn.remove(), { once: true });
  showTimerPage();
});

muteBtn.addEventListener("click", () => {
  if (music.paused) {
    music.play().catch(() => {});
    muteBtn.textContent = "Mute";
    muteBtn.setAttribute("aria-pressed", "false");
  } else {
    music.pause();
    muteBtn.textContent = "Unmute";
    muteBtn.setAttribute("aria-pressed", "true");
  }
});

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);
focusInput.addEventListener("change", setDurationFromInput);

/* Init */
loadState();
// If there is prior state (e.g., you navigated away), show timer immediately
const hasHistory = state.remainingMs !== state.durationMs || state.running;
if (hasHistory) {
  // Hide intro overlay without animation if already working
  introBtn.style.display = "none";
  showTimerPage();
}

// Sync input/display with state
focusInput.value = String(Math.round(state.durationMs / 60000));
render();
if (state.running) startLoop();
