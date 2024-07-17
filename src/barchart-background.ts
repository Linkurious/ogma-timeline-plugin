import { DataItem } from "vis-timeline";
import { VChart } from "./types";

export class BCBackground {
  public chart!: VChart;
  private elments: Map<DataItem["id"], HTMLElement> = new Map();
  constructor(chart: VChart) {
    this.chart = chart;
  }

  public refresh() {
    const timebars = this.chart.customTimes;
    document.querySelectorAll(".barchart-background").forEach((el) => {
      el.remove();
    });
    timebars.forEach((timebar, i) => {
      if (i % 2 === 0) return;
      const prev = timebars[i - 1];
      const div = document.createElement("div");
      div.className = "vis-item vis-background barchart-background";
      div.style.position = "relative";
      div.style.width = `calc(${timebar.bar.style.left} - ${prev.bar.style.left})`;
      div.style.height = "100%";
      div.style.top = "0";
      div.style.left = prev.bar.style.left;
      div.style.backgroundColor = "rgba(213, 221, 246, 0.4)";
      div.style.zIndex = "0";
      div.style.pointerEvents = "none";
      this.elments.set(`bg_${timebar.id}`, div);
      this.chart.dom.backgroundVertical.appendChild(div);
    });
  }
}
