import { afterAll, beforeAll, beforeEach, describe, test } from "vitest";
import { expect } from "@playwright/test";
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
    await session.emptyPage();
  });

  test("should show", async () => {
    const size = await session.page.evaluate(() => {
      const ogma = new Ogma({
        container: "ogma",
        graph: {
          nodes: [
            ...new Array(10).fill(0).map((_, i) => ({
              id: i,
              data: { start: 0 },
            })),
          ],
        },
      });
      const controller = new Controller(
        ogma,
        document.getElementById("timeline"),
        {}
      );
      return afterTimelineRedraw(controller)
        .then((controller) => afterTimelineRedraw(controller))
        .then(() => document.querySelectorAll(".vis-box.group-0").length);
    });
    expect(size).toBe(10);
  });

  test("should respect grouping", async () => {
    const [as, bs] = await session.page.evaluate(() => {
      const ogma = new Ogma({
        container: "ogma",
        graph: {
          nodes: [
            ...new Array(10).fill(0).map((_, i) => ({
              id: i,
              data: { start: 0, type: i % 2 ? "A" : "B" },
            })),
          ],
        },
      });
      window.ogma = ogma;
      const controller = new Controller(
        ogma,
        document.getElementById("timeline"),
        {
          timeline: {
            groupIdFunction: (nodeid) => ogma.getNode(nodeid).getData("type"),
          },
        }
      );
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
