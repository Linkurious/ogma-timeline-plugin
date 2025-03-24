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
export class Barchart<ND = unknown, ED = unknown> extends Chart<ND, ED> {
  private nodeItemsByScale: Lookup<ItemByScale>;
  private edgeItemsByScale: Lookup<ItemByScale>;
  private currentNodeData: ItemByScale;
  private currentEdgeData: ItemByScale;
  private isTooZoomedByScale: Lookup<boolean>;
  private options: Required<BarchartOptions<ND, ED>>;
  private rects: SVGRectElement[];
  private groupDataset: DataSet<DataGroup>;

  /**
   * @param {HTMLDivElement} container
   * @param {Ogma} ogma
   * @param {TimelineOptions} options
   */
  constructor(
    container: HTMLDivElement,
    ogma: Ogma<ND, ED>,
    options: Required<BarchartOptions<ND, ED>>
  ) {
    super(container, ogma);
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
      elementToItem: {},
      groups: [],
      tooZoomed: false,
      maxY: 0,
    };
    this.currentEdgeData = {
      items: [],
      itemToElements: {},
      elementToItem: {},
      groups: [],
      tooZoomed: false,
      maxY: 0,
    };
    this.isChangingRange = false;
    this.rects = [];
    this.chart.on("click", (e) => {
      this.onBarClick(e);
    });
    this.chart.on("rangechanged", () => {
      this.rects = Array.from(
        this.container.querySelectorAll(".vis-line-graph>svg>rect")
      ) as SVGRectElement[];
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
    this.nodeItemsByScale = this._group(
      nodes,
      this.options.nodeGroupIdFunction as unknown as IdFunction<Item>,
      this.options.nodeGroupContent as unknown as GroupFunction<ItemList>,
      this.options.nodeItemGenerator as ItemGenerator<BarChartItem, ItemList>,
      this.options.getNodeClass as ItemGenerator<string, ItemList>,
      nodeStarts,
      nodeEnds
    );
    this.edgeItemsByScale = this._group(
      edges,
      this.options.edgeGroupIdFunction as unknown as IdFunction<Item>,
      this.options.edgeGroupContent as unknown as GroupFunction<ItemList>,
      this.options.edgeItemGenerator as ItemGenerator<BarChartItem, ItemList>,
      this.options.getEdgeClass as ItemGenerator<string, ItemList>,
      edgeStarts,
      edgeEnds
    );
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
    const offsetX = +svg.style.left.slice(0, -2);
    const offsetY = +svg.style.top.slice(0, -2);

    let edgeIndex = 0;
    let nodeIndex = 0;
    const isLine = this.options.graph2dOptions.style === "line";
    const { nodes, edges } = (
      this.rects
        .map((rect) => {
          const groupX = +(rect.getAttribute("x") as string) + offsetX;
          const groupH = +(rect.getAttribute("height") as string);
          const groupY = +(rect.getAttribute("y") as string) + offsetY;
          const groupW = +(rect.getAttribute("width") as string);
          const isNode = rect.classList.contains("node");
          const isEdge = rect.classList.contains("edge");
          if (isLine || !rect.classList.contains("vis-point")) {
            if (isNode) nodeIndex++;
            if (isEdge) edgeIndex++;
          }
          if (
            groupX >= x ||
            groupX + groupW <= x ||
            groupY >= y ||
            groupY + groupH <= y
          ) {
            rect.classList.remove("vis-selected");
            return null;
          }
          rect.classList.add("vis-selected");
          return {
            rect,
            nodeIndex,
            edgeIndex,
            nodes: isNode
              ? this.ogma.getNodes(
                  this.currentNodeData.items[nodeIndex - 1].ids
                )
              : undefined,
            edges: isEdge
              ? this.ogma.getEdges(
                  this.currentEdgeData.items[edgeIndex - 1].ids
                )
              : undefined,
          };
        })
        .filter((e) => e) as {
        nodes?: NodeList;
        edges?: EdgeList;
        rect: SVGRectElement;
      }[]
    ).reduce(
      (acc, { nodes, edges }) => {
        if (nodes || edges) return { nodes, edges };
        return acc;
      },
      { nodes: undefined, edges: undefined } as {
        nodes?: NodeList;
        edges?: EdgeList;
      }
    );
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
    this.emit(scaleChange, { scale, tooZoomed: this.isTooZoomed(scale) });
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

    this.chart.redraw();
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
    return scales
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
        const elementToItem: Lookup<NodeId | EdgeId> = {};
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
          .reduce((itemToElements, { ids }, i) => {
            itemToElements[i] = isNode
              ? this.ogma.getNodes(ids)
              : this.ogma.getEdges(ids);
            ids.forEach((id) => (elementToItem[id] = i));
            return itemToElements;
          }, {} as Lookup<ItemList>);

        const maxY = items.reduce((maxY, g) => Math.max(maxY, g.y), 0);
        itemsByScale[millis] = {
          items,
          itemToElements,
          tooZoomed,
          groups,
          maxY,
          elementToItem,
        };
        // tell the next iteration if it should be on timeline or barchart mode
        tooZoomed = false; //tooZoomed || maxY < 5;
        return itemsByScale;
      }, {} as Lookup<ItemByScale>);
  }
  setSelection({
    nodes,
    edges,
  }: {
    nodes?: NodeList<ND, ED>;
    edges?: EdgeList<ED, ND>;
  }) {
    const nodeIds = (nodes ? nodes.getId() : []).reduce(
      (acc, id) => {
        acc[id] = true;
        return acc;
      },
      {} as Record<NodeId, boolean>
    );
    const edgeIds = (edges ? edges.getId() : []).reduce(
      (acc, id) => {
        acc[id] = true;
        return acc;
      },
      {} as Record<EdgeId, boolean>
    );
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
          itemToNodes[nodeIndex].getId().some((id) => nodeIds[id])
        ) {
          rect.classList.add("vis-selected");
        } else {
          rect.classList.remove("vis-selected");
        }
      }
      if (isEdge) {
        if (
          itemToEdges[edgeIndex] &&
          itemToEdges[edgeIndex].getId().some((id) => edgeIds[id])
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
}
