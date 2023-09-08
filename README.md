# vite-plugin-i18n-detector

> i18n国际化资源懒加载 vite 插件

## 特性

- 无感知开发体验
- **懒加载**当前语言资源文件
- 类 `i18n-ally` 的配置项

## 安装

```bash
pnpm add vite-plugin-i18n-detector -D
```

## 在线示例
[Demo](https://hemengke1997.github.io/vite-plugin-i18n-detector/)

## 代码示例
[playground](./playground/spa/)

## vscode国际化配置

### .vscode => settings.json
``` json
{
  "i18n-ally.localesPaths": ["src/locale"],
  "i18n-ally.keystyle": "flat",
  "i18n-ally.enabledParsers": ["json", "json5"],
  "i18n-ally.enabledFrameworks": ["react", "i18next"],
  "i18n-ally.namespace": true,
  "i18n-ally.pathMatcher": "{locale}/{namespaces}.{ext}",
  "i18n-ally.sourceLanguage": "en"
}
```


## ⚠️ 提示

目前仅支持 `json(5)` 资源文件
