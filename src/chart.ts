import { NodeId } from "@linkurious/ogma";
import EventEmitter from "eventemitter3";
import { DataSet } from "vis-data";
import { DataItem, IdType } from "vis-timeline";
import { rangechanged, scales } from "./constants";
import { Events, VChart } from "./types";

export abstract class Chart extends EventEmitter<Events> {
  public chart!: VChart;

  protected dataset: DataSet<DataItem>;

  public container: HTMLDivElement;
  protected currentScale: number;
  protected timebars: IdType[];
  protected isChangingRange: boolean;
  public visible: boolean;

  constructor(container: HTMLDivElement) {
    super();
    this.dataset = new DataSet([]);
    this.container = container;
    this.currentScale = 0;
    this.timebars = [];
    this.isChangingRange = false;
    this.visible = false;
  }

  protected registerEvents(): void {
    this.chart.on("rangechange", () => {
      // prevent from infinite loop: setdata and window trigger this event
      if (this.isChangingRange || !this.visible) return;
      this.isChangingRange = true;
      this.onRangeChange();
      this.isChangingRange = false;
    });
    this.chart.on("timechange", () => {
      this.emit("timechange");
    });
    this.chart.on("timechanged", () => {
      this.emit("timechanged");
    });
  }

  public addTimeBar(time: number): void {
    this.timebars.push(
      this.chart.addCustomTime(time, `t${this.timebars.length}`)
    );
  }
  public removeTimeBar(index: number) {
    this.chart.removeCustomTime(this.timebars[index]);
  }

  public getTimebarsDates(): Date[] {
    return this.timebars.map((id) => this.chart.getCustomTime(id));
  }
  public setTimebarsDates(dates: Date[]) {
    return this.timebars.forEach((id, i) =>
      this.chart.setCustomTime(dates[i], id)
    );
  }

  public setWindow(minTime: number, maxTime: number): void {
    this.chart.setWindow(minTime, maxTime);
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
