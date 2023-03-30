# Timebars

We provide `timebars`, which the user can drag to filter in/out nodes. Please checkout the [Getting started](#filter-nodes-depending-on-time) section to see how to hook ogma filter to the timeline.


![](/filter-between.mp4)


Let's see how to bring some colors into this. 
## Add Timebars

Timebars are defined by the `timeBars` option. You can pass a `number`, a `Date` or an `Object`.
```ts
const controller = new Controller(ogma, document.getElementById("timeline"), {
  timeBars: [0, new Date("1/7/1950"), {  fixed: true, date: new Date("1/7/1960")}],
});
```

The effect of timebars is defined by the `filter` option. 
Please check the [filtering](/filtering.md) section for further details on the filtering option.

```ts
const controller = new Controller(ogma, document.getElementById("timeline"), {
 filter: {
    enabled: true,
    strategy: "between",
    tolerance: "strict",
  },
});
```

You can access the timebars via controller`.getTimebars`
You can add and remove timebars via: controller`.addTimebar` and controller`.removeTimebar` and `.setTimebars`.

## Fixed Timebars

By default timebars move around while dragging the timeline. If you which for having fixed timebars, just pass:  
```ts
const controller = new Controller(ogma, document.getElementById("timeline"), {
  timeBars: [
    {  fixed: true, date: new Date("1/7/1950")},
    {  fixed: true, date: new Date("1/7/1960")}
  ],
});
```

![](/filter-between-fixed.mp4)
