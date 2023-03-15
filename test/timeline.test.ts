import { afterAll, beforeAll, describe, test } from "vitest";
import { preview } from "vite";
import type { PreviewServer } from "vite";
import { chromium } from "playwright";
import type { Browser, Page } from "playwright";
import { expect } from "@playwright/test";
// import Ogma from "@linkurious/ogma";
// unstable in Windows, TODO: investigate
describe.runIf(process.platform !== "win32")("basic", async () => {
  let server: PreviewServer;
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    server = await preview({
      preview: { port: 3000 },
      configFile: "test/vite.config.ts",
    });
    browser = await chromium.launch({ headless: false});
    page = await browser.newPage();
    await page.goto("http://localhost:3000");
  });

  afterAll(async () => {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close((error) => (error ? reject(error) : resolve()));
    });
  });

  test("should load elements", async () => {
    const size = await page.evaluate(() => {
      document.body.innerHTML = `
        <div id="ogma-container"></div>
        <div id="timeline-container"></div>
        `;
      const ogma = new Ogma({
        container: "ogma-container",
      });
      const range = Date.now() - +new Date("August 19, 1975 23:15:30");
      window.ogma = ogma;
      return ogma.generate
        .random({ nodes: 200, edges: 200 })
        .then((graph) => {
          graph.nodes.forEach((node, i) => {
            node.data = { start: Math.floor(Date.now() * Math.random()) };
          });
          return ogma.setGraph(graph);
        })
        .then(() => {
          const controller = new Controller(
            ogma,
            document.getElementById("timeline-container")
          );
            window.controller = controller;
          return new Promise((resolve) => {
              // resolve(document.querySelectorAll(".timeline-item").length);
              setTimeout(() => {
                resolve();
              }, 1000000)
          });
          // return document.querySelectorAll(".timeline-item").length;
          // return new Promise((resolve) => {
          //   controller.barchart.chart.on("changed", () => {
          //     resolve(document.querySelectorAll(".timeline-item").length);
          //   });
          //   // controller.refresh(ogma.getNodes());
          // });
        });
    }, 60_000);
    console.log(size);
    expect(size).toBe(1);
  });
});
