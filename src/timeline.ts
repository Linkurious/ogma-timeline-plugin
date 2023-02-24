import { NodeId, NodeList } from '@linkurious/ogma';
import { DataItem, Timeline as VTimeline, TimelineEventPropertiesResult } from 'vis-timeline';
import { click, scaleChange, scales } from './constants';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import './style.css';
import { Id, Lookup, TimelineOptions } from './types';
import { Chart } from './chart';

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
  getItem: id => ({content: `node ${id}`}),
  getGroups: () => [],
};

export class Timeline extends Chart {
  protected options: TimelineOptions;

  // private ogma: Ogma<any, any>;
  private isChangingRange: boolean;
  private itemToNodes: Lookup<Id[]>;

  /**
   * @param {HTMLDivElement} container
   * @param {Ogma} ogma
   * @param {TimelineOptions} options
   */
  constructor(container: HTMLDivElement, options: TimelineOptions) {
    super(container);
    this.options = options;
    const timeline = new VTimeline(container, this.dataset, {
      editable: false
    });
    this.chart = timeline;
    this.itemToNodes = {};
    // state flags
    this.isChangingRange = false;
    this.chart.on('click', e => {
      this.onBarClick(e);
    })
    super.registerEvents();
  }

  public refresh(ids: NodeId[], starts: number[], ends: number[]): void {
    const itemToNodes: Lookup<Id[]> = {};
    const nodeToItem: Lookup<number> = {};
    const elements: DataItem[] = ids.map((id, i) => {
      itemToNodes[i] = [id];
      nodeToItem[id] = i;
      const content = this.options.getItem(id);
      return {
        id,
        start: starts[i],
        end: ends[i],
        ...content,
      } as DataItem;
    });
    this.itemToNodes = itemToNodes;
    this.dataset.clear();
    this.dataset.add(elements);
    const groups = this.options.getGroups();
    if(groups && groups.length) {
      this.chart.setGroups(groups);
    }
    this.chart.setWindow(starts[0], ends[ends.length - 1]);
     
  }

  protected onRangeChange() {
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

  highlightNodes(nodes: NodeList| Id[]) {

    this.resethighlight();
    const ids = 'getId' in nodes ?  
    nodes.getId() : nodes;
    this.chart.setSelection(ids)
  }

  resethighlight(){
    this.chart.setSelection([])
  }

  onBarClick(evt: TimelineEventPropertiesResult) {
    const { x, y, item } = evt;
    if (!x || !y || !item) return;
    const nodeIds = this.itemToNodes[item]
    this.emit(click, { nodeIds: nodeIds, evt });
  }

}
