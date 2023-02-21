import './style.css';
import Ogma from '@linkurious/ogma';
import { Controller } from '../src';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Demo timeline plugin</h1>
    <div id="graph-container"></div>
    <div id="timeline"></div>

  </div>
`;

const ogma = new Ogma({
  container: 'graph-container'
});
ogma.styles.addNodeRule({
  innerStroke: {
    color: '#555',
    scalingMethod: 'fixed',
    width: 1
  }
});
const range = Date.now() - +new Date('August 19, 1975 23:15:30');

ogma.generate
  .random({ nodes: 20, edges: 20 })
  .then((graph) => {
    graph.nodes.forEach((node, i) => {
      // add a random date to the node
      const start = Date.now() - Math.floor(Math.random() * range);
      // randomly add a lifespan to the node
      const end =
        i % 2 ? start + 3000000 + (Math.random() * range) / 10 : undefined;
      node.data = { start, end };
    });
    return ogma.setGraph(
      {
        nodes: graph.nodes,
        edges: graph.edges
      },
      { ignoreInvalid: true }
    );
  })
  .then(() => {
    const container = document.getElementById('timeline') as HTMLDivElement;
    const controller = new Controller(ogma, container);
    controller.refresh(ogma.getNodes());
    controller.showBarchart();
    controller.barchart.chart.setWindow(new Date(0), Date.now())
  });
