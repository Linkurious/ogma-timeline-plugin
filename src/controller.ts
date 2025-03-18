import Ogma, { NodeList, EdgeList } from "@linkurious/ogma";
import { deepmerge } from "deepmerge-ts";
import EventEmitter from "eventemitter3";
// eslint-disable-next-line depend/ban-dependencies
import throttle from "lodash.throttle";

import { TimelineAnimationOptions } from "vis-timeline";
import { Barchart, defaultBarchartOptions } from "./barchart";
import {
  rangechange,
  scaleChange,
  select,
  timechange,
  timechanged,
} from "./constants";
import { getSelector } from "./selector";
import { Timeline, defaultTimelineOptions } from "./timeline";
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

export const defaultOptions: Partial<Options> = {
  nodeStartPath: "start",
  nodeEndPath: "end",
  edgeStartPath: "start",
  edgeEndPath: "end",
  edgeFilter: {
    enabled: true,
    strategy: "between",
    tolerance: "loose",
  },
  nodeFilter: {
    enabled: true,
    strategy: "between",
    tolerance: "loose",
  },
  switchOnZoom: true,
  showBarchart: false,
  timeBars: [],
  barchart: defaultBarchartOptions,
  timeline: defaultTimelineOptions,
};
export class Controller<
  ND = unknown,
  ED = unknown,
> extends EventEmitter<ControlerEvents> {
  private mode: TimelineMode;
  public timeline: Timeline;
  public nodes: NodeList;
  public edges: EdgeList;
  public barchart: Barchart;
  public filteredNodes: Set<Id>;
  public filteredEdges: Set<Id>;
  private ogma: Ogma<ND, ED>;
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
    this.ogma = ogma;
    this.options = deepmerge(defaultOptions, options) as Options;
    this.filteredNodes = new Set();
    this.filteredEdges = new Set();
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
    const wrapper = document.createElement("div");
    wrapper.classList.add("ogma-timeline-wrapper");
    wrapper.appendChild(timelineContainer);
    wrapper.appendChild(barchartContainer);
    container.appendChild(wrapper);
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
    if (this.options.showBarchart) {
      this.showBarchart();
    } else {
      this.showTimeline();
    }
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
    this.barchart.on(select, (evt) => {
      this.emit(select, evt);
    });
    this.timeline.on(select, (evt) => {
      this.emit(select, evt);
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

    this.refresh({ nodes, edges });
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

  refresh({
    nodes,
    edges,
  }: {
    nodes?: NodeList<ND, ED>;
    edges?: EdgeList<ED, ND>;
  }) {
    const wd =
      this.mode === "barchart"
        ? this.barchart.getWindow()
        : this.timeline.getWindow();
    this.nodes = (nodes ? nodes : this.ogma.createNodeList()).filter(
      (n) => n.getData(this.options.nodeStartPath) !== undefined
    );
    this.edges = (edges ? edges : this.ogma.createEdgeList()).filter(
      (e) => e.getData(this.options.edgeStartPath) !== undefined
    );
    this.nodeStarts = this.nodes.getData(this.options.nodeStartPath);
    this.nodeEnds = this.nodes.getData(this.options.nodeEndPath);
    this.edgeStarts = this.edges.getData(this.options.edgeStartPath);
    this.edgeEnds = this.edges.getData(this.options.edgeEndPath);
    this.timeline.refresh(
      this.nodes,
      this.edges,
      this.nodeStarts,
      this.nodeEnds,
      this.edgeStarts,
      this.edgeEnds
    );
    this.barchart.refresh(
      this.nodes,
      this.edges,
      this.nodeStarts,
      this.nodeEnds,
      this.edgeStarts,
      this.edgeEnds
    );
    if (!this.options.nodeFilter.enabled) {
      this.filteredNodes.clear();
      for (let i = 0; i < this.nodes.size; i++)
        this.filteredNodes.add(this.nodes.get(i).getId());
    }
    if (!this.options.edgeFilter.enabled) {
      this.filteredEdges.clear();
      for (let i = 0; i < this.edges.size; i++)
        this.filteredEdges.add(this.edges.get(i).getId());
    }
    this.setWindow(wd.start, wd.end, { animation: false });
  }

  showTimeline() {
    const { start, end } = this.barchart.getWindow();
    this.timeline.setTimebars(this.barchart.getTimebars());
    this.barchart.container.style.display = "none";
    this.timeline.container.style.display = "";
    this.mode = "timeline";
    this.timeline.visible = true;
    this.barchart.visible = false;
    this.timeline.chart.setWindow(+start, +end, { animation: false });
  }

  showBarchart() {
    const { start, end } = this.timeline.getWindow();
    this.barchart.setTimebars(this.timeline.getTimebars());
    this.barchart.container.style.display = "";
    this.timeline.container.style.display = "none";
    this.mode = "barchart";
    this.timeline.visible = false;
    this.barchart.visible = true;
    this.barchart.chart.setWindow(+start, +end, { animation: false });
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
    if (!Number.isFinite(+start) || !Number.isFinite(+end)) {
      return this.onTimeChange();
    }
    if (this.mode === "timeline") {
      this.timeline.setWindow(start, end, options);
    } else {
      this.barchart.setWindow(start, end, options);
    }
    return this.onTimeChange();
  }

  getWindow() {
    if (this.mode === "timeline") {
      return this.timeline.getWindow();
    }
    return this.barchart.getWindow();
  }

  setSelection({ nodes, edges }: { nodes?: NodeList; edges?: EdgeList }) {
    if (this.mode === "timeline") {
      this.timeline.setSelection({ nodes, edges });
    } else {
      this.barchart.setSelection({ nodes, edges });
    }
  }

  getSelection() {
    if (this.mode === "timeline") {
      return this.timeline.getSelection();
    } else {
      return this.barchart.getSelection();
    }
  }

  onTimeChange() {
    if (!this.options.nodeFilter.enabled && !this.options.edgeFilter.enabled) {
      return this.emit(timechange);
    }
    const times = (
      this.mode === "timeline"
        ? this.timeline.getTimebars()
        : this.barchart.getTimebars()
    )
      .map(({ date }) => +date)
      .sort((a, b) => a - b);
    if (this.options.nodeFilter.enabled) {
      const selector = getSelector(
        times,
        this.options.nodeFilter.strategy,
        this.options.nodeFilter.tolerance
      );
      this.filteredNodes.clear();
      for (let i = 0; i < this.nodes.size; i++) {
        if (!selector(this.nodeStarts[i], this.nodeEnds[i])) continue;
        this.filteredNodes.add(this.nodes.get(i).getId());
      }
    }
    if (this.options.edgeFilter.enabled) {
      const selector = getSelector(
        times,
        this.options.edgeFilter.strategy,
        this.options.edgeFilter.tolerance
      );
      this.filteredEdges.clear();
      for (let i = 0; i < this.edges.size; i++) {
        if (!selector(this.edgeStarts[i], this.edgeEnds[i])) continue;
        this.filteredEdges.add(this.edges.get(i).getId());
      }
    }
    return this.emit(timechange);
  }

  setOptions(options: DeepPartial<Options>) {
    const mode = this.mode;
    this.options = deepmerge(this.options, options) as Options;
    this.timeline.setOptions(this.options.timeline);
    this.barchart.setOptions(this.options.barchart);
    this.refresh({ nodes: this.nodes, edges: this.edges });
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
