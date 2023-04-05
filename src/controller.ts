import Ogma, { NodeList, NodeId, EdgeList } from "@linkurious/ogma";
import EventEmitter from "eventemitter3";
import throttle from "lodash.throttle";
import merge from "lodash.merge";

import { rangechange, scaleChange, timechange, timechanged } from "./constants";
import { getSelector } from "./selector";
import { Timeline, defaultTimelineOptions } from "./timeline";
import { Barchart, defaultBarchartOptions } from "./barchart";
import "vis-timeline/styles/vis-timeline-graph2d.css";
import "./style.css";
import {
  ControlerEvents,
  DeepPartial,
  Id,
  Options,
  TimebarOptions,
  TimelineMode,
} from "./types";
import { TimelineAnimationOptions } from "vis-timeline";

export const defaultOptions: Partial<Options> = {
  nodeStartPath: "start",
  nodeEndPath: "end",
  edgeStartPath: "start",
  edgeEndPath: "end",
  filter: {
    enabled: true,
    strategy: "between",
    tolerance: "loose",
  },
  switchOnZoom: true,
  timeBars: [],
  barchart: defaultBarchartOptions,
  timeline: defaultTimelineOptions,
};
export class Controller<
  ND = unknown,
  ED = unknown
> extends EventEmitter<ControlerEvents> {
  private mode: TimelineMode;
  public timeline: Timeline;
  public nodes: NodeList;
  public edges: EdgeList;
  public barchart: Barchart;
  public filteredNodes: Set<Id>;
  private options: Options;
  private container: HTMLDivElement;
  private nodeStarts: number[];
  private nodeEnds: number[];
  private edgeStarts: number[];
  private edgeEnds: number[];

  constructor(
    ogma: Ogma<ND, ED>,
    container: HTMLDivElement,
    options: DeepPartial<Options> = {}
  ) {
    super();
    this.mode = "barchart";
    this.options = merge(defaultOptions, options) as Options;
    this.filteredNodes = new Set();
    this.nodes = ogma.createNodeList();
    this.edges = ogma.createEdgeList();
    this.nodeStarts = [];
    this.nodeEnds = [];
    this.edgeStarts = [];
    this.edgeEnds = [];
    const timelineContainer = document.createElement("div");
    timelineContainer.classList.add("timeline-container");
    const barchartContainer = document.createElement("div");
    barchartContainer.classList.add("barchart-container");
    container.appendChild(timelineContainer);
    container.appendChild(barchartContainer);
    this.container = container;
    const timeline = new Timeline(
      timelineContainer,
      ogma,
      this.options.timeline
    );
    const barchart = new Barchart(
      barchartContainer,
      ogma,
      this.options.barchart
    );
    this.timeline = timeline;
    this.barchart = barchart;

    this.showTimeline();
    //switch from barchart to timeline on zoom
    this.barchart.on(scaleChange, ({ tooZoomed }) => {
      if (!tooZoomed || !this.options.switchOnZoom) return;
      this.showTimeline();
    });
    //switch from timeline to barchart on zoom
    this.timeline.on(scaleChange, ({ scale }) => {
      if (barchart.isTooZoomed(scale) || !this.options.switchOnZoom) return;
      this.showBarchart();
    });

    // update the list of filtered nodes
    const throttled = throttle(() => this.onTimeChange(), 50);
    this.barchart.on(timechange, () => {
      throttled();
    });
    this.timeline.on(timechange, () => {
      throttled();
    });
    this.barchart.on(timechanged, () => {
      throttled();
    });
    this.timeline.on(timechanged, () => {
      throttled();
    });
    this.barchart.on(rangechange, () => {
      throttled();
    });
    this.timeline.on(rangechange, () => {
      throttled();
    });
    const nodes = ogma.getNodes();
    const edges = ogma.getEdges();

    this.options.timeBars
      .sort(
        (a, b) =>
          +((a as { date: Date }).date || a) - +((b as { date: Date }) || b)
      )
      .forEach((timeBar) => {
        this.timeline.addTimeBar(timeBar);
        this.barchart.addTimeBar(timeBar);
      });

    this.refresh(nodes, edges);
    this.setWindow(
      this.options.start ||
        Math.min(
          this.nodeStarts.reduce((min, s) => Math.min(min, s), Infinity),
          this.edgeStarts.reduce((min, s) => Math.min(min, s), Infinity)
        ),
      this.options.end ||
        Math.max(
          this.nodeStarts.reduce((max, s) => Math.max(max, s), -Infinity),
          this.edgeStarts.reduce((max, s) => Math.max(max, s), -Infinity)
        ),
      { animation: false }
    );

    ogma.events.on("destroy", () => {
      this.destroy();
    });
  }

  refresh(nodes: NodeList<ND, ED>, edges: EdgeList<ED, ND>) {
    this.nodes = nodes;
    this.edges = edges;
    this.nodeStarts = nodes.getData(this.options.nodeStartPath);
    this.nodeEnds = nodes.getData(this.options.nodeEndPath);
    this.edgeStarts = edges.getData(this.options.edgeStartPath);
    this.edgeEnds = edges.getData(this.options.edgeEndPath);
    this.timeline.refresh(this.nodes.getId(), this.nodeStarts, this.nodeEnds);
    this.barchart.refresh(
      nodes,
      edges,
      this.nodeStarts,
      this.nodeEnds,
      this.edgeStarts,
      this.edgeEnds
    );
    if (!this.options.filter.enabled) {
      this.filteredNodes.clear();
      // TODO
      // for (let i = 0; i < this.ids.length; i++)
      // this.filteredNodes.add(this.ids[i]);
    }
    this.onTimeChange();
  }

  showTimeline() {
    const { start, end } = this.barchart.getWindow();
    this.timeline.chart.setWindow(+start, +end, { animation: false });
    this.timeline.setTimebars(this.barchart.getTimebars());
    this.barchart.container.style.display = "none";
    this.timeline.container.style.display = "";
    this.mode = "timeline";
    this.timeline.visible = true;
    this.barchart.visible = false;
  }

  showBarchart() {
    const { start, end } = this.timeline.getWindow();
    this.barchart.chart.setWindow(+start, +end, { animation: false });
    this.barchart.setTimebars(this.timeline.getTimebars());
    this.barchart.container.style.display = "";
    this.timeline.container.style.display = "none";
    this.mode = "barchart";
    this.timeline.visible = false;
    this.barchart.visible = true;
  }

  addTimeBar(timebar: TimebarOptions): void {
    this.timeline.addTimeBar(timebar);
    this.barchart.addTimeBar(timebar);
  }
  removeTimeBar(index: number) {
    this.timeline.removeTimeBar(index);
    this.barchart.removeTimeBar(index);
  }

  getTimebars() {
    return this.mode === "timeline"
      ? this.timeline.getTimebars()
      : this.barchart.getTimebars();
  }
  setTimebars(timebars: TimebarOptions[]) {
    this.timeline.setTimebars(timebars);
    this.barchart.setTimebars(timebars);
  }

  setWindow(
    start: number | Date,
    end: number | Date,
    options?: TimelineAnimationOptions
  ) {
    if (this.mode === "timeline") {
      this.timeline.setWindow(start, end, options);
    } else {
      this.barchart.setWindow(start, end, options);
    }
    this.onTimeChange();
  }

  onTimeChange() {
    if (!this.options.filter.enabled) return this.emit(timechange);
    const times = (
      this.mode === "timeline"
        ? this.timeline.getTimebars()
        : this.barchart.getTimebars()
    )
      .map(({ date }) => +date)
      .sort((a, b) => a - b);
    const selector = getSelector(
      times,
      this.options.filter.strategy,
      this.options.filter.tolerance
    );
    this.filteredNodes.clear();
    // TODO
    // for (let i = 0; i < this.ids.length; i++) {
    //   // TODO node start node end edge start edge end
    //   if (selector(this.nodeStarts[i], this.nodeEnds[i])) {
    //     this.filteredNodes.add(this.ids[i]);
    //   }
    // }
    return this.emit(timechange);
  }

  setOptions(options: DeepPartial<Options>) {
    const mode = this.mode;
    this.options = merge(this.options, options) as Options;
    this.timeline.setOptions(this.options.timeline);
    this.barchart.setOptions(this.options.barchart);
    this.refresh(this.nodes, this.edges);
    const wd =
      this.mode === "timeline"
        ? this.timeline.getWindow()
        : this.barchart.getWindow();
    this.setWindow(this.options.start || wd.start, this.options.end || wd.end, {
      animation: false,
    });
    if (mode === "timeline") this.showTimeline();
    else this.showBarchart();
  }

  destroy() {
    this.timeline.destroy();
    this.barchart.destroy();
    [...this.container.children].forEach((c) => c.remove());
    this.removeAllListeners();
  }
}
