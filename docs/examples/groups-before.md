```ts
const ogma = new Ogma({
  container: "ogma",
  graph: {
    nodes: [
      {
        id: 1,
        data: { type: "car", start: new Date("1 1 1971") },
      },
      {
        id: 2,
        data: { type: "car", start: new Date("1 1 1991") },
      },
      {
        id: 3,
        data: { type: "car", start: new Date("1 1 1992") },
      },
      {
        id: 4,
        data: {
          type: "person",
          start: new Date("1 1 1970"),
        },
      },
      {
        id: 5,
        data: {
          type: "person",
          start: new Date("1 1 1990"),
        },
      },
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
  start: new Date("1 1 1930"),
  end: new Date("1 1 2050"),
});
```