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
import { NodeId } from "@linkurious/ogma";
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

/**
 * @typedef {object} BarchartOptions
 * @property {Graph2dOptions} graph2dOptions (https://visjs.github.io/vis-timeline/docs/graph2d/#graph2dOptions) to pass to the barchart
 * @property {Function} groupIdFunction Similar to [Ogma addNodeGrouping](https://doc.linkurious.com/ogma/latest/api.html#Ogma-transformations-addNodeGrouping) groupIdFunction
 * @property {Function} groupContent Generates the content of the group. See [Visjs groups](https://visjs.github.io/vis-timeline/docs/graph2d/#groups)
 */
export interface BarchartOptions {
  graph2dOptions: Graph2dOptions;
  groupIdFunction: (item: NodeId) => string;
  groupContent: (groupId: string, nodeIds: NodeId[]) => string;
  itemGenerator: (nodeId: NodeId[]) => Partial<BarChartItem>;
}
export interface TimelineOptions {
  groupIdFunction: (item: NodeId) => string;
  groupContent: (groupId: string, nodeIds: NodeId[]) => string;
  itemGenerator: (nodeId: NodeId) => Partial<DataItem>;
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
  filter: FilterOptions;
  startDatePath: string;
  endDatePath: string;
  switchOnZoom: boolean;
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
  id: NodeId;
  group: string;
  label: string;
  x: number;
  y: number;
};

export type ItemByScale = {
  items: BarChartItem[];
  itemToNodes: Lookup<Id[]>;
  groups: DataGroup[];
  nodeToItem: Lookup<number>;
  tooZoomed: boolean;
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
  nodeIds: Id[];
  evt: TimelineEventPropertiesResult;
};
export type SelectEvt = {
  nodeIds: Id[];
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
