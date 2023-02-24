import { NodeId, NodeList } from '@linkurious/ogma';
import EventEmitter from 'eventemitter3';
import { DataSet } from 'vis-data';
import { DataItem, IdType } from 'vis-timeline';
import { Events, Id, VChart } from './types';

export abstract class Chart extends EventEmitter<Events> {
  public chart!: VChart;

  protected dataset: DataSet<DataItem>;

  public container: HTMLDivElement;
  protected currentScale: number;
  protected timebars: IdType[];

  constructor(container: HTMLDivElement) {
    super();
    this.dataset = new DataSet([]);
    this.container = container;
    this.currentScale = 0;
    this.timebars = []
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
    // return this.timebars.forEach((id, i) => this.chart.setCustomTime(dates[i], id));
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
