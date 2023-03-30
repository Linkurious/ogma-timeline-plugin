import "./style.css";
import Ogma from "@linkurious/ogma";
import moment from "moment/min/moment-with-locales";
import { Controller, vis, click } from "../src";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Demo timeline plugin</h1>
    <div id="ogma"></div>
    <div id="timeline"></div>
  </div>
`;
const ogma = new Ogma({
  container: "ogma",
  graph: {
    nodes: [
      {
        id: 1,
        data: { start: -10, end: -5 },
      },
      {
        id: 2,
        data: { start: -10, end: 10 },
      },
      {
        id: 3,
        data: { start: Date.now() / 4, end: Date.now() / 2 },
      },
      {
        id: 4,
        data: { start: Date.now() - 1000, end: Date.now() + 1000 },
      },
      {
        id: 5,
        data: { start: Date.now() + 2000, end: Date.now() + 3000 },
      },
    ],
    edges: [],
  },
});
const controller = new Controller(ogma, document.getElementById("timeline"), {
  timeBars: [new Date("1 1 1980"), new Date("1 1 2010")],
  filter: {
    enabled: true,
    strategy: "outisde",
    tolerance: "strict",
  },
});
window.controller = controller;