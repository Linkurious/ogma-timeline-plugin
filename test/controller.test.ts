import { expect } from "@playwright/test";
import { afterAll, beforeAll, beforeEach, describe, test } from "vitest";
import { BrowserSession } from "./utils";

describe("Controller", async () => {
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

  test("should default the window to the data range when start/end are not provided", async () => {
    const { start, end } = await session.page.evaluate(() => {
      createOgma({
        graph: {
          nodes: [
            { id: 1, data: { start: new Date("1 1 1950") } },
            { id: 2, data: { start: new Date("1 1 1980") } },
          ],
          edges: [],
        },
      });
      const controller = createController({});
      return controller.getWindow();
    });
    expect(new Date(start).getFullYear()).toBe(1950);
    expect(new Date(end).getFullYear()).toBe(1980);
  });

  test("should switch modes explicitly via showTimeline/showBarchart", async () => {
    const visibility = await session.page.evaluate(() => {
      createOgma({
        graph: {
          nodes: [{ id: 1, data: { start: new Date("1 1 1950") } }],
          edges: [],
        },
      });
      const controller = createController({ switchOnZoom: false });
      const before = {
        timelineVisible: controller.timeline.visible,
        barchartVisible: controller.barchart.visible,
      };
      controller.showBarchart();
      const afterBarchart = {
        timelineVisible: controller.timeline.visible,
        barchartVisible: controller.barchart.visible,
      };
      controller.showTimeline();
      const afterTimeline = {
        timelineVisible: controller.timeline.visible,
        barchartVisible: controller.barchart.visible,
      };
      return { before, afterBarchart, afterTimeline };
    });
    expect(visibility.before).toEqual({
      timelineVisible: true,
      barchartVisible: false,
    });
    expect(visibility.afterBarchart).toEqual({
      timelineVisible: false,
      barchartVisible: true,
    });
    expect(visibility.afterTimeline).toEqual({
      timelineVisible: true,
      barchartVisible: false,
    });
  });

  test("should set and get the current node/edge selection", async () => {
    const { selectedNodeIds, selectedEdgeIds } = await session.page.evaluate(
      () => {
        createOgma({
          graph: {
            nodes: [
              { id: 1, data: { start: new Date("1 1 1950") } },
              { id: 2, data: { start: new Date("1 1 1960") } },
            ],
            edges: [
              {
                id: "e1",
                source: 1,
                target: 2,
                data: { start: new Date("1 1 1955") },
              },
            ],
          },
        });
        const controller = createController({});
        controller.setSelection({
          nodes: ogma.getNodes([1]),
          edges: ogma.getEdges(["e1"]),
        });
        const selection = controller.getSelection();
        return {
          selectedNodeIds: selection.nodes.getId(),
          selectedEdgeIds: selection.edges.getId(),
        };
      },
    );
    expect(selectedNodeIds).toEqual([1]);
    expect(selectedEdgeIds).toEqual(["e1"]);
  });

  test("should clear the selection when called with no nodes/edges", async () => {
    const selectionSizeAfterClear = await session.page.evaluate(() => {
      createOgma({
        graph: {
          nodes: [{ id: 1, data: { start: new Date("1 1 1950") } }],
          edges: [],
        },
      });
      const controller = createController({});
      controller.setSelection({ nodes: ogma.getNodes([1]) });
      controller.setSelection({});
      return controller.getSelection().nodes.size;
    });
    expect(selectionSizeAfterClear).toEqual(0);
  });

  test("setOptions should apply new options and preserve the active mode", async () => {
    const { mode, nodeFilterEnabled } = await session.page.evaluate(() => {
      createOgma({
        graph: {
          nodes: [{ id: 1, data: { start: new Date("1 1 1950") } }],
          edges: [],
        },
      });
      const controller = createController({ switchOnZoom: false });
      controller.showBarchart();
      controller.setOptions({ nodeFilter: { enabled: false } });
      return {
        mode: controller.barchart.visible ? "barchart" : "timeline",
        nodeFilterEnabled: controller.filteredNodes.size,
      };
    });
    expect(mode).toBe("barchart");
    expect(nodeFilterEnabled).toBe(0);
  });

  test("destroy should remove the DOM content and stop listening to ogma", async () => {
    const childrenAfterDestroy = await session.page.evaluate(() => {
      createOgma({
        graph: {
          nodes: [{ id: 1, data: { start: new Date("1 1 1950") } }],
          edges: [],
        },
      });
      const controller = createController({});
      const container = document.getElementById("timeline") as HTMLElement;
      controller.destroy();
      return container.children.length;
    });
    expect(childrenAfterDestroy).toEqual(0);
  });
});
