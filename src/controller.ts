import Ogma, { Transformation, NodeList, NodeId } from '@linkurious/ogma';
import { scaleChange ,click, rangechanged} from './constants';
import { Timeline, defaultTimelineOptions } from './timeline';
import { Barchart, defaultBarchartOptions } from './barchart';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import './style.css';
import { Id, Options, TimelineMode } from './types';

export const defaultOptions: Partial<Options> = {
  startDatePath: 'start',
  endDatePath: 'end',
}
export class Controller {
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


  private timeFilter: Transformation<any, any>;

  constructor(ogma: Ogma<any, any>, container: HTMLDivElement, options: Partial<Options> = {}) {
    this.ogma = ogma;
    this.mode = 'barchart';
    this.options = {
      ...defaultBarchartOptions,
      ...defaultTimelineOptions,
      ...defaultOptions,
      ...options
    };
    this.filteredNodes = new Set();
    this.nodes = ogma.createNodeList();
    this.starts = [];
    this.ends = [];
    this.ids = [];
    const timeFilter = this.ogma.transformations.addNodeFilter({
      criteria: (node) => {
        const start = node.getData('start');
        const end = node.getData('end');
        const { minTime, maxTime } = this.options;
        return (
          start > minTime &&
          start < maxTime &&
          (!end || (end > minTime && end < maxTime))
        );
      },
      enabled: false
    });
    this.timeFilter = timeFilter;
    const timelineContainer = document.createElement('div');
    const barchartContainer = document.createElement('div');
    container.appendChild(timelineContainer);
    container.appendChild(barchartContainer);

    const timeline = new Timeline(timelineContainer, this.options);
    const barchart = new Barchart(barchartContainer, this.options);
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
    this.barchart.on(rangechanged, () => {

      // this.nodes.getData(options.)
    })

    // this.timeFilter
    // .enable(100)
    // .then(() => this.ogma.view.locateGraph())
    // .then(() => {
    //   const { minTime, maxTime } = this.options;
    //   // this.timeline.chart.setWindow(minTime - 2 * year, maxTime + 2 * year);
    //   // this.barchart.chart.setWindow(minTime - 2 * year, maxTime + 2 * year);
    // });
  }

  refresh(nodes: NodeList<any, any>) {
    this.nodes = nodes;
    this.ids = nodes.getId();
    this.starts = nodes.getData(this.options.startDatePath);
    this.ends = nodes.getData(this.options.endDatePath);
    this.timeline.refresh(this.ids, this.starts, this.ends);
    this.barchart.refresh(this.ids, this.starts, this.ends);
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
}
