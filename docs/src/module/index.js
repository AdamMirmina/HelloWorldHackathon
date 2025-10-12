class PomodoroTimer {
  constructor() {
    this.loadTimerState();
    this.initializeEventListeners();
    this.updateDisplay();
    this.setMode(this.state.mode);

    // guard to avoid accidental double-complete spam
    this._lastCompleteAt = 0;
  }

  // Default settings
  getDefaultSettings() {
    return {
      focusTime: 25, // minutes
    };
  }

  // Get today's date string for daily tracking
  getTodayString() {
    return new Date().toDateString();
  }

  // Load timer state from localStorage
  loadTimerState() {
    const saved = localStorage.getItem("pomodoroTimer");
    const dailyStats = localStorage.getItem("dailyStats");

    this.settings =
      JSON.parse(localStorage.getItem("timerSettings")) ||
      this.getDefaultSettings();

    if (saved) {
      this.state = JSON.parse(saved);
    } else {
      this.resetToDefaults();
    }

    // Load or initialize daily stats
    const today = this.getTodayString();
    if (dailyStats) {
      this.dailyStats = JSON.parse(dailyStats);
      // Reset stats if it's a new day
      if (this.dailyStats.date !== today) {
        this.dailyStats = {
          date: today,
          totalStudyTime: 0,
          completedPomodoros: 0,
          totalSessions: 0,
        };
      }
    } else {
      this.dailyStats = {
        date: today,
        totalStudyTime: 0,
        completedPomodoros: 0,
        totalSessions: 0,
      };
    }
  }

  // Save current state to localStorage
  saveState() {
    localStorage.setItem("pomodoroTimer", JSON.stringify(this.state));
    localStorage.setItem("timerSettings", JSON.stringify(this.settings));
    localStorage.setItem("dailyStats", JSON.stringify(this.dailyStats));
  }

  // Reset to default state
  resetToDefaults() {
    this.state = {
      minutes: this.settings.focusTime,
      seconds: 0,
      isRunning: false,
      isPaused: false,
      mode: "focus",
      currentPomodoro: 1,
      totalTime: this.settings.focusTime * 60,
      currentTime: this.settings.focusTime * 60,
      sessionStartTime: null,
    };
  }

  // Initialize event listeners
  initializeEventListeners() {
    document.getElementById("startBtn")?.addEventListener("click", () => this.start());
    document.getElementById("pauseBtn")?.addEventListener("click", () => this.pause());
    document.getElementById("resetBtn")?.addEventListener("click", () => this.reset());

    // Settings input (focus minutes)
    document.getElementById("focusTimeInput")?.addEventListener("change", (e) => {
      const v = parseInt(e.target.value, 10);
      // clamp to 1–90 and fall back to default if NaN
      const clamped = Number.isFinite(v)
        ? Math.max(1, Math.min(90, v))
        : this.getDefaultSettings().focusTime;
      this.settings.focusTime = clamped;
      e.target.value = clamped; // reflect sanitized value
      this.saveState();
      if (this.state.mode === "focus" && !this.state.isRunning) {
        this.setMode("focus");
      }
    });
  }

  // Set timer mode (focus, short break, long break)
  setMode(mode) {
    this.stop(); // Stop current timer

    this.state.mode = mode;

    switch (mode) {
      case "focus":
        this.state.totalTime = this.settings.focusTime * 60;
        this.state.minutes = this.settings.focusTime;
        break;
      case "shortBreak":
        this.state.totalTime = this.settings.shortBreak * 60;
        this.state.minutes = this.settings.shortBreak;
        break;
      case "longBreak":
        this.state.totalTime = this.settings.longBreak * 60;
        this.state.minutes = this.settings.longBreak;
        break;
    }

    this.state.seconds = 0;
    this.state.currentTime = this.state.totalTime;
    this.state.isPaused = false;

    this.updateDisplay();
    this.saveState();
  }

  // ✅ Start countdown (reseed if at 00:00; resumes music)
  start() {
    if (this.state.isRunning) return; // Prevent double start

    // If timer is at 00:00, reset to the current mode's default before starting
    if (this.state.minutes === 0 && this.state.seconds === 0) {
      this.setMode(this.state.mode); // resets minutes/seconds/totalTime/currentTime
    }

    this.state.isRunning = true;
    this.state.isPaused = false;

    if (!this.state.sessionStartTime) {
      this.state.sessionStartTime = Date.now();
    }

    // Resume background music on start
    const bgm = document.getElementById("backgroundMusic");
    if (bgm && bgm.paused) {
      bgm.play().catch(() => {}); // ignore autoplay blocks; intro click usually whitelists
    }

    // Real countdown logic
    this.interval = setInterval(() => {
      if (!this.state.isRunning) return;

      if (this.state.seconds > 0) {
        this.state.seconds--;
        this.state.currentTime--;
      } else if (this.state.minutes > 0) {
        this.state.minutes--;
        this.state.seconds = 59;
        this.state.currentTime--;
      } else {
        // Reached 00:00
        this.completeSession();
        return;
      }

      this.updateDisplay();
      this.saveState();
    }, 1000);

    this.updateDisplay();
    this.saveState();
  }

  pause() {
    this.state.isRunning = false;
    this.state.isPaused = true;
    clearInterval(this.interval);
    this.interval = null;
    this.updateDisplay();
    this.saveState();
  }

  // Stop timer (used internally)
  stop() {
    this.state.isRunning = false;
    this.state.isPaused = false;
    clearInterval(this.interval);
    this.interval = null;
  }

  // ✅ Reset current session (also pauses music)
  reset() {
    this.stop();

    // Pause background music when user hits Reset
    const bgm = document.getElementById("backgroundMusic");
    if (bgm && !bgm.paused) bgm.pause();

    this.state.sessionStartTime = null;
    this.setMode(this.state.mode); // Reset to current mode's default time
  }

  // ✅ Complete a session (pause music when timer hits 0)
  completeSession() {
    // tiny guard to avoid duplicate completes from any edge case
    const now = Date.now();
    if (now - this._lastCompleteAt < 400) return;
    this._lastCompleteAt = now;

    this.stop();

    // Pause background music at session end
    try {
      const bgm = document.getElementById("backgroundMusic");
      if (bgm && !bgm.paused) bgm.pause();
    } catch {}

    // Update daily stats
    if (this.state.mode === "focus") {
      this.dailyStats.completedPomodoros++;
      const sessionDuration = Math.floor(
        (Date.now() - this.state.sessionStartTime) / 1000
      );
      this.dailyStats.totalStudyTime += sessionDuration;
    }

    this.dailyStats.totalSessions++;
    this.state.sessionStartTime = null;

    // Completion UI/notification
    this.showCompletionNotification();

    this.saveState();
  }

  // Show completion notification
  showCompletionNotification() {
    const mode = this.state.mode === "focus" ? "Focus session" : "Break";
    const nextMode = this.state.mode === "focus" ? "break" : "focus";

    if (window.Notification && Notification.permission === "granted") {
      new Notification(`${mode} complete!`, {
        body: `Time for your ${nextMode} session.`,
        icon: "/favicon.ico",
      });
    }

    const statusElement = document.getElementById("timerStatus");
    if (statusElement) {
      statusElement.textContent = `${mode} complete!`;
      setTimeout(() => this.updateDisplay(), 3000);
    }
  }

  // Update all display elements
  updateDisplay() {
    this.updateTimerDisplay();
    this.updateStatusDisplay();
    this.updateStatsDisplay();
    this.updateModeButtons();
    this.updateSettingsInputs();
  }

  // Update main timer display
  updateTimerDisplay() {
    const display = document.getElementById("timerDisplay");
    if (display) {
      const minutes = this.state.minutes.toString().padStart(2, "0");
      const seconds = this.state.seconds.toString().padStart(2, "0");
      display.textContent = `${minutes}:${seconds}`;
    }
  }

  // Update status text
  updateStatusDisplay() {
    const status = document.getElementById("timerStatus");
    if (status) {
      if (this.state.isRunning) {
        const modeText =
          this.state.mode === "focus"
            ? "Focus Mode"
            : this.state.mode === "shortBreak"
            ? "Short Break"
            : "Long Break";
        status.textContent = `${modeText}`;
      } else if (this.state.isPaused) {
        status.textContent = "Timer Paused";
      } else {
        const modeText =
          this.state.mode === "focus"
            ? "Ready to Focus"
            : this.state.mode === "shortBreak"
            ? "Short Break Ready"
            : "Long Break Ready";
        status.textContent = modeText;
      }
    }
  }

  // Update statistics display
  updateStatsDisplay() {
    const pomodoroCount = document.getElementById("pomodoroCount");
    if (pomodoroCount) {
      pomodoroCount.textContent = this.dailyStats.completedPomodoros;
    }

    const totalTime = document.getElementById("totalStudyTime");
    if (totalTime) {
      const hours = Math.floor(this.dailyStats.totalStudyTime / 3600);
      const minutes = Math.floor((this.dailyStats.totalStudyTime % 3600) / 60);
      totalTime.textContent =
        hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }

    const sessionCount = document.getElementById("sessionCount");
    if (sessionCount) {
      sessionCount.textContent = this.state.currentPomodoro;
    }

    const totalSessions = document.getElementById("totalSessions");
    if (totalSessions) {
      totalSessions.textContent = this.dailyStats.totalSessions;
    }
  }

  // Update mode button states
  updateModeButtons() {
    const buttons = {
      focusModeBtn: "focus",
      shortBreakBtn: "shortBreak",
      longBreakBtn: "longBreak",
    };

    Object.entries(buttons).forEach(([buttonId, mode]) => {
      const button = document.getElementById(buttonId);
      if (button) {
        if (this.state.mode === mode) {
          button.classList.add("active");
        } else {
          button.classList.remove("active");
        }
      }
    });
  }

  // Update settings inputs
  updateSettingsInputs() {
    const focusInput = document.getElementById("focusTimeInput");
    if (focusInput) focusInput.value = this.settings.focusTime;

    const shortBreakInput = document.getElementById("shortBreakInput");
    if (shortBreakInput) shortBreakInput.value = this.settings.shortBreak;

    const longBreakInput = document.getElementById("longBreakInput");
    if (longBreakInput) longBreakInput.value = this.settings.longBreak;
  }

  // Get current stats (useful for displaying in UI)
  getStats() {
    return {
      today: this.dailyStats,
      current: {
        mode: this.state.mode,
        pomodoro: this.state.currentPomodoro,
        isRunning: this.state.isRunning,
        isPaused: this.state.isPaused,
      },
    };
  }

  // Manual methods for external control
  setCustomTime(minutes) {
    if (!this.state.isRunning) {
      this.state.minutes = minutes;
      this.state.seconds = 0;
      this.state.totalTime = minutes * 60;
      this.state.currentTime = minutes * 60;
      this.updateDisplay();
      this.saveState();
    }
  }

  // Request notification permission
  requestNotificationPermission() {
    if (window.Notification && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }
}

// Initialize timer when DOM is ready
let pomodoroTimer;

document.addEventListener("DOMContentLoaded", function () {
  pomodoroTimer = new PomodoroTimer();

  // Request notification permission
  pomodoroTimer.requestNotificationPermission();

  console.log("Pomodoro Timer initialized");
});

// Export for external use
if (typeof module !== "undefined" && module.exports) {
  module.exports = { PomodoroTimer };
}
