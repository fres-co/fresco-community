// fake sdk, used for local development
window.addEventListener("load", (event) => {
  console.log("load");
  window.fresco._listeners.forEach((listener) => listener());

  fresco.onReady = (cb) => {
    cb();
  };
});

let onStateChangedHandler;

window.fresco.onStateChanged = (callback) => {
  onStateChangedHandler = callback;
};

const realtimeData = JSON.parse(localStorage.getItem("local-realtime")) || {};
function update() {
  localStorage.setItem("local-realtime", JSON.stringify(realtimeData));
  setTimeout(() => {
    onStateChangedHandler && onStateChangedHandler();
  }, 0);
}

let globalHandlers = {};
window.fresco.initialize = (state, config) => {
  window.fresco.element = {
    state,
  };
  window.fresco.localParticipant = {
    id: "local-participant",
    name: "Local Participant",
    permission: {
      canEdit: true,
    },
  };
  window.fresco.isMockSdk = true;
  window.fresco.remoteParticipants = [];
  window.fresco.triggerEvent = () => {};
  window.fresco.subscribeToGlobalEvent = (eventName, handler) => {
    if (!globalHandlers[eventName]) {
      globalHandlers[eventName] = [handler];
    } else {
      globalHandlers[eventName].push(handler);
    }

    return () => {
      globalHandlers[eventName] = globalHandlers[eventName].filter(
        (h) => h !== handler
      );
      if (globalHandlers[eventName].length === 0) {
        delete globalHandlers[eventName];
      }
    };
  };
  update();
};

window.fresco.storage = {
  realtime: {
    set: (tableName, key, value) => {
      if (!key || !tableName) {
        return;
      }

      if (!realtimeData[tableName]) {
        realtimeData[tableName] = {};
      }

      realtimeData[tableName][key] = value;
      update();
    },
    get: (tableName, key) => {
      return realtimeData[tableName] && realtimeData[tableName][key];
    },
    all: (tableName) => realtimeData[tableName] ?? {},
    clear: (tableName) => {
      realtimeData[tableName] = {};
      update();
    },
    data: realtimeData,
  },
};
