// Page navigation
function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  // Show selected page
  if (pageName === "home") {
    document.getElementById("homePage").classList.add("active");
  } else if (pageName === "timer") {
    document.getElementById("timerPage").classList.add("active");
  } else if (pageName === "buddy") {
    document.getElementById("buddyPage").classList.add("active");
  } else if (pageName === "spots") {
    document.getElementById("spotsPage").classList.add("active");
  }
}

// Timer functionality
let timerState = {
  minutes: 25,
  seconds: 0,
  isRunning: false,
  totalTime: 25 * 60,
  currentTime: 25 * 60,
};

let timerInterval;

function updateTimerDisplay() {
  const display = document.getElementById("timerDisplay");
  const status = document.getElementById("timerStatus");

  display.textContent = `${timerState.minutes
    .toString()
    .padStart(2, "0")}:${timerState.seconds.toString().padStart(2, "0")}`;

  if (timerState.isRunning) {
    status.textContent = "deep focus mode";
  } else {
    status.textContent =
      timerState.currentTime === timerState.totalTime
        ? "ready to focus"
        : "paused";
  }
}

function startTimer() {
  if (
    !timerState.isRunning &&
    (timerState.minutes > 0 || timerState.seconds > 0)
  ) {
    timerState.isRunning = true;
    timerInterval = setInterval(() => {
      if (timerState.seconds === 0) {
        if (timerState.minutes === 0) {
          // Timer finished
          timerState.isRunning = false;
          clearInterval(timerInterval);
          document.getElementById("timerStatus").textContent =
            "session complete! ✨";
          return;
        }
        timerState.minutes--;
        timerState.seconds = 59;
      } else {
        timerState.seconds--;
      }
      timerState.currentTime =
        timerState.minutes * 60 + timerState.seconds;
      updateTimerDisplay();
    }, 1000);
    updateTimerDisplay();
  }
}

function pauseTimer() {
  timerState.isRunning = false;
  clearInterval(timerInterval);
  updateTimerDisplay();
}

function resetTimer() {
  timerState.isRunning = false;
  timerState.minutes = 25;
  timerState.seconds = 0;
  timerState.currentTime = timerState.totalTime;
  clearInterval(timerInterval);
  updateTimerDisplay();
}

// Event listeners
document.getElementById("startBtn").addEventListener("click", startTimer);
document.getElementById("pauseBtn").addEventListener("click", pauseTimer);
document.getElementById("resetBtn").addEventListener("click", resetTimer);

// Initialize
updateTimerDisplay();
