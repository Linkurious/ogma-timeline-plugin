import { afterAll, beforeAll, beforeEach, describe, test } from "vitest";
import { expect } from "@playwright/test";
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

  test("should show", async () => {
    const size = await session.page.evaluate(() => {
      createOgma({
        container: "ogma",
        graph: {
          nodes: [
            ...new Array(10).fill(0).map((_, i) => ({
              id: i,
              data: { start: 0 },
            })),
            ...new Array(10).fill(0).map((_, i) => ({
              id: i + 10,
              data: { start: Date.now() },
            })),
          ],
          edges: [],
        },
      });
      createController({});
      return afterBarchartRedraw()
        .then(() => wait(200))
        .then(() => document.querySelectorAll(".vis-bar").length);
    });
    expect(size).toBe(2);
  });

  test("should respect node grouping", async () => {
    const [as, bs] = await session.page.evaluate(() => {
      const ogma = createOgma({
        container: "ogma",
        graph: {
          nodes: [
            ...new Array(10).fill(0).map((_, i) => ({
              id: i,
              data: { start: 0, type: i % 2 ? "A" : "B" },
            })),
            ...new Array(10).fill(0).map((_, i) => ({
              id: i + 10,
              data: { start: Date.now(), type: i % 2 ? "A" : "B" },
            })),
          ],
          edges: [],
        },
      });
      createController({
        barchart: {
          nodeGroupIdFunction: (node) => node.getData("type"),
        },
      });
      return afterBarchartRedraw()
        .then(() => wait(200))
        .then(() => [
          document.querySelectorAll(".vis-bar.A").length,
          document.querySelectorAll(".vis-bar.B").length,
        ]);
    });
    expect(as).toBe(2);
    expect(bs).toBe(2);
  });

  test("should respect edge grouping", async () => {
    const [as, bs] = await session.page.evaluate(() => {
      const ogma = createOgma({
        container: "ogma",
        graph: {
          nodes: [
            ...new Array(2).fill(0).map((_, i) => ({
              id: i,
            })),
          ],
          edges: new Array(2).fill(0).map((_, i) => ({
            source: 0,
            target: 1,
            data: {
              start: 0,
              type: i % 2 ? "A" : "B",
            },
          })),
        },
      });
      createController({
        barchart: {
          edgeGroupIdFunction: (edge) => edge.getData("type"),
        },
      });
      return afterBarchartRedraw()
        .then(() => wait(200))
        .then(() => [
          document.querySelectorAll(".vis-bar.A").length,
          document.querySelectorAll(".vis-bar.B").length,
        ]);
    });
    expect(as).toBe(1);
    expect(bs).toBe(1);
  });

  test("should draw lines", async () => {
    const lines = await session.page.evaluate(() => {
      createOgma({
        container: "ogma",
        graph: {
          nodes: [
            ...new Array(10).fill(0).map((_, i) => ({
              id: i,
              data: { start: 0, type: i % 2 ? "A" : "B" },
            })),
            ...new Array(10).fill(0).map((_, i) => ({
              id: i + 10,
              data: { start: Date.now(), type: i % 2 ? "A" : "B" },
            })),
          ],
          edges: [],
        },
      });
      createController({
        barchart: {
          graph2dOptions: {
            style: "line",
          },
        },
      });
      return afterBarchartRedraw()
        .then(() => wait(200))
        .then(
          () =>
            [...document.querySelectorAll(".vis-group")].filter(
              (bar) => bar.tagName === "path"
            ).length
        );
    });
    expect(lines).toBe(1);
  });
});
