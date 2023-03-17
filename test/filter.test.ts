import { afterAll, beforeAll, beforeEach, describe, test } from "vitest";
import { expect } from "@playwright/test";
import { BrowserSession } from "./utils";
import { year } from "../src";

describe("Barchart", async () => {
  const session = new BrowserSession();
  beforeAll(async () => {
    await session.start();
  });

  afterAll(async () => {
    await session.close();
  });
  beforeEach(async () => {
    await session.emptyPage();
  });
  test("should filter", async () => {
    const size = await session.page.evaluate(() => {
      const ogma = new Ogma({
        container: "ogma",
        graph: {
          nodes: [
            ...new Array(10).fill(0).map((_, i) => ({
              id: i + 1,
              data: { start: Date.now() / 2 },
            })),
            {
              id: 11,
              data: { start: 0 },
            },
            {
              id: 12,
              data: { start: Date.now() },
            },
          ],
        },
      });
      const controller = new Controller(
        ogma,
        document.getElementById("timeline"),
        { timeBars: [(1 / 3) * Date.now(), (2 / 3) * Date.now()] }
      );
      return controller.filteredNodes.size;
    });
    expect(size).toBe(10);
  });

  test("should be disabled if asked", async () => {
    const size = await session.page.evaluate(() => {
      const ogma = new Ogma({
        container: "ogma",
        graph: {
          nodes: [
            ...new Array(10).fill(0).map((_, i) => ({
              id: i + 1,
              data: { start: Date.now() / 2 },
            })),
            {
              id: 11,
              data: { start: 0 },
            },
            {
              id: 12,
              data: { start: Date.now() },
            },
          ],
        },
      });
      const controller = new Controller(
        ogma,
        document.getElementById("timeline"),
        {
          timeBars: [(1 / 3) * Date.now(), (2 / 3) * Date.now()],
          filter: {
            enabled: false,
          },
        }
      );
      return controller.filteredNodes.size;
    });
    expect(size).toBe(12);
  });

  test("should respect strategy and tolerance", async () => {
    const ids = await session.page.evaluate(() => {
      const ogma = new Ogma({
        container: "ogma",
        graph: {
          nodes: [
            {
              id: 1,
              data: { start: -10, end: -5 },
            },
            {
              id: 2,
              data: { start: -10, end: 10 },
            },
            {
              id: 3,
              data: { start: Date.now() / 4, end: Date.now() / 2 },
            },
            {
              id: 4,
              data: { start: Date.now() - 1000, end: Date.now() + 1000 },
            },
            {
              id: 5,
              data: { start: Date.now() + 2000, end: Date.now() + 3000 },
            },
          ],
        },
      });
      const controller = new Controller(
        ogma,
        document.getElementById("timeline"),
        {
          timeBars: [0, Date.now()],
          filter: {
            enabled: true,
            strategy: "outisde",
            tolerance: "strict",
          },
        }
      );
      return [...controller.filteredNodes.values()].map((v) => v);
    });
    expect(ids).toEqual([1, 5]);
  });

  test("should refresh on drag", async () => {
    const ids = await session.page.evaluate(() => {
      const ogma = new Ogma({
        container: "ogma",
        graph: {
          nodes: [
            {
              id: 1,
              data: { start: -10, end: -5 },
            },
            {
              id: 2,
              data: { start: -10, end: 10 },
            },
            {
              id: 3,
              data: {
                start: +new Date("1 1 2020") / 4,
                end: +new Date("1 1 2020") / 2,
              },
            },
            {
              id: 4,
              data: {
                start: +new Date("1 1 2020") - 1000,
                end: +new Date("1 1 2020") + 1000,
              },
            },
            {
              id: 5,
              data: {
                start: +new Date("1 1 2020") + 2000,
                end: +new Date("1 1 2020") + 3000,
              },
            },
          ],
        },
      });
      const controller = new Controller(
        ogma,
        document.getElementById("timeline"),
        {
          timeBars: [new Date("1 1 1980"), new Date("1 1 2010")],
          filter: {
            enabled: true,
            strategy: "outisde",
            tolerance: "strict",
          },
        }
      );
      window.controller = controller;
      return [...controller.filteredNodes.values()].map((v) => v);
    });
    expect(ids).toEqual([1, 5]);

    const { x, y, width, height } = await session.page
      .locator(".vis-custom-time.t0>div")
      .evaluate((e) => e.getBoundingClientRect());
    const { x: x2, y: y2 } = await session.page
      .locator(".vis-custom-time.t1>div")
      .evaluate((e) => e.getBoundingClientRect());

    await session.page.mouse.move(x + width / 2, y + height / 2);
    await session.page.mouse.down({ button: "left" });
    await session.page.mouse.move(x2, y2, { steps: 5 });
    await session.page.mouse.up({ button: "left" });
    await session.page.evaluate(() => wait(50));
    const ids2 = await session.page.evaluate(() => [
      ...controller.filteredNodes.values(),
    ]);
    expect(ids2).toEqual([1, 2, 3, 4, 5]);
  });
});
