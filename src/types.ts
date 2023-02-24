import { DataItem, DataGroup, Graph2d, Timeline, TimelineEventPropertiesResult, Graph2dOptions } from 'vis-timeline';
import {NodeId} from "@linkurious/ogma";
import { click, rangechanged, scaleChange, timechange, timechanged } from './constants';
export type FilterStrategy = 'before' | 'after' | 'between' | 'outside';
export type FilterTolerance = 'strict' | 'loose';

export type FilterOptions = {
  enabled: boolean;
  strategy: FilterStrategy;
  tolerance: FilterTolerance;
}
export interface TimelineOptions {
  getItem: (item: NodeId) => Partial<DataItem>;
  getGroups: () => DataGroup[];
};

export interface BarchartOptions {
  graph2dOptions: Graph2dOptions;
  groupIdFunction: (item: NodeId) => string;
  groupContent: (groupId: string, nodeIds: NodeId[]) => string;
  itemGenerator: (nodeIds: NodeId[], scale: number) => Partial<BarChartItem>;
}

export interface Options{
  timeline: TimelineOptions;
  barchart: BarchartOptions;
  timeBars?: Date[];
  filter: FilterOptions;
  startDatePath: string;
  endDatePath: string;
}

export type Id = number | string;
export type Lookup<T> = {
  [key in Id]: T;
};

export type BarChartItem = {
  id: number;
  group: string;
  className: string;
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
export type TimelineMode = 'barchart' | 'timeline';

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
}
export type Events = {
  [scaleChange]: (evt: ScaleChangeEvt) => void;
  [click]: (evt: ClickEvt) => void;
  [rangechanged]: () => void;
  [timechange]: () => void;
  [timechanged]: () => void;

};

export type ControlerEvents = {
  [timechange]: () => void;
}