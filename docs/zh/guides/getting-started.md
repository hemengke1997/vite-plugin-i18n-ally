# 快速上手

此指南将帮助您快速了解如何使用 `vite-plugin-i18n-ally` 在你的Vite项目中实现丝滑的国际化。

## 准备工作

- `vite-plugin-i18n-ally` 沿用了 [vscode-i18n-ally](https://github.com/lokalise/i18n-ally/blob/main/README.zh-CN.md) 部分配置。同时我们强烈推荐在vscode中安装 `i18n-ally` 插件，以获得更好的开发体验。

- 你可以选择使用任意语言框架，本指南将以 `React`、`react-i18next` 为例。

## 第 1 步：安装

首先，我们需要安装必要的依赖：

```bash
npm i vite-plugin-i18n-ally i18next react-i18next
```

## 第 2 步：配置

在你的 `vite.config.ts` 中引入此插件

```ts
import { defineConfig } from 'vite'
import { i18nAlly } from 'vite-plugin-i18n-ally'

export default defineConfig({
  plugins: [i18nAlly()],
})
```

`vite-plugin-i18n-ally` 默认会读取项目中的 `.vscode/settings.json` 中的 `i18n-ally.*` 配置，所以大部分情况下，无需再进行额外配置

关于vscode-i18n-ally配置，请参考 [官方文档](https://github.com/lokalise/i18n-ally/wiki/Configurations)。


你也可以在 `vite.config.ts` 中配置 `i18n-ally` 插件的选项，请参考 [插件选项](/zh/reference/plugin-options)。

## 第 3 步：前端代码中使用

首先我们需要从 `vite-plugin-i18n-ally/client` 引入插件提供的客户端API。客户端API的核心是用于开发者控制如何使用已加载的国际化资源以及如何缓存语言标识。

### 加载国际化资源

```tsx
// main.tsx
import { i18nAlly } from 'vite-plugin-i18n-ally/client'
```

`i18nAlly` API 提供了一些hook，便于开发者初始化应用和使用资源。

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { initReactI18next } from 'react-i18next'
import i18next from 'i18next'
import { i18nAlly } from 'vite-plugin-i18n-ally/client'

const fallbackLng = 'en'

const { asyncLoadResource } = i18nAlly({
  // onInit hook 在i18nAlly初始化时调用，此时国际化资源还未加载
  async onInit({ language }) {
    i18next.use(initReactI18next).init({
      lng: language,
      resources: {}, // 空对象即可，资源会在onResourceLoaded hook中加载
      nsSeparator: '.',
      keySeparator: '.',
      fallbackLng,
    })
  },
  // onInited hook 在i18nAlly初始化完成后调用，此时国际化资源已首次加载完成
  onInited() {
    root.render(
      <React.StrictMode>
        { /* Your App */ }
      </React.StrictMode>,
    )
  },
  // onResourceLoaded hook 在资源加载完成后调用
  // 在这里我们需要将资源添加到i18next中
  onResourceLoaded: (resources, { language }) => {
    i18next.addResourceBundle(language, i18next.options.defaultNS[0], resources)
  },
  fallbackLng,
})
```

为了在语言切换时加载资源，我们需要重写 `i18next.changeLanguage` 方法

```tsx{3-8}
const { asyncLoadResource } = i18nAlly()

const i18nextChangeLanguage = i18next.changeLanguage
i18next.changeLanguage = async (lang: string, ...args) => {
  // 在语言切换前加载资源
  await asyncLoadResource(lang)
  return i18nextChangeLanguage(lang, ...args)
}
```

### 探测和缓存语言标识

i18nAlly 提供了类似 [i18next-browser-languageDetector](https://github.com/i18next/i18next-browser-languageDetector) 的语言探测和缓存功能

detection数组优先级递减，当探测到语言标识时，将不再继续探测

```tsx
i18nAlly({
  detection: [
    {
      detect: 'querystring',
      lookup: 'lang',
    },
    {
      detect: 'cookie',
      lookup: 'cookie-name',
      cache: true,
    },
    {
      detect: 'htmlTag',
      cache: false,
    },
  ],
})
```

关于更多缓存和探测配置，请参考 [i18nAlly配置](../reference/i18n-ally-client)。

## 第 4 步：添加国际化资源

在你的项目中添加国际化资源文件。假设我们的配置如下：

```json
{
  "i18n-ally.keystyle": "nested",
  "i18n-ally.localesPaths": ["src/locales"],
  "i18n-ally.pathMatcher": "{locale}.json",
  "i18n-ally.namespace": false,
}
```

那么我们需要在 `src/locales` 目录下添加资源文件 `en.json`：

```json
{
  "hello": "Hello, World!"
}
```

## 第 5 步：使用国际化资源

在你的组件中使用 `react-i18next` 提供的 `useTranslation` hook

```tsx
import { useTranslation } from 'react-i18next'

export default function Hello() {
  const { t } = useTranslation()

  return (
    <h1>
      {t('hello')}
    </h1>
  )
}
```


现在你的项目中就具备基本的i18n国际化自动懒加载功能了！

我们不再需要手动引入资源文件了，只是在 `localesPaths` 中添加资源文件即可，`vite-plugin-i18n-ally` 会自动搜索资源文件
