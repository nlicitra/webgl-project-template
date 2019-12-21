import { init } from "./js/bootstrap.js";

const setThreshold = init();

function updateThreshold(val) {
  setThreshold(val);
}

window.updateThreshold = updateThreshold;
