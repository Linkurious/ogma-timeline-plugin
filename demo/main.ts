import "./style.css";
import Ogma from "@linkurious/ogma";
import { Controller as TimelinePlugin, day } from "../src";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <div id="ogma"></div>
    <div id="timeline"></div>
`;
const nodesN = 30;
const edgesN = 30;
const ogma = new Ogma({
  container: "ogma",
  graph: {
    nodes: new Array(nodesN).fill(0).map((_, i) => ({
      id: i + 1,
      data: {
        start: Date.now() - Math.floor(1 + 100 * Math.random()) * day,
        // end: Date.now() + Math.floor(1 + 100 * Math.random()) * day,
        type: i % 2 === 0 ? "car" : "truck",
      },
    })),
    edges: new Array(edgesN).fill(0).map((_, i) => ({
      // id: i + 1,
      source: ((i + 1) % (nodesN - 1)) + 1,
      target: 1,
      data: {
        start: Date.now() - Math.floor(1 + 100 * Math.random()) * day,
      },
    })),
  },
});

ogma.styles.addRule({
  nodeAttributes: {
    color: (node) => (node.getData("type") === "car" ? "#ff9914" : "#60f779"),
  },
  edgeAttributes: {
    color: "#9914ff",
  },
});
ogma.styles.setSelectedNodeAttributes({
  color: (node) => (node.getData("type") === "car" ? "#e9bd84" : "#78d88e"),
  outerStroke: {
    color: (node) => (node.getData("type") === "car" ? "#e9bd84" : "#78d88e"),
  },
});

ogma.styles.setHoveredNodeAttributes({
  color: (node) => (node.getData("type") === "car" ? "#ff9914" : "#60f779"),
  outerStroke: {
    color: (node) => (node.getData("type") === "car" ? "#ff9914" : "#60f779"),
  },
});

ogma.layouts.force({
  locate: { padding: 100 },
});
const timelinePlugin = new TimelinePlugin(
  ogma,
  document.getElementById("timeline"),
  {
    barchart: {
      nodeGroupIdFunction: (node) => node.getData("type"),
      graph2dOptions: {
        legend: true,
        // style: "line",
      },
    },
    timeBars: [
      // place the bars at now and 01/01/70 to start
      new Date(Date.now()),
      new Date(0),
    ],
    //configure filtering
    nodeFilter: {
      enabled: true,
      strategy: "between",
      tolerance: "loose",
    },
    edgeFilter: {
      enabled: true,
      strategy: "between",
      tolerance: "loose",
    },
  }
);

//create filters
const nodeFilter = ogma.transformations.addNodeFilter({
  criteria: (node) => {
    return timelinePlugin.filteredNodes.has(node.getId());
  },
  enabled: false,
});
const edgeFilter = ogma.transformations.addEdgeFilter({
  criteria: (edge) => {
    return timelinePlugin.filteredEdges.has(edge.getId());
  },
});

//Hook it to the timeline events
timelinePlugin.on("timechange", () => {
  nodeFilter.refresh();
  edgeFilter.refresh();
});

let isSelecting = false;
timelinePlugin.on("select", ({ nodes, edges }) => {
  isSelecting = true;
  ogma.getNodes().setSelected(false);
  ogma.getEdges().setSelected(false);

  if (nodes) {
    nodes.setSelected(true);
  }
  if (edges) {
    edges.setSelected(true);
  }
  isSelecting = false;
});
ogma.events.on(
  ["nodesSelected", "edgesSelected", "nodesUnselected", "edgesUnselected"],
  () => {
    if (isSelecting) return;
    timelinePlugin.setSelection({
      nodes: ogma.getSelectedNodes(),
      edges: ogma.getSelectedEdges(),
    });
  }
);
