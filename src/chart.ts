import { NodeId, NodeList } from '@linkurious/ogma';
import EventEmitter from 'eventemitter3';
import { DataSet } from 'vis-data';
import { IdType } from 'vis-timeline';
import { ChartOptions, Events, Id, VChart } from './types';

export const defaultChartOptions: ChartOptions = {
  minTime: 0,
  maxTime: Infinity
};

export abstract class Chart extends EventEmitter<Events> {
  public chart!: VChart;

  protected dataset: DataSet<Record<string, string | number>>;

  protected options: ChartOptions;
  public container: HTMLDivElement;
  protected currentScale: number;
  protected timebars: IdType[];

  constructor(container: HTMLDivElement, options: Partial<ChartOptions> = {}) {
    super();
    this.dataset = new DataSet([]);
    this.container = container;
    this.currentScale = 0;
    this.timebars = []
    this.options = { ...defaultChartOptions, ...options };
  }

  protected registerEvents(): void {
    this.chart.on('rangechange', () => {
      this.onRangeChange();
    });
    this.chart.on('timechange', () => {
      this.emit('timechange');
    });
    this.chart.on('timechanged', () => {
      this.emit('timechanged');
    });

  }

  public addTimeBar(time: number): void {
    this.timebars.push(
      this.chart.addCustomTime(time, `t${this.timebars.length}`)
    );
  }
  public removeTimeBar(index: number){
    this.chart.removeCustomTime(this.timebars[index]);
  }

  public getTimebarsDates(): Date[] {
    return this.timebars.map(id => this.chart.getCustomTime(id));
  }
  public setTimebarsDates(dates: Date[]) {
    return this.timebars.forEach((id, i) => this.chart.setCustomTime(dates[i], id));
  }
  
  public setWindow(minTime: number, maxTime: number): void {
    this.chart.setWindow(minTime, maxTime);
  }
  
  public getWindow() {
    return this.chart.getWindow();
  }
  
  protected onRangeChange(){
    this.emit('rangechange');
  };
  public abstract refresh(ids: NodeId[], starts: number[], ends: number[]): void;

}
