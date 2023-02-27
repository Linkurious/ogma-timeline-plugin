import { NodeId, NodeList } from '@linkurious/ogma';
import { DataItem, Graph2d as VGraph2d, TimelineEventPropertiesResult,DataGroup } from 'vis-timeline';
import { click, rangechanged, scaleChange, scales } from './constants';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import './style.css';
import { BarchartOptions, BarChartItem, Id, Lookup, ItemByScale } from './types';
import { Chart } from './chart';
import { DataSet } from 'vis-data';

/**
 * @typedef {object} BarchartOptions
 * @property {number} [barWidth=50] Barchart  width
 * @property {'center'|'left'|'right'} [barAl='center'] Barchart bars alignment
 * @property {'top'|'bottom'} [barAxisOrientan='top'] Axis position
 */
export const defaultBarchartOptions: BarchartOptions = {
  graph2dOptions: {
    style: 'bar'
  },
  groupIdFunction: (id) => `group-0`,
  groupContent: (groupId: string, nodeIds: Id[]) => groupId,
  itemGenerator: () => ({}),
};

export class Barchart extends Chart {
  private itemsByScale: Lookup<ItemByScale>;
  private nodeToItem: Lookup<number>;
  private options: BarchartOptions;
  private itemToNodes: Lookup<Id[]>;
  private isChangingRange: boolean;
  private rects: SVGRectElement[];
  private groupDataset: DataSet<DataGroup>;

  /**
   * @param {HTMLDivElement} container
   * @param {Ogma} ogma
   * @param {TimelineOptions} options
   */
  constructor(container: HTMLDivElement, options: BarchartOptions) {
    super(container);
    this.groupDataset = new DataSet<DataGroup>();
    const barchart = new VGraph2d(container, this.dataset, this.groupDataset, {
      ...defaultBarchartOptions.graph2dOptions,
      ...options.graph2dOptions,
    });
    this.options = options;
    this.chart = barchart;
    this.itemsByScale = {};
    this.nodeToItem = {};
    this.itemToNodes = {};
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
    const groupIdToNode = ids.reduce((groups, id, i) => {
      const groupid = this.options.groupIdFunction(id);
      if (!groups[groupid]) {
        groups[groupid] = []
      }
      groups[groupid].push(i)
      return groups;
    }, {} as Record<string, number[]>);

    const groups: DataGroup[] = Object.entries(groupIdToNode).map(([groupid, indexes]) => ({
      id: groupid,
      content: this.options.groupContent(groupid, indexes),
      className: `vis-graph-group ${groupid}`,
      options: {}
    }));

    this.itemsByScale = scales
      .slice()
      .reverse()
      .reduce((itemsByScale, scale, i, scales) => {
        // if we reached a zoom where there are not too many events,
        // just display timeline
        const gpPrev = itemsByScale[scales[i - 1]] as any as ItemByScale;

        if (tooZoomed) {
          itemsByScale[scale] = { ...gpPrev, tooZoomed: true };
          return itemsByScale;
        }
        const itemsPerGroup: Record<string,  Record<number, BarChartItem>> = Object.keys(groupIdToNode)
        .reduce((acc, groupid) => {
          acc[groupid] = {};
          return acc;
        }, {} as Record<string, Record<number, BarChartItem>>);
        let itemToNodes: Lookup<Id[]> = {};
        const nodeToItem: Lookup<number> = {};
        const items:BarChartItem[]  = [];
        Object.entries(groupIdToNode)
        .forEach(([groupid, indexes]) => {
          const itemsPerX = itemsPerGroup[groupid];
          indexes.forEach((i) => {
            const index = Math.floor((starts[i] - min) / scale);
              const x = min + scale * index;
              if (!itemsPerX[x]) {
                itemsPerX[x] = {
                  id: i,
                  label: '',
                  group: groupid,
                  x,
                  y: 0
                };
              }
              // y is how many nodes there is within this group
              itemsPerX[x].y += 1;
          });
        })
        Object.values(itemsPerGroup).forEach((itemsPerX) => {
          Object.values(itemsPerX).forEach(item => {
            items.push({
              ...item,
              ...this.options.itemGenerator(
                // nodeIds:
                groupIdToNode[item.group],
                // scale
                scale,
              )
            })  
          })
        });

        itemToNodes = Object.entries(itemToNodes)
          .sort(([a], [b]) => +a - +b)
          .reduce((itemToNodes, [index, nodes], i) => {
            itemToNodes[i] = nodes;
            nodes.forEach((n) => (nodeToItem[n] = i));
            return itemToNodes;
          }, {} as Lookup<Id[]>);

        // eslint-disable-next-line no-param-reassign
        itemsByScale[scale] = {
          items,
          itemToNodes,
          tooZoomed,
          groups,
          nodeToItem
        };
        // tell the next iteration if it should be on timeline or barchart mode
        tooZoomed =
          tooZoomed || items.reduce((maxY, g) => Math.max(maxY, g.y), 0) < 5;
        return itemsByScale;
      }, {} as Lookup<ItemByScale>);
  }

  highlightNodes(nodes: NodeList| Id[]) {

    this.resethighlight();
    const ids = 'getId' in nodes ?  
    nodes.getId() : nodes;

    ids
      .forEach(id => {
        if (!this.rects[this.nodeToItem[id]]) return;
        this.rects[this.nodeToItem[id]].classList.add('hightlight');
      });
  }

  resethighlight(){
    this.rects.forEach(group => group.classList.remove('hightlight'));
  }

  onBarClick(evt: TimelineEventPropertiesResult) {
    const { x, y, what } = evt;
    if (!x || !y || !this.rects.length
    || what === 'background') return;
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
              nodeIds: this.itemToNodes[i]
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
    const { items, nodeToItem, itemToNodes,groups, tooZoomed } =
      this.itemsByScale[scale];
    this.emit(scaleChange, { scale, tooZoomed });
    this.nodeToItem = nodeToItem;
    this.itemToNodes = itemToNodes;

    this.dataset.clear();
    // const groups = this.
    // if(groups && groups.length) {
    this.groupDataset.clear()
    this.groupDataset.add(groups as unknown as DataItem[]);
    this.dataset.add(items as unknown as DataItem[]);

    // }

    // this.chart.setWindow(start, end);
    this.chart.redraw();
    this.isChangingRange = false;
    this.emit(rangechanged);
  }

  isTooZoomed(scale: number) {
    return this.itemsByScale[scale].tooZoomed;
  }
}
