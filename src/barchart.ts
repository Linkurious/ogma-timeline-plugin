import Ogma, {
  EdgeId,
  EdgeList,
  Item,
  ItemId,
  ItemList,
  NodeId,
  NodeList,
} from "@linkurious/ogma";
import { deepmerge } from "deepmerge-ts";
import { DataSet } from "vis-data";
import {
  DataItem,
  Graph2d as VGraph2d,
  TimelineEventPropertiesResult,
  DataGroup,
  TimelineOptions,
  IdType,
} from "vis-timeline";
import { Chart, defaultChartOptions } from "./chart";
import { click, rangechanged, scaleChange, scales, select } from "./constants";
import {
  BarchartOptions,
  BarChartItem,
  Lookup,
  ItemByScale,
  IdFunction,
  GroupFunction,
  ItemGenerator,
  Id,
  TimeToIds,
} from "./types";

export const defaultBarchartOptions: Required<BarchartOptions> = {
  graph2dOptions: {
    style: "bar",
    height: "100%",
    barChart: { sideBySide: true },
    autoResize: false,
  },
  ...defaultChartOptions,
};
export class Barchart<ND = unknown, ED = unknown> extends Chart<
  ND,
  ED,
  VGraph2d
> {
  private nodeItemsByScale: Lookup<ItemByScale>;
  private edgeItemsByScale: Lookup<ItemByScale>;
  private currentNodeData: ItemByScale;
  private currentEdgeData: ItemByScale;
  private isTooZoomedByScale: Lookup<boolean>;
  private options: Required<BarchartOptions<ND, ED>>;
  private rects: SVGRectElement[];
  private nodeRects: Record<string, SVGRectElement[]>;
  private nodeGroups: IdType[];
  private edgeGroups: IdType[];
  private nodePoints: Record<string, SVGRectElement[]>;
  private edgeRects: Record<string, SVGRectElement[]>;
  private edgePoints: Record<string, SVGRectElement[]>;
  private groupDataset: DataSet<DataGroup>;

  /**
   * @param {HTMLDivElement} container
   * @param {Ogma} ogma
   * @param {TimelineOptions} options
   */
  constructor(
    container: HTMLDivElement,
    ogma: Ogma<ND, ED>,
    options: Required<BarchartOptions<ND, ED>>,
    selectedNodes: Set<Id>,
    selectedEdges: Set<Id>
  ) {
    super(container, ogma, selectedNodes, selectedEdges);
    this.groupDataset = new DataSet<DataGroup>();
    const barchart = new VGraph2d(
      container,
      this.dataset,
      this.groupDataset,
      deepmerge(defaultBarchartOptions.graph2dOptions, options.graph2dOptions)
    );
    this.options = options;
    this.chart = barchart;
    this.nodeItemsByScale = {};
    this.edgeItemsByScale = {};
    this.isTooZoomedByScale = {};
    this.currentNodeData = {
      items: [],
      itemToElements: {},
      timeToIds: new Map() as TimeToIds,
      groups: [],
      tooZoomed: false,
      maxY: 0,
    };
    this.currentEdgeData = {
      items: [],
      itemToElements: {},
      timeToIds: new Map() as TimeToIds,
      groups: [],
      tooZoomed: false,
      maxY: 0,
    };
    this.isChangingRange = false;
    this.nodeRects = {};
    this.nodePoints = {};
    this.edgeRects = {};
    this.edgePoints = {};
    this.nodeGroups = [];
    this.edgeGroups = [];
    this.rects = [];
    this.chart.on("click", (e) => {
      this.onBarClick(e);
    });
    this.chart.on("rangechanged", () => {
      this.rects = Array.from(
        this.container.querySelectorAll(".vis-line-graph>svg>rect")
      ) as SVGRectElement[];
      this.nodeRects = this.nodeGroups.reduce(
        (acc, group) => {
          acc[group] = Array.from(
            this.container.querySelectorAll(
              `.vis-line-graph>svg>rect.node.vis-bar.${group}`
            )
          ) as SVGRectElement[];
          return acc;
        },
        {} as Record<string, SVGRectElement[]>
      );
      this.nodePoints = this.nodeGroups.reduce(
        (acc, group) => {
          acc[group] = Array.from(
            this.container.querySelectorAll(
              `.vis-line-graph>svg>rect.node.vis-point.${group}`
            )
          ) as SVGRectElement[];
          return acc;
        },
        {} as Record<string, SVGRectElement[]>
      );
      this.edgeRects = this.edgeGroups.reduce(
        (acc, group) => {
          acc[group] = Array.from(
            this.container.querySelectorAll(
              `.vis-line-graph>svg>rect.edge.vis-bar.${group}`
            )
          ) as SVGRectElement[];
          return acc;
        },
        {} as Record<string, SVGRectElement[]>
      );
      this.edgePoints = this.edgeGroups.reduce(
        (acc, group) => {
          acc[group] = Array.from(
            this.container.querySelectorAll(
              `.vis-line-graph>svg>rect.edge.vis-point.${group}`
            )
          ) as SVGRectElement[];
          return acc;
        },
        {} as Record<string, SVGRectElement[]>
      );
      this.applySelection();
    });
    super.registerEvents();
  }

  public refresh(
    nodes: NodeList<ND, ED>,
    edges: EdgeList<ED, ND>,
    nodeStarts: number[],
    nodeEnds: number[],
    edgeStarts: number[],
    edgeEnds: number[]
  ): void {
    this.computeGroups(
      nodes,
      edges,
      nodeStarts,
      nodeEnds,
      edgeStarts,
      edgeEnds
    );
    this.onRangeChange(true);
  }

  /**
   * Compute the groups depending on the chart zoom.
   * Above a certain zoom, switch to timeline mode
   */
  computeGroups(
    nodes: NodeList<ND, ED>,
    edges: EdgeList<ED, ND>,
    nodeStarts: number[],
    nodeEnds: number[],
    edgeStarts: number[],
    edgeEnds: number[]
  ) {
    const nodeGroups = this._group(
      nodes,
      this.options.nodeGroupIdFunction as unknown as IdFunction<Item>,
      this.options.nodeGroupContent as unknown as GroupFunction<ItemList>,
      this.options.nodeItemGenerator as ItemGenerator<BarChartItem, ItemList>,
      this.options.getNodeClass as ItemGenerator<string, ItemList>,
      nodeStarts,
      nodeEnds
    );
    this.nodeItemsByScale = nodeGroups.itemsByScale;
    this.nodeGroups = nodeGroups.groups.map((g) => g.id);
    const edgeGroups = this._group(
      edges,
      this.options.edgeGroupIdFunction as unknown as IdFunction<Item>,
      this.options.edgeGroupContent as unknown as GroupFunction<ItemList>,
      this.options.edgeItemGenerator as ItemGenerator<BarChartItem, ItemList>,
      this.options.getEdgeClass as ItemGenerator<string, ItemList>,
      edgeStarts,
      edgeEnds
    );
    this.edgeItemsByScale = edgeGroups.itemsByScale;
    this.edgeGroups = edgeGroups.groups.map((g) => g.id);
    this.isTooZoomedByScale = Object.keys(this.nodeItemsByScale).reduce(
      (acc, scale) => {
        let max = -Infinity;
        let heightAtIndex = this.nodeItemsByScale[scale].items.reduce(
          (acc, item) => {
            const index = Math.floor(item.x / +scale);
            if (!acc[index]) acc[index] = 0;
            acc[index] += item.y;
            max = Math.max(max, acc[index]);
            return acc;
          },
          {} as Lookup<number>
        );
        heightAtIndex = this.edgeItemsByScale[scale].items.reduce(
          (acc, item) => {
            const index = Math.floor(item.x / +scale);
            if (!acc[index]) acc[index] = 0;
            acc[index] += item.y;
            max = Math.max(max, acc[index]);
            return acc;
          },
          heightAtIndex
        );
        acc[scale] =
          Object.values(heightAtIndex).reduce((max, h) => Math.max(max, h), 0) <
          5;
        return acc;
      },
      {} as Lookup<boolean>
    );
  }

  onBarClick(evt: TimelineEventPropertiesResult) {
    const { x, y, event } = evt;
    if (!x || !y || !this.rects.length) return;
    const svg: SVGAElement | null = this.container.querySelector(
      ".vis-line-graph>svg"
    );
    if (!svg) return;
    const edgeIds = this._getIdsAt(
      x,
      y,
      this.edgeGroups,
      this.edgeRects,
      this.edgePoints,
      this.currentEdgeData.timeToIds
    );
    const edges = this.ogma.getEdges(edgeIds);
    const nodeIds = this._getIdsAt(
      x,
      y,
      this.nodeGroups,
      this.nodeRects,
      this.nodePoints,
      this.currentNodeData.timeToIds
    );
    const nodes = this.ogma.getNodes(nodeIds);
    this.selectedNodes.clear();
    this.selectedEdges.clear();
    nodeIds.forEach((id) => this.selectedNodes.add(id));
    edgeIds.forEach((id) => this.selectedEdges.add(id));
    this.emit(click, { nodes, edges, evt });
    this.emit(select, { nodes, edges, evt: event as MouseEvent });
  }

  protected onRangeChange(force = false) {
    const { scale } = this.getScale();
    if (
      (!force && scale === this.currentScale) ||
      !this.nodeItemsByScale[scale]
    ) {
      return;
    }
    // prevent from too much movement on zoom out
    const currentBarsCount =
      this.currentEdgeData.items.length + this.currentNodeData.items.length;
    if (
      scale > this.currentScale &&
      currentBarsCount < 5 &&
      currentBarsCount > 0 &&
      this.nodeItemsByScale[scale].items.length +
        this.nodeItemsByScale[scale].items.length <
        5
    ) {
      return;
    }
    this.currentScale = scale;
    // get the data depending on zoom
    const currentNodeData = this.nodeItemsByScale[scale];
    const currentEdgeData = this.edgeItemsByScale[scale];
    this.currentEdgeData = currentEdgeData;
    this.currentNodeData = currentNodeData;
    this.dataset.clear();
    this.groupDataset.clear();
    this.groupDataset.add([
      ...currentNodeData.groups,
      ...currentEdgeData.groups,
    ]);
    this.dataset.add([
      ...currentNodeData.items,
      ...currentEdgeData.items,
    ] as unknown as DataItem[]);
    this.redraw();
    this.emit(scaleChange, { scale, tooZoomed: this.isTooZoomed(scale) });
    if (!currentNodeData.tooZoomed) {
      this.emit(rangechanged);
    }
  }

  isTooZoomed(scale: number) {
    return this.isTooZoomedByScale[scale] !== undefined
      ? this.isTooZoomedByScale[scale]
      : true;
  }

  setOptions(options: Required<BarchartOptions<ND, ED>>) {
    this.options = options;
    this.chart.setOptions(options.graph2dOptions as unknown as TimelineOptions);
  }

  protected registerEvents(): void {
    super.registerEvents();
  }

  private _group(
    elements: ItemList,
    idFunction: IdFunction<Item>,
    groupFunction: GroupFunction<ItemList>,
    itemGenerator: ItemGenerator<BarChartItem, ItemList>,
    getClass: ItemGenerator<string, ItemList>,
    starts: number[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ends: number[]
  ) {
    const ids = elements.getId();
    const isNode = elements.isNode;
    const prefix = isNode ? "node" : "edge";
    let tooZoomed = false;
    const idToIndex: Record<ItemId, number> = {};
    const groupIdToElementsArray = ids.reduce(
      (groups, id, i) => {
        const groupid = `${idFunction(elements.get(i))}`;
        if (!groups[groupid]) {
          groups[groupid] = [];
        }
        groups[groupid].push(elements.get(i));
        idToIndex[id] = i;
        return groups;
      },
      {} as Record<string, Item[]>
    );
    const groupIdToElement = Object.entries(groupIdToElementsArray).reduce(
      (acc, [groupid, elements]) => {
        acc[groupid] = isNode
          ? this.ogma.getNodes(elements as unknown as NodeId[])
          : this.ogma.getEdges(elements as unknown as EdgeId[]);
        return acc;
      },
      {} as Record<string, ItemList>
    );

    const groups: DataGroup[] = Object.entries(groupIdToElement).map(
      ([groupid, elements]) => ({
        id: groupid,
        content: groupFunction(groupid, elements),
        className: `vis-group ${groupid} ${prefix} ${getClass(elements, groupid)}`,
        options: {},
      })
    );

    const itemsByScale = scales
      .slice()
      .reverse()
      .reduce((itemsByScale, { millis, round }, i, scales) => {
        // if we reached a zoom where there are not too many events,
        // just display timeline
        const gpPrev = i > 0 ? itemsByScale[scales[i - 1].millis] : undefined;
        if (gpPrev && tooZoomed) {
          itemsByScale[millis] = { ...gpPrev, tooZoomed: true };
          return itemsByScale;
        }
        const itemsPerGroup: Record<
          string,
          Record<number, BarChartItem>
        > = Object.keys(groupIdToElement).reduce(
          (acc, groupid) => {
            acc[groupid] = {};
            return acc;
          },
          {} as Record<string, Record<number, BarChartItem>>
        );

        let itemToElements: Lookup<ItemList> = {};
        const timeToIds: Map<number, Map<string, ItemId[]>> = new Map();
        const items: BarChartItem[] = [];
        Object.entries(groupIdToElement).forEach(([groupid, elements]) => {
          const ids = elements.getId();
          const itemsPerX = itemsPerGroup[groupid];
          elements.forEach((element, i) => {
            const d = starts[idToIndex[ids[i]]];
            const x = round
              ? round(new Date(d))
              : millis * Math.floor(d / millis);
            if (!itemsPerX[x]) {
              itemsPerX[x] = {
                ids: [],
                label: "",
                group: groupid,
                x,
                y: 0,
              };
            }
            // y is how many nodes there is within this group
            itemsPerX[x].y += 1;
            itemsPerX[x].ids.push(ids[i]);
          });
        });
        Object.entries(itemsPerGroup).forEach(([groupId, itemsPerX]) => {
          Object.values(itemsPerX).forEach((item) => {
            items.push({
              ...item,
              ...itemGenerator(groupIdToElement[item.group], groupId),
            });
          });
        });

        itemToElements = items
          .sort((a, b) => a.x - b.x)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .reduce((itemToElements, { ids, x, group }, i) => {
            itemToElements[i] = isNode
              ? this.ogma.getNodes(ids)
              : this.ogma.getEdges(ids);
            const groupToIds = timeToIds.get(x) || new Map<string, ItemId[]>();
            groupToIds.set(group, ids);
            timeToIds.set(x, groupToIds);
            return itemToElements;
          }, {} as Lookup<ItemList>);

        const maxY = items.reduce((maxY, g) => Math.max(maxY, g.y), 0);
        itemsByScale[millis] = {
          items,
          itemToElements,
          tooZoomed,
          groups,
          maxY,
          timeToIds,
        };
        // tell the next iteration if it should be on timeline or barchart mode
        tooZoomed = false; //tooZoomed || maxY < 5;
        return itemsByScale;
      }, {} as Lookup<ItemByScale>);
    return {
      itemsByScale,
      groups,
    };
  }
  applySelection() {
    let edgeIndex = 0;
    let nodeIndex = 0;
    const isLine = this.options.graph2dOptions.style === "line";
    const { itemToElements: itemToNodes } = this.currentNodeData;
    const { itemToElements: itemToEdges } = this.currentEdgeData;
    this.rects.forEach((rect) => {
      const isNode = rect.classList.contains("node");
      const isEdge = rect.classList.contains("edge");
      if (isNode) {
        if (
          itemToNodes[nodeIndex] &&
          itemToNodes[nodeIndex]
            .getId()
            .some((id) => this.selectedNodes.has(id))
        ) {
          rect.classList.add("vis-selected");
        } else {
          rect.classList.remove("vis-selected");
        }
      }
      if (isEdge) {
        if (
          itemToEdges[edgeIndex] &&
          itemToEdges[edgeIndex]
            .getId()
            .some((id) => this.selectedEdges.has(id))
        ) {
          rect.classList.add("vis-selected");
        } else {
          rect.classList.remove("vis-selected");
        }
      }
      if (isLine || !rect.classList.contains("vis-point")) {
        if (isNode) nodeIndex++;
        if (isEdge) edgeIndex++;
      }
    });
  }
  getSelection() {
    let nodeIndex = 0;
    let edgeIndex = 0;
    const selectedNodes: ItemId[] = [];
    const selectedEdges: ItemId[] = [];
    const isLine = this.options.graph2dOptions.style === "line";
    this.rects.forEach((rect) => {
      const isNode = rect.classList.contains("node");
      const isEdge = rect.classList.contains("edge");
      if (isLine || !rect.classList.contains("vis-point")) {
        if (isNode) nodeIndex++;
        if (isEdge) edgeIndex++;
      }
      if (!rect.classList.contains("vis-selected")) return;
      if (isNode) {
        selectedNodes.push(...this.currentNodeData.items[nodeIndex - 1].ids);
      }
      if (isEdge) {
        selectedEdges.push(...this.currentEdgeData.items[edgeIndex - 1].ids);
      }
    });
    return {
      nodes: this.ogma.getNodes(selectedNodes),
      edges: this.ogma.getEdges(selectedEdges),
    };
  }

  filterNodes(
    selector: (a: number, b: number) => boolean,
    filteredNodes: Set<Id>
  ) {
    this._filter(
      selector,
      this.nodeGroups,
      this.nodeRects,
      this.nodePoints,
      this.currentNodeData.timeToIds,
      filteredNodes
    );
  }
  filterEdges(
    selector: (a: number, b: number) => boolean,
    filteredEdges: Set<Id>
  ) {
    this._filter(
      selector,
      this.edgeGroups,
      this.edgeRects,
      this.edgePoints,
      this.currentEdgeData.timeToIds,
      filteredEdges
    );
  }

  private _getOffsets() {
    const svg = this.container.querySelector(
      ".vis-line-graph>svg"
    ) as SVGElement;
    return {
      x: Number((svg && svg.style?.left.slice(0, -2)) || 0),
      y: Number((svg && svg.style?.top.slice(0, -2)) || 0),
    };
  }

  private _filter(
    selector: (a: number, b: number) => boolean,
    elementGroups: IdType[],
    rectsByGroup: Record<string, SVGRectElement[]>,
    pointsByGroup: Record<string, SVGRectElement[]>,
    timeToIds: TimeToIds,
    filteredElements: Set<Id>
  ) {
    const groups = this.chart.linegraph.groups;
    const left = this._getOffsets().x;
    elementGroups.forEach((groupId) => {
      const itemsData = groups[groupId].itemsData;
      const rects = rectsByGroup[groupId] || [];
      const points = pointsByGroup[groupId] || [];
      let offset = 0;
      itemsData.forEach((item, i) => {
        const screen_x = item.screen_x;
        const x = Number(item.x);
        if (isNaN(screen_x)) {
          offset--;
          return;
        }
        if (screen_x + left < 0) {
          return;
        }
        const rect = rects[i + offset];
        const point = points[i + offset];
        if (selector(x, x)) {
          rect && rect.classList.remove("vis-filtered");
          point && point.classList.remove("vis-filtered");
        } else {
          timeToIds
            .get(x)
            ?.get(groupId)
            .forEach((id) => filteredElements.delete(id));
          rect && rect.classList.add("vis-filtered");
          point && point.classList.add("vis-filtered");
        }
      });
    });
  }
  private _getIdsAt(
    x: number,
    y: number,
    elementGroups: IdType[],
    rectsByGroup: Record<string, SVGRectElement[]>,
    pointsByGroup: Record<string, SVGRectElement[]>,
    timeToIds: TimeToIds
  ) {
    const ids = new Set<IdType>();
    const svgOffset = this._getOffsets();
    const groups = this.chart.linegraph.groups;
    elementGroups.forEach((groupId) => {
      const itemsData = groups[groupId].itemsData;
      const rects = rectsByGroup[groupId] || [];
      const points = pointsByGroup[groupId] || [];
      let offset = 0;
      itemsData.forEach((item, i) => {
        const screen_x = item.screen_x;
        if (isNaN(screen_x)) {
          offset--;
          return;
        }
        const time = Number(item.x);
        if (screen_x + svgOffset.x < 0) {
          return;
        }
        const rect = rects[i + offset];
        if (!rect) return;
        const point = points[i + offset];
        const groupX = +(rect.getAttribute("x") as string) + svgOffset.x;
        const groupH = +(rect.getAttribute("height") as string);
        const groupY = +(rect.getAttribute("y") as string) + svgOffset.y;
        const groupW = +(rect.getAttribute("width") as string);

        if (
          x < groupX ||
          x > groupX + groupW ||
          y < groupY ||
          y > groupY + groupH
        ) {
          rect.classList.remove("vis-selected");
          point && point.classList.remove("vis-selected");
          return;
        }
        timeToIds
          .get(time)
          ?.get(groupId)
          ?.forEach((id) => ids.add(id));
        rect.classList.add("vis-selected");
        point && point.classList.add("vis-selected");
      });
    });
    return Array.from(ids);
  }
}
