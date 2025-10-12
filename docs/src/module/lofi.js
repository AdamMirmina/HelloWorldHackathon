// docs/src/module/lofi.js
document.addEventListener("DOMContentLoaded", () => {
  const introBtn = document.getElementById("intro");
  const bgm = document.getElementById("backgroundMusic");
  const timerPage = document.getElementById("timerPage");

  if (!introBtn || !timerPage) return; // nothing to do if elements missing

  let started = false;

  async function beginSession() {
    if (started) return;
    started = true;

    // Try to play background music on user gesture
    if (bgm) {
      try {
        // optional: bgm.volume = 0.6;
        await bgm.play();
      } catch (e) {
        console.warn("Audio play was blocked or failed:", e);
      }
    }

    // Fade out and remove the intro curtain
    introBtn.classList.add("fade-out");
    introBtn.addEventListener(
      "transitionend",
      () => introBtn.remove(),
      { once: true }
    );

    // Reveal the timer page
    timerPage.classList.add("active");
  }

  // Start on click
  introBtn.addEventListener("click", beginSession, { once: true });

  // Also allow Enter/Space to start for accessibility
  introBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      beginSession();
    }
  });
});

/**
 * Keep a global helper for compatibility with any inline calls.
 * Accepts "timer" or "timerPage" and activates that page.
 */
function showPage(name) {
  const targetId = name.endsWith("Page") ? name : `${name}Page`;

  document.querySelectorAll(".page").forEach((el) => el.classList.remove("active"));

  const target = document.getElementById(targetId);
  if (target) target.classList.add("active");
}

// Expose globally if modules scope-isolate (harmless if already global)
try {
  window.showPage = window.showPage || showPage;
} catch { /* noop for very old browsers */ }
