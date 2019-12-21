import { init } from "./js/bootstrap.js";

const setThreshold = init();

window.setThreshold = (color, val) => {
  setThreshold(color, val);
  document.getElementById(`${color}-threshold`).innerHTML = val;
};

window.setThreshold("red", 0.1);
window.setThreshold("green", 0.1);
window.setThreshold("blue", 0.1);
