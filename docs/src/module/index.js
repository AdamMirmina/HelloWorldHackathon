/*
pomodoroTimer.start();                // Start timer
pomodoroTimer.setCustomTime(45);      // Set 45-minute custom session
pomodoroTimer.getStats();             // Get current statistics

*/

// Enhanced Pomodoro Timer System
class PomodoroTimer {
  constructor() {
    this.loadTimerState();
    this.initializeEventListeners();
    this.updateDisplay();
  }

  // Default settings
  getDefaultSettings() {
    return {
      focusTime: 25,      // minutes
      shortBreak: 5,      // minutes
      longBreak: 15,      // minutes
      longBreakInterval: 4 // after how many pomodoros
    };
  }

  // Get today's date string for daily tracking
  getTodayString() {
    return new Date().toDateString();
  }

  // Load timer state from localStorage
  loadTimerState() {
    const saved = localStorage.getItem('pomodoroTimer');
    const dailyStats = localStorage.getItem('dailyStats');
    
    this.settings = JSON.parse(localStorage.getItem('timerSettings')) || this.getDefaultSettings();
    
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
          totalSessions: 0
        };
      }
    } else {
      this.dailyStats = {
        date: today,
        totalStudyTime: 0,
        completedPomodoros: 0,
        totalSessions: 0
      };
    }
  }

  // Save current state to localStorage
  saveState() {
    localStorage.setItem('pomodoroTimer', JSON.stringify(this.state));
    localStorage.setItem('timerSettings', JSON.stringify(this.settings));
    localStorage.setItem('dailyStats', JSON.stringify(this.dailyStats));
  }

  // Reset to default state
  resetToDefaults() {
    this.state = {
      minutes: this.settings.focusTime,
      seconds: 0,
      isRunning: false,
      isPaused: false,
      mode: 'focus', // 'focus', 'shortBreak', 'longBreak'
      currentPomodoro: 1,
      totalTime: this.settings.focusTime * 60,
      currentTime: this.settings.focusTime * 60,
      sessionStartTime: null
    };
  }

  // Initialize event listeners
  initializeEventListeners() {
    document.getElementById('startBtn')?.addEventListener('click', () => this.start());
    document.getElementById('pauseBtn')?.addEventListener('click', () => this.pause());
    document.getElementById('resetBtn')?.addEventListener('click', () => this.reset());
    
    // Settings inputs
    document.getElementById('focusTimeInput')?.addEventListener('change', (e) => {
      this.settings.focusTime = parseInt(e.target.value);
      this.saveState();
      if (this.state.mode === 'focus' && !this.state.isRunning) {
        this.setMode('focus');
      }
    });

    document.getElementById('shortBreakInput')?.addEventListener('change', (e) => {
      this.settings.shortBreak = parseInt(e.target.value);
      this.saveState();
    });

    document.getElementById('longBreakInput')?.addEventListener('change', (e) => {
      this.settings.longBreak = parseInt(e.target.value);
      this.saveState();
    });

    // Mode switching buttons
    document.getElementById('focusModeBtn')?.addEventListener('click', () => this.setMode('focus'));
    document.getElementById('shortBreakBtn')?.addEventListener('click', () => this.setMode('shortBreak'));
    document.getElementById('longBreakBtn')?.addEventListener('click', () => this.setMode('longBreak'));
  }

  // Set timer mode (focus, short break, long break)
  setMode(mode) {
    this.stop(); // Stop current timer
    
    this.state.mode = mode;
    
    switch(mode) {
      case 'focus':
        this.state.totalTime = this.settings.focusTime * 60;
        this.state.minutes = this.settings.focusTime;
        break;
      case 'shortBreak':
        this.state.totalTime = this.settings.shortBreak * 60;
        this.state.minutes = this.settings.shortBreak;
        break;
      case 'longBreak':
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

  // Start timer
  start() {
    if (this.state.isPaused || !this.state.isRunning) {
      this.state.isRunning = true;
      this.state.isPaused = false;
      
      if (!this.state.sessionStartTime) {
        this.state.sessionStartTime = Date.now();
      }
      
      this.interval = setInterval(() => {
        if (this.state.seconds === 0) {
          if (this.state.minutes === 0) {
            this.completeSession();
            return;
          }
          this.state.minutes--;
          this.state.seconds = 59;
        } else {
          this.state.seconds--;
        }
        
        this.state.currentTime = this.state.minutes * 60 + this.state.seconds;
        this.updateDisplay();
        this.saveState();
      }, 1000);
      
      this.updateDisplay();
      this.saveState();
    }
  }

  // Pause timer
  pause() {
    this.state.isRunning = false;
    this.state.isPaused = true;
    clearInterval(this.interval);
    this.updateDisplay();
    this.saveState();
  }

  // Stop timer (used internally)
  stop() {
    this.state.isRunning = false;
    this.state.isPaused = false;
    clearInterval(this.interval);
  }

  // Reset current session
  reset() {
    this.stop();
    this.state.sessionStartTime = null;
    this.setMode(this.state.mode); // Reset to current mode's default time
  }

  // Complete a session (when timer reaches 0)
  completeSession() {
    this.stop();
    
    // Update daily stats
    if (this.state.mode === 'focus') {
      this.dailyStats.completedPomodoros++;
      const sessionDuration = Math.floor((Date.now() - this.state.sessionStartTime) / 1000);
      this.dailyStats.totalStudyTime += sessionDuration;
    }
    
    this.dailyStats.totalSessions++;
    this.state.sessionStartTime = null;
    
    // Auto-switch to next mode
    if (this.state.mode === 'focus') {
      // After focus, switch to break
      if (this.state.currentPomodoro % this.settings.longBreakInterval === 0) {
        this.setMode('longBreak');
      } else {
        this.setMode('shortBreak');
      }
      this.state.currentPomodoro++;
    } else {
      // After break, switch to focus
      this.setMode('focus');
    }
    
    // Show completion message
    this.showCompletionNotification();
    
    this.saveState();
  }

  // Show completion notification
  showCompletionNotification() {
    const mode = this.state.mode === 'focus' ? 'Focus session' : 'Break';
    const nextMode = this.state.mode === 'focus' ? 'break' : 'focus';
    
    // You can customize this notification
    if (window.Notification && Notification.permission === 'granted') {
      new Notification(`${mode} complete!`, {
        body: `Time for your ${nextMode} session.`,
        icon: '/favicon.ico'
      });
    }
    
    // Visual notification in the UI
    const statusElement = document.getElementById('timerStatus');
    if (statusElement) {
      statusElement.textContent = `${mode} complete! ✨ Starting ${nextMode}...`;
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
    const display = document.getElementById('timerDisplay');
    if (display) {
      const minutes = this.state.minutes.toString().padStart(2, '0');
      const seconds = this.state.seconds.toString().padStart(2, '0');
      display.textContent = `${minutes}:${seconds}`;
    }
  }

  // Update status text
  updateStatusDisplay() {
    const status = document.getElementById('timerStatus');
    if (status) {
      if (this.state.isRunning) {
        const modeText = this.state.mode === 'focus' ? 'Focus Mode' : 
                        this.state.mode === 'shortBreak' ? 'Short Break' : 'Long Break';
        status.textContent = `${modeText} - Focus Mode`;
      } else if (this.state.isPaused) {
        status.textContent = 'Timer Paused';
      } else {
        const modeText = this.state.mode === 'focus' ? 'Ready to Focus' : 
                        this.state.mode === 'shortBreak' ? 'Short Break Ready' : 'Long Break Ready';
        status.textContent = modeText;
      }
    }
  }

  // Update statistics display
  updateStatsDisplay() {
    // Pomodoro counter
    const pomodoroCount = document.getElementById('pomodoroCount');
    if (pomodoroCount) {
      pomodoroCount.textContent = this.dailyStats.completedPomodoros;
    }

    // Total study time (formatted)
    const totalTime = document.getElementById('totalStudyTime');
    if (totalTime) {
      const hours = Math.floor(this.dailyStats.totalStudyTime / 3600);
      const minutes = Math.floor((this.dailyStats.totalStudyTime % 3600) / 60);
      totalTime.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }

    // Current session number
    const sessionCount = document.getElementById('sessionCount');
    if (sessionCount) {
      sessionCount.textContent = this.state.currentPomodoro;
    }

    // Total sessions today
    const totalSessions = document.getElementById('totalSessions');
    if (totalSessions) {
      totalSessions.textContent = this.dailyStats.totalSessions;
    }
  }

  // Update mode button states
  updateModeButtons() {
    const buttons = {
      'focusModeBtn': 'focus',
      'shortBreakBtn': 'shortBreak',
      'longBreakBtn': 'longBreak'
    };

    Object.entries(buttons).forEach(([buttonId, mode]) => {
      const button = document.getElementById(buttonId);
      if (button) {
        if (this.state.mode === mode) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      }
    });
  }

  // Update settings inputs
  updateSettingsInputs() {
    const focusInput = document.getElementById('focusTimeInput');
    if (focusInput) focusInput.value = this.settings.focusTime;

    const shortBreakInput = document.getElementById('shortBreakInput');
    if (shortBreakInput) shortBreakInput.value = this.settings.shortBreak;

    const longBreakInput = document.getElementById('longBreakInput');
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
        isPaused: this.state.isPaused
      }
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
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}


// Initialize timer when DOM is ready
let pomodoroTimer;

document.addEventListener('DOMContentLoaded', function() {
  pomodoroTimer = new PomodoroTimer();
  
  // Request notification permission
  pomodoroTimer.requestNotificationPermission();
  
  console.log('Pomodoro Timer initialized');
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PomodoroTimer, showPage };
}
