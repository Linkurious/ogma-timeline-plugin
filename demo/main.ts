import "./style.css";
import Ogma from "@linkurious/ogma";
import moment from "moment/min/moment-with-locales";
import { Controller, vis, click } from "../src";

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

ogma.generate
  .random({nodes: 200, edges: 200})
  .then((graph) => {
    graph.nodes.forEach((node, i) => {
      // add a random date to the node
      const start = Date.now() - Math.floor(Math.random() * range);
      // randomly add a lifespan to the node
      const end =
        i % 2
          ? start + 3000000 + Math.floor((Math.random() * range) / 10)
          : undefined;

      const type = i % 2 ? "car" : "bike";
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
  .then(() => ogma.layouts.force({ locate: true }))
  .then(() => {
    console.log(ogma.getNodes().size);
    const container = document.getElementById("timeline") as HTMLDivElement;
    const controller = new Controller(ogma, container, {
      timeBars: [new Date(0), new Date(Date.now())],
      filter: {
        enabled: true,
        strategy: "between",
        tolerance: "loose",
      },
      barchart: {
        graph2dOptions: {
          legend: { left: { position: "bottom-left" } },
          moment: function (date) {
            return moment(date).utcOffset("+08:00").locale("ru");
          },
          style: "line",
          // locale: "fr",
        },
        groupIdFunction: (nodeId) => ogma.getNode(nodeId)?.getData("type"),
      },
      timeline: {
        // groupIdFunction: (nodeId) => ogma.getNode(nodeId)?.getData("type"),
        timelineOptions: {
          moment: function (date) {
            return moment(date).utcOffset("+08:00").locale("ru");
          },
          // locale: "fr",
        },
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
    controller.refresh(ogma.getNodes());
    controller.barchart.chart.setWindow(new Date(0), new Date(Date.now()));
  });
