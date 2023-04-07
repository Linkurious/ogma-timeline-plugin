import Ogma, {
  Edge,
  EdgeList,
  Item,
  ItemId,
  ItemList,
  Node,
  NodeId,
  NodeList,
} from "@linkurious/ogma";
import {
  DataGroup,
  DataItem,
  Timeline as VTimeline,
  TimelineEventPropertiesResult,
} from "vis-timeline";
import { click, scaleChange, select } from "./constants";
import "./style.css";
import {
  GroupFunction,
  Id,
  IdFunction,
  ItemGenerator,
  Lookup,
  TimelineData,
  TimelineOptions,
} from "./types";
import { Chart, defaultChartOptions } from "./chart";
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
  ...(defaultChartOptions as unknown as TimelineOptions),
  nodeItemGenerator: (node) => ({ content: `node ${node.getId()}` }),
  edgeItemGenerator: (edge) => ({ content: `edge ${edge.getId()}` }),

  timelineOptions: {
    editable: false,
    horizontalScroll: true,
    maxHeight: "100%",
    height: "100%",
    groupHeightMode: "fixed",
  },
};

export class Timeline extends Chart {
  protected options: TimelineOptions;
  private nodeItems: TimelineData;
  private edgeItems: TimelineData;

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
    // state flags
    this.isChangingRange = false;
    this.chart.on("click", (e) => {
      this.onBarClick(e);
    });
    this.registerEvents();
  }

  public refresh(
    nodes: NodeList,
    edges: EdgeList,
    nodeStarts: number[],
    nodeEnds: number[],
    edgeStarts: number[],
    edgeEnds: number[]
  ): void {
    this.nodeItems = this._group(
      nodes,
      this.options.nodeGroupIdFunction as IdFunction<Item>,
      this.options.nodeGroupContent as unknown as GroupFunction<ItemList>,
      this.options.nodeItemGenerator as ItemGenerator<DataItem, Item>,
      nodeStarts,
      nodeEnds
    );
    this.edgeItems = this._group(
      edges,
      this.options.edgeGroupIdFunction as IdFunction<Item>,
      this.options.edgeGroupContent as unknown as GroupFunction<ItemList>,
      this.options.edgeItemGenerator as ItemGenerator<DataItem, Item>,
      edgeStarts,
      edgeEnds
    );
    this.dataset.clear();
    this.dataset.add(this.edgeItems.items);
    this.dataset.add(this.nodeItems.items);

    const totalGroups =
      this.edgeItems.groups.length + this.nodeItems.groups.length;
    if (totalGroups > 1) {
      this.chart.setGroups([
        ...this.nodeItems.groups,
        ...this.edgeItems.groups,
      ]);
    }
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
    const { x, y, item, event } = evt;
    if (!x || !y || !item) return;
    const node = this.nodeItems.itemToElements[item] as unknown as
      | Node
      | undefined;
    const edge = this.edgeItems.itemToElements[item] as unknown as
      | Edge
      | undefined;

    this.edgeItems.itemToElements[item];
    this.emit(click, { node, edge, evt });
    if (node || edge) {
      this.emit(select, {
        evt: event as MouseEvent,
        node,
        edge,
      });
    }
  }

  setOptions(options: TimelineOptions) {
    this.options = options;
    this.chart.setOptions(options.timelineOptions);
  }

  protected registerEvents(): void {
    super.registerEvents();
  }

  private _group(
    elements: ItemList,
    idFunction: IdFunction<Item>,
    groupFunction: GroupFunction<ItemList>,
    itemGenerator: ItemGenerator<DataItem, Item>,
    starts: number[],
    ends: number[]
  ): TimelineData {
    const items: DataItem[] = [];
    const ids = elements.getId();
    const isNode = elements.isNode;
    const prefix = isNode ? "node" : "edge";

    const itemToElements: Lookup<Item> = {};
    const elementToItem: Lookup<ItemId> = {};

    const groupIdToNode = ids.reduce((groups, id, i) => {
      const element = elements.get(i);
      const groupid = idFunction(element);
      if (!groups[groupid]) {
        groups[groupid] = [];
      }
      groups[groupid].push(element);
      itemToElements[id] = element;
      elementToItem[i] = id;
      const content = itemGenerator(element, groupid);
      items.push({
        id,
        start: starts[i],
        end: ends[i],
        group: groupid,
        className: `timeline-item ${groupid} ${id} ${prefix}`,
        ...content,
      } as DataItem);
      return groups;
    }, {} as Record<string, Item[]>);

    const groups: DataGroup[] = Object.entries(groupIdToNode).map(
      ([groupid, items]) => ({
        id: groupid,
        content: groupFunction(
          groupid,
          this.ogma.getNodes(items as unknown as NodeId[])
        ),
        className: `vis-group ${groupid}`,
        options: {},
      })
    );
    return { items, groups, itemToElements, elementToItem };
  }
}
