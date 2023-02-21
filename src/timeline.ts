import { NodeList } from '@linkurious/ogma';
import { Timeline as VTimeline } from 'vis-timeline';
import { scaleChange, scales } from './constants';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import './style.css';
import { Id, Lookup, TimelineOptions } from './types';
import { Chart, defaultChartOptions } from './chart';

/**
 * @typedef {object} TimelineOptions
 * @property {number} [barWidth=50] Barchart bar width
 * @property {'center'|'left'|'right'} [barAlign='center'] Barchart bars alignment
 * @property {'top'|'bottom'} [barAxisOrientation='top'] Axis position
 * @property {number} [minTime] Unix timestamp of the earliest event
 * @property {number} [maxTime] Unix timestamp of the latest event
 *
 */
export const defaultTimelineOptions: TimelineOptions = {
  ...defaultChartOptions
};

export class Timeline extends Chart {
  protected options: TimelineOptions;

  // private ogma: Ogma<any, any>;
  private isChangingRange: boolean;

  private isSelecting: boolean;
  /**
   * @param {HTMLDivElement} container
   * @param {Ogma} ogma
   * @param {TimelineOptions} options
   */
  constructor(container: HTMLDivElement, options: TimelineOptions) {
    super(container, { ...defaultTimelineOptions, ...options });
    this.options = options;
    const timeline = new VTimeline(container, this.dataset, {
      editable: false
    });
    this.chart = timeline;
    const { minTime, maxTime } = options;
    timeline.addCustomTime(minTime, 't1');
    timeline.addCustomTime(maxTime, 't2');
    // state flags
    this.isChangingRange = false;
    this.isSelecting = false;
    this.registerEvents();
  }

  public refresh(nodes: NodeList<any, any>): void {
    const nodeIndexes = nodes.getId();
    const starts = nodes.getData(this.options.startDatePath);
    const ends = nodes.getData(this.options.endDatePath);
    const groupToNodes: Lookup<Id[]> = {};
    const nodeToGroup: Lookup<number> = {};
    const elements = nodeIndexes.map((id, i) => {
      groupToNodes[i] = [id];
      nodeToGroup[id] = i;
      return {
        id,
        start: starts[i],
        end: ends[i],
        content: `node ${id}`
      };
    });
    this.dataset.clear();
    this.dataset.add(elements);
    this.chart.setWindow(starts[0], ends[ends.length - 1]);
  }

  // TODO
  onNodesSelectionChange = () => {
    // if (this.isSelecting) return;
    // this.isSelecting = true;
    // this.timeline.setSelection(this.ogma.getSelectedNodes().getId());
    // this.isSelecting = false;
  };
  // TODO
  onTimelineSelect = (s: { items: Id[] }) => {
    // if (this.isSelecting) return;
    // this.isSelecting = true;
    // this.ogma.clearSelection();
    // const nodesToSelect = this.ogma.getNodes(s.items);
    // nodesToSelect.setSelected(true);
    // this.ogma.view
    //   .moveToBounds(nodesToSelect.getBoundingBox())
    //   .then(() => (this.isSelecting = false));
  };

  protected onRangeChange = () => {
    // prevent from infinite loop: setdata and window trigger this event
    if (this.isChangingRange) return;

    // this.isChangingRange = true;
    const { start, end } = this.chart.getWindow();
    const length = +end - +start;
    // choose a scale adapted to zoom
    const { scale } = scales.reduce(
      (scale, candidate) => {
        const bars = Math.round(length / candidate);
        if (bars < scale.bars && bars > 10) {
          return {
            bars,
            scale: candidate
          };
        }
        return scale;
      },
      { bars: Infinity, scale: Infinity }
    );
    if (scale === this.currentScale) {
      this.isChangingRange = false;
    }
    this.emit(scaleChange, { scale, tooZoomed: false });
    this.isChangingRange = false;
  };
}
