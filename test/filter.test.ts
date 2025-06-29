import { expect } from "@playwright/test";
import { afterAll, beforeAll, beforeEach, describe, test } from "vitest";
import { BrowserSession } from "./utils";

describe("Barchart", async () => {
  const session = new BrowserSession();
  beforeAll(async () => {
    await session.start();
  });

  afterAll(async () => {
    await session.close();
  });
  beforeEach(async () => {
    await session.refresh();
  });
  test("should filter nodes", async () => {
    const size = await session.page.evaluate(() => {
      createOgma({
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
          edges: [],
        },
      });
      const controller = createController({
        timeBars: [(1 / 3) * Date.now(), (2 / 3) * Date.now()],
      });
      return controller.filteredNodes.size;
    });
    expect(size).toBe(2);
  });

  test("should filter edges", async () => {
    const size = await session.page.evaluate(async () => {
      createOgma({
        graph: {
          nodes: [{ id: 0 }, { id: 1 }],
          edges: [
            {
              source: 0,
              target: 1,
              data: {
                start: Date.now(),
              },
            },
            {
              source: 0,
              target: 1,
              data: {
                start: Date.now(),
              },
            },
            ...new Array(10).fill(0).map(() => ({
              source: 0,
              target: 1,
              data: {
                start: Date.now() / 2,
              },
            })),
          ],
        },
      });
      const controller = createController({
        timeBars: [(1 / 3) * Date.now(), (2 / 3) * Date.now()],
        edgeFilter: {
          enabled: true,
          strategy: "between",
          tolerance: "strict",
        },
      });
      await new Promise<null>((resolve) => {
        controller.once("timechange", () => {
          resolve(null);
        });
      });
      return controller.filteredEdges.size;
    });
    expect(size).toBe(2);
  });

  test("should be disabled if asked", async () => {
    const size = await session.page.evaluate(() => {
      createOgma({
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
          edges: [],
        },
      });
      const controller = createController({
        timeBars: [(1 / 3) * Date.now(), (2 / 3) * Date.now()],
        nodeFilter: {
          enabled: false,
        },
      });
      return controller.filteredNodes.size;
    });
    expect(size).toBe(0);
  });

  test("should respect strategy and tolerance", async () => {
    const ids = await session.page.evaluate(() => {
      createOgma({
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
          edges: [],
        },
      });
      const controller = createController({
        timeBars: [0, Date.now()],
        nodeFilter: {
          enabled: true,
          strategy: "outside",
          tolerance: "strict",
        },
      });
      return [...controller.filteredNodes.values()].map((v) => v);
    });
    expect(ids).toEqual([2, 3, 4]);
  });

  test("should refresh on drag", async () => {
    const ids = await session.page.evaluate(() => {
      createOgma({
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
          edges: [],
        },
      });
      const controller = createController({
        timeBars: [new Date("1 1 1980"), new Date("1 1 2010")],
        nodeFilter: {
          enabled: true,
          strategy: "outside",
          tolerance: "strict",
        },
      });
      return [...controller.filteredNodes.values()].map((v) => v);
    });
    expect(ids).toEqual([3]);

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
    expect(ids2).toEqual([]);
  });
});
