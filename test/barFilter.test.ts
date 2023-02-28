import { assert, describe, it } from "vitest";

import { getSelector } from "../src/barFilter";

describe("getSelector", () => {
  // TODO add tests with NaN
  it("before strict", () => {
    const selector = getSelector([0, 10], "before", "strict");
    assert.equal(selector(-5, 5), false);
    assert.equal(selector(-10, -5), true);
    assert.equal(selector(1, 5), false);
    assert.equal(selector(5, 15), false);
    assert.equal(selector(11, 15), false);
  });
  it("before loose", () => {
    const selector = getSelector([0, 10], "before", "loose");
    assert.equal(selector(-5, 5), true);
    assert.equal(selector(-10, -5), true);
    assert.equal(selector(1, 5), false);
    assert.equal(selector(5, 15), false);
    assert.equal(selector(11, 15), false);
  });

  it("after strict", () => {
    const selector = getSelector([0, 10], "after", "strict");
    assert.equal(selector(-5, 5), false);
    assert.equal(selector(-10, -5), false);
    assert.equal(selector(1, 5), false);
    assert.equal(selector(5, 15), false);
    assert.equal(selector(11, 15), true);
  });

  it("after loose", () => {
    const selector = getSelector([0, 10], "after", "loose");
    assert.equal(selector(-5, 5), false);
    assert.equal(selector(-10, -5), false);
    assert.equal(selector(1, 5), false);
    assert.equal(selector(5, 15), true);
    assert.equal(selector(11, 15), true);
  });

  it("between strict", () => {
    const selector = getSelector([0, 10, 20, 30], "between", "strict");
    assert.equal(selector(-5, 5), false);
    assert.equal(selector(-10, -5), false);
    assert.equal(selector(1, 5), true);
    assert.equal(selector(5, 15), false);
    assert.equal(selector(11, 15), false);

    assert.equal(selector(15, 16), false);
    assert.equal(selector(15, 21), false);
    assert.equal(selector(21, 29), true);
    assert.equal(selector(21, 35), false);
    assert.equal(selector(35, 40), false);
  });

  it("between loose", () => {
    const selector = getSelector([0, 10, 20, 30], "between", "loose");
    assert.equal(selector(-5, 5), true);
    assert.equal(selector(-10, -5), false);
    assert.equal(selector(1, 5), true);
    assert.equal(selector(5, 15), true);
    assert.equal(selector(11, 15), false);

    assert.equal(selector(15, 16), false);
    assert.equal(selector(15, 21), true);
    assert.equal(selector(21, 29), true);
    assert.equal(selector(21, 35), true);
    assert.equal(selector(35, 40), false);
  });

  it("outside strict", () => {
    const selector = getSelector([0, 10, 20, 30], "outside", "strict");
    assert.equal(selector(-5, 5), false);
    assert.equal(selector(-10, -5), true);
    assert.equal(selector(1, 5), false);
    assert.equal(selector(5, 15), false);
    assert.equal(selector(11, 15), true);

    assert.equal(selector(15, 16), true);
    assert.equal(selector(15, 21), false);
    assert.equal(selector(21, 29), false);
    assert.equal(selector(21, 35), false);
    assert.equal(selector(35, 40), true);
  });

  it("outside loose", () => {
    const selector = getSelector([0, 10, 20, 30], "outside", "loose");
    assert.equal(selector(-5, 5), true);
    assert.equal(selector(-10, -5), true);
    assert.equal(selector(1, 5), false);
    assert.equal(selector(5, 15), true);
    assert.equal(selector(11, 15), true);

    assert.equal(selector(15, 16), true);
    assert.equal(selector(15, 21), true);
    assert.equal(selector(21, 29), false);
    assert.equal(selector(21, 35), true);
    assert.equal(selector(35, 40), true);
  });
});
