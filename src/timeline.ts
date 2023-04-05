import Ogma, { NodeId, NodeList } from "@linkurious/ogma";
import {
  DataGroup,
  DataItem,
  Timeline as VTimeline,
  TimelineEventPropertiesResult,
} from "vis-timeline";
import { click, scaleChange, select } from "./constants";
import "./style.css";
import { Id, Lookup, TimelineOptions } from "./types";
import { Chart } from "./chart";
import merge from "lodash.merge";

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
  groupIdFunction: () => `group-0`,
  groupContent: (groupId: string) => groupId,
  itemGenerator: (id) => ({ content: `node ${id}` }),
  timelineOptions: { editable: false },
};

export class Timeline extends Chart {
  protected options: TimelineOptions;
  private itemToNodes: Lookup<Id[]>;

  /**
   * @param {HTMLDivElement} container
   * @param {Ogma} ogma
   * @param {TimelineOptions} options
   */
  constructor(container: HTMLDivElement, ogma: Ogma, options: TimelineOptions) {
    super(container, ogma);
    this.options = options;
    const timeline = new VTimeline(
      container,
      this.dataset,
      merge(defaultTimelineOptions.timelineOptions, options.timelineOptions)
    );
    this.chart = timeline;
    this.itemToNodes = {};
    // state flags
    this.isChangingRange = false;
    this.chart.on("click", (e) => {
      this.onBarClick(e);
    });
    this.registerEvents();
  }

  public refresh(ids: NodeId[], starts: number[], ends: number[]): void {
    const itemToNodes: Lookup<Id[]> = {};
    const nodeToItem: Lookup<number> = {};

    const items: DataItem[] = [];
    const groupIdToNode = ids.reduce((groups, id, i) => {
      const groupid = this.options.groupIdFunction(id);
      if (!groups[groupid]) {
        groups[groupid] = [];
      }
      groups[groupid].push(i);
      itemToNodes[i] = [id];
      nodeToItem[id] = i;
      const content = this.options.itemGenerator(id);
      items.push({
        id,
        start: starts[i],
        end: ends[i],
        group: groupid,
        className: `timeline-item ${groupid} ${id}`,
        ...content,
      } as DataItem);
      return groups;
    }, {} as Record<string, number[]>);

    const groups: DataGroup[] = Object.entries(groupIdToNode).map(
      ([groupid, indexes]) => ({
        id: groupid,
        content: this.options.groupContent(groupid, indexes),
        className: `vis-group ${groupid}`,
        options: {},
      })
    );

    this.itemToNodes = itemToNodes;
    this.dataset.clear();
    this.dataset.add(items);
    if (groups && groups.length > 1) {
      this.chart.setGroups(groups);
    }
    this.chart.setWindow(starts[0], ends[ends.length - 1]);
  }

  protected onRangeChange() {
    const scale = this.getScale();
    if (scale === this.currentScale) {
      return;
    }
    this.emit(scaleChange, { scale, tooZoomed: false });
  }

  highlightNodes(nodes: NodeList | Id[]) {
    this.resethighlight();
    const ids = "getId" in nodes ? nodes.getId() : nodes;
    this.chart.setSelection(ids);
  }

  resethighlight() {
    this.chart.setSelection([]);
  }

  onBarClick(evt: TimelineEventPropertiesResult) {
    const { x, y, item } = evt;
    if (!x || !y || !item) return;
    const nodeIds = this.itemToNodes[item];
    this.emit(click, { nodeIds: nodeIds, evt });
  }

  setOptions(options: TimelineOptions) {
    this.options = options;
    this.chart.setOptions(options.timelineOptions);
  }

  protected registerEvents(): void {
    super.registerEvents();
    this.chart.on(select, ({ event, items }) => {
      const nodeIds = (items as string[]).reduce((acc, id) => {
        acc.push(...this.itemToNodes[id]);
        return acc;
      }, [] as Id[]);
      this.emit(select, {
        evt: event as MouseEvent,
        nodeIds,
      });
    });
  }
}
