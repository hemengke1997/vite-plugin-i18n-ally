# 命名空间

在 [快速上手](./getting-started) 章节中，我们实现了一个基础的 i18n 国际化自动懒加载功能。但是，当项目变得庞大时，资源文件可能会变得庞大，这时候我们就需要对资源文件进行细粒度的控制。

`vite-plugin-i18n-ally` 提供了 `namespace` 配置，用于启用命名空间。启用后，插件会根据命名空间生成对应的资源文件，以减少资源文件大小。

你可以设置 `i18n-ally.namespace`
```json
{
  "i18n-ally.namespace": true,
  "i18n-ally.pathMatcher": "{locale}/{namespace}.{ext}"
}
```
或是在 `vite.config.ts` 中配置：

```ts
import { defineConfig } from 'vite'
import { i18nAlly } from 'vite-plugin-i18n-ally'

export default defineConfig({
  plugins: [
    i18nAlly({
      namespace: true,
      pathMatcher: '{locale}/{namespace}.{ext}',
    }),
  ],
})
```

启用命名空间后，资源文件会根据namespace生成对应的资源文件，但是如何加载这些资源文件，是客户端需要解决的问题。

有两种方式加载资源文件：

1. 一次性加载所有资源文件
2. 根据路由加载对应的资源文件

## 一次性加载所有资源文件


我们可以在 `onResourceLoaded` hook 中，添加对应namespace的资源文件到国际化库中

```tsx
import { i18nAlly } from 'vite-plugin-i18n-ally/client'

i18nAlly({
  onResourceLoaded: (resources) => {
    i18next.addResourceBundle(language, namespace, resources)
  },
})
```

这种方式简单暴力，但网页会加载所有当前语言的资源文件。拆分namespace的意义就不大了。

## 根据路由加载对应的资源文件

既然涉及到了路由，自然会联想到 `react-router`。在 `react-router^6.4` 中，新增了 [`loader`](https://reactrouter.com/en/main/route/loader) ，可以在loader中加载资源文件。

```tsx
import { createRoutesFromElements, Route } from 'react-router';
import { i18nAlly } from 'vite-plugin-i18n-ally/client'

const { asyncLoadResource } = i18nAlly(
  /// ...
)

const routes = createRoutesFromElements(
  <Route path="/">
    <Route path="a" lazy={() => import("./a")} loader={async () => {
      await asyncLoadResource(i18next.language, {
        namespaces: ['a']
      })
    }} />
  </Route>
);
```

这样，我们就可以根据路由加载对应的资源文件，实现资源文件的按需加载。

更多高级方式，可以使用 `vite-plugin-remix-flat-routes` 或 `remix` 来实现

参考：
- [基于vite-plugin-remix-flat-routes 实现](https://github.com/hemengke1997/vite-plugin-i18n-ally/tree/master/playground/remix-flat-routes)
- [基于remix 实现](https://github.com/hemengke1997/vite-plugin-i18n-ally/tree/master/playground/remix-ssr)
