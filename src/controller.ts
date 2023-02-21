import Ogma, { Transformation, NodeList } from '@linkurious/ogma';
import { scaleChange } from './constants';
import { Timeline, defaultTimelineOptions } from './timeline';
import { Barchart, defaultBarchartOptions } from './barchart';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import './style.css';
import { Id, TimelineMode } from './types';

export class Controller {
  private ogma: Ogma<any, any>;

  private mode: TimelineMode;

  private timeline: Timeline;

  public barchart: Barchart;

  private options: any;

        private chosenScale: number;

  private timeFilter: Transformation<any, any>;

  private isChangingRange: boolean;

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
    this.chosenScale = 0;

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
    // this.setupEvents(this.timeline, timeFilter, 'timeline');
    // this.setupEvents(this.barchart, timeFilter, 'barchart');
    // this.timeline.chart.on('rangechanged', this._onRangeChange);
    // this.barchart.chart.on('rangechanged', this._onRangeChange);
  }

  refresh(nodes: NodeList<any, any>) {
    this.timeline.refresh(nodes);
    this.barchart.refresh(nodes);
  }

  setupEvents(
    chart: Timeline | Barchart,
    timeFilter: Transformation,
    mode: TimelineMode
  ) {
    const { ogma } = this;
    this.isSelecting = false;
    this.ogma.events.on(
      ['nodesSelected', 'nodesUnselected'],
      this.onNodesSelectionChange
    );

    chart.chart.on('timechange', () => {
      const [min, max] = chart.chart.components
        .map(({ customTime }: { customTime: string }) => customTime)
        .filter((c: string) => c)
        .sort((a: string, b: string) => +a - +b);
      this.options.minTime = min;
      this.options.maxTime = max;
      timeFilter.refresh();
    });

    // if (mode === 'timeline') chart.on('select', this._onTimelineSelect);
    // if (mode === 'barchart') chart.on('click', this._onBarClicked);

    this.isChangingRange = false;
  }

  onNodesSelectionChange() {
    // if (this.isSelecting) return;
    // this.isSelecting = true;
    // if (this.mode === 'timeline') {
    //   this.timeline.setSelection(this.ogma.getSelectedNodes().getId());
    // } else {
    //   const groups = [
    //     ...this.container.querySelectorAll('.vis-line-graph>svg>rect')
    //   ];
    //   groups.forEach(group => group.classList.remove('selected'));
    //   this.ogma
    //     .getSelectedNodes()
    //     .getId()
    //     .forEach(id => {
    //       if (!groups[this.nodeToGroup[id]]) return;
    //       groups[this.nodeToGroup[id]].classList.add('selected');
    //     });
    // }
    // this.isSelecting = false;
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

  _onRangeChange() {
    // prevent from infinite loop: setdata and window trigger this event
    // if (this.isChangingRange) return;

    // this.isChangingRange = true;
    // const { start, end } =
    //   this.mode === 'timeline'
    //     ? this.timeline.timeline.getWindow()
    //     : this.barchart.barchart.getWindow();
    // const length = +end - +start;
    // // choose a scale adapted to zoom
    // const scale = scales.reduce(
    //   (scale, candidate) => {
    //     const bars = Math.round(length / candidate);
    //     if (bars < scale.bars && bars > 10) {
    //       return {
    //         bars,
    //         scale: candidate
    //       };
    //     }
    //     return scale;
    //   },
    //   { bars: Infinity, scale: Infinity }
    // ).scale;
    // if (scale === this.chosenScale) {
    //   this.isChangingRange = false;
    //   return;
    // }
    // this.chosenScale = scale;
    // // get the data depending on zoom
    // const { groups, timelineMode, nodeToGroup, groupToNodes } =
    //   this.groupsByScale[scale];
    // const { minTime, maxTime } = this.options;
    // this.nodeToGroup = nodeToGroup;
    // this.groupToNodes = groupToNodes;

    // update timelines
    // if (timelineMode) {
    //   this.mode = 'timeline';
    //   this.showTimeline();
    //   // no need to update the data, it does not change
    //   // this.timedataset.clear();
    //   // this.timedataset.add(groups);
    //   this.timeline.setWindow(start, end);
    //   this.timeline.setCustomTime(minTime, 't1');
    //   this.timeline.setCustomTime(maxTime, 't2');
    // } else {
    //   this.mode = 'barchart';
    //   this.showBarchart();
    //   this.bardataset.clear();
    //   this.bardataset.add(groups);
    //   this.barchart.setWindow(start, end);
    //   this.barchart.setCustomTime(minTime, 't1');
    //   this.barchart.setCustomTime(maxTime, 't2');
    //   this.barchart.redraw();
    // }
    this.isChangingRange = false;
  }

  showTimeline() {
    this.barchart.container.style.display = 'none';
    this.timeline.container.style.display = '';
  }

  showBarchart() {
    this.barchart.container.style.display = '';
    this.timeline.container.style.display = 'none';
  }
}
