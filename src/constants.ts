import { Scale } from "./types";

export const day = 1000 * 3600 * 24;
export const month = day * 30;
export const year = day * 365;

export const scales: Scale[] = [
  {
    name: "millisecond",
    millis: 1,
  },
  {
    name: "second",
    millis: 1000,
  },
  {
    name: "5 seconds",
    millis: 1000,
  },
  {
    name: "10 seconds",
    millis: 1000,
  },
  {
    name: "1 minute",
    millis: 60000,
  },
  {
    name: "5 minutes",
    millis: 60000 * 5,
  },
  {
    name: "10 minutes",
    millis: 60000 * 10,
  },
  {
    name: "1 hour",
    millis: 3600 * 1000,
    round: (x) =>
      +new Date(x.getFullYear(), x.getMonth(), x.getDate(), x.getHours(), 30),
  },
  {
    name: "1 day",
    millis: day,
    round: (x) => +new Date(x.getFullYear(), x.getMonth(), x.getDate(), 12),
  },
  {
    name: "1 week",
    millis: 7 * day,
    round: (x) =>
      +new Date(
        x.getFullYear(),
        x.getMonth(),
        x.getDate() - x.getDay() + 2,
        12
      ),
  },
  {
    name: "1 month",
    millis: month,
    round: (x) => +new Date(x.getFullYear(), x.getMonth(), 15, 12),
  },
  {
    name: "3 months",
    millis: 3 * month,
    round: (x) =>
      +new Date(x.getFullYear(), Math.floor(x.getMonth() / 3) * 3 + 1, 15, 12),
  },
  {
    name: "6 months",
    millis: 6 * month,
    round: (x) =>
      +new Date(x.getFullYear(), Math.floor(x.getMonth() / 6) * 6 + 3, 15, 12),
  },
  {
    name: "1 year",
    millis: year,
    round: (x) => +new Date(x.getFullYear(), 6, 15, 12),
  },
  {
    name: "5 years",
    millis: 5 * year,
    round: (x) =>
      +new Date((Math.floor(x.getFullYear()) / 5) * 5 + 2, 6, 15, 12),
  },
  {
    name: "10 years",
    millis: 10 * year,
    round: (x) =>
      +new Date((Math.floor(x.getFullYear()) / 10) * 10 + 5, 6, 15, 12),
  },
  {
    name: "50 years",
    millis: 50 * year,
    round: (x) =>
      +new Date((Math.floor(x.getFullYear()) / 50) * 50 + 25, 6, 15, 12),
  },
  {
    name: "100 years",
    millis: 100 * year,
    round: (x) =>
      +new Date((Math.floor(x.getFullYear()) / 100) * 100 + 50, 6, 15, 12),
  },
  {
    name: "500 years",
    millis: 500 * year,
    round: (x) =>
      +new Date((Math.floor(x.getFullYear()) / 500) * 500 + 250, 6, 15, 12),
  },
  {
    name: "1000 years",
    millis: 1000 * year,
    round: (x) =>
      +new Date((Math.floor(x.getFullYear()) / 1000) * 1000 + 500, 6, 15, 12),
  },
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
