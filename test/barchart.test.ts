import { afterAll, beforeAll, beforeEach, describe, test } from "vitest";
import { expect } from "@playwright/test";
import { BrowserSession } from "./utils";
import { Node } from "@linkurious/ogma";

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
        .then(() => afterBarchartRedraw())
        .then(() => document.querySelectorAll(".vis-bar").length);
    });
    expect(size).toBe(2);
  });

  test("should respect grouping", async () => {
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
          groupIdFunction: (nodeid) =>
            (ogma.getNode(nodeid) as Node).getData("type"),
        },
      });
      return afterBarchartRedraw()
        .then(() => afterBarchartRedraw())
        .then(() => [
          document.querySelectorAll(".vis-bar.A").length,
          document.querySelectorAll(".vis-bar.B").length,
        ]);
    });
    expect(as).toBe(2);
    expect(bs).toBe(2);
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
        .then(() => afterBarchartRedraw())
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
