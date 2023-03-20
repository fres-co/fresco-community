const defaultURLList = "https://d2nour97nrwdwq.cloudfront.net/public/i9xkghj4pmiggfsbn1eli.png|https://d2nour97nrwdwq.cloudfront.net/public/bxcxpojzwsh__romvtlhz.png|https://d2nour97nrwdwq.cloudfront.net/public/6ttoc6m1not7lz6tm0ft9.png|https://d2nour97nrwdwq.cloudfront.net/public/jbjwdatysuugwnx9cflsi.png|https://d2nour97nrwdwq.cloudfront.net/public/5zu03tvtyxqcxtogej35t.png|https://d2nour97nrwdwq.cloudfront.net/public/eiultsyvgkyqn0w2sufuy.png";

const cardElement = document.getElementById("card-like");

const getURLs = () => {
  const urls = (
    !fresco.element ? defaultURLList : fresco.element.state.imageURLList
  ).split("|");

  return urls
}


function showCard(state) {
  document.body.style.setProperty(
    "--url",
    `url(${ state.url })`
  );
}

document.body.addEventListener("click", () => {

  const urls = getURLs()
  if(fresco.element.state.random) {
    const next = Math.floor(Math.random() * urls.length);
    fresco.setState({ urlIndex: next, url: urls[next] });
  } else {
    const next = (fresco.element.state.urlIndex + 1) % urls.length;
    fresco.setState({ urlIndex: next, url: urls[next] });
  }
});


fresco.onReady(function () {
  fresco.onStateChanged(function () {
    showCard(fresco.element.state)
  });

  const defaultState = {
    url: null,
    urlIndex:0,
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
