import Ogma, {
  Edge,
  EdgeId,
  EdgeList,
  Item,
  ItemList,
  NodeId,
  NodeList,
} from "@linkurious/ogma";
import {
  DataItem,
  Graph2d as VGraph2d,
  TimelineEventPropertiesResult,
  DataGroup,
  TimelineOptions,
} from "vis-timeline";
import { click, rangechanged, scaleChange, scales } from "./constants";
import {
  BarchartOptions,
  BarChartItem,
  Id,
  Lookup,
  ItemByScale,
  IdFunction,
  GroupFunction,
  ItemGenerator,
} from "./types";
import { Chart } from "./chart";
import { DataSet } from "vis-data";
import merge from "lodash.merge";

export const defaultBarchartOptions: BarchartOptions = {
  graph2dOptions: {
    style: "bar",
    height: "100%",
    barChart: { sideBySide: true },
  },
  nodeGroupIdFunction: () => `node-group`,
  edgeGroupIdFunction: () => `edge-group`,
  nodeGroupContent: (groupId: string) => groupId,
  edgeGroupContent: (groupId: string) => groupId,
  nodeItemGenerator: () => ({}),
  edgeItemGenerator: () => ({}),
};

export class Barchart extends Chart {
  private nodeItemsByScale: Lookup<ItemByScale>;
  private edgeItemsByScale: Lookup<ItemByScale>;
  private currentNodeData: ItemByScale;
  private currentEdgeData: ItemByScale;
  private options: BarchartOptions;
  private rects: SVGRectElement[];
  private groupDataset: DataSet<DataGroup>;

  /**
   * @param {HTMLDivElement} container
   * @param {Ogma} ogma
   * @param {TimelineOptions} options
   */
  constructor(container: HTMLDivElement, ogma: Ogma, options: BarchartOptions) {
    super(container, ogma);
    this.groupDataset = new DataSet<DataGroup>();
    const barchart = new VGraph2d(
      container,
      this.dataset,
      this.groupDataset,
      merge(defaultBarchartOptions.graph2dOptions, options.graph2dOptions)
    );
    this.options = options;
    this.chart = barchart;
    this.nodeItemsByScale = {};
    this.edgeItemsByScale = {};
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
    nodes: NodeList,
    edges: EdgeList,
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
    this.onRangeChange();
  }

  /**
   * Compute the groups depending on the chart zoom.
   * Above a certain zoom, switch to timeline mode
   */
  computeGroups(
    nodes: NodeList,
    edges: EdgeList,
    nodeStarts: number[],
    nodeEnds: number[],
    edgeStarts: number[],
    edgeEnds: number[]
  ) {
    this.nodeItemsByScale = this._group(
      nodes,
      this.options.nodeGroupIdFunction as IdFunction<Item>,
      this.options.nodeGroupContent as unknown as GroupFunction<ItemList>,
      this.options.nodeItemGenerator as ItemGenerator<BarChartItem, ItemList>,
      nodeStarts,
      nodeEnds
    );
    this.edgeItemsByScale = this._group(
      edges,
      this.options.edgeGroupIdFunction as IdFunction<Item>,
      this.options.edgeGroupContent as unknown as GroupFunction<ItemList>,
      this.options.edgeItemGenerator as ItemGenerator<BarChartItem, ItemList>,
      edgeStarts,
      edgeEnds
    );
  }

  highlightNodes(nodes: NodeList | Id[]) {
    this.resethighlight();
    const ids = "getId" in nodes ? nodes.getId() : nodes;

    ids.forEach((id) => {
      if (!this.rects[this.nodeToItem[id]]) return;
      this.rects[this.nodeToItem[id]].classList.add("hightlight");
    });
  }

  resethighlight() {
    this.rects.forEach((group) => group.classList.remove("hightlight"));
  }

  onBarClick(evt: TimelineEventPropertiesResult) {
    const { x, y, what } = evt;
    if (!x || !y || !this.rects.length || what === "background") return;
    const svg: SVGAElement | null = this.container.querySelector(
      ".vis-line-graph>svg"
    );
    if (!svg) return;
    const offset = +svg.style.left.slice(0, -2);
    const nodeIds = (
      this.rects
        .map((rect, i) => {
          const groupX = +(rect.getAttribute("x") as string) + offset;
          const groupW = +(rect.getAttribute("width") as string);
          return groupX < x && groupX + groupW > x
            ? {
                rect,
                nodeIds: this.itemToNodes[i],
              }
            : null;
        })
        .filter((e) => e) as { nodeIds: Id[]; rect: SVGRectElement }[]
    ).reduce((acc, { nodeIds }) => {
      acc.push(...nodeIds);
      return acc;
    }, [] as Id[]);
    this.emit(click, { nodeIds, evt });
  }

  protected onRangeChange() {
    const scale = this.getScale();
    if (scale === this.currentScale) {
      return;
    }
    this.currentScale = scale;
    // get the data depending on zoom
    const currentNodeData = this.nodeItemsByScale[scale];
    const currentEdgeData = this.edgeItemsByScale[scale];
    this.currentEdgeData = currentEdgeData;
    this.currentNodeData = currentNodeData;
    this.emit(scaleChange, { scale, tooZoomed: currentNodeData.tooZoomed });
    this.dataset.clear();
    this.groupDataset.clear();
    this.groupDataset.add(currentNodeData.groups);
    this.groupDataset.add(currentEdgeData.groups);

    this.dataset.add(currentNodeData.items as unknown as DataItem[]);
    this.dataset.add(currentEdgeData.items as unknown as DataItem[]);

    this.chart.redraw();
    if (!currentNodeData.tooZoomed) {
      this.emit(rangechanged);
    }
  }

