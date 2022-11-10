const main = document.getElementById("main");
let formDuration = 10;
let value = [10, 00];
let btnStart = "block";

function getCurrentTimerValue(milliseconds) {
  if (milliseconds == undefined) {
    return value;
  }

  if (milliseconds < 0) {
    milliseconds = 0;
  }
  const seconds = milliseconds / 1000;
  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60);
  return [m, s];
}

function ifAdmin(element) {
  if (fresco.localParticipant.permission.canEdit) {
    return element;
  }
  return "";
}

function ifUser(element) {
  if (!fresco.localParticipant.permission.canEdit) {
    return element;
  }
  return "";
}

function renderIf(condition, element) {
  if (condition) {
    return element;
  }
  return "";
}
function render(timer) {
  const [minutes, seconds] = getCurrentTimerValue(timer);

  const admin = fresco.localParticipant.permission?.canEdit;
  const user = !admin;

  main.innerHTML = `
      <div>
      <form id="form" onchange="valueForm(event)" >
        <div class="inputs-group">
        <input ${renderIf(
          fresco.element.state.timer !== "initial" || !admin,
          "disabled"
        )} type="number" id="minutes" min="0" max="59" onkeydown="javascript: return ['Backspace','Delete','ArrowLeft','ArrowRight'].includes(event.code) ? true : !isNaN(Number(event.key)) && event.code!=='Space'" value="${minutes}"/>
        <p class="time-label time-label-min">min</p>
        <input ${renderIf(
          fresco.element.state.timer !== "initial" || !admin,
          "disabled"
        )} type="number" id="seconds" min="00" max="59" onkeydown="javascript: return ['Backspace','Delete','ArrowLeft','ArrowRight'].includes(event.code) ? true : !isNaN(Number(event.key)) && event.code!=='Space'" value="${seconds}"/>
        <p class="time-label time-label-sec">sec</p>
        </div>
      <div class="buttons-group">
        ${renderIf(
          admin,
          `
          ${
            fresco.element.state.timer === "initial" ||
            fresco.element.state.timer === "pause"
              ? `<button type="button" class="button--start"  onclick="toggleTimer()"
                ${renderIf(minutes === 0 && seconds === 0, "disabled")}
              >Start</button>`
              : ""
          }

          ${
            fresco.element.state.timer === "run"
              ? `<button type="button" class="button--pause" onclick="pauseTimer()">Pause</button>`
              : ""
          }

        ${
          fresco.element.state.timer === "pause"
            ? ` <button type="button" class="button--reset" onclick="resetTimer()">Reset</button>`
            : ""
        }`
        )}


        ${renderIf(
          user && fresco.element.state.timer === "pause",
          `<button type="button" class="button--user_pause" disabled>Paused</button>`
        )}

        </div>
        </form>
      </div>
    `;
}

function valueForm(e) {
  const form = e.target.closest("form");
  const minutes = parseFloat(form.elements["minutes"].value || 0);
  const seconds = parseFloat(form.elements["seconds"].value || 0) / 60;
  formDuration = minutes + seconds;

  fresco.setState({
    duration: formDuration,
    startedAt: "initial",
    setValue: formDuration,
  });
}

let interval = null;
let targetTime = null;

function stopTimer() {
  render(fresco.element.state.duration * 60 * 1000);
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
  resetValue(fresco.element.state.setValue);
  fresco.setState({
    duration: fresco.element.state.setValue,
    startedAt: null,
    timer: "initial",
  });
}

function resetValue(e) {
  let milliseconds = e * 60 * 1000;
  const seconds = milliseconds / 1000;
  value[0] = Math.floor(seconds / 60);
  value[1] = Math.floor(seconds % 60);
}

function startTimer(targetTime, now) {
  render(targetTime - 1 - now);
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => {
    const timeRemaining = targetTime - new Date().getTime();
    render(timeRemaining);
    if (timeRemaining <= 0) {
      const tingsha = new Audio("tingsha.mp3");
      tingsha.play();
      fresco.setState({
        duration: fresco.element.state.setValue,
        startedAt: null,
        timer: "initial",
      });
      clearInterval(interval);
      interval = null;
      resetValue(fresco.element.state.setValue);
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
  resetValue(duration ? parseFloat(duration, 2) : 10);
  formDuration = duration;

  const defaultState = {
    duration: duration ? parseFloat(duration, 2) : 10,
    startedAt: null,
    timer: "initial",
    setValue: duration ? parseFloat(duration, 2) : 10,
  };

  const elementConfig = {
    title: "Timer",
    toolbarButtons: [],
  };

  fresco.onStateChanged(function () {
    resetValue(fresco.element.state.setValue);
    if (fresco.element.state.startedAt === "initial") {
      render();
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
});
