import { expect } from "@playwright/test";
import { afterAll, beforeAll, beforeEach, describe, test } from "vitest";
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
            ...new Array(4).fill(0).map((_, i) => ({
              id: i,
              data: { start: Math.random() * 3600_000 },
            })),
          ],
          edges: [],
        },
      });
      createController({});
      return afterTimelineRedraw()
        .then(() => afterTimelineRedraw())
        .then(() => document.querySelectorAll(".vis-box.nodes").length);
    });
    expect(size).toBe(4);
  });

  test("should respect grouping", async () => {
    const [as, bs] = await session.page.evaluate(() => {
      const ogma = createOgma({
        graph: {
          nodes: [
            ...new Array(10).fill(0).map((_, i) => ({
              id: i,
              data: {
                start: Math.random() * 3600_000,
                type: i % 2 ? "A" : "B",
              },
            })),
          ],
          edges: [],
        },
      });
      createController({
        timeline: {
          nodeGroupIdFunction: (node) => node.getData("type"),
        },
      });
      return afterTimelineRedraw()
        .then(() => afterTimelineRedraw())
        .then(() => [
          document.querySelectorAll(".vis-box.A").length,
          document.querySelectorAll(".vis-box.B").length,
        ]);
    });
    expect(as).toBe(5);
    expect(bs).toBe(5);
  });
});
