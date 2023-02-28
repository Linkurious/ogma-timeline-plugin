import { FilterStrategy, FilterTolerance } from "./types";

export function getSelector(
  bars: number[],
  strategy: FilterStrategy,
  tolerance: FilterTolerance
): (a: number, b: number) => boolean {
  if (strategy === "before") {
    if (tolerance === "strict") {
      return (a, b) => (isNaN(a) || a < bars[0]) && (isNaN(b) || b < bars[0]);
    } else {
      return (a, b) => isNaN(a) || a <= bars[0] || isNaN(b) || b <= bars[0];
    }
  }

  if (strategy === "after") {
    if (tolerance === "strict") {
      return (a, b) =>
        (isNaN(a) || a > bars[bars.length - 1]) &&
        (isNaN(b) || b > bars[bars.length - 1]);
    } else {
      return (a, b) =>
        isNaN(a) ||
        a > bars[bars.length - 1] ||
        isNaN(b) ||
        b > bars[bars.length - 1];
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
          if ((isNaN(a) || a < max) && (isNaN(b) || b > min)) return true;
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
      const isNanB = isNaN(a);

      for (let i = 0; i < bars.length - 1; i += 2) {
        const min = bars[i];
        const max = bars[i + 1];
        res =
          res &&
          (((isNanA || a < min) && (isNanB || b < min)) ||
            ((isNanA || a > max) && (isNanB || b > max)));
      }
      return res;
    };
  } else {
    return (a, b) => {
      const isNanA = isNaN(a);
      const isNanB = isNaN(a);
      let res = true;
      for (let i = 0; i < bars.length - 1; i += 2) {
        const min = bars[i];
        const max = bars[i + 1];
        res = res && (isNanA || isNanB || a < min || b < min || a > max || b > max);
      }
      return res;
    };
  }
}
