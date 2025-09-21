// docs/src/module/mottos.js
// Rotates the home subtitle with a random study line.
// Triggers on page load and whenever #homePage becomes active again.

const MOTTOS = [
  // — Core rotation (no emojis)
  "Lock in.",
  "One pomodoro at a time.",
  "Keep your focus sharp!",
  "Pencil ready?",
  "Make the next minute count.",
  "Who's the final boss this time?",
  "Study hard, game later.",
  "Focus!",
  "Progress loves consistency.",
  "Notes today, mastery tomorrow.",
  "Less scroll, more soul (into notes).",
  "Build the habit, keep the promise.",
  "Learn like you mean it.",
  "Don't you dare lift that phone.",
  "The hard part is starting. Begin.",
  "Be where your feet are.",
  "You don’t need more time, just more focus.",
  "Short sprint. Long impact.",
  "Turn down the noise, turn up the effort.",
  "Brain on. Distractions off.",
  "Curiosity is your superpower.",
  "Drafts first, polish later.",
  "Study what future-you wishes you knew.",
  "One page more than yesterday.",
  "Be precise. Be patient.",
  "Build a streak you’re proud of.",
  "Take notes you’ll actually read.",
  "Questions first, answers second.",
  "Read, recall, refine, repeat.",
  "Don't you dare skim that reading.",
  "Show up for the boring parts.",
  "Turn effort into momentum.",
  "Make it make sense (to you).",
  "Learn loudly in silence.",
  "This hour is yours.",
  "Keep your promise to focus.",
  "You’re closer than you think.",
  "Breathe, then begin.",
  "Study is practice for thinking.",
  "Make the hard thing easy: start.",
  "Less perfect, more progress.",
  "Focus is choosing one thing.",
  "Put your phone face down.",
  "Think with a pen.",
  "The best time is this minute.",
  "Don’t count the minutes; make the minutes count.",
  "You already beat procrastination by opening this.",
  "When in doubt, write it out.",
  "⌒(o＾▽＾o)ノ",
  "So. How long have you doomscrolled today?",

  // — Light easter eggs (kept subtle, still no emojis)
  "Hidden boss: the next paragraph. Defeat it.",
  "ACHIEVEMENT UNLOCKED: Refreshing Like a Maniac.",
  "What will Prof. Turkstra rant about today?",
  "べんきょうをしましょう！",
  "Wow! This message was a 1/55 chance!",
];

const STORAGE_KEY = "lastMottoIndex";

function pickNewIndex(last) {
  if (MOTTOS.length <= 1) return 0;
  let idx = Math.floor(Math.random() * MOTTOS.length);
  if (last != null && MOTTOS.length > 1) {
    // avoid immediate repeat
    if (idx === last) idx = (idx + 1) % MOTTOS.length;
  }
  return idx;
}

function setRandomSubtitle() {
  const el = document.querySelector(".subtitle");
  if (!el) return;

  let last = null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) last = parseInt(stored, 10);
  } catch (_) {}

  const idx = pickNewIndex(Number.isFinite(last) ? last : null);
  el.textContent = MOTTOS[idx];

  try {
    localStorage.setItem(STORAGE_KEY, String(idx));
  } catch (_) {}
}

function observeHomePageActivation() {
  const home = document.getElementById("homePage");
  if (!home) return;

  // fire when home is currently active
  if (home.classList.contains("active")) setRandomSubtitle();

  // watch for future toggles to 'active'
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "attributes" && m.attributeName === "class") {
        if (home.classList.contains("active")) {
          setRandomSubtitle();
        }
      }
    }
  });
  mo.observe(home, { attributes: true });
}

document.addEventListener("DOMContentLoaded", () => {
  // on load
  setRandomSubtitle();

  // when the tab becomes visible again
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") setRandomSubtitle();
  });

  // when navigating back to Home within the SPA
  observeHomePageActivation();
});
