import { FilterStrategy, FilterTolerance } from "./types";

export function getSelector(
  bars: number[],
  strategy: FilterStrategy,
  tolerance: FilterTolerance,
): (a: number, b: number) => boolean {
  const firstBar = bars[0];
  const lastBar = bars[bars.length - 1];
  if (strategy === "before") {
    if (tolerance === "strict") {
      return (a, b) => (isNaN(a) || a < firstBar) && (isNaN(b) || b < firstBar);
    } else {
      return (a, b) =>
        isNaN(a)
          ? isNaN(b)
            ? true
            : b < firstBar
          : isNaN(b)
            ? a < firstBar
            : a < firstBar || b < firstBar;
    }
  }

  if (strategy === "after") {
    if (tolerance === "strict") {
      return (a, b) => (isNaN(a) || a > lastBar) && (isNaN(b) || b > lastBar);
    } else {
      return (a, b) =>
        isNaN(a)
          ? isNaN(b)
            ? true
            : b > lastBar
          : isNaN(b)
            ? a > lastBar
            : a > lastBar || b > lastBar;
    }
  }
  if (strategy === "between") {
    if (tolerance === "strict") {
      return (a, b) => {
        for (let i = 0; i < bars.length - 1; i += 2) {
          const min = bars[i];
          const max = bars[i + 1];
          if (
            (isNaN(a) || (a > min && a < max)) &&
            (isNaN(b) || (b > min && b < max))
          )
            return true;
        }
        return false;
      };
    } else {
      return (a, b) => {
        for (let i = 0; i < bars.length - 1; i += 2) {
          const min = bars[i];
          const max = bars[i + 1];
          if (
            isNaN(b)
              ? isNaN(a)
                ? true
                : a < max && a > min
              : isNaN(a)
                ? b < max && b > min
                : a < max && b > min
          )
            return true;
        }
        return false;
      };
    }
  }

  // outside
  if (tolerance === "strict") {
    return (a, b) => {
      let res = true;
      const isNanA = isNaN(a);
      const isNanB = isNaN(b);
      if (isNanA && isNanB) return true;
      for (let i = 0; i < bars.length - 1; i += 2) {
        const min = bars[i];
        const max = bars[i + 1];
        res =
          res &&
          (isNanA
            ? b < min || b > max
            : isNanB
              ? a < min || a > max
              : (a < min && b < min) || (a > max && b > max));
      }
      return res;
    };
  } else {
    return (a, b) => {
      let res = true;
      const isNanA = isNaN(a);
      const isNanB = isNaN(b);
      if (isNanA && isNanB) return true;
      for (let i = 0; i < bars.length - 1; i += 2) {
        const min = bars[i];
        const max = bars[i + 1];
        res =
          res &&
          (isNanA
            ? b < min || b > max
            : isNanB
              ? a < min || a > max
              : a < min || b < min || a > max || b > max);
      }
      return res;
    };
  }
}
