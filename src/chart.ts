import { NodeList } from '@linkurious/ogma';
import EventEmitter from 'eventemitter3';
import { DataSet } from 'vis-data';
import { ChartOptions, Events, VChart } from './types';

export const defaultChartOptions: ChartOptions = {
  minTime: 0,
  startDatePath: 'start',
  endDatePath: 'end',
  maxTime: Infinity
};

export abstract class Chart extends EventEmitter<Events> {
  public chart!: VChart;

  protected dataset: DataSet<Record<string, string | number>>;

  protected options: ChartOptions;
  public container: HTMLDivElement;
  protected currentScale: number;

  constructor(container: HTMLDivElement, options: Partial<ChartOptions> = {}) {
    super();
    this.dataset = new DataSet([]);
    this.container = container;
    this.currentScale = 0;
    this.options = { ...defaultChartOptions, ...options };
  }

  protected registerEvents(): void {
    this.chart.on('rangechange', () => {
      this.onRangeChange();
    });
  }

  
  public setWindow(minTime: number, maxTime: number): void {
    this.chart.setWindow(minTime, maxTime);
  }
  
  public getWindow() {
    return this.chart.getWindow();
  }
  
  protected abstract onRangeChange(): void;
  public abstract refresh(nodes: NodeList): void;

}
