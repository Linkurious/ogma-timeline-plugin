import { defineUserConfig } from 'vuepress';
import { defaultTheme } from '@vuepress/theme-default';
import { searchPlugin } from '@vuepress/plugin-search'

export default defineUserConfig({
  // site config
  lang: 'en-US',
  title: 'Ogma-Plugin-timeline',
  description: 'Documentation for the Ogma-Timeline-Plugin',
  head:  [['link', { rel: 'icon', type:'image/x-icon', href: '/favicon.ico' }]],
  // base: "/plugin-timeline/",
  // theme: '@vuepress/theme-default',
  theme: defaultTheme({
    logo: '/favicon.ico',
    sidebar: [
      '/',
      '/filtering.md',
    ],
    repo: '@linkurious/ogma-timeline-plugin'
  }),
  plugins: [
    [
      // ['@vuepress/search', {
      //   searchMaxSuggestions: 10
      // }]
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