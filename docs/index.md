---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Ogma timeline plugin"
  text: "Timeline filtering for Ogma graph visualization"
  tagline: "Easily add a timeline to your Ogma instance and filter nodes and edges depending on time"
  image:
    src: https://doc.linkurious.com/ogma/latest/examples/cyber-security.png
    alt: Ogma timeline plugin
  actions:
    - theme: brand
      text: Getting Started
      link: /getting-started
    - theme: alt
      text: API reference
      link: /api

features:
  - title: Time-based filtering
    details: Filter nodes and edges based on temporal data with intuitive range selection and playback controls
  - title: Seamless Ogma integration
    details: Drops right into your existing Ogma graph visualization with minimal configuration required
  - title: Interactive timeline
    details: Drag, zoom, and scrub through time to explore how your graph evolves dynamically
---

<style>

:root {
  --vp-c-brand-1: #0094ff;
}

@media (min-width: 960px) {
  .image-src {
    max-width: 100% !important;
  }
}

@media (min-width: 640px) {
  .image-src {
    max-width: 100% !important;
  }
}
</style>
