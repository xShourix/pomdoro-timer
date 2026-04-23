const studyColor = "var(--primary-color)";
const breakColor = "var(--secondary-color)";
let mode = "study"; // "study" or "break"

// timer variables
let studyTime = 25 * 60; // default 25 minutes
let breakTime = 5 * 60; // default 5 minutes
let totalTime = studyTime;
let currentTime = studyTime;
let interval = null;

// timer display elements
const breakModeLabel = document.getElementById("breakModeLabel");
const studyModeLabel = document.getElementById("studyModeLabel");
const timerDisplay = document.getElementById("timerNumber");
const progressCircle = document.getElementById("progressCircle");
const radius = 90;
const circumference = 2 * Math.PI * radius;
progressCircle.style.strokeDasharray = circumference;
progressCircle.style.strokeDashoffset = 0;

// timer control buttons
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");

// settings elements
const settingsPanel = document.getElementById("settingsPanel");
const studyInput = document.getElementById("studyInput");
const breakInput = document.getElementById("breakInput");
const goalInput = document.getElementById("goalInput");

// session tracking elements
const sessionCountEl = document.getElementById("sessionCount");
const sessionGoalEl = document.getElementById("sessionGoal");
let sessionCount = 0;
let sessionGoal = 4;

// goal - session data display elements
const savedCount = localStorage.getItem("sessionCount");
const savedGoal = localStorage.getItem("sessionGoal");

// popup elements
const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popupMessage");

// display update function
function updateDisplay() {
  let minutes = Math.floor(currentTime / 60);
  let seconds = currentTime % 60;

  seconds = seconds < 10 ? "0" + seconds : seconds;

  timerDisplay.textContent = `${minutes}:${seconds}`;
  document.title = `${mode === "study" ? "Study" : "Break"} - ${minutes}:${seconds}`;
  progressCircle.style.stroke = mode === "study" ? studyColor : breakColor;

  // active style toggle
  if (mode === "study") {
    studyModeLabel.classList.add("active");
    breakModeLabel.classList.remove("active");
  }
  else {
    breakModeLabel.classList.add("active");
    studyModeLabel.classList.remove("active");
  }

  sessionCountEl.textContent = sessionCount;
  sessionGoalEl.textContent = sessionGoal;

  // progress calculation
  const progress = currentTime / totalTime;
  progressCircle.style.strokeDashoffset = circumference * (1 - progress);
}

// mode switch function
function switchModeTo(modeName) {
  if (mode === modeName) return; // no change
  
  pauseTimer(); // ensure timer is stopped when switching modes

  mode = modeName;
  if (mode === "study") {
    totalTime = studyTime;
    currentTime = studyTime;
  } else {
    totalTime = breakTime;
    currentTime = breakTime;
  }

  updateDisplay();
}
// timer functions
function startTimer() {
  if (interval) return; // preventing multiple timers

  startBtn.classList.add("hidden");
  pauseBtn.classList.remove("hidden");

  interval = setInterval(() => {
    if (currentTime > 0) {
      currentTime--;
      updateDisplay();
    } else {
      clearInterval(interval);
      interval = null;

      if (mode === "study") {
        sessionCount++;
        if (sessionCount >= sessionGoal) {
          popupMessage.textContent = "Congratulations! You've reached your session goal!";
        } else {          
          popupMessage.textContent = "Study session complete! Time for a break.";
        }
      } else {
        popupMessage.textContent = "Break's over! Time to get back to work.";
      }

      saveSessionData();
      updateDisplay();
      popup.classList.remove("hidden");
    }
  }, 1000);
}
function pauseTimer() {
    startBtn.classList.remove("hidden");
    pauseBtn.classList.add("hidden");

    clearInterval(interval);
    interval = null;
}
function resetTimer() {
  startBtn.classList.remove("hidden");
  pauseBtn.classList.add("hidden");

  clearInterval(interval);
  interval = null;

  studyTime = studyInput.value * 60;
  breakTime = breakInput.value * 60;

  if (mode === "study") {
    totalTime = studyTime;
    currentTime = studyTime;
  } else {
    totalTime = breakTime;
    currentTime = breakTime;
  }

  updateDisplay();
}

// settings functions
function saveStudyTime() {
  localStorage.setItem("studyTime", studyInput.value);
}
function saveBreakTime() {
  localStorage.setItem("breakTime", breakInput.value);
}
function saveGoal() {
  sessionGoal = goalInput.value;
  sessionGoalEl.textContent = sessionGoal;
  localStorage.setItem("sessionGoal", goalInput.value);
}
function loadSettings() {
  const savedStudy = localStorage.getItem("studyTime");
  const savedBreak = localStorage.getItem("breakTime");

  if (savedStudy) studyInput.value = savedStudy;
  if (savedBreak) breakInput.value = savedBreak;

  studyTime = studyInput.value * 60;
  breakTime = breakInput.value * 60;

  mode = "study";
  totalTime = studyTime;
  currentTime = studyTime;
  
  // session data loading
  if (savedCount) sessionCount = parseInt(savedCount);
  if (savedGoal) {
    goalInput.value = savedGoal;
    sessionGoal = parseInt(savedGoal);
  }
  updateDisplay();
}

// session handling
function resetSession() {
  sessionCount = 0;
  updateDisplay();
  saveSessionData();
}
function saveSessionData() {
  localStorage.setItem("sessionCount", sessionCount);
  localStorage.setItem("sessionGoal", sessionGoal);
}

// popup handling
function closePopup() {
  if (mode === "study") {
    switchModeTo("break");
  } else {
    switchModeTo("study");
  }
  startTimer();
  updateDisplay();
  popup.classList.add("hidden");
}
// settings panel toggle
function toggleSettingsPanel() {
  if (settingsPanel.classList.contains("open")) {
    settingsPanel.classList.remove("open");
    settingsPanel.classList.add("hidden");
  } else {
    settingsPanel.classList.add("open");
    settingsPanel.classList.remove("hidden");
  }
}

// on load
loadSettings();
updateDisplay();
