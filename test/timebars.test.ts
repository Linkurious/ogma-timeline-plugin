import { afterAll, beforeAll, beforeEach, describe, test } from "vitest";
import { expect } from "@playwright/test";
import { BrowserSession, compareDates } from "./utils";

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

  test("should add timebars", async () => {
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
      createController({
        timeBars: [
          0,
          new Date("1 1 1956"),
          { fixed: true, date: new Date("1 1 1960") },
        ],
      });

      return afterTimelineRedraw().then(
        () => [...document.querySelectorAll(".vis-custom-time")].length
      );
    });
    expect(filteredNodes).toEqual(3);
  });

  test("should allow dynamic timebars", async () => {
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
        timeBars: [
          { fixed: false, date: new Date("1 1 1960") },
          { fixed: false, date: new Date("1 1 1950") },
        ],
        start: new Date("1 1 1940"),
        end: new Date("1 1 1970"),
        nodeFilter: {
          strategy: "between",
          tolerance: "strict",
          enabled: true,
        },
      });
      return afterTimelineRedraw().then(() => controller.filteredNodes.size);
    });
    expect(filteredNodes).toEqual(1);
    const { x, y, width, height } = await session.page
      .locator(".vis-custom-time.t0>div")
      .evaluate((e) => e.getBoundingClientRect());
    const { x: x2, y: y2 } = await session.page
      .locator(".vis-custom-time.t1>div")
      .evaluate((e) => e.getBoundingClientRect());
    await session.page.mouse.move(x + width, y + height / 2);
    await session.page.mouse.down({ button: "left" });
    await session.page.mouse.move(x2, y2, { steps: 5 });
    await session.page.mouse.up({ button: "left" });
    const filteredNodes2 = await session.page.evaluate(() => {
      return controller.filteredNodes.size;
    });
    expect(filteredNodes2).toEqual(1);
  });

  test("should allow fixed timebars", async () => {
    const { filteredNodes, timebars } = await session.page.evaluate(() => {
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
        timeBars: [
          { fixed: true, date: new Date("1 1 1950") },
          { fixed: true, date: new Date("1 1 1960") },
        ],
        start: new Date("1 1 1940"),
        end: new Date("1 1 1970"),
        nodeFilter: {
          strategy: "between",
          tolerance: "strict",
          enabled: true,
        },
      });
      return afterTimelineRedraw().then(() => ({
        filteredNodes: controller.filteredNodes.size,
        timebars: controller.getTimebars().map(({ date }) => date),
      }));
    });
    expect(filteredNodes).toEqual(1);

    const expectedDates = [new Date("1 1 1950"), new Date("1 1 1960")];
    timebars.forEach((date, i) => {
      expect(compareDates(date, expectedDates[i])).toBeTruthy();
    });

    const { x, y, width, height } = await session.page
      .locator(".vis-custom-time.t0>div")
      .evaluate((e) => e.getBoundingClientRect());
    const { x: x2, y: y2 } = await session.page
      .locator(".vis-custom-time.t1>div")
      .evaluate((e) => e.getBoundingClientRect());
    await session.page.mouse.move(x + width, y + height / 2);
    await session.page.mouse.down({ button: "left" });
    await session.page.mouse.move(x2, y2, { steps: 5 });
    await session.page.mouse.up({ button: "left" });
    const { filteredNodes2, timebars2 } = await session.page.evaluate(() => {
      return {
        filteredNodes2: controller.filteredNodes.size,
        timebars2: controller.getTimebars().map(({ date }) => date),
      };
    });
    expect(filteredNodes2).toEqual(0);
    const expectedDates2 = [
      new Date("1940-06-14T13:23:46.522Z"),
      new Date("1950-06-14T13:23:46.522Z"),
    ];
    timebars2.forEach((date, i) => {
      expect(compareDates(date, expectedDates2[i])).toBeTruthy();
    });
  });

  test("Fixed timebars respect zoom", async () => {
    const dates = await session.page.evaluate(() => {
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
        timeBars: [
          { fixed: true, date: new Date("1 1 1950") },
          { fixed: true, date: new Date("1 1 1960") },
        ],
        start: new Date("1 1 1940"),
        end: new Date("1 1 1970"),
      });
      return afterTimelineRedraw().then(() =>
        controller.getTimebars().map(({ date }) => date)
      );
    });
    expect(dates).toEqual([new Date("1 1 1950"), new Date("1 1 1960")]);
    const { x, y, width, height } = await session.page
      .locator(".vis-custom-time.t0>div")
      .evaluate((e) => e.getBoundingClientRect());
    await session.page.mouse.move(x + 2 * width, y + height / 2);
    await session.page.waitForTimeout(1000);
    await session.page.mouse.wheel(0, 200);
    await session.page.waitForTimeout(1000);
    const { filteredNodes2, timebars2 } = await session.page.evaluate(() => {
      return {
        filteredNodes2: controller.filteredNodes.size,
        timebars2: controller.getTimebars().map(({ date }) => date),
      };
    });
    expect(filteredNodes2).toEqual(1);
    expect(timebars2).toEqual([new Date("1 1 1950"), new Date("1 1 1960")]);
  });
});
