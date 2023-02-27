import { FilterStrategy, FilterTolerance } from "./types";


export function getSelector(bars: number[], strategy: FilterStrategy, tolerance: FilterTolerance)
: (a: number, b: number) => boolean
{

  if(strategy === 'before'){
    if(tolerance === 'strict'){
      return (a, b) => a < bars[0] && b < bars[0]
    }else{
      return (a, b) => a <= bars[0] || b <= bars[0]
    }
  }

  if(strategy === 'after'){
    if(tolerance === 'strict'){
      return (a, b) => a > bars[bars.length-1] && b > bars[bars.length-1]
    }else{
      return (a, b) => a > bars[bars.length-1] || b > bars[bars.length-1]
    }
  }
  if(strategy === 'between'){
    if(tolerance === 'strict'){
      return (a, b) => {
        for(let i = 0; i < bars.length-1; i+=2){
          const min = bars[i];
          const max = bars[i+1];
          if(a > min && a < max
            && b > min && b < max) return true;
        }
        return false;
      }
    }else{
      return (a, b) => {
        for(let i = 0; i < bars.length-1; i+=2){
          const min = bars[i];
          const max = bars[i+1];
          if(a < max && b > min) return true;
        }
        return false;
      }
    }
  }

    // outside
    if(tolerance === 'strict'){
      return (a, b) => {
        let res = true
        for(let i = 0; i < bars.length-1; i+=2){
          const min = bars[i];
          const max = bars[i+1];
          res = res && ((a < min && b < min) || (a > max && b > max));
        }
        return res;
      }
    }else{
      return (a, b) => {
        let res = true;
        for(let i = 0; i < bars.length-1; i+=2){
          const min = bars[i];
          const max = bars[i+1];
          res = res && (a < min || b < min || a > max || b > max);
        }
        return res;
      }
    }

}