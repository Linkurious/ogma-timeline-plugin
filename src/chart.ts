import { NodeId } from "@linkurious/ogma";
import EventEmitter from "eventemitter3";
import { DataSet } from "vis-data";
import { DataItem, TimelineAnimationOptions } from "vis-timeline";
import {
  rangechange,
  rangechanged,
  scales,
  timechange,
  timechanged,
} from "./constants";
import { Events, Timebar, TimebarOptions, VChart } from "./types";

export abstract class Chart extends EventEmitter<Events> {
  public chart!: VChart;

  protected dataset: DataSet<DataItem>;

  public container: HTMLDivElement;
  protected currentScale: number;
  protected timebars: Timebar[];
  protected isChangingRange: boolean;
  private chartRange: number;
  public visible: boolean;

  constructor(container: HTMLDivElement) {
    super();
    this.dataset = new DataSet([]);
    this.container = container;
    this.currentScale = 0;
    this.timebars = [];
    this.isChangingRange = false;
    this.visible = false;
    this.chartRange = 0;
  }

  protected registerEvents(): void {
    this.chart.on(rangechange, () => {
      const { start, end } = this.chart.getWindow();
      const range = end - start;
      if (range === this.chartRange) {
        // if we are sliding but not zooming, we move the fixed timebars
        this.timebars
          .filter((t) => t.fixed)
          .forEach((t) => {
            this.chart.setCustomTime(t.delta + +start, t.id);
          });
      }
      this.chartRange = range;

      // prevent from infinite loop: setdata and window trigger this event
      if (this.isChangingRange || !this.visible) return;
      this.isChangingRange = true;
      this.onRangeChange();
      this.isChangingRange = false;
      this.emit(rangechange);
    });
    this.chart.on(rangechanged, () => {
      this.emit(rangechanged);
    });
    this.chart.on(timechange, () => {
      const start = this.chart.getWindow().start;
      this.timebars
        .filter((t) => t.fixed)
        .forEach((t) => {
          t.delta = +this.chart.getCustomTime(t.id) - +start;
        });
      this.emit(timechange);
    });
    this.chart.on(timechanged, () => {
      this.emit(timechanged);
    });
    this.chart.on(timechanged, () => {
      this.emit(timechanged);
    });
    this.chart.on("changed", () => {
      this.emit("redraw");
    });
  }

  public addTimeBar(timebar: TimebarOptions): void {
    const date = (
      timebar instanceof Date || typeof timebar === "number"
        ? timebar
        : new Date(timebar.date)
    ) as Date;
    const fixed =
      timebar instanceof Date || typeof timebar === "number"
        ? false
        : !!timebar.fixed;
    const id = this.chart.addCustomTime(date, `t${this.timebars.length}`);
    this.timebars.push({
      fixed,
      id,
      delta: +date - +this.chart.getWindow().start,
    });
  }
  public removeTimeBar(index: number) {
    this.chart.removeCustomTime(this.timebars[index].id);
    this.timebars = this.timebars
      .slice(0, index)
      .concat(this.timebars.slice(index + 1));
  }

  public getTimebars() {
    return this.timebars.map((t) => ({
      ...t,
      date: this.chart.getCustomTime(t.id),
    }));
  }
  public setTimebars(timebars: TimebarOptions[]) {
    this.timebars.forEach((t) => this.chart.removeCustomTime(t.id));
    this.timebars = [];
    return timebars.forEach((timebar) => this.addTimeBar(timebar));
  }

  public setWindow(
    minTime: number,
    maxTime: number,
    options?: TimelineAnimationOptions
  ): void {
    this.chart.setWindow(minTime, maxTime, options);
  }

  public getWindow() {
    return this.chart.getWindow();
  }

  protected onRangeChange() {
    this.emit(rangechanged);
  }
  public abstract refresh(
    ids: NodeId[],
    starts: number[],
    ends: number[]
  ): void;

  protected getScale(): number {
    const { start, end } = this.chart.getWindow();
    const length = +end - +start;
    // choose a scale adapted to zoom
    const { scale } = scales.reduce(
      (scale, candidate) => {
        const bars = Math.round(length / candidate);
        if (bars < scale.bars && bars > 10) {
          return {
            bars,
            scale: candidate,
          };
        }
        return scale;
      },
      { bars: Infinity, scale: Infinity }
    );
    return scale;
  }
}
