import { expect } from "@playwright/test";
import { afterAll, beforeAll, beforeEach, describe, test } from "vitest";
import { BrowserSession } from "./utils";

describe("Options", async () => {
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

  test("should switch to barchart on zoom out", async () => {
    const { timelineVisible, barchartVisible } = await session.page.evaluate(
      () => {
        createOgma({
          graph: {
            nodes: [
              ...new Array(3).fill(0).map((_, i) => ({
                id: i + 1,
                data: { start: Date.now() / 2 },
                attributes: {
                  x: i * 20,
                  y: i * 10,
                },
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
          timeBars: [(1 / 2) * Date.now()],
          nodeFilter: {
            enabled: false,
          },
        });
        return {
          timelineVisible: controller.timeline.visible,
          barchartVisible: controller.barchart.visible,
        };
      }
    );
    expect(timelineVisible).toBe(true);
    expect(barchartVisible).toBe(false);
    const { x, y, height } = await session.page
      .locator(".vis-custom-time.t0>div")
      .evaluate((e) => e.getBoundingClientRect());
    await session.page.mouse.move(x, y + height / 2);
    for (let i = 0; i < 20; i++) {
      await session.page.mouse.wheel(0, 200);
    }
    const { timelineVisible: tv, barchartVisible: bv } =
      await session.page.evaluate(() => {
        return {
          timelineVisible: controller.timeline.visible,
          barchartVisible: controller.barchart.visible,
        };
      });
    expect(tv).toBe(false);
    expect(bv).toBe(true);
  });

  test("should not switch if switchOnZoom disabled", async () => {
    const { timelineVisible, barchartVisible } = await session.page.evaluate(
      () => {
        createOgma({
          graph: {
            nodes: [
              ...new Array(3).fill(0).map((_, i) => ({
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
          timeBars: [(1 / 2) * Date.now()],
          nodeFilter: {
            enabled: false,
          },
          switchOnZoom: false,
        });
        return {
          timelineVisible: controller.timeline.visible,
          barchartVisible: controller.barchart.visible,
        };
      }
    );
    expect(timelineVisible).toBe(true);
    expect(barchartVisible).toBe(false);
    const { x, y, height } = await session.page
      .locator(".vis-custom-time.t0>div")
      .evaluate((e) => e.getBoundingClientRect());
    await session.page.mouse.move(x, y + height / 2);
    await session.page.mouse.wheel(0, 200);
    const { timelineVisible: tv, barchartVisible: bv } =
      await session.page.evaluate(() => {
        return {
          timelineVisible: controller.timeline.visible,
          barchartVisible: controller.barchart.visible,
        };
      });
    expect(tv).toBe(true);
    expect(bv).toBe(false);
  });

  test("should respect startDatePath", async () => {
    const elementSize = await session.page.evaluate(() => {
      createOgma({
        graph: {
          nodes: [
            ...new Array(3).fill(0).map((_, i) => ({
              id: i + 1,
              data: { startCustom: Date.now() / 2 },
            })),
          ],
          edges: [],
        },
      });
      createController({
        nodeStartPath: "startCustom",
      });
      return afterTimelineRedraw().then(
        () => document.querySelectorAll(".vis-box.nodes").length
      );
    });
    expect(elementSize).toBe(3);
  });
  test("should respect endDatePath", async () => {
    const elementSize = await session.page.evaluate(() => {
      createOgma({
        graph: {
          nodes: [
            ...new Array(3).fill(0).map((_, i) => ({
              id: i + 1,
              data: { start: Date.now() / 2, endCustom: Date.now() },
            })),
          ],
          edges: [],
        },
      });
      createController({
        nodeEndPath: "endCustom",
      });
      return afterTimelineRedraw().then(
        () => document.querySelectorAll(".vis-range").length
      );
    });
    expect(elementSize).toBe(3);
  });

  test("should respect start", async () => {
    const is1955 = await session.page.evaluate(() => {
      createOgma({
        graph: {
          nodes: [
            {
              id: 1,
              data: { start: Date.now() },
            },
          ],
          edges: [],
        },
      });
      createController({
        start: new Date("1 1 1955"),
      });

      return afterTimelineRedraw()
        .then(() => wait(100))
        .then(() =>
          (
            document.querySelector(".vis-time-axis") as HTMLDivElement
          ).children[0].classList.contains("vis-year1955")
        );
    });
    expect(is1955).toBe(true);
  });
  test("should respect end", async () => {
    const is1955 = await session.page.evaluate(() => {
      createOgma({
        graph: {
          nodes: [
            {
              id: 1,
              data: { start: Date.now() },
            },
          ],
          edges: [],
        },
      });
      createController({
        end: new Date("1 1 2100"),
      });

      return afterTimelineRedraw()
        .then(() => wait(100))
        .then(() => {
          const timeAxis = document.querySelector(
            ".vis-time-axis"
          ) as HTMLDivElement;
          return (timeAxis.lastChild as SVGSVGElement).classList.contains(
            "vis-year2100"
          );
        });
    });
    expect(is1955).toBe(true);
  });

  test("should respect filter", async () => {
    const filteredNodes = await session.page.evaluate(() => {
      createOgma({
        graph: {
          nodes: [
            {
              id: 1,
              data: { start: new Date("1 1 1955") },
            },
          ],
          edges: [],
        },
      });
      const controller = createController({
        nodeFilter: {
          enabled: true,
          strategy: "after",
          tolerance: "strict",
        },
        timeBars: [new Date("1 1 1954")],
      });

      return afterTimelineRedraw().then(() =>
        Array.from(controller.filteredNodes)
      );
    });
    expect(filteredNodes).toEqual([]);
  });
  test("should respect filter disabled", async () => {
    const filteredNodes = await session.page.evaluate(() => {
      createOgma({
        graph: {
          nodes: [
            {
              id: 1,
              data: { start: new Date("1 1 1955") },
            },
          ],
          edges: [],
        },
      });
      const controller = createController({
        nodeFilter: {
          enabled: true,
          strategy: "after",
          tolerance: "strict",
        },
        timeBars: [new Date("1 1 1954")],
      });

      return afterTimelineRedraw().then(() =>
        Array.from(controller.filteredNodes)
      );
    });
    expect(filteredNodes).toEqual([]);
  });
  test("should respect filter after", async () => {
    const filteredNodes = await session.page.evaluate(() => {
      createOgma({
        graph: {
          nodes: [
            {
              id: 1,
              data: { start: new Date("1 1 1955") },
            },
          ],
          edges: [],
        },
      });
      const controller = createController({
        nodeFilter: {
          enabled: true,
          strategy: "after",
          tolerance: "strict",
        },
        timeBars: [new Date("1 1 1956")],
      });

      return afterTimelineRedraw().then(() =>
        Array.from(controller.filteredNodes)
      );
    });
    expect(filteredNodes).toEqual([1]);
  });
});
