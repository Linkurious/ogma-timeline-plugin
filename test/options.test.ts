import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  test,
} from "vitest";
import { expect } from "@playwright/test";
import { BrowserSession } from "./utils";

describe("Options", async () => {
  const session = new BrowserSession();
  beforeAll(async () => {
    await session.start(false);
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
        const controller = createController({
          timeBars: [(1 / 2) * Date.now()],
          filter: {
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
    await session.page.mouse.wheel(0, 200);
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
          },
        });
        const controller = createController({
          timeBars: [(1 / 2) * Date.now()],
          filter: {
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
        },
      });
      const controller = createController({
        startDatePath: "startCustom",
      });
      return afterTimelineRedraw(controller).then(
        () => document.querySelectorAll(".vis-box.group-0").length
      );
    });
    expect(elementSize).toBe(3);
  });
  test("should respect endDatePath", async () => {
    debugger;
    const elementSize = await session.page.evaluate(() => {
      createOgma({
        graph: {
          nodes: [
            ...new Array(3).fill(0).map((_, i) => ({
              id: i + 1,
              data: { start: Date.now() / 2, endCustom: Date.now() },
            })),
          ],
        },
      });
      const controller = createController({
        endDatePath: "endCustom",
      });
      return afterTimelineRedraw(controller).then(
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
        },
      });
      const controller = createController({
        start: new Date("1 1 1955"),
      });

      return afterTimelineRedraw(controller)
        .then(() => wait(100))
        .then(() =>
          document
            .querySelector(".vis-time-axis")
            .children[0].classList.contains("vis-year1955")
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
        },
      });
      const controller = createController({
        end: new Date("1 1 2100"),
      });

      return afterTimelineRedraw(controller)
        .then(() => wait(100))
        .then(() => {
          const timeAxis = document.querySelector(".vis-time-axis");
          return timeAxis?.lastChild.classList.contains("vis-year2100");
        });
    });
    expect(is1955).toBe(true);
  });
});
