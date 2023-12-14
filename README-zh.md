
<p align="center">
  <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://vitejs.dev/logo.svg" alt="Vite logo" />
  </a>
</p>
<br/>
<p align="center">
  <a href="https://npmjs.com/package/vite-plugin-i18n-detector"><img src="https://img.shields.io/npm/v/vite-plugin-i18n-detector.svg" alt="npm package"></a>
</p>


# vite-plugin-i18n-detector

**中文** | [English](./README.md)

> 懒加载i18n国际化资源的 vite 插件

**NOTE：此插件跟语言框架无关，无论你使用React或Vue（或其他任意语言），只要是vite，都可以基于此插件实现国际化资源懒加载**

**考虑到更好的扩展性，此插件不负责国际化资源的解析，而是提供了一个 `setupI18n` 方法，你需要基于此方法实现自己的国际化资源解析等逻辑**

## 特性

- 无感知的开发体验，不需手动引入资源文件
- **懒加载**语言资源文件，减少首屏资源体积
- 类 `i18n-ally` 的配置项，更易上手

## 安装

```bash
pnpm add vite-plugin-i18n-detector -D
```

## 在线示例
[Demo](https://hemengke1997.github.io/vite-plugin-i18n-detector/)


## 配置项
| 参数          | 类型             | 默认值                                  | 描述                   |
| ------------- | ---------------- | --------------------------------------- | ---------------------- |
| localesPaths  | `string[]`       | `['./src/locales', './locales']`        | 存放语言资源的目录地址 |
| pathMatcher   | `string`         | `{locale}/{namespaces}.{ext}`           | 资源文件匹配规则       |
| parserPlugins | `ParserPlugin[]` | `[jsonParser, json5Parser, yamlParser]` | 资源文件解析插件       |
| root          | `string`         | `process.cwd()`                         | 项目根目录             |

## 配置参考

### vite.config.ts
```ts
import path from 'node:path'
import { defineConfig } from 'vite'
import { i18nDetector } from 'vite-plugin-i18n-detector'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    i18nDetector({
      localesPaths: ['./src/locales'],
    }),
  ],
})
```

## 与React-i18next配合使用

### main.tsx
```tsx
import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { initReactI18next } from 'react-i18next'
import { setupI18n } from 'vite-plugin-i18n-detector/client'
import App from './App'

const root = ReactDOM.createRoot(document.querySelector('#root') as HTMLElement)

const lookupTarget = 'lang'
const fallbackLng = 'en'

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {}, // !!! 初始化时不添加资源，不然何来懒加载:)
    nsSeparator: '.',
    fallbackLng,
    detection: { // 探测浏览器语言
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator'],
      caches: ['localStorage', 'sessionStorage', 'cookie'],
      lookupQuerystring: lookupTarget,
      // ... 更多配置请查阅 i18next-browser-languagedetector
    },
  })


const { loadResourceByLang } = setupI18n({
  language: i18next.language,
  onInited() {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  },
  onResourceLoaded: (langs, currentLang) => { // 资源加载完成后，添加到i18next
    Object.keys(langs).forEach((ns) => {
      i18next.addResourceBundle(currentLang, ns, langs[ns])
    })
  },
  fallbackLng,
  query: {
    url: lookupTarget,
  },
})

const _changeLanguage = i18next.changeLanguage
i18next.changeLanguage = async (lang: string, ...args) => {
  const currentLng = lang

  // 语言改变之前，先加载资源
  await loadResourceByLang(currentLng)
  return _changeLanguage(currentLng, ...args)
}
```

## 完整示例
请参考 [i18next example](./playground/spa/src/main.tsx)

## vscode国际化配置参考

### .vscode => settings.json
``` json
{
  "i18n-ally.localesPaths": ["src/locales"],
  "i18n-ally.keystyle": "flat",
  "i18n-ally.enabledParsers": ["json", "json5", "yaml"],
  "i18n-ally.enabledFrameworks": ["react", "i18next"],
  "i18n-ally.namespace": true,
  "i18n-ally.pathMatcher": "{locale}/{namespaces}.{ext}",
}
```


## ⚠️ 温馨提示

目前内置支持 `json` / `json5` / `yaml` / `yml` 资源文件，可自定义插件解析语言

## 感谢

- [i18n-ally](https://github.com/lokalise/i18n-ally)
- [vite](https://github.com/vitejs/vite)

## License

MIT
