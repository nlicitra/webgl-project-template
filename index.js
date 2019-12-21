import { init } from "./js/bootstrap.js";

const { setThreshold, setVideoSelection } = init();

window.setThreshold = (color, val) => {
  setThreshold(color, val);
  document.getElementById(`${color}-threshold`).innerHTML = val;
};

window.setVideoSelection = name => {
  setVideoSelection(name);
};

setVideoSelection("sea");

window.setThreshold("red", 0.1);
window.setThreshold("green", 0.1);
window.setThreshold("blue", 0.1);
// window.setThreshold("alpha", 0.1);
