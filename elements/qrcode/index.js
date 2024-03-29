const canvas = document.getElementById("canvas");

function showCard(state) {
  QRCode.toCanvas(canvas, state.text, { width: Math.min(window.innerWidth, window.innerHeight) }, function (error) {
    if (error) {
      console.error(error);
    }
  });
}

fresco.onReady(function () {
  fresco.onStateChanged(function () {
    showCard(fresco.element.state);
  });

  const defaultState = {
    text: 'https://www.fres.co',
  };

  fresco.initialize(defaultState, {
    title: "QR code",
    toolbarButtons: [
      {
        title: "text or url to show",
        ui: { type: "string" },
        property: "text",
      },
    ],
  });
});


window.addEventListener('resize', () => {
  showCard(fresco.element.state);
});