  isTooZoomed(scale: number) {
    const tooZoomedNodes = this.nodeItemsByScale[scale]
      ? this.nodeItemsByScale[scale].tooZoomed
      : false;
    const tooZoomedEdges = this.nodeItemsByScale[scale]
      ? this.nodeItemsByScale[scale].tooZoomed
      : false;
    return tooZoomedEdges || tooZoomedNodes;
  }

  setOptions(options: BarchartOptions) {
    this.options = options;
    this.chart.setOptions(options.graph2dOptions as unknown as TimelineOptions);
  }

  protected registerEvents(): void {
    super.registerEvents();
    this.chart.on("click", (evt) => {
      console.log("click");
    });
    this.chart.on("select", (evt) => {
      console.log("select");
    });
  }

  private _group(
    elements: ItemList,
    idFunction: IdFunction<Item>,
    groupFunction: GroupFunction<ItemList>,
    itemGenerator: ItemGenerator<BarChartItem, ItemList>,
    starts: number[],
    ends: number[]
  ) {
    const ids = elements.getId();
    const isNode = elements.isNode;
    const prefix = isNode ? "node" : "edge";
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
    let tooZoomed = false;

    const groupIdToElementsArray = ids.reduce((groups, id, i) => {
      const groupid = `${prefix}-${idFunction(elements.get(i))}`;
      if (!groups[groupid]) {
        groups[groupid] = [];
      }
      groups[groupid].push(elements.get(i));
      return groups;
    }, {} as Record<string, Item[]>);
    const groupIdToElement = Object.entries(groupIdToElementsArray).reduce(
      (acc, [groupid, elements]) => {
        acc[groupid] = isNode
          ? this.ogma.getNodes(elements as unknown as NodeId[])
          : this.ogma.getEdges(elements as unknown as NodeId[]);
        return acc;
      },
      {} as Record<string, ItemList>
    );

    const groups: DataGroup[] = Object.entries(groupIdToElement).map(
      ([groupid, elements]) => ({
        id: groupid,
        content: groupFunction(groupid, elements),
        className: `vis-group ${groupid} ${prefix}`,
        options: {},
      })
    );
    return scales
      .slice()
      .reverse()
      .reduce((itemsByScale, scale, i, scales) => {
        // if we reached a zoom where there are not too many events,
        // just display timeline
        const gpPrev = itemsByScale[scales[i - 1]];
        if (tooZoomed) {
          itemsByScale[scale] = { ...gpPrev, tooZoomed: true };
          return itemsByScale;
        }
        const itemsPerGroup: Record<
          string,
          Record<number, BarChartItem>
        > = Object.keys(groupIdToElement).reduce((acc, groupid) => {
          acc[groupid] = {};
          return acc;
        }, {} as Record<string, Record<number, BarChartItem>>);

        let itemToElements: Lookup<ItemList> = {};
        const elementToItem: Lookup<NodeId | EdgeId> = {};
        const items: BarChartItem[] = [];
        Object.entries(groupIdToElement).forEach(([groupid, elements]) => {
          const itemsPerX = itemsPerGroup[groupid];
          elements.forEach((element, i) => {
            const index = Math.floor((starts[i] - min) / scale);
            const x = min + scale * index;
            if (!itemsPerX[x]) {
              itemsPerX[x] = {
                id: element.getId(),
                label: "",
                group: groupid,
                x,
                y: 0,
              };
            }
            // y is how many nodes there is within this group
            itemsPerX[x].y += 1;
          });
        });
        Object.values(itemsPerGroup).forEach((itemsPerX) => {
          Object.values(itemsPerX).forEach((item) => {
            items.push({
              ...item,
              ...itemGenerator(groupIdToElement[item.group]),
            });
          });
        });

        itemToElements = Object.entries(itemToElements)
          .sort(([a], [b]) => +a - +b)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .reduce((itemToNodes, [_, nodes], i) => {
            itemToElements[i] = nodes;
            nodes.forEach((n) => (elementToItem[n.getId()] = i));
            return itemToNodes;
          }, {} as Lookup<NodeList>);

        itemsByScale[scale] = {
          items,
          itemToElements,
          tooZoomed,
          groups,
          elementToItem,
        };
        // tell the next iteration if it should be on timeline or barchart mode
        tooZoomed =
          tooZoomed || items.reduce((maxY, g) => Math.max(maxY, g.y), 0) < 5;
        return itemsByScale;
      }, {} as Lookup<ItemByScale>);
  }
}

// _onBarClicked = ({ x, y }: { x: number, y: number }) => {
//   if (!x || !y || this.isSelecting) return;
//   this.isSelecting = true;
//   this.ogma.clearSelection();
//   const svg: SVGAElement| null = this.container.querySelector('.vis-line-graph>svg');
//   if(!svg) return;
//   const groups = [...svg.children];
//   groups.forEach(g => g.classList.remove('selected'));
//   const offset = +svg.style.left.slice(0, -2);
//   const nodeIdsToSelect = (groups
//     .map((g, i) => {
//       const groupX = +(g.getAttribute('x') as string) + offset;
//       const groupW = +(g.getAttribute('width') as string);
//       return groupX < x && groupX + groupW > x
//         ? {
//             group: g,
//             nodeIds: this.groupToNodes[i]
//           }
//         : null;
//     })
//     .filter(e => e)as ({ nodeIds: Id[], group: Element}[]))
//     .reduce((nodes, { group, nodeIds }) => {
//       nodes.push(...nodeIds);
//       group.classList.add('selected');
//       return nodes;
//     }, [] as Id[]);

//   const nodesToSelect = this.ogma.getNodes(nodeIdsToSelect).dedupe();
//   nodesToSelect.setSelected(true);
//   this.ogma.view
//     .moveToBounds(nodesToSelect.getBoundingBox())
//     .then(() => (this.isSelecting = false));
// };
