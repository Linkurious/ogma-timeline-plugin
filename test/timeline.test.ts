import { afterAll, beforeAll, beforeEach, describe, test } from "vitest";
import { expect } from "@playwright/test";
import { Node } from "@linkurious/ogma";
import { BrowserSession } from "./utils";

describe("Timeline", async () => {
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
        graph: {
          nodes: [
            ...new Array(10).fill(0).map((_, i) => ({
              id: i,
              data: { start: 0 },
            })),
          ],
          edges: [],
        },
      });
      const controller = createController({});
      return afterTimelineRedraw(controller)
        .then((controller) => afterTimelineRedraw(controller))
        .then(() => document.querySelectorAll(".vis-box.group-0").length);
    });
    expect(size).toBe(10);
  });

  test("should respect grouping", async () => {
    const [as, bs] = await session.page.evaluate(() => {
      const ogma = createOgma({
        graph: {
          nodes: [
            ...new Array(10).fill(0).map((_, i) => ({
              id: i,
              data: { start: 0, type: i % 2 ? "A" : "B" },
            })),
          ],
          edges: [],
        },
      });
      const controller = createController({
        timeline: {
          groupIdFunction: (nodeid) =>
            (ogma.getNode(nodeid) as Node).getData("type"),
        },
      });
      return afterTimelineRedraw(controller)
        .then((controller) => afterTimelineRedraw(controller))
        .then(() => [
          document.querySelectorAll(".vis-box.A").length,
          document.querySelectorAll(".B").length,
        ]);
    });
    expect(as).toBe(5);
    expect(bs).toBe(4);
  });
});
