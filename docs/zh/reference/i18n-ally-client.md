# i18nAlly 客户端配置

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

语言探测和缓存。优先级按输入数组依次递减，当探测到语言标识时，将不再继续探测。

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


