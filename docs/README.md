# Home

Ogma-Timeline-Plugin for [Ogma](https://doc.linkurio.us/ogma/latest/).

[demo](/examples/demo)
### Getting started.

First, you need to own a valid **Ogma** licence. Reach out [Ogma sales](https://doc.linkurio.us/ogma/latest/support.html) for more details.
Let's say you start from scratch:

```bash
npm create vite@latest
cd my-ogma-app
```

#### Install Ogma and Ogma-plugin-timeline
```bash
npm i @linkurious/ogma @linkurious/ogma-plugin-timeline
```

#### Use Ogma-plugin-timeline in your App

```ts
import Ogma from "@linkurious/ogma";
import {Controller as TimelinePlugin } from "@linkurious/ogma-plugin-timeline";

const ogma = new Ogma({
  container: 'graph-container'
});
const timelineContainer = document.getElementById('timeline') as HTMLDivElement;
const timelinePlugin = new TimelinePlugin(ogma, container);
```

That's it ! You have a fully functionnal Ogma instance within your app, and a timeline showing your data.

### Get the timestamps on your nodes

By default the plugin looks for `start` and `end` keys within node data, and uses it to generate the timeline.
If you store your data within the `creation.date` and `deletion.date` keys for instance, then you can pass `startDatePath` and `endDatePath` properties to the Controller constructor: 

```ts
const timelinePlugin = new TimelinePlugin(ogma, container, {
  startDatePath: 'creation.date',
  endDatePath: 'deletion.date',
})
```
If some of your data does not have an `end` date, no worries, the plugin deals with `undefined` end dates. Though start date are **mandatory** to be displayed.

### Filter nodes depending on time

The plugin provides a simple API to filter out nodes depending on user's imput: 
 - add some timeBars to the controller
 - create an ogma [nodeFilter](https://doc.linkurious.com/ogma/latest/api.html#Ogma-transformations-addNodeFilter)
 - Link it to the timeline events

```ts
const timelinePlugin = new TimelinePlugin(ogma, container, {
  timeBars: [
    // place the bars at now and 01/01/70 to start
        new Date(Date.now()), 
        new Date(0),
      ],
  //configure filtering
  filter: {
    enabled: true,
    strategy: 'between',
    tolerance: 'loose'
  },
})

//create filter
const filter = ogma.transformations.addNodeFilter({
    criteria: node => {
      return controller.filteredNodes.has(node.getId());
    },
  })
//Hook it to the timeline events
controller.on('timechange', () => {
  filter.refresh();
})
```

You can place as many bars as you want, but please place either **one** or a **multiple of two** bars.
There are many filtering options availiable, please have a look at the [filterring](./filtering.md) section for more details.

### Grouping

Barchart automatically groups data by date, depending on zoom, but you can specify a `groupIdFunction` to make it group together nodes with different data.
Let's say you have two types of nodes: persons and cars, like this: 

```js
const nodes = [
  {
    id: 0,
    data: {
      type: 'car',
      start: 1677508918326
    }
  },
  {
    id: 1,
    data: {
      type: 'person',
      start: 1677508918326
    }
  }
];
```
You can then pass a `groupIdFunction` that will create bars for cars and bars for persons.
```ts
const controller = new Controller(ogma, container, {
  barchart: {
    groupIdFunction: (nodeId) => ogma.getNode(nodeId).getData('type')
  }
});
```


### Update the timeline on graph changes

When you create the timeline, it gets all the nodes within the vizualisation and saves their ids. 
Then the timeline will show only thoose nodes, but your graph might evolve with time, some nodes might be created/deleted. In that case, you need to hook on Ogma's events to refresh the timeline: 
  
```ts
ogma.events.on(['addNodes', 'addEdges', 'removeNodes', 'removeEdges', 'clearGraph'] ,() => {
  timeline.refresh(ogma.getNodes())
})
```

## Styling and interactions

Now that you have a working timeline, you might want to make it look neat, and to sync it with the visualisation.

### Barchart styling

The simplest way to style barchart is to set `fill` and `stroke` properties in CSS: 

```css
.vis-bar{
  stroke: #ff9914;
  fill: #ff9914;
}
```

If you specified a `groupIdFunction`, then your groups will have the same class as the id returned by your groupIdFunction.
Let's say groupIdFunction returns either `car` either `person`, then you can style `car` and `person` bars like this

```css
.vis-bar.car{
  stroke: #99ff14;
  fill: #99ff14;
}
.vis-bar.person{
  stroke: #14ff99;
  fill: #14ff99;
}
```

To go further into barchart customization, you can pass [options](https://visjs.github.io/vis-timeline/docs/graph2d/#Configuration_Options) within the controller: 

```ts
const controller = new Controller(ogma, container, {
  barchart: {
    graph2dOptions: {
      barChart:{ sideBySide: true,},
      // here pass more options if you like
    },
    groupIdFunction: (nodeId) => ogma.getNode(nodeId)?.getData('type')
  }
})
```
### Linecahrt styling

You can get the barchart to display lines by setting the `style` key to `line`

```ts
const controller = new Controller(ogma, container, {
  barchart: {
    graph2dOptions: {
      style: 'line'
    },
  }
})
```

Then styling of the lines is as follows: 
```css
.vis-graph-group{
  fill-opacity: 0;
}
.vis-graph-group.person{
  stroke: #99ff14;
}
```
### Timeline styling


### Legend

To get the legend on barchart, you can simply pass the `legend` key
```ts
const controller = new Controller(ogma, container, {
  barchart: {
    graph2dOptions: {
      legend: {left:{position:"bottom-left"}},
    },
  }
})
```

### Groups


