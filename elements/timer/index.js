const main = document.getElementById("main");
let formDuration = 10;
let value = [10, 00];

function render(timer) {
  if (fresco.element.state.timer === "initial") {
    main.innerHTML = `
      <div>
      <form id="form" onkeyup="valueForm(this)">
        <input type="number" id="minutes" min="0" max="59" value="${value[0]}"/>
        <input type="number" id="seconds" min="0" max="59" value="${value[1]}"/>
        <button id="start" type="submit" onclick="toggleTimer()">Start</button>
      </form>
      </div>
    `;
  } else if (fresco.element.state.timer === "run") {
    main.innerHTML = `
      <div>
      <p>${timer}</p>
      <button id="pause" onclick="pauseTimer()">Pause</button>
      </div>
    `;
  } else if (fresco.element.state.timer === "pause") {
    main.innerHTML = `
      <div>
      <p>${timer}</p>
      <button id="start" onclick="toggleTimer()">Start</button>
      <button id="pause" onclick="resetTimer()">Reset</button>
      </div>
    `;
  }
}

function valueForm(e) {
  const minutes = parseFloat(e[0].value);
  const seconds = parseFloat(e[1].value) / 60;
  formDuration = minutes + seconds;
  fresco.setState({ duration: formDuration, startedAt: "initial" });
}

function toTime(milliseconds) {
  if (milliseconds < 0) {
    milliseconds = 0;
  }
  const seconds = milliseconds / 1000;
  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60);
  return (
    (m < 10 ? "0" : "") +
    m.toString() +
    ":" +
    (s < 10 ? "0" : "") +
    s.toString()
  );
}

let interval = null;
let targetTime = null;

function stopTimer() {
  render(toTime(fresco.element.state.duration * 60 * 1000));
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

function pauseTimer() {
  clearInterval(interval);
  const timePause = targetTime;
  targetTime = (timePause - new Date().getTime()) / 60 / 1000;
  fresco.setState({ duration: targetTime, startedAt: null, timer: "pause" });
}

function resetTimer() {
  clearInterval(interval);
  interval = null;
  resetValue(formDuration);
  fresco.setState({ duration: 10, startedAt: null, timer: "initial" });
}

function resetValue(e) {
  let milliseconds = e * 60 * 1000;
  const seconds = milliseconds / 1000;
  value[0] = Math.floor(seconds / 60);
  value[1] = Math.floor(seconds % 60);
}

function startTimer(targetTime, now) {
  render(toTime(targetTime - 1 - now));
  interval = setInterval(() => {
    const timeRemaining = targetTime - new Date().getTime();
    render(toTime(timeRemaining));
    if (timeRemaining <= 0) {
      const tingsha = new Audio("tingsha.mp3");
      tingsha.play();
      clearInterval(interval);
      interval = null;
    }
  }, 1000);
}

function toggleTimer() {
  if (interval) {
    // We want to stop the timer
    stopTimer();
    fresco.setState({ startedAt: null });
    return;
  }

  const now = new Date().getTime();
  targetTime = now + fresco.element.state.duration * 60 * 1000;
  fresco.setState({ startedAt: now, timer: "run" });
  startTimer(targetTime, now);
}

fresco.onReady(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const duration = urlParams.get("duration");

  const defaultState = {
    duration: duration ? parseFloat(duration, 2) : 5,
    startedAt: null,
    timer: "initial",
  };

  const elementConfig = {
    title: "Timer",
    toolbarButtons: [],
  };

  fresco.onStateChanged(function () {
    if (fresco.element.state.startedAt === "initial") {
    } else if (!fresco.element.state.startedAt) {
      stopTimer();
    } else {
      stopTimer();
      targetTime =
        fresco.element.state.startedAt +
        fresco.element.state.duration * 60 * 1000;
      startTimer(targetTime, new Date().getTime());
    }

    if (!fresco.localParticipant.permission.canEdit) {
      main.setAttribute("class", "user");
    } else {
      main.setAttribute("class", "admin");
    }
  });
  
  fresco.initialize(defaultState, elementConfig);
  render();
});
