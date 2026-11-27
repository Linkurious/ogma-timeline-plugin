import { FilterStrategy, FilterTolerance } from "./types";

type Comparator = (a: number, b: number) => boolean;

/**
 * Builds a one-sided ("before"/"after") comparator. `NaN` acts as a
 * wildcard: an endpoint that isn't defined never blocks a match on its
 * own. In "strict" mode it is simply ignored (`isNaN(x) || xOk`); in
 * "loose" mode it falls back to whatever the other endpoint decides,
 * or `true` if both are undefined.
 */
function sideSelector(
  bar: number,
  isBefore: boolean,
  strict: boolean,
): Comparator {
  return (a, b) => {
    const isNanA = isNaN(a);
    const isNanB = isNaN(b);
    const aOk = isBefore ? a < bar : a > bar;
    const bOk = isBefore ? b < bar : b > bar;
    if (strict) return (isNanA || aOk) && (isNanB || bOk);
    if (isNanA && isNanB) return true;
    if (isNanA) return bOk;
    if (isNanB) return aOk;
    return aOk || bOk;
  };
}

interface Window {
  min: number;
  max: number;
}

/** Turns a flat list of timebars into (min, max) window pairs. */
function toWindows(bars: number[]): Window[] {
  const windows: Window[] = [];
  for (let i = 0; i < bars.length - 1; i += 2) {
    windows.push({ min: bars[i], max: bars[i + 1] });
  }
  return windows;
}

/** Whether [a, b] overlaps a given timebar window (used by "between"). */
function overlapsWindow(
  a: number,
  b: number,
  { min, max }: Window,
  strict: boolean,
): boolean {
  const isNanA = isNaN(a);
  const isNanB = isNaN(b);
  const aIn = a > min && a < max;
  const bIn = b > min && b < max;
  if (strict) return (isNanA || aIn) && (isNanB || bIn);
  if (isNanA && isNanB) return true;
  if (isNanA) return bIn;
  if (isNanB) return aIn;
  return a < max && b > min;
}

/** Whether [a, b] falls entirely outside a given timebar window (used by "outside"). */
function outsideWindow(
  a: number,
  b: number,
  { min, max }: Window,
  strict: boolean,
): boolean {
  const isNanA = isNaN(a);
  const isNanB = isNaN(b);
  if (isNanA && isNanB) return true;
  if (isNanA) return b < min || b > max;
  if (isNanB) return a < min || a > max;
  return strict
    ? (a < min && b < min) || (a > max && b > max)
    : a < min || b < min || a > max || b > max;
}

export function getSelector(
  bars: number[],
  strategy: FilterStrategy,
  tolerance: FilterTolerance,
): Comparator {
  const strict = tolerance === "strict";

  if (strategy === "before") return sideSelector(bars[0], true, strict);
  if (strategy === "after")
    return sideSelector(bars[bars.length - 1], false, strict);

  const windows = toWindows(bars);
  if (strategy === "between")
    return (a, b) => windows.some((w) => overlapsWindow(a, b, w, strict));

  // strategy === "outside"
  return (a, b) => windows.every((w) => outsideWindow(a, b, w, strict));
}
