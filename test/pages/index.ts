import Ogma from "@linkurious/ogma";
import { Controller } from "../../src/controller";

function afterBarchartRedraw(controller: Controller) {
  return new Promise((resolve) => {
    controller.barchart.chart.on("changed", () => {
      resolve(controller);
    });
  });
}
function afterTimelineRedraw(controller: Controller) {
  return new Promise((resolve) => {
    controller.timeline.chart.on("changed", () => {
      resolve(controller);
    });
  });
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
window.Ogma = Ogma;
window.Controller = Controller;
window.wait = wait;
window.afterBarchartRedraw = afterBarchartRedraw;
window.afterTimelineRedraw = afterTimelineRedraw;
