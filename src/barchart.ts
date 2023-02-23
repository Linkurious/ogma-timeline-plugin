import { NodeId, NodeList } from '@linkurious/ogma';
import { Graph2d as VGraph2d, TimelineEventPropertiesResult } from 'vis-timeline';
import { click, scaleChange, scales } from './constants';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import './style.css';
import { BarchartOptions, Group, GroupByScale, Id, Lookup } from './types';
import { Chart, defaultChartOptions } from './chart';

/**
 * @typedef {object} BarchartOptions
 * @property {number} [barWidth=50] Barchart  width
 * @property {'center'|'left'|'right'} [barAl='center'] Barchart bars alignment
 * @property {'top'|'bottom'} [barAxisOrientan='top'] Axis position
 */
export const defaultBarchartOptions: BarchartOptions = {
  barWidth: 50,
  barAlign: 'center',
  barAxisOrientation: 'top',
  ...defaultChartOptions
};

export class Barchart extends Chart {
  private groupsByScale: Lookup<GroupByScale>;

  private nodeToGroup: Lookup<number>;

  private groupToNodes: Lookup<Id[]>;

  private isChangingRange: boolean;
  private rects: SVGRectElement[];

  /**
   * @param {HTMLDivElement} container
   * @param {Ogma} ogma
   * @param {TimelineOptions} options
   */
  constructor(container: HTMLDivElement, options: BarchartOptions) {
    super(container, { ...defaultBarchartOptions, ...options });
    const barchart = new VGraph2d(container, this.dataset, {
      style: 'bar',
      barChart: { width: options.barWidth, align: options.barAlign },
      drawPoints: false,
      orientation: options.barAxisOrientation,
      graphHeight: `${container.offsetHeight - 50}px`
    });
    this.chart = barchart;
    this.groupsByScale = {};
    this.nodeToGroup = {};
    this.groupToNodes = {};
    this.isChangingRange = false;
    this.rects = [];
    this.chart.on('click', e => {
      this.onBarClick(e);
    })
    this.chart.on("rangechanged", () => {
      this.rects = Array.from(this.container.querySelectorAll('.vis-line-graph>svg>rect')) as SVGRectElement[];
    })
    super.registerEvents();
  }

  public refresh(ids: NodeId[], starts: number[], ends: number[]): void {
    this.computeGroups(ids, starts, ends);
    this.onRangeChange();
  }

  /**
   * Compute the groups depending on the chart zoom.
   * Above a certain zoom, switch to timeline mode
   */
  computeGroups(ids: NodeId[], starts: number[], ends: number[]) {
    const min = Math.min(
      starts.reduce(
        (min, start) => (isNaN(start) ? min : Math.min(min, start)),
        Infinity
      ),
      ends.reduce(
        (min, end) => (isNaN(end) ? min : Math.min(min, end)),
        Infinity
      )
    );
    const max = Math.max(
      starts.reduce(
        (max, start) => (isNaN(start) ? max : Math.max(max, start)),
        -Infinity
      ),
      ends.reduce(
        (max, end) => (isNaN(end) ? max : Math.max(max, end)),
        -Infinity
      )
    );

    let tooZoomed = false;
    // iterate from big to small zoom and compute bars
    this.groupsByScale = scales
      .slice()
      .reverse()
      .reduce((groupsByScale, scale, i, scales) => {
        // if we reached a zoom where there are not too many events,
        // just display timeline
        const gpPrev = groupsByScale[scales[i - 1]] as any as GroupByScale;

        if (tooZoomed) {
          groupsByScale[scale] = { ...gpPrev, tooZoomed: true };
          return groupsByScale;
        }
        let groupToNodes: Lookup<Id[]> = {};
        const nodeToGroup: Lookup<number> = {};
        const groupMap = ids.reduce((groups, id, i) => {
          // slice the data and group
          const index = Math.floor((starts[i] - min) / scale);
          const x = min + scale * index;
          if (!groups[x]) {
            groups[x] = {
              id: index,
              group: index,
              className: 'group-0',
              x,
              y: 0
            };
            groupToNodes[index] = [];
          }
          groupToNodes[index].push(id);
          // y is how many nodes there is within this group
          // eslint-disable-next-line no-param-reassign
          groups[x].y += 1;
          return groups;
        }, {} as Lookup<Group>);
        const groups = Object.values(groupMap);
        groupToNodes = Object.entries(groupToNodes)
          .sort(([a], [b]) => +a - +b)
          .reduce((groupToNodes, [index, nodes], i) => {
            groupToNodes[i] = nodes;
            nodes.forEach((n) => (nodeToGroup[n] = i));
            return groupToNodes;
          }, {} as Lookup<Id[]>);

        // eslint-disable-next-line no-param-reassign
        groupsByScale[scale] = {
          groups,
          groupToNodes,
          tooZoomed,
          nodeToGroup
        };
        // tell the next iteration if it should be on timeline or barchart mode
        tooZoomed =
          tooZoomed || groups.reduce((maxY, g) => Math.max(maxY, g.y), 0) < 5;
        return groupsByScale;
      }, {} as Lookup<GroupByScale>);
  }

  highlightNodes(nodes: NodeList| Id[]) {

    this.resethighlight();
    const ids = 'getId' in nodes ?  
    nodes.getId() : nodes;

    ids
      .forEach(id => {
        if (!this.rects[this.nodeToGroup[id]]) return;
        this.rects[this.nodeToGroup[id]].classList.add('hightlight');
      });
  }

  resethighlight(){
    this.rects.forEach(group => group.classList.remove('hightlight'));
  }

  onBarClick(evt: TimelineEventPropertiesResult) {
    const { x, y } = evt;
    if (!x || !y || !this.rects.length) return;
    const svg: SVGAElement| null = this.container.querySelector('.vis-line-graph>svg');
    if(!svg) return;
    const offset = +svg.style.left.slice(0, -2);
    const nodeIds = (this.rects
      .map((rect, i) => {
        const groupX = +(rect.getAttribute('x') as string) + offset;
        const groupW = +(rect.getAttribute('width') as string);
        return groupX < x && groupX + groupW > x
          ? {
              rect,
              nodeIds: this.groupToNodes[i]
            }
          : null;
      })
      .filter(e => e)as ({ nodeIds: Id[], rect: SVGRectElement}[]))
      .reduce((acc, { nodeIds }) => {
        acc.push(...nodeIds);
        return acc;
      },  []  as Id[] );
    this.emit(click, {nodeIds, evt});
  }

  protected onRangeChange() {
    // prevent from infinite loop: setdata and window trigger this event
    if (this.isChangingRange) return;

    this.isChangingRange = true;
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
      return;
    }
    this.currentScale = scale;
    // get the data depending on zoom
    const { groups, nodeToGroup, groupToNodes, tooZoomed } =
      this.groupsByScale[scale];
    this.emit(scaleChange, { scale, tooZoomed });
    this.nodeToGroup = nodeToGroup;
    this.groupToNodes = groupToNodes;

    this.dataset.clear();
    this.dataset.add(groups);
    this.chart.setWindow(start, end);
    this.chart.redraw();
    this.isChangingRange = false;
    this.emit('rangechanged')
  }

  isTooZoomed(scale: number) {
    return this.groupsByScale[scale].tooZoomed;
  }
}
