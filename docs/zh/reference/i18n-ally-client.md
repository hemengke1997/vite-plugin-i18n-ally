# 客户端配置

## language

- **类型**: `string`

初始化语言标识

## namespaces

- **类型**: `string[]`

初始化页面需要加载的命名空间

## fallbackLng

- **类型**: `string`

默认语言标识

## onInit

- **类型**: `(
    current: { language: string; namespaces: string[] },
    all: {
      languages: string[]
      namespaces: {
        [lang: string]: string[]
      }
    },
  ) => Promise<void> | void`

初始化时调用，此时国际化资源还未加载。一般用于初始化国际化库。

## onInited

- **类型**: `(
    current: {
      language: string
      namespaces: string[]
    },
    all: {
      languages: string[]
      namespaces: {
        [lang: string]: string[]
      }
    },
  ) => Promise<void> | void`

初始化完成后调用，此时国际化资源已首次加载完成。一般用于渲染应用。

## onResourceLoaded

- **类型**: `(
    resources: {
      [key in string]: string
    },
    current: {
      language: string
      namespace: string
    },
  ) => Promise<void> | void`

资源加载完成后调用。一般用于将资源添加到国际化库中。


## detection

- **类型**: `Array`

语言探测和缓存。当探测到语言标识时，将不再继续探测。越靠前优先级越高。

支持以下类型：

- `htmlTag`
  - `lookup` - html 标签中获取语言标识的属性名，默认为`lang`
  - `cache` - 是否缓存语言标识
- `querystring`
  - `lookup` - querystring 中获取语言标识的属性名，默认为`lang`
  - `cache` - 是否缓存语言标识
- `cookie`
  - `lookup` - cookie 中获取语言标识的属性名
  - `attribute: CookieAttributes` - cookie 属性
  - `cache` - 是否缓存语言标识
- `localStorage`
  - `lookup` - localStorage 中获取语言标识的属性名
  - `cache` - 是否缓存语言标识
- `sessionStorage`
  - `lookup` - sessionStorage 中获取语言标识的属性名
  - `cache` - 是否缓存语言标识
- `path`
  - `lookup` - url pathname 中获取语言标识的下标，默认为 `0`
  - `cache` - 是否缓存语言标识
- `navigator`


参考：[语言探测](../guides/language-detection.md#客户端)

## customDetectors

- **类型**: `Detector[]`

自定义语言探测器。如果内置探测器无法满足需求，可以通过此选项添加自定义探测器。

添加了自定义探测器后，需要在 `detection` 中添加对应的探测配置。

```tsx
i18nAlly<
  (
    | {
        name: 'custom'
        lookup: (options: { lookup: string }) => string
      }
    | {
        name: 'onemore'
        lookup: (options: { lookup: string }) => string
      }
  )[]
>({
  customDetectors: [
    {
      name: 'custom',
      lookup: ({ lookup }) => {
        // 自定义探测逻辑
      },
    },
    {
      name: 'onemore',
      lookup: ({ lookup }) => {
        // 自定义探测逻辑
      },
    },
  ],
  detection: [
    {
      detect: 'custom',
      lookup: 'custom-lookup',
      cache: false,
    }, 
    {
      detect: 'onemore',
      lookup: 'onemore-lookup',
      cache: true,
    },
  ],
})
```
