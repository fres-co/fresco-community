import React from "react";
import ReactDOM from "react-dom";
import "./style.css";
import App from "./App";
import { Provider } from "react-redux";
import { createStore } from "./store";

const store = createStore();
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
