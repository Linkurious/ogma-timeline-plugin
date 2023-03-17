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
      window.controller = controller;
      window.ogma = ogma;
      return afterBarchartRedraw(controller)
        .then(() => wait(3000000))
        .then(() => controller.filteredNodes.size);
    });
    expect(size).toBe(10);
  });
});
