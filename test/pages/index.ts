import Ogma from "@linkurious/ogma";
import { Controller } from "../../src/controller";

function afterBarchartRedraw() {
  return new Promise((resolve) => {
    window["controller"].barchart.once("redraw", () => {
      resolve(window["controller"]);
    });
  });
}
function afterTimelineRedraw() {
  return new Promise((resolve) => {
    window["controller"].timeline.once("redraw", () => {
      resolve(window["controller"]);
    });
  });
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });
}

function createOgma(options) {
  const ogma = new Ogma({
    container: "ogma",
    ...options,
  });
  window["ogma"] = ogma;
  return ogma;
}
function createController(options) {
  const controller = new Controller(
    window["ogma"],
    document.getElementById("timeline") as HTMLDivElement,
    options,
  );
  window["controller"] = controller;
  return controller;
}
function cleanup() {
  if (window["controller"]) window["controller"].destroy();
  if (window["ogma"]) window["ogma"].destroy();
}
window["Ogma"] = Ogma;
window["controller"] = Controller;
// @ts-expect-error
window["wait"] = wait;
window["createOgma"] = createOgma;
window["createController"] = createController;
// @ts-expect-error
window["afterBarchartRedraw"] = afterBarchartRedraw;
// @ts-expect-error
window["afterTimelineRedraw"] = afterTimelineRedraw;
window["cleanup"] = cleanup;
