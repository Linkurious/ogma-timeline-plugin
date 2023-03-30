import { defineUserConfig } from "vuepress";
import { defaultTheme } from "@vuepress/theme-default";
import { searchPlugin } from "@vuepress/plugin-search";
import { html5Media } from "markdown-it-html5-media";
export default defineUserConfig({
  lang: "en-US",
  title: "Ogma-timeline-plugin",
  description: "Documentation for the Ogma-Timeline-Plugin",
  head: [["link", { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]],
  base: "/ogma-timeline-plugin/",
  theme: defaultTheme({
    logo: "/favicon.ico",
    sidebar: [
      "/",
      "/grouping",
      "/styling",
      "/filtering",
      "/timebars",
      "/timezone",
    ],
    repo: "Linkurious/ogma-timeline-plugin",
  }),
  plugins: [
    searchPlugin({}),
    {
      name: "video-md",
      extendsMarkdown: (md) => {
        md.use(html5Media, {
          videoAttrs: 'class="video" controls',
          audioAttrs: 'class="audio" data-collapse',
        });
      },
    },
  ],
});
