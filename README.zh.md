<p align="center">
  <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://vitejs.dev/logo.svg" alt="Vite logo" />
  </a>
</p>
<br/>
<p align="center">
  <a href="https://npmjs.com/package/vite-plugin-i18n-ally"><img src="https://img.shields.io/npm/v/vite-plugin-i18n-ally.svg" alt="npm package"></a>
</p>

# vite-plugin-i18n-ally

**中文** | [English](./README.md)

> 懒加载i18n国际化资源的 vite 插件

**NOTE：此插件跟语言框架无关，无论你使用React或Vue（或其他任意语言），只要是vite，都可以基于此插件实现国际化资源懒加载**

**考虑到更好的扩展性，此插件不负责国际化资源的解析，而是提供了一个 `i18nAlly` 方法，你需要基于此方法实现自己的国际化资源解析等逻辑**

## 特性

- 丝滑的国际化开发体验，不需手动引入资源文件
- **懒加载**语言资源文件，减少首屏资源体积
- 默认读取 `i18n-ally` 的配置项，无需额外配置
- 开箱即用 vite hmr

## 安装

```bash
pnpm add vite-plugin-i18n-ally -D
```

## 在线示例

[Demo](https://hemengke1997.github.io/vite-plugin-i18n-ally/)

## vite插件配置项

**如果已配置i18n.ally，插件会默认读取配置**

| 参数                    | 类型                                    | 默认值                           | 描述                                                             |
| ----------------------- | --------------------------------------- | -------------------------------- | ---------------------------------------------------------------- |
| localesPaths            | `string[]`                              | `i18n-ally.localesPaths`         | 存放语言资源的目录地址，相对于 `root`                            |
| root                    | `string`                                | `process.cwd()`                  | 项目根路径                                                       |
| namespace               | `boolean`                               | `i18n-ally.namespace \|\| false` | 是否启用命名空间                                                 |
| pathMatcher             | `string`                                | 自动探测                         | 资源文件匹配规则                                                 |
| parserPlugins           | `ParserPlugin[]`                        | 内置插件                         | 资源文件解析插件                                                 |
| useVscodeI18nAllyConfig | `boolean         \| { stopAt: string }` | `true`                           | 是否自动使用i18n配置项，如果传入stopAt，则会在指定的目录停止探测 |

## 配置参考

### vite.config.ts

```ts
import path from 'node:path'
import { defineConfig } from 'vite'
import { i18nAlly } from 'vite-plugin-i18n-ally'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [i18nAlly()],
})
```

## 客户端配置项

| 参数             | 类型       | 描述                                                    |
| ---------------- | ---------- | ------------------------------------------------------- |
| language         | `string`   | 当前语言                                                |
| namespaces       | `string[]` | 当前路由所需的namespaces                                |
| onInited         | `Function` | 初始化完成后的回调                                      |
| onResourceLoaded | `Function` | 资源加载完成后的回调，参数为资源和当前语言              |
| fallbackLng      | `string`   | 回退语言                                                |
| detection        | `Array`    | 语言探测和缓存，类似 `i18next-browser-languagedetector` |

## 与i18next配合使用

### main.tsx

```tsx
import React from 'react'
import { initReactI18next } from 'react-i18next'
import i18next from 'i18next'
import ReactDOM from 'react-dom/client'
import { i18nAlly } from 'vite-plugin-i18n-ally/client' // 注意是 client
import App from './App'

const root = ReactDOM.createRoot(document.querySelector('#root') as HTMLElement)

const { asyncLoadResource } = i18nAlly({
  onInit() {
    i18next.use(initReactI18next).init({
      resources: {}, // !!! 初始化时不添加资源，不然何来懒加载:)
      nsSeparator: '.',
      keySeparator: '.',
      fallbackLng: 'en',
    })
  },
  onInited() {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  },
 onResourceLoaded: (resources, { language }) => {
    Object.keys(resources).forEach((ns) => {
      i18next.addResourceBundle(language, ns, resources[ns])
    })
  },
  fallbackLng: 'en',
  /**
   * 探测配置
   * vite-plugin-i18n-ally 实现了一套简单易用的探测缓存机制
   */
   detection: [
    {
      detect: 'querystring',
      lookup: 'lang',
    },
    {
      detect: 'cookie',
      lookup: 'cookie-name',
    },
    {
      detect: 'htmlTag',
    },
  ],
})

const i18nextChangeLanguage = i18next.changeLanguage
i18next.changeLanguage = async (lang: string, ...args) => {
  // 语言改变之前，先加载资源
  await asyncLoadResource(lang)
  return i18nextChangeLanguage(lang, ...args)
}
```

## 完整示例

请参考 [i18next example](./playground/spa-with-namespace/src/main.tsx)

## vscode国际化配置参考

### .vscode => settings.json

```json
{
  "i18n-ally.localesPaths": ["src/locales"],
  "i18n-ally.keystyle": "nested",
  "i18n-ally.pathMatcher": "{locale}/{namespaces}.{ext}",
  "i18n-ally.namespace": true // 如果你的pathMatcher使用了`namepaces`，需要开启此配置
}
```

## ⚠️ 温馨提示

目前内置支持 `json` / `json5` / `yaml` / `yml` / `ts` / `js` 资源文件，可自定义插件解析语言

## 感谢

- [i18n-ally](https://github.com/lokalise/i18n-ally)
- [vite](https://github.com/vitejs/vite)

## License

MIT
