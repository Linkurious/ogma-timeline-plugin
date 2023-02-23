import { Graph2d, Timeline, TimelineEventPropertiesResult } from 'vis-timeline';
import { click, scaleChange, timechange, timechanged } from './constants';
export interface ChartOptions {
  minTime: number;
  maxTime: number;
}
export type FilterStrategy = 'before' | 'after' | 'between' | 'outside';
export type FilterTolerance = 'strict' | 'loose';

export type FilterOptions = {
  enabled: boolean;
  strategy: FilterStrategy;
  tolerance: FilterTolerance;
}
export type TimelineOptions = ChartOptions;

export interface BarchartOptions extends ChartOptions {
  barWidth: number;
  barAlign: 'center' | 'left' | 'right';
  barAxisOrientation: 'top' | 'bottom';
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

export type Group = {
  id: number;
  group: number;
  className: string;
  x: number;
  y: number;
};

export type GroupByScale = {
  groups: Group[];
  groupToNodes: Lookup<Id[]>;
  nodeToGroup: Lookup<number>;
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
  // [rangechanged]: () => void;
  [timechange]: () => void;
  [timechanged]: () => void;

};

export type ControlerEvents = {
  [timechange]: () => void;
}