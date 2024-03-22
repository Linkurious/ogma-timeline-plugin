import Ogma, { OgmaParameters } from "@linkurious/ogma";
import getPort from "get-port";
import { chromium, type Browser, type Page } from "playwright";
import { preview, type  PreviewServer } from "vite";
import { Controller } from "../src";
import { DeepPartial, Options } from "../src/types";
declare global {
  function createOgma(options: OgmaParameters): Ogma;
  function createController(options: DeepPartial<Options>): Controller;
  function afterBarchartRedraw(): Promise<Controller>;
  function afterTimelineRedraw(): Promise<Controller>;
  function wait(ms: number): Promise<void>;
  let ogma: Ogma;
  let controller: Controller;
}

export class BrowserSession {
  public server: PreviewServer;
  public browser: Browser;
  public page: Page;
  public port: number;
  async start(headless = true) {
    this.port = await getPort();
    this.server = await preview({
      preview: { port: this.port },
      configFile: "test/vite.config.ts",
    });
    this.browser = await chromium.launch({ headless, devtools: false });
    this.page = await this.browser.newPage();
    await this.page.goto(`http://localhost:${this.port}`);
  }

  async close() {
    await this.browser.close();
    await new Promise<void>((resolve, reject) => {
      this.server.httpServer.close((error) =>
        error ? reject(error) : resolve()
      );
    });
  }
  async emptyPage() {
    await this.page.evaluate(() => {
      document.getElementById("ogma")!.innerHTML = "";
      document.getElementById("timeline")!.innerHTML = "";
    });
  }
  async refresh() {
    await this.page.reload();
  }
}

export function compareDates(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
