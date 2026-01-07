import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: " timeline plugin",
  head: [["link", { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]],
  description: "Timeline filtering for Ogma graph visualization",
  base: "/ogma-timeline-plugin/",

  themeConfig: {
    logo: {
      light: "https://doc.linkurious.com/ogma/latest/logo-white.svg",
      dark: "https://doc.linkurious.com/ogma/latest/logo.svg",
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Getting started", link: "/getting-started.md" },
      { text: "API", link: "/API.md" },
      { text: "Examples", link: "/examples/index.md" },
    ],

    sidebar: [
      {
        text: "Grouping",
        link: "/grouping.md",
      },
      {
        text: "Styling",
        link: "/styling.md",
      },
      {
        text: "Filtering",
        link: "/filtering.md",
      },
      {
        text: "Selecting",
        link: "/selecting.md",
      },
      {
        text: "Timebars",
        link: "/timebars.md",
      },
      {
        text: "Timezones and locales",
        link: "/timezone.md",
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/linkurious/ogma-timeline-plugin",
      },
    ],
  },
});
