# Timebars

We provide `timebars`, which the user can drag to filter in/out nodes. Please checkout the [Getting started](#filter-nodes-depending-on-time) section to see how to hook ogma filter to the timeline.


![](/filter-between.mp4)


Let's see how to bring some colors into this. 
## Barchart styling

The simplest way to style barchart is to set `fill` and `stroke` properties in CSS: 

```css
.bar-item{
  stroke: #ff9914;
  fill: #ff9914;
}
```

If you specified a `groupIdFunction`, then your groups will have the same class as the id returned by your groupIdFunction.
Let's say groupIdFunction returns either `car` either `person`, then you can style `car` and `person` bars like this

```css
.bar-item.car{
  stroke: #ff9914;
  fill: #ff9914;
}
.bar-item.person{
  stroke: #08f;
  fill: #08f;
}
```


![](/style-barchart.png)


To go further into barchart customization, you can pass [options](https://visjs.github.io/vis-timeline/docs/graph2d/#Configuration_Options) within the controller: 

```ts
const timelinePlugin = new TimelinePlugin(ogma, container, {
  barchart: {
    graph2dOptions: {
      barChart:{ sideBySide: true},
      // here pass more options if you like
    },
    groupIdFunction: (nodeId) => ogma.getNode(nodeId)?.getData('type')
  }
})
```

## Linechart styling

You can get the barchart to display lines by setting the `style` key to `line`

```ts
const timelinePlugin = new TimelinePlugin(ogma, container, {
  barchart: {
    graph2dOptions: {
      style: 'line'
    },
  }
})
```

Then styling of the lines is as follows: 
```css
.vis-group{
  fill-opacity: 0;
}
.vis-group.person{
  stroke: #ff9914;
}
```

![](/style-line.png)

## Timeline styling

Timeline styling follows the same rules as the other charts, elements get classes depending on their group, and you can use it to stlye them. They also get as a class the **nodeId** of the node they represent.
You can customize the names of the items with the `itemGenerator` function.

```ts
const timelinePlugin = new TimelinePlugin(ogma, container, {
  timeline: {
    groupIdFunction: (nodeId) => ogma.getNode(nodeId)?.getData('type'),
    itemGenerator: (nodeId) => `${ogma.getNode(nodeI).getData(type)} ${nodeId}`,
    timelineOptions: {
      //here pass more options if you like
    }
  }
})
```
```css
.timeline-item.car {
  stroke: #ff9914;
  fill: #ff9914;
}
.timeline-item.car.vis-selected {
  stroke: #CCff55;
  fill: #CCff55;
}
```

![](/style-timeline.png)


To go further into customization, pass [options](https://visjs.github.io/vis-timeline/docs/timeline/#Configuration_Options) in the `timelineOptions` key.

## Legend

To get the legend on barchart, you can simply pass the `legend` key
```ts
const timelinePlugin = new TimelinePlugin(ogma, container, {
  barchart: {
    graph2dOptions: {
      legend: {left:{position:"bottom-left"}},
    },
  }
})
```

