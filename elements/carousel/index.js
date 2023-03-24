const defaultURLList = "https://d2nour97nrwdwq.cloudfront.net/public/2x3vg1tlbhfpvkqanhcca.png|https://d2nour97nrwdwq.cloudfront.net/public/6jeakjai2vxrp9dw3g1xq.png|https://d2nour97nrwdwq.cloudfront.net/public/s_xkgafrbz_b2dkz72-bt.png|https://d2nour97nrwdwq.cloudfront.net/public/teejy2zeb6wsubfc-dhva.png|https://d2nour97nrwdwq.cloudfront.net/public/-tn-ydz2ekae3nl2rbpsv.png|https://d2nour97nrwdwq.cloudfront.net/public/jzd8v-52zrzadudc53gus.png";

const cardElement = document.getElementById("card-like");

const getURLs = () => {
  const urls = (
    !fresco.element ? defaultURLList : fresco.element.state.imageURLList
  ).split("|");

  return urls;
}


function showCard(state) {
  document.body.style.setProperty(
    "--url",
    `url(${state.url})`
  );
}

document.body.addEventListener("click", () => {

  const urls = getURLs();
  if (fresco.element.state.random) {
    const next = Math.floor(Math.random() * urls.length);
    fresco.setState({ urlIndex: next, url: urls[next] });
  } else {
    const next = (fresco.element.state.urlIndex + 1) % urls.length;
    fresco.setState({ urlIndex: next, url: urls[next] });
  }
});


fresco.onReady(function () {
  fresco.onStateChanged(function () {
    showCard(fresco.element.state);
  });

  const defaultState = {
    url: 'https://d2nour97nrwdwq.cloudfront.net/public/2x3vg1tlbhfpvkqanhcca.png',
    urlIndex: 0,
    random: false,
    imageURLList: defaultURLList,
  };

  fresco.initialize(defaultState, {
    title: "List of image",
    toolbarButtons: [
      {
        title: "Random order",
        ui: { type: "checkbox" },
        property: "random",
      },
      {
        title: "Image url list (separated with |)",
        ui: { type: "string" },
        property: "imageURLList",
      },
    ],
  });
});
