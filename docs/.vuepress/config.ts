import { defineUserConfig } from 'vuepress';
import { defaultTheme } from '@vuepress/theme-default';
import { searchPlugin } from '@vuepress/plugin-search'

export default defineUserConfig({
  // site config
  lang: 'en-US',
  title: 'Ogma-Plugin-timeline',
  description: 'Documentation for the Ogma-Timeline-Plugin',
  head: [['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]],
  base: "/ogma-timeline-plugin/",
  theme: defaultTheme({
    sidebarDepth: 3,
    logo: '/favicon.ico',
    sidebar: [
      '/',
      '/grouping',
      '/styling',
      '/filtering',
      '/timezone',
    ],
    repo: 'Linkurious/ogma-timeline-plugin'
  }),
  plugins: [
    [
      searchPlugin({
        locales: {
          '/': {
            placeholder: 'Search',
          },
          '/zh/': {
            placeholder: '搜索',
          },
        }
      }),
    ],
  ],
});