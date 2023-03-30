import { defineUserConfig } from "vuepress";
import { defaultTheme } from "@vuepress/theme-default";
import { searchPlugin } from "@vuepress/plugin-search";

export default defineUserConfig({
  lang: "en-US",
  title: "Ogma-timeline-plugin",
  description: "Documentation for the Ogma-Timeline-Plugin",
  head: [["link", { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]],
  base: "/ogma-timeline-plugin/",
  theme: defaultTheme({
    logo: "/favicon.ico",
    sidebar: ["/", "/grouping", "/styling", "/filtering", "/timezone"],
    repo: "@linkurious/ogma-timeline-plugin",
  }),
  plugins: [[searchPlugin({})]],
});
