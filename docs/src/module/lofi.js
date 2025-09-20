let time = 25 * 60; // 25 minutes
let timer = null;

const display = document.getElementById("time-display");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const stopBtn = document.getElementById("stop");
const plusBtn = document.getElementById("plus");
const minusBtn = document.getElementById("minus");

function updateDisplay() {
  let minutes = Math.floor(time / 60);
  let seconds = time % 60;
  display.textContent = 
    `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function startTimer() {
  if (!timer) {
    timer = setInterval(() => {
      if (time > 0) {
        time--;
        updateDisplay();
      } else {
        clearInterval(timer);
        timer = null;
        alert("Pomodoro complete!");
      }
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(timer);
  timer = null;
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
  time = 25 * 60;
  updateDisplay();
}

function plusMinute() {
  time += 60;
  updateDisplay();
}

function minusMinute() {
  if (time > 60) {
    time -= 60;
    updateDisplay();
  }
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
stopBtn.addEventListener("click", stopTimer);
plusBtn.addEventListener("click", plusMinute);
minusBtn.addEventListener("click", minusMinute);

updateDisplay();
