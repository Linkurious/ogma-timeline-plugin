# API

## Options

Options described here are the options for the controller constructor. Everything you need to customize your timeline happens here.

| Name          | Description                                                                                                                                                    | Type                             | Default                                                           |
|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|-------------------------------------------------------------------|
| start         | The date from which the timeline will start. If undefined it will take the minimum date from the input nodes/edges                                             | number \| Date                   | undefined                                                         |
| end           | The date from which the timeline will end. If undefined it will take the maximum date from the input nodes/edges                                               | number \| Date                   | undefined                                                         |
| showBarchart  | Whether to show the barchart by default. Has no effect if switchOnZoom is true, as it will pick the most appropriate view depending on the number of elements. | boolean                          | false                                                             |
| switchOnZoom  | Whether the timeline should automatically switch between barchart and timeline mode during zoom in/out.                                                        | boolean                          | true                                                              |
| nodeStartPath | The path to retrieve start dates from nodes data. Use dotted notation if it is nested.                                                                         | string                           | start                                                             |
| nodeEndPath   | The path to retrieve end dates from nodes data.                                                                                                                | string                           | end                                                               |
| edgeStartPath | The path to retrieve start dates from edges data.                                                                                                              | string                           | start                                                             |
| edgeEndPath   | The path to retrieve end dates from edges data.                                                                                                                | string                           | end                                                               |
| timebars      | The "blue bars", shown on the timeline. They are used for filtering. See [Timebar](#timebar).                                                                  | [Timebar](#timebar)              | []                                                                |
| edgeFilter    | Options for edge filtering. See [FitlerOptions](#filteroptions)                                                                                                | [FitlerOptions](#filteroptions)  |  |
| nodeFilter    | Options for node filtering. See  [FitlerOptions](#filteroptions)                                                                                               | [FitlerOptions](#filteroptions)  |  |
| barchart      | Options for barchart. See [barchartOptions](#barchartoptions).                                                                                                 | [BarchartOptions](#barchartoptions)|                                                                  |
| timeline      | Options for timeline. See [timelineOptions](#timelineoptions).                                                                                                 | [TimelineOptions](#timelineoptions)|                                                                  |

### FilterOptions

| Name               | Description                                                                                                                                        | Type                             | Default                                                                                           |
|--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|---------------------------------------------------------------------------------------------------|
| enabled            | Whether the filter is enabled or not.                                                                                                              | boolean                          | true                                                                                              |
| strategy           | Which strategy to apply for filtering. See [Filtering](./Filtering) for further details. Possible values are `before`, `after`, `between`, `outside` | string                         | undefined                                                                                         |
| tolerance          | Which tolerance to apply for filtering. See  [Filtering](./Filtering)  for further details. Possible values are `strict`, `loose`                   | string                          | loose                                                                                             |

### Timebar

Timebars can be an object: `{ fixed?: boolean; date: Date }` a number or a Date. If you specify a number or a date, the timebar will not be fixed.

| Name               | Description                                                                                                                      | Type                             | Default                                                                                           |
|--------------------|----------------------------------------------------------------------------------------------------------------------------------|----------------------------------|---------------------------------------------------------------------------------------------------|
| fixed              | Whheter or not the timebar remains at the same position on screen while dragging the timeline.                                   | boolean                          | false                                                                                             |
| date               | The date of the timebar                                                                                                          | string                           | undefined                                                                                         |

### TimelineOptions
| Name                | Description                                                                                                                                                                                                                            | Type                                                                                                          | Default            |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|--------------------|
| nodeGroupIdFunction | Similar to [Ogma groups](https://doc.linkurious.com/ogma/latest/api.html#Ogma-transformations-addNodeGrouping), pass a function that takes a node as an argument and returns a string representing in which group the node belongs.    | (node: Node) => string                                                                                        | node => `nodes`    |
| nodeGroupContent    | A function that takes the groupId returned by groupIdFunction, the nodes in the group and returns the title to display for this group in the timeline.                                                                                 | (groupId: string, nodes: NodeList) => string                                                                  | groupid => groupid |
| nodeItemGenerator   | A function that takes a node and its groupid, which returns a [DataItem](https://visjs.github.io/vis-timeline/docs/timeline/#Data_Format) Object.                                                                                      | (node: Node, groupId: string) => [DataItem](https://visjs.github.io/vis-timeline/docs/timeline/#Data_Format)  |                    |
| edgeGroupIdFunction | Similar to  [Ogma groups](https://doc.linkurious.com/ogma/latest/api.html#Ogma-transformations-addNodeGrouping) , pass a function that takes an edge as an argument and returns a string representing in which group the edge belongs. | (edge: Edge) => string                                                                                        | edge => `edges`    |
| edgeGroupContent    | A function that takes the groupId returned by groupIdFunction, the nodes in the group and returns the title to display for this group in the timeline.                                                                                 | groupid => groupid                                                                                            | start              |
| edgeItemGenerator   | A function that takes an edge and its groupid, which returns a  [DataItem](https://visjs.github.io/vis-timeline/docs/timeline/#Data_Format)  Object.                                                                                   | (edge: Edge, groupId: string) =>  [DataItem](https://visjs.github.io/vis-timeline/docs/timeline/#Data_Format) |                    |
| timelineOptions     | Options to pass to vis-js timeline. See [Visjs Timeline Options](https://visjs.github.io/vis-timeline/docs/timeline/#Configuration_Options)                                                                                            | [TimelineOptions](https://visjs.github.io/vis-timeline/docs/timeline/#Configuration_Options)                  |                    |

### BarchartOptions

| Name                | Description                                                                                                                                          | Type                                                                                                           | Default            |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|--------------------|
| nodeGroupIdFunction | Same as in TimelineOptions                                                                                                                           | (nodes: Node) => string                                                                                        | node => `nodes`    |
| nodeGroupContent    | Same as in TimelineOptions                                                                                                                           | (groupId: string, nodes: NodeList) => string                                                                   | groupid => groupid |
| nodeItemGenerator   | A function that takes a nodeList and its groupid, which returns a [Graph2dItem](https://visjs.github.io/vis-timeline/docs/graph2d/#items) Object.    | (nodes: NodeList, groupId: string) => [Graph2dItem](https://visjs.github.io/vis-timeline/docs/graph2d/#items)  |                    |
| edgeGroupIdFunction | Same as in timelineOptions                                                                                                                           | (edge: Edge) => string                                                                                         | edge => `edges`    |
| edgeGroupContent    | Same as in timelineOptions                                                                                                                           | groupid => groupid                                                                                             |               |
| edgeItemGenerator   | A function that takes an edgeList and its groupid, which returns a  [Graph2dItem](https://visjs.github.io/vis-timeline/docs/graph2d/#items)  Object. | (edges: EdgeList, groupId: string) =>  [Graph2dItem](https://visjs.github.io/vis-timeline/docs/graph2d/#items) |                    |
| graph2dOptions      | Options to pass to vis-js barchart. See [Visjs Graph2d Options](https://visjs.github.io/vis-timeline/docs/graph2d/#Configuration_Options)            | [Graph2dOptions](https://visjs.github.io/vis-timeline/docs/graph2d/#Configuration_Options)                     |                    |

## Events

The timeline plugin is an event emmitter, to hook to the events it fires, just type `plugin.on(myevent, () => }{})`

| Name                | Description                                                                                                                                             | Type                                                                                                           |
|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| timechange          | Event triggered when a timebar has changed position. When user drags a timebar for instance.                                                            | void                                                                                                           |
| select              | Event triggered when selection in the barchart/timeline changes. This event contains the nodes/edges that are related to the selection in the timeline. | {nodes?: NodeList, edges?: EdgeList, evt: MouseEvent}                                                          |

## Methods

| Nameset         | Description                                                                                                                        | Arguments                              | Returns                      |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|------------------------------|
| constructor     | Creates a new timeline plugin.                                                                                                     | [Options](#options)                    | Controller                   |
| showTimeline    | Displays the timeline instead of the barchart.                                                                                     | void                                   | void                         |
| showBarchart    | Displays the barchart instead of the timeline.                                                                                     | void                                   | void                         |
| addTimeBar      | Add a timebar to the timeline.                                                                                                     | [timebarOptions](#timebar)             | void                         |
| removeTimeBar   | Remove a timebar from the timeline at index i.                                                                                     | number                                 | void                         |
| getTimebars     | Get all the timebars from the timeline.                                                                                            | groupid => groupid                     | void                         |
| setTimebars     | Set timebars for the timeline.                                                                                                     | [timebarOptions](#timebar)[]           | void                         |
| setSelection    | Set nodes and edges as selected.                                                                                                   | {nodes: NodeList, edges: EdgeList}     | void                         |
| getSelection    | Get the nodes and edges selected in the timeline                                                                                   | void                                   | {nodes: NodeList, edges: EdgeList} |
| setWindow       | Set the start and end dates of the timeline. See [setWindow](https://visjs.github.io/vis-timeline/docs/timeline/#Methods) on visjs.| start:number, end: number, options     | void                         |
| getWindow       | Get the start and end dates of the timeline.                                                                                       | string                                 | {start: number; end: number} |
| setOptions      | Set the options for the timeline.                                                                                                  | [Options](#options)                    | void                         |