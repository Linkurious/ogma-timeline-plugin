# Selecting

The plugin provides an easy way to synhronize selection between Ogma and the timeline:
  - it triggers an even when user clicks on a timeline element
  - it provides a `setSelection` method to select elements wihin the timeline

```js
let isSelecting = false;
controller.on("select", ({ nodes, edges }) => {
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
    controller.setSelection({
      nodes: ogma.getSelectedNodes(),
      edges: ogma.getSelectedEdges(),
    });
  }
);
```

## Result
![Result](/selection.mp4)

