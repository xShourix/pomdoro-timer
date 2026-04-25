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
const breakModeLabel = document.querySelector("#breakModeLabel");
const studyModeLabel = document.querySelector("#studyModeLabel");
const timerDisplay = document.querySelector("#timerNumber");
const progressCircle = document.querySelector("#progressCircle");
const radius = 90;
const circumference = 2 * Math.PI * radius;
progressCircle.style.strokeDasharray = circumference;
progressCircle.style.strokeDashoffset = 0;

// timer control buttons
const startBtn = document.querySelector("#start");
const pauseBtn = document.querySelector("#pause");

// settings elements
const settingsPanel = document.querySelector("#settingsPanel");
const studyInput = document.querySelector("#studyInput");
const breakInput = document.querySelector("#breakInput");
const goalInput = document.querySelector("#goalInput");

// session tracking elements
const sessionCountEl = document.querySelector("#sessionCount");
const sessionGoalEl = document.querySelector("#sessionGoal");
let sessionCount = 0;
let sessionGoal = 4;

// goal - session data display elements
const savedCount = localStorage.getItem("sessionCount");
const savedGoal = localStorage.getItem("sessionGoal");

// popup elements
const popup = document.querySelector("#popup");
const popupMessage = document.querySelector("#popupMessage");

// alarm
const alarmSound = document.querySelector("#alarmSound");
const muteIcon = document.getElementById("muteIcon");
const volumeSlider = document.getElementById("volumeSlider");
let lastVolume = 0.5;

//FUNCTIONS
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

      alarmSound.currentTime = 0;
      alarmSound.play();

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
  const savedVolume = localStorage.getItem("volume");

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

  if(savedVolume)
    updateVolume(savedVolume);

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
  alarmSound.pause();
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

// audio functions
function updateVolume(val) {
  alarmSound.volume = val;
  lastVolume = val;
  localStorage.setItem("volume", volumeSlider.value);
  updateVolumeIcon();
}
function toggleMute() {
  if (alarmSound.volume > 0) {
    lastVolume = alarmSound.volume;
    alarmSound.volume = 0;
    volumeSlider.value = 0;
  } else {
    if(lastVolume>0) {
      alarmSound.volume = lastVolume || 0.5;
      volumeSlider.value = lastVolume || 0.5;
    }
    else {
      alarmSound.volume = 0.5;
      volumeSlider.value = 0.5;
    }
  }
  updateVolumeIcon();
  localStorage.setItem("volume", volumeSlider.value);
}
function updateVolumeIcon() {
  if (volumeSlider.value == 0) {
    muteIcon.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640'><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d='M80 416L128 416L262.1 535.2C268.5 540.9 276.7 544 285.2 544C304.4 544 320 528.4 320 509.2L320 130.8C320 111.6 304.4 96 285.2 96C276.7 96 268.5 99.1 262.1 104.8L128 224L80 224C53.5 224 32 245.5 32 272L32 368C32 394.5 53.5 416 80 416zM399 239C389.6 248.4 389.6 263.6 399 272.9L446 319.9L399 366.9C389.6 376.3 389.6 391.5 399 400.8C408.4 410.1 423.6 410.2 432.9 400.8L479.9 353.8L526.9 400.8C536.3 410.2 551.5 410.2 560.8 400.8C570.1 391.4 570.2 376.2 560.8 366.9L513.8 319.9L560.8 272.9C570.2 263.5 570.2 248.3 560.8 239C551.4 229.7 536.2 229.6 526.9 239L479.9 286L432.9 239C423.5 229.6 408.3 229.6 399 239z'/></svg>";
  } else if (volumeSlider.value < 0.5) {
    muteIcon.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640'><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d='M144 416L192 416L326.1 535.2C332.5 540.9 340.7 544 349.2 544C368.4 544 384 528.4 384 509.2L384 130.8C384 111.6 368.4 96 349.2 96C340.7 96 332.5 99.1 326.1 104.8L192 224L144 224C117.5 224 96 245.5 96 272L96 368C96 394.5 117.5 416 144 416zM476.6 245.5C466.3 237.1 451.2 238.7 442.8 249C434.4 259.3 436 274.4 446.3 282.8C457.1 291.6 464 305 464 320C464 335 457.1 348.4 446.3 357.3C436 365.7 434.5 380.8 442.8 391.1C451.1 401.4 466.3 402.9 476.6 394.6C498.1 376.9 512 350.1 512 320C512 289.9 498.1 263.1 476.5 245.5z'/></svg>";
  } else {
    muteIcon.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640'><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d='M533.6 96.5C523.3 88.1 508.2 89.7 499.8 100C491.4 110.3 493 125.4 503.3 133.8C557.5 177.8 592 244.8 592 320C592 395.2 557.5 462.2 503.3 506.3C493 514.7 491.5 529.8 499.8 540.1C508.1 550.4 523.3 551.9 533.6 543.6C598.5 490.7 640 410.2 640 320C640 229.8 598.5 149.2 533.6 96.5zM473.1 171C462.8 162.6 447.7 164.2 439.3 174.5C430.9 184.8 432.5 199.9 442.8 208.3C475.3 234.7 496 274.9 496 320C496 365.1 475.3 405.3 442.8 431.8C432.5 440.2 431 455.3 439.3 465.6C447.6 475.9 462.8 477.4 473.1 469.1C516.3 433.9 544 380.2 544 320.1C544 260 516.3 206.3 473.1 171.1zM412.6 245.5C402.3 237.1 387.2 238.7 378.8 249C370.4 259.3 372 274.4 382.3 282.8C393.1 291.6 400 305 400 320C400 335 393.1 348.4 382.3 357.3C372 365.7 370.5 380.8 378.8 391.1C387.1 401.4 402.3 402.9 412.6 394.6C434.1 376.9 448 350.1 448 320C448 289.9 434.1 263.1 412.6 245.5zM80 416L128 416L262.1 535.2C268.5 540.9 276.7 544 285.2 544C304.4 544 320 528.4 320 509.2L320 130.8C320 111.6 304.4 96 285.2 96C276.7 96 268.5 99.1 262.1 104.8L128 224L80 224C53.5 224 32 245.5 32 272L32 368C32 394.5 53.5 416 80 416z'/></svg>";
  }
}

// on load
alarmSound.pause();
loadSettings();
updateDisplay();
