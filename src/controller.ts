import Ogma, { Transformation, NodeList, NodeId } from '@linkurious/ogma';
import EventEmitter from 'eventemitter3';
import throttle from 'lodash.throttle';
import merge from 'lodash.merge';

import { scaleChange, timechange, timechanged} from './constants';
import {getSelector} from "./barFilter"
import { Timeline, defaultTimelineOptions } from './timeline';
import { Barchart, defaultBarchartOptions } from './barchart';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import './style.css';
import { ControlerEvents, Id, Options, TimelineMode } from './types';

export const defaultOptions: Partial<Options> = {
  startDatePath: 'start',
  endDatePath: 'end',
  filter: {
    enabled: true,
    strategy: 'between',
    tolerance: 'loose'
  },
  barchart:defaultBarchartOptions,
  timeline: defaultTimelineOptions,
}
export class Controller extends EventEmitter<ControlerEvents> {
  private ogma: Ogma<any, any>;

  private mode: TimelineMode;

  public timeline: Timeline;
  public nodes: NodeList;
  public barchart: Barchart;
  public filteredNodes: Set<Id>;
  private options: Options;
  private starts: number[];
  private ends: number[];
  private ids: NodeId[];

  constructor(ogma: Ogma<any, any>, container: HTMLDivElement, options: Partial<Options> = {}) {
    super();
    this.ogma = ogma;
    this.mode = 'barchart';
    this.options = merge(
      defaultOptions,
      options,
    );
    this.filteredNodes = new Set();
    this.nodes = ogma.createNodeList();
    this.starts = [];
    this.ends = [];
    this.ids = [];
    const timelineContainer = document.createElement('div');
    const barchartContainer = document.createElement('div');
    container.appendChild(timelineContainer);
    container.appendChild(barchartContainer);

    const timeline = new Timeline(timelineContainer, this.options.timeline);
    const barchart = new Barchart(barchartContainer, this.options.barchart);
    this.timeline = timeline;
    this.barchart = barchart;

    this.showTimeline();
    //switch from barchart to timeline on zoom
    this.barchart.on(scaleChange, ({ tooZoomed }) => {
      if (!tooZoomed) return;
      const { start, end } = this.barchart.getWindow();
      this.timeline.setWindow(+start, +end);
      this.timeline.setTimebarsDates(this.barchart.getTimebarsDates());

      this.showTimeline();
    });
    //switch from timeline to barchart on zoom
    this.timeline.on(scaleChange, ({ scale }) => {
      if (barchart.isTooZoomed(scale)) return;
      const { start, end } = this.timeline.getWindow();
      this.barchart.setWindow(+start, +end);
      this.barchart.setTimebarsDates(this.timeline.getTimebarsDates());
      this.showBarchart();
    });

    (options.timeBars||[])
    .sort()
    .forEach((timeBar) => {
      this.timeline.addTimeBar(+timeBar);
      this.barchart.addTimeBar(+timeBar);
    })

    // update the list of filtered nodes
    const throttled = throttle(() => this.onTimeChange(), 50);
    this.barchart.on(timechange, () => {
      throttled();
    })
    this.barchart.on(timechanged, () => {
      throttled();
    })

    this.timeline.on(timechange, () => {
      throttled();
    })
    this.timeline.on(timechanged, () => {
      throttled();
    })

  }

  refresh(nodes: NodeList<any, any>) {
    this.nodes = nodes;
    this.ids = nodes.getId();
    this.starts = nodes.getData(this.options.startDatePath);
    this.ends = nodes.getData(this.options.endDatePath);
    this.timeline.refresh(this.ids, this.starts, this.ends);
    this.barchart.refresh(this.ids, this.starts, this.ends);
    this.onTimeChange();
  }

  showTimeline() {
    this.barchart.container.style.display = 'none';
    this.timeline.container.style.display = '';
    this.mode = 'timeline';
  }

  showBarchart() {
    this.barchart.container.style.display = '';
    this.timeline.container.style.display = 'none';
    this.mode = 'barchart';
  }

  addTimeBar(time: number): void {
    this.timeline.addTimeBar(time);
    this.barchart.addTimeBar(time);
  }
  removeTimeBar(index: number){
    this.timeline.removeTimeBar(index);
    this.barchart.removeTimeBar(index);
  }

  getTimebarsDates(): Date[] {
    return this.mode==='timeline' ? this.timeline.getTimebarsDates() : this.barchart.getTimebarsDates();
  }
  setTimebarsDates(dates: Date[]) {
      this.timeline.setTimebarsDates(dates);
      this.barchart.setTimebarsDates(dates);
  }

  onTimeChange(){
    if(!this.options.filter.enabled)return this.emit(timechange);
    const times = (this.mode === 'timeline' 
      ? this.timeline.getTimebarsDates()
      : this.barchart.getTimebarsDates())
      .map(d => +d).sort((a,b) => a - b);
    const selector = getSelector(
      times,
      this.options.filter.strategy,
      this.options.filter.tolerance);
      this.filteredNodes.clear();
      for(let i=0; i< this.ids.length; i++){
        if(selector(this.starts[i], this.ends[i])){
          this.filteredNodes.add(this.ids[i]);
        }
      }
      this.emit(timechange);
  }
}
