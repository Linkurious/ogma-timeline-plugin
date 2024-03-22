import {
  Edge,
  Node,
  NodeList,
  EdgeList,
  NodeId,
  ItemList,
  EdgeId,
  ItemId,
  Item,
} from "@linkurious/ogma";
import {
  TimelineOptions as VTimelineOptions,
  DataGroup,
  Graph2d,
  Timeline,
  TimelineEventPropertiesResult,
  Graph2dOptions,
  DataItem,
  IdType,
} from "vis-timeline";
import {
  click,
  rangechanged,
  scaleChange,
  redraw,
  timechange,
  timechanged,
  rangechange,
  select,
} from "./constants";
export type FilterStrategy = "before" | "after" | "between" | "outside";
export type FilterTolerance = "strict" | "loose";

export type FilterOptions = {
  enabled: boolean;
  strategy: FilterStrategy;
  tolerance: FilterTolerance;
};
export type IdFunction<U> = (item: U) => string;
export type GroupFunction<U> = (groupId: string, items: U) => string;
export type ItemGenerator<T, U> = (elements: U, groupId: string) => Partial<T>;
export interface BaseOptions<T, U, V> {
  nodeGroupIdFunction: IdFunction<Node>;
  nodeGroupContent: GroupFunction<Node>;
  nodeItemGenerator: ItemGenerator<T, U>;
  edgeGroupIdFunction: IdFunction<Edge>;
  edgeGroupContent: GroupFunction<Edge>;
  edgeItemGenerator: ItemGenerator<T, V>;
}
/**
 * @typedef {object} BarchartOptions
 * @property {Graph2dOptions} graph2dOptions (https://visjs.github.io/vis-timeline/docs/graph2d/#graph2dOptions) to pass to the barchart
 * @property {Function} groupIdFunction Similar to [Ogma addNodeGrouping](https://doc.linkurious.com/ogma/latest/api.html#Ogma-transformations-addNodeGrouping) groupIdFunction
 * @property {Function} groupContent Generates the content of the group. See [Visjs groups](https://visjs.github.io/vis-timeline/docs/graph2d/#groups)
 */
export interface BarchartOptions
  extends BaseOptions<BarChartItem, NodeList, EdgeList> {
  graph2dOptions: Graph2dOptions;
}
export interface TimelineOptions extends BaseOptions<DataItem, Node, Edge> {
  timelineOptions: VTimelineOptions;
}

/**
 * @typedef {object} Options
 * @property {TimelineOptions} graph2dOptions (https://visjs.github.io/vis-timeline/docs/graph2d/#graph2dOptions) to pass to the barchart
 * @property {BarchartOptions} groupIdFunction Similar to [Ogma addNodeGrouping](https://doc.linkurious.com/ogma/latest/api.html#Ogma-transformations-addNodeGrouping) groupIdFunction
 * @property {Function} groupContent Generates the content of the group. See [Visjs groups](https://visjs.github.io/vis-timeline/docs/graph2d/#groups)
 */
export interface Options {
  timeline: TimelineOptions;
  barchart: BarchartOptions;
  timeBars: TimebarOptions[];
  edgeFilter: FilterOptions;
  nodeFilter: FilterOptions;
  nodeStartPath: string;
  nodeEndPath: string;
  edgeStartPath: string;
  edgeEndPath: string;
  switchOnZoom: boolean;
  showBarchart: boolean;
  start?: number | Date;
  end?: number | Date;
}

export type Id = number | string;
export type Lookup<T> = {
  [key in Id]: T;
};
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type BarChartItem = {
  ids: ItemId[];
  group: string;
  label: string;
  x: number;
  y: number;
};

export type ItemByScale = {
  items: BarChartItem[];
  itemToElements: Lookup<ItemList>;
  groups: DataGroup[];
  elementToItem: Lookup<NodeId | EdgeId>;
  tooZoomed: boolean;
  maxY: number;
};

export type TimelineData = {
  items: DataItem[];
  groups: DataGroup[];
  itemToElements: Lookup<Item>;
  elementToItem: Lookup<ItemId>;
};
export type TimelineMode = "barchart" | "timeline";

export type NAND<A, B> = Omit<A, keyof B> & Omit<B, keyof A>;
export type AND<A, B> = Omit<A, keyof NAND<A, B>>;

export type VChart = AND<Graph2d, Timeline>;
export type ScaleChangeEvt = {
  scale: number;
  tooZoomed: boolean;
};
export type ClickEvt = {
  edges?: EdgeList | Edge;
  nodes?: NodeList | Node;
  evt: TimelineEventPropertiesResult;
};
export type SelectEvt = {
  edges?: EdgeList | Edge;
  nodes?: NodeList | Node;
  evt: MouseEvent;
};
export type Events = {
  [scaleChange]: (evt: ScaleChangeEvt) => void;
  [click]: (evt: ClickEvt) => void;
  [rangechanged]: () => void;
  [rangechange]: () => void;
  [timechange]: () => void;
  [timechanged]: () => void;
  [redraw]: () => void;
  [select]: (evt: SelectEvt) => void;
};

export type ControlerEvents = {
  [timechange]: () => void;
  [select]: (evt: SelectEvt) => void;
};

export type Timebar = {
  delta: number;
  id: IdType;
  fixed: boolean;
};

/**
 * @typedef {object} TimebarOptions Options to setup filter bars in the chart.
 * It can be a number, a date or an object.
 */
export type TimebarOptions = { fixed?: boolean; date: Date } | number | Date;

export type Scale = {
  name: string;
  millis: number;
  round?: (date: Date) => number;
};
