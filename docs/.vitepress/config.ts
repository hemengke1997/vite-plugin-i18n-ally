import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/vite-plugin-i18n-ally/',
  title: 'vite-plugin-i18n-ally',
  description: 'Vite plugin for automatic lazy loading of i18n resources',
  locales: {
    root: {
      lang: 'en',
      label: 'English',
      description: 'Vite plugin for automatic lazy loading of i18n resources',
      themeConfig: {
        nav: [
          { text: 'Guides', link: '/guides/getting-started' },
          { text: 'Reference', link: '/reference/plugin-options' },
          { text: 'Examples', link: 'https://github.com/hemengke1997/vite-plugin-i18n-ally/tree/master/playground' },
        ],
        sidebar: [
          {
            text: 'Guides',
            items: [
              { text: 'Getting Started', link: '/guides/getting-started' },
              { text: 'Namespace', link: '/guides/namespace' },
            ],
          },
          {
            text: 'Reference',
            items: [
              { text: 'Plugin Options', link: '/reference/plugin-options' },
              { text: 'i18nAlly Client Options', link: '/reference/i18n-ally-client' },
            ],
          },
        ],
      },
    },
    zh: {
      lang: 'zh',
      label: '简体中文',
      description: 'Vite 插件，用于自动懒加载 i18n 资源',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guides/getting-started' },
          { text: '参考', link: '/zh/reference/plugin-options' },
          { text: '示例', link: 'https://github.com/hemengke1997/vite-plugin-i18n-ally/tree/master/playground' },
        ],
        sidebar: [
          {
            text: '指南',
            items: [
              { text: '快速上手', link: '/zh/guides/getting-started' },
              {
                text: '命名空间',
                link: '/zh/guides/namespace',
              },
            ],
          },
          {
            text: '参考',
            items: [
              { text: '插件配置', link: '/zh/reference/plugin-options' },
              {
                text: 'i18nAlly 客户端配置',
                link: '/zh/reference/i18n-ally-client',
              },
            ],
          },
        ],
      },
    },
  },
  themeConfig: {
    socialLinks: [{ icon: 'github', link: 'https://github.com/vuejs/vitepress' }],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 hemengke1997',
    },
  },
})