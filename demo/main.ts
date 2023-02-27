import './style.css';
import Ogma from '@linkurious/ogma';
import { Controller } from '../src';
import { click } from '../src/constants';

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

const types = ['person', 'car'];

ogma.generate
  .random({ nodes: 120, edges: 20 })
  .then((graph) => {
    graph.nodes.forEach((node, i) => {
      // add a random date to the node
      const start = Date.now() - Math.floor(Math.random() * range);
      // randomly add a lifespan to the node
      const end =
        i % 2 ? start + 3000000 + Math.floor((Math.random() * range) / 10) : undefined;

      const type = types[i%2];
      node.data = { start, end, type };
    });
    return ogma.setGraph(
      {
        nodes: graph.nodes,
        edges: graph.edges
      },
      { ignoreInvalid: true }
    );
  })
  .then(() => ogma.view.locateGraph())
  .then(() => {
    const container = document.getElementById('timeline') as HTMLDivElement;
    const controller = new Controller(ogma, container, {
      timeBars: [
        new Date(Date.now()),
      ],
      filter: {
        enabled: true,
        strategy: 'after',
        tolerance: 'loose'
      },
      barchart: {
        graph2dOptions: {
          legend: {left:{position:"bottom-left"}},
          barChart:{ sideBySide: true,
          
            
          },
          style: 'line',
        },
        groupIdFunction: (nodeId) => ogma.getNode(nodeId)?.getData('type')
      },
      timeline: {
        getItem: (nodeId) => {
          const group = `group${(+nodeId % 2) +1}`;
          console.log(group)
          return {
            content: `${ogma.getNode(nodeId)!.getData('start')}`,
            group
          };
        },
        getGroups: () => {return [{
          id: 'group1',
          content: 'group1',
        },{
          id: 'group2',
          content: 'group2',

        }]}
      }
    });

    let isBarchartClick = false;
    controller.barchart.on(click, ({nodeIds, evt}) => {
      isBarchartClick = true
      ogma.getSelectedNodes().setSelected(false);
      ogma.getNodes(nodeIds).setSelected(true);
      controller.barchart.highlightNodes(nodeIds);
      isBarchartClick = false 
    });
    ogma.events.on(['nodesSelected', 'nodesUnselected'], (evt)=>{
      if(isBarchartClick)return;
      controller.barchart.highlightNodes(ogma.getSelectedNodes().getId());
      controller.timeline.highlightNodes(ogma.getSelectedNodes().getId());
    })
    controller.timeline.on(click, ({ nodeIds }) => {
      isBarchartClick = true
      ogma.getSelectedNodes().setSelected(false);
      ogma.getNodes(nodeIds).setSelected(true);
      controller.barchart.highlightNodes(nodeIds);
      isBarchartClick = false 
    }); 
    const filter = ogma.transformations.addNodeFilter({
      criteria: node => {
        return controller.filteredNodes.has(node.getId());
      },
    })

    controller.on('timechange', () => {
      filter.refresh();
    })
    window.controller = controller;
    controller.refresh(ogma.getNodes());
    // controller.showBarchart();
    controller.barchart.chart.setWindow(new Date(0), Date.now())
  });
