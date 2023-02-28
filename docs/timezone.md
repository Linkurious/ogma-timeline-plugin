
# Timezones and Locales

By default the plugin will display all dates in english, on local time, but you can customize that easily. 

## Setup

First, you need to install `moment.js`

```sh
npm i moment
```

Then import it with locales: 

```ts
import moment from "moment/min/moment-with-locales";
```

## Timezone

To specify a timezone, simply pass a moment object with de desired timezone: 

```ts
const timelinePlugin = new TimelinePlugin(ogma, container, {
  barchart: {
    graph2dOptions: {
      moment: function (date) {
        return moment(date).utcOffset("+08:00")
      },
    },
  },
  timeline: {
    timelineOptions: {
      moment: function (date) {
        return moment(date).utcOffset("+08:00")
      },
    },
  },
});
```

## Locale

To specify a language, it is the same, just pass the desired locale 

```ts
const timelinePlugin = new TimelinePlugin(ogma, container, {
  barchart: {
    graph2dOptions: {
      moment: function (date) {
        return moment(date).locale('fr')
      },
    },
  },
  timeline: {
    timelineOptions: {
      moment: function (date) {
        return moment(date).locale('fr')
      },
    },
  },
});
```

## Locale and Timezone


```ts
const timelinePlugin = new TimelinePlugin(ogma, container, {
  barchart: {
    graph2dOptions: {
      moment: function (date) {
        return moment(date).utcOffset("+08:00").locale('fr')
      },
    },
  },
  timeline: {
    timelineOptions: {
      moment: function (date) {
        return moment(date).utcOffset("+08:00").locale('fr')
      },
    },
  },
});
```
