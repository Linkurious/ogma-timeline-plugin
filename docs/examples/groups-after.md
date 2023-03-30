const ogma = new Ogma({
  container: "ogma",
  graph: {
    nodes: [
      ...new Array(8).fill(0).map((_, id) => ({
        id,
        data: { type: "car", start: new Date(`1 1 ${1950 + id}`) },
      })),
      ...new Array(8).fill(0).map((_, id) => ({
        id: 8 + id,
        data: { type: "person", start: new Date(`1 6 ${1950 + id}`) },
      })),
    ],
    edges: [],
  },
});
ogma.styles.addNodeRule((node) => node.getData("type") === "car", {
  color: "#f80",
  text: {
    content: (node) => `car ${node?.getId()}`,
    size: 20,
  },
});
ogma.styles.addNodeRule((node) => node.getData("type") === "person", {
  color: "#08f",
  text: {
    content: (node) => `person ${node?.getId()}`,
    size: 20,
  },
});

ogma.layouts.force({
  locate: { padding: 200 },
});

const controller = new Controller(ogma, document.getElementById("timeline"), {
  filter: {
    enabled: true,
    strategy: "outisde",
    tolerance: "strict",
  },
  timeline: {
    groupIdFunction: (nodeId) => (ogma.getNode(nodeId) as Node).getData("type"),
    itemGenerator: (nodeId) => {
      const node = ogma.getNode(nodeId) as Node;
      return { content: `${node?.getData("type")} ${node.getId()}` };
    },
  },
  barchart: {
    groupIdFunction: (nodeId) => (ogma.getNode(nodeId) as Node).getData("type"),
    graph2dOptions: {
      legend: true,
    },
  },
  start: new Date("1 1 1949"),
  end: new Date("1 1 1958"),
});
