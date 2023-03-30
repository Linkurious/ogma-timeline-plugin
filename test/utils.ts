import { preview } from "vite";
import getPort from "get-port";
import type { PreviewServer } from "vite";
import { chromium } from "playwright";
import type { Browser, Page } from "playwright";
import Ogma, { OgmaParameters } from "@linkurious/ogma";
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
