import { preview } from "vite";
import getPort from "get-port";
import type { PreviewServer } from "vite";
import { chromium } from "playwright";
import type { Browser, Page } from "playwright";
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
/*
  async afterBarchartRedraw() {
    await this.page.evaluate(() => {
      return new Promise((resolve) => {
        window.controller.barchart.once("redraw", () => {
          resolve(null);
        });
      });
    });
  }
  async afterTimelineRedraw() {
    await this.page.evaluate(() => {
      return new Promise((resolve) => {
        window.controller.timeline.once("redraw", () => {
          resolve(null);
        });
      });
    });
  }
  async wait(ms: number) {
    await this.page.evaluate((ms) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, ms);
      });
    }, ms);
  }

  async createOgma(options) {
    return await this.page.evaluate((options) => {
      const ogma = new window.Ogma({
        container: "ogma",
        ...options,
      });
      window.ogma = ogma;
      return ogma;
    }, options);
  }

  async createController(options) {
    return await this.page.evaluate((options) => {
      const controller = new window.Controller(
        window.ogma,
        document.getElementById("timeline"),
        options
      );
      window.controller = controller;
      return controller;
    }, options);
  }

  async cleanup() {
    await this.page.evaluate(() => {
      if (window.controller) window.controller.destroy();
      if (window.ogma) window.ogma.destroy();
    });
  }*/
}
