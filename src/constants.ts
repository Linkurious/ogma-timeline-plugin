export const day = 1000 * 3600 * 24;
export const month = day * 30;
export const year = day * 365;

export const scales = [
  // milis
  1,
  // second
  1000,
  // 5 seconds
  5000,
  // 10 seconds
  10000,
  // 1 minute
  60000,
  // 5 minutes
  60000 * 5,
  // 10 minutes
  60000 * 5,
  // 1 hour
  3600 * 1000,
  // 1 day
  day,
  // 1 week
  7 * day,
  // 1 month
  month,
  // 3 months
  3 * month,
  // 6 months
  0.5 * year,
  // 1 year
  year,
  // 5 years
  5 * year,
  // 10 years
  10 * year,
  // 10 years
  50 * year,
  // 100 years
  100 * year,
  // 500 years
  500 * year,
  // 1000 years
  1000 * year,
];

export const zoomIn = "zoom-in";
export const zoomOut = "zoom-out";
export const scaleChange = "scale-change";
export const click = "click";
export const rangechanged = "rangechanged";
export const rangechange = "rangechange";
export const timechange = "timechange";
export const timechanged = "timechanged";
export const redraw = "redraw";
export const select = "select";
