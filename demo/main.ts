import "./style.css";
import Ogma from "@linkurious/ogma";
import { Controller } from "../src";
import { click, day } from "../src/constants";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Demo timeline plugin</h1>
    <div id="graph-container"></div>
    <div id="timeline"></div>
  </div>
`;

const ogma = new Ogma({
  container: "graph-container",
});
ogma.styles.addNodeRule({
  innerStroke: {
    color: "#555",
    scalingMethod: "fixed",
    width: 1,
  },
});
const range = Date.now() - +new Date("August 19, 1975 23:15:30");

// const types = ['in', 'in', 'out', 'in', 'in'];
// const types = ['in', 'out', 'out', 'out', 'in'];
// const types = ['out', 'in', 'in', 'in', 'out'];
// const types = ['out', 'out', 'in', 'out', 'out'];
const types = ["in", "in", "in", "out", "out"];

const length = 2 * day;

ogma.generate
  .random({ nodes: 5, edges: 0 })
  .then((graph) => {
    graph.nodes.forEach((node, i) => {
      // add a random date to the node
      // const start = Date.now() - Math.floor(Math.random() * range);
      // randomly add a lifespan to the node
      // const end =
      //   i % 2 ? start + 3000000 + Math.floor((Math.random() * range) / 10) : undefined;

      const start = Date.now() - i * length;
      const end = start + length;

      const type = types[i];
      node.data = { start, end, type };
    });
    return ogma.setGraph(
      {
        nodes: graph.nodes,
        edges: graph.edges,
      },
      { ignoreInvalid: true }
    );
  })
  .then(() => ogma.view.setCenter({ x: 1000, y: 1000 }))
  .then(() => {
    const container = document.getElementById("timeline") as HTMLDivElement;
    const controller = new Controller(ogma, container, {
      timeBars: [
        // new Date(Date.now()-1.2*day),
        // new Date(Date.now() - 4.8 * day),
        new Date(Date.now() - ((1.2 + 4.8) / 2) * day),
      ],
      filter: {
        enabled: true,
        strategy: "after",
        tolerance: "loose",
      },
      barchart: {
        graph2dOptions: {
          legend: { left: { position: "bottom-left" } },
          barChart: { sideBySide: true },
          style: "line",
        },
        groupIdFunction: (nodeId) => ogma.getNode(nodeId)?.getData("type"),
      },
      timeline: {
        groupIdFunction: (nodeId) => ogma.getNode(nodeId)?.getData("type"),
        timelineOptions: {},
      },
    });

    let isBarchartClick = false;
    controller.barchart.on(click, ({ nodeIds, evt }) => {
      isBarchartClick = true;
      ogma.getSelectedNodes().setSelected(false);
      ogma.getNodes(nodeIds).setSelected(true);
      controller.barchart.highlightNodes(nodeIds);
      isBarchartClick = false;
    });
    ogma.events.on(["nodesSelected", "nodesUnselected"], (evt) => {
      if (isBarchartClick) return;
      controller.barchart.highlightNodes(ogma.getSelectedNodes().getId());
      controller.timeline.highlightNodes(ogma.getSelectedNodes().getId());
    });
    controller.timeline.on(click, ({ nodeIds }) => {
      isBarchartClick = true;
      ogma.getSelectedNodes().setSelected(false);
      ogma.getNodes(nodeIds).setSelected(true);
      controller.barchart.highlightNodes(nodeIds);
      isBarchartClick = false;
    });
    const filter = ogma.transformations.addNodeFilter({
      criteria: (node) => {
        return controller.filteredNodes.has(node.getId());
      },
    });

    controller.on("timechange", () => {
      filter.refresh();
    });
    window.controller = controller;
    controller.refresh(ogma.getNodes());
    // controller.showBarchart();
    controller.barchart.chart.setWindow(
      new Date(Date.now() - 16 * day),
      new Date(Date.now() + 4 * day)
    );
  });
