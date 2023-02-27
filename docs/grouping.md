# Grouping

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
const timelinePlugin = new TimelinePlugin(ogma, container, {
  barchart: {
    groupIdFunction: (nodeId) => ogma.getNode(nodeId).getData('type')
  },
  timeline: {
    groupIdFunction: (nodeId) => ogma.getNode(nodeId).getData('type')
  }
});
```

Items within a group will have a class corresponding to the `groupId` return by `groupIdFunction`. You can use it to style your items. See  [styling](/styling)