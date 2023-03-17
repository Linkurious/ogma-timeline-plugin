import { preview } from "vite";
import getPort from "get-port";
import type { PreviewServer } from "vite";
import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

export class BrowserSession {
  public server: PreviewServer;
  public browser: Browser;
  public page: Page;

  async start() {
    const port = await getPort();
    this.server = await preview({
      preview: { port },
      configFile: "test/vite.config.ts",
    });
    this.browser = await chromium.launch({ headless: false });
    this.page = await this.browser.newPage();
    await this.page.goto(`http://localhost:${port}`);
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
}
