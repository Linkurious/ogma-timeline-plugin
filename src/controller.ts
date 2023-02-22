import Ogma, { Transformation, NodeList } from '@linkurious/ogma';
import { scaleChange } from './constants';
import { Timeline, defaultTimelineOptions } from './timeline';
import { Barchart, defaultBarchartOptions } from './barchart';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import './style.css';
import { Id, TimelineMode } from './types';
import {click} from './constants';

export class Controller {
  private ogma: Ogma<any, any>;

  private mode: TimelineMode;

  public timeline: Timeline;

  public barchart: Barchart;

  private options: any;

  private timeFilter: Transformation<any, any>;

  private isSelecting: boolean;

  constructor(ogma: Ogma<any, any>, container: HTMLDivElement, options = {}) {
    this.ogma = ogma;
    this.mode = 'barchart';
    this.options = {
      ...defaultBarchartOptions,
      ...defaultTimelineOptions,
      ...options
    };
    // state flags
    this.isChangingRange = false;
    this.isSelecting = false;

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
    this.timeFilter
      .enable(100)
      .then(() => this.ogma.view.locateGraph())
      .then(() => {
        const { minTime, maxTime } = this.options;
        // this.timeline.chart.setWindow(minTime - 2 * year, maxTime + 2 * year);
        // this.barchart.chart.setWindow(minTime - 2 * year, maxTime + 2 * year);
      });

    this.barchart.on(scaleChange, ({ tooZoomed }) => {
      if (!tooZoomed) return;
      const { start, end } = this.barchart.getWindow();
      this.timeline.setWindow(+start, +end);
      this.showTimeline();
    });

    this.timeline.on(scaleChange, ({ scale }) => {
      if (barchart.isTooZoomed(scale)) return;
      const { start, end } = this.timeline.getWindow();
      this.barchart.setWindow(+start, +end);
      this.showBarchart();
    });

    this.timeline.on(click, (e) => {
      console.log(e);
    })
  }

  refresh(nodes: NodeList<any, any>) {
    this.timeline.refresh(nodes);
    this.barchart.refresh(nodes);
  }

  _onTimelineSelect = (s: { items: Id[] }) => {
    if (this.isSelecting) return;
    this.isSelecting = true;
    this.ogma.clearSelection();
    const nodesToSelect = this.ogma.getNodes(s.items);
    nodesToSelect.setSelected(true);
    this.ogma.view
      .moveToBounds(nodesToSelect.getBoundingBox())
      .then(() => (this.isSelecting = false));
  };

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
}
