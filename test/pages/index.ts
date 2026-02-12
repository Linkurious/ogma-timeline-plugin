import { Ogma, OgmaParameters } from "@linkurious/ogma";
import { Controller, Options } from "../../src";

declare global {
  interface Window {
    Ogma: typeof Ogma;
    controller: Controller;
    ogma: Ogma;
    createOgma: (options: OgmaParameters) => Ogma;
    createController: (options: Options) => Controller;
    afterBarchartRedraw: () => Promise<Controller>;
    afterTimelineRedraw: () => Promise<Controller>;
    wait: (ms: number) => Promise<void>;
    cleanup: () => void;
  }
}

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

function createOgma(options: OgmaParameters) {
  const ogma = new Ogma({
    container: "ogma",
    ...options,
  });
  window["ogma"] = ogma;
  return ogma;
}
function createController(options: Options) {
  const controller = new Controller(
    window["ogma"],
    document.getElementById("timeline") as HTMLDivElement,
    options
  );
  window["controller"] = controller;
  return controller;
}
function cleanup() {
  if (window["controller"]) window["controller"].destroy();
  if (window["ogma"]) window["ogma"].destroy();
}

Object.assign(window, {
  controller: Controller,
  Ogma,
  wait,
  createController,
  afterBarchartRedraw,
  afterTimelineRedraw,
  createOgma,
  cleanup,
});
