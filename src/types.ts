import { Graph2d, Timeline } from 'vis-timeline';
import { click, scaleChange, zoomIn, zoomOut } from './constants';

export interface ChartOptions {
  minTime: number;
  maxTime: number;
  startDatePath: string;
  endDatePath: string;
}

export type TimelineOptions = ChartOptions;

export interface BarchartOptions extends ChartOptions {
  barWidth: number;
  barAlign: 'center' | 'left' | 'right';
  barAxisOrientation: 'top' | 'bottom';
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
  rects: SVGRectElement[];
  event: MouseEvent;
}
export type Events = {
  [scaleChange]: (evt: ScaleChangeEvt) => void;
  [click]: (evt: ClickEvt) => void;
  [zoomOut]: (evt) => void;
};
