const nodesN = 100;
const edgesN = 100;
const day = 1000 * 3600 * 24;

export const graph = {
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
};
