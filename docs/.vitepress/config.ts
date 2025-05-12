import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    server: {
      port: 3003,
    },
  },
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
              { text: 'Language Detection', link: '/guides/language-detection' },
              { text: 'Migration', link: '/guides/migration/v6' },
            ],
          },
          {
            text: 'Reference',
            items: [
              { text: 'Plugin Options', link: '/reference/plugin-options' },
              { text: 'Client Options', link: '/reference/i18n-ally-client' },
              { text: 'Server Options', link: '/reference/i18n-ally-server' },
            ],
          },
        ],
      },
    },
    zh: {
      lang: 'zh',
      label: '简体中文',
      description: '自动懒加载 i18n 资源的 Vite插件',
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
              {
                text: '语言探测',
                link: '/zh/guides/language-detection',
              },
              {
                text: '迁移',
                link: '/zh/guides/migration/v6',
              },
            ],
          },
          {
            text: '参考',
            items: [
              { text: '插件配置', link: '/zh/reference/plugin-options' },
              {
                text: '客户端配置',
                link: '/zh/reference/i18n-ally-client',
              },
              {
                text: '服务端配置',
                link: '/zh/reference/i18n-ally-server',
              },
            ],
          },
        ],
      },
    },
  },
  themeConfig: {
    socialLinks: [{ icon: 'github', link: 'https://github.com/hemengke1997/vite-plugin-i18n-ally' }],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 hemengke1997',
    },
    logo: '/logo.svg',
    search: {
      provider: 'local',
    },
  },
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/vite-plugin-i18n-ally/logo.svg' }]],
})
