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
import { deepmerge } from "deepmerge-ts";
import {
  DataGroup,
  DataItem,
  Timeline as VTimeline,
  TimelineEventPropertiesResult,
} from "vis-timeline";
import { Chart, defaultChartOptions } from "./chart";
import { click, scaleChange, select } from "./constants";
import {
  GroupFunction,
  Id,
  IdFunction,
  ItemGenerator,
  Lookup,
  TimelineData,
  TimelineOptions,
  BaseOptions,
} from "./types";

/**
 * @typedef {object} TimelineOptions
 * @property {number} [barWidth=50] Barchart bar width
 * @property {'center'|'left'|'right'} [barAlign='center'] Barchart bars alignment
 * @property {'top'|'bottom'} [barAxisOrientation='top'] Axis position
 * @property {number} [minTime] Unix timestamp of the earliest event
 * @property {number} [maxTime] Unix timestamp of the latest event
 *
 */
export const defaultTimelineOptions: Required<TimelineOptions> = {
  ...(defaultChartOptions as unknown as Required<
    BaseOptions<DataItem, Node, Edge>
  >),
  nodeItemGenerator: (node) => ({ content: `node ${node.getId()}` }),
  edgeItemGenerator: (edge) => ({ content: `edge ${edge.getId()}` }),
  getNodeClass: () => ``,
  getEdgeClass: () => ``,
  timelineOptions: {
    editable: false,
    horizontalScroll: true,
    maxHeight: "100%",
    height: "100%",
    groupHeightMode: "fixed",
  },
};

export class Timeline<ND = unknown, ED = unknown> extends Chart<
  ND,
  ED,
  VTimeline
> {
  protected options: Required<TimelineOptions<ND, ED>>;
  private nodeItems: TimelineData;
  private edgeItems: TimelineData;

  /**
   * @param {HTMLDivElement} container
   * @param {Ogma} ogma
   * @param {TimelineOptions} options
   */
  constructor(
    container: HTMLDivElement,
    ogma: Ogma<ND, ED>,
    options: Required<TimelineOptions<ND, ED>>,
    selectedNodes: Set<Id>,
    selectedEdges: Set<Id>
  ) {
    super(container, ogma, selectedNodes, selectedEdges);
    this.options = options;
    this.nodeItems = {
      items: [],
      groups: [],
      itemToElements: {},
      elementToItem: {},
    };
    this.edgeItems = {
      items: [],
      groups: [],
      itemToElements: {},
      elementToItem: {},
    };
    const timeline = new VTimeline(
      container,
      this.dataset,
      deepmerge(defaultTimelineOptions.timelineOptions, options.timelineOptions)
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
    nodes: NodeList<ND, ED>,
    edges: EdgeList<ED, ND>,
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
      this.options.getNodeClass as ItemGenerator<string, Item>,
      nodeStarts,
      nodeEnds
    );
    this.edgeItems = this._group(
      edges,
      this.options.edgeGroupIdFunction as IdFunction<Item>,
      this.options.edgeGroupContent as unknown as GroupFunction<ItemList>,
      this.options.edgeItemGenerator as ItemGenerator<DataItem, Item>,
      this.options.getEdgeClass as ItemGenerator<string, Item>,
      edgeStarts,
      edgeEnds
    );
    this.dataset.clear();
    this.dataset.add(this.edgeItems.items);
    this.dataset.add(this.nodeItems.items);

    const totalGroups = new Set(
      this.edgeItems.groups
        .map((g) => g.id)
        .concat(this.nodeItems.groups.map((g) => g.id))
    ).size;
    if (totalGroups > 1) {
      this.chart.setGroups([
        ...this.nodeItems.groups,
        ...this.edgeItems.groups,
      ]);
    } else {
      this.chart.setGroups();
    }
    this.applySelection();
  }

  protected onRangeChange() {
    const { scale } = this.getScale();
    if (scale === this.currentScale) {
      return;
    }
    this.emit(scaleChange, { scale, tooZoomed: false });
  }

  highlightNodes(nodes: NodeList<ND, ED> | Id[]) {
    this.resethighlight();
    const ids = "getId" in nodes ? nodes.getId() : nodes;
    this.chart.setSelection(ids);
  }

  resethighlight() {
    this.chart.setSelection([]);
  }

  onBarClick(evt: TimelineEventPropertiesResult) {
    const { x, y, item, event } = evt;
    if (!x || !y) return;
    const nodes = (item
      ? this.nodeItems.itemToElements[item]
      : undefined) as unknown as Node | undefined;
    const edges = (item
      ? this.edgeItems.itemToElements[item]
      : undefined) as unknown as Edge | undefined;

    this.selectedNodes.clear();
    this.selectedEdges.clear();
    nodes && this.selectedNodes.add(nodes.getId());
    edges && this.selectedEdges.add(edges.getId());
    this.emit(click, { nodes, edges, evt });
    this.emit(select, {
      evt: event as MouseEvent,
      nodes,
      edges,
    });
  }

  setOptions(options: Required<TimelineOptions<ND, ED>>) {
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
    itemClass: ItemGenerator<string, Item>,
    starts: number[],
    ends: number[]
  ): TimelineData {
    const items: DataItem[] = [];
    const ids = elements.getId();
    const isNode = elements.isNode;
    const prefix = isNode ? "node" : "edge";

    const itemToElements: Lookup<Item> = {};
    const elementToItem: Lookup<ItemId> = {};

    const groupIdToNode = ids.reduce(
      (groups, id, i) => {
        const element = elements.get(i);
        const groupid = idFunction(element);
        if (!groups[groupid]) {
          groups[groupid] = [];
        }
        groups[groupid].push(element);
        itemToElements[id] = element;
        elementToItem[i] = id;
        const content = itemGenerator(element, groupid);
        const customClass = itemClass(element, groupid);
        items.push({
          id,
          start: starts[i],
          end: ends[i],
          group: groupid,
          className: `timeline-item ${groupid} ${id} ${prefix} ${customClass}`,
          ...content,
        } as DataItem);
        return groups;
      },
      {} as Record<string, Item[]>
    );

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
  applySelection() {
    const ids = Array.from(this.selectedNodes.keys()).concat(
      Array.from(this.selectedEdges.keys())
    );
    this.chart.setSelection(ids);
  }
  getSelection() {
    const nodeIds: ItemId[] = [];
    const edgeIds: ItemId[] = [];

    this.chart.getSelection().forEach((id) => {
      if (this.edgeItems.itemToElements[id]) {
        edgeIds.push(this.edgeItems.itemToElements[id].getId());
      }
      if (this.nodeItems.itemToElements[id]) {
        nodeIds.push(this.nodeItems.itemToElements[id].getId());
      }
    });
    return {
      nodes: this.ogma.getNodes(nodeIds),
      edges: this.ogma.getEdges(edgeIds),
    };
  }

  filterNodes(
    selector: (a: number, b: number) => boolean,
    filteredNodes: Set<Id>
  ) {
    this._filter(selector, this.nodeItems, filteredNodes);
  }
  filterEdges(
    selector: (a: number, b: number) => boolean,
    filteredEdges: Set<Id>
  ) {
    this._filter(selector, this.edgeItems, filteredEdges);
  }
  private _filter(
    selector: (a: number, b: number) => boolean,
    timelineData: TimelineData,
    elementSet: Set<Id>
  ) {
    const items = timelineData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const id = item.id;
      const timelineItem = this.chart.itemSet.groups[item.group as string]
        ? this.chart.itemSet.groups[item.group as string].items[id]
        : this.chart.itemSet.items[id];
      if (!timelineItem) continue;
      const start = +item.start;
      const end = +item.end;
      const box = timelineItem.dom?.box;
      const line = timelineItem.dom?.line;
      const dot = timelineItem.dom?.dot;
      if (!selector(start, end)) {
        box && box.classList.add("vis-filtered");
        line && line.classList.add("vis-filtered");
        dot && dot.classList.add("vis-filtered");
        elementSet.add(id);
        continue;
      }
      box && box.classList.remove("vis-filtered");
      line && line.classList.remove("vis-filtered");
      dot && dot.classList.remove("vis-filtered");
    }
  }
}
