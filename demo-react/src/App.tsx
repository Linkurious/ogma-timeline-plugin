import Ogma from "@linkurious/ogma";
import { graph } from "./createGraph";
import { Ogma as Vis } from "@linkurious/ogma-react";
import Timeline from "./Timeline";
function App() {
  const onReady = (ogma: Ogma) => {
    ogma.setGraph(graph);
    ogma.layouts.force({ locate: true });
    ogma.styles.addRule({
      nodeAttributes: {
        color: (node) =>
          node.getData("type") === "car" ? "#ff9914" : "#60f779",
      },
      edgeAttributes: {
        color: "#9914ff",
      },
    });
    ogma.styles.setSelectedNodeAttributes({
      color: (node) => (node.getData("type") === "car" ? "#e9bd84" : "#78d88e"),
      outerStroke: {
        color: (node) =>
          node.getData("type") === "car" ? "#e9bd84" : "#78d88e",
      },
    });

    ogma.styles.setHoveredNodeAttributes({
      color: (node) => (node.getData("type") === "car" ? "#ff9914" : "#60f779"),
      outerStroke: {
        color: (node) =>
          node.getData("type") === "car" ? "#ff9914" : "#60f779",
      },
    });
  };

  return (
    <>
      <Vis onReady={onReady}>
        <Timeline></Timeline>
      </Vis>
      <div id="timeline-teleport"></div>
    </>
  );
}

export default App;
