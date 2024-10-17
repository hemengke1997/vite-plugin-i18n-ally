# 配合 vite-plugin-remix-flat-routes 实现按namespace请求国际化资源

实现了按 「语言」+「命名空间」 请求国际化资源

## 核心逻辑

1. 通过 `vite-plugin-remix-flat-routes` 的 Meta 约定，导出路由所需要的namespaces。
```ts
export const handle = {
  i18n: ['home'],
}
```

2. 使用 react-router 的 `matchRoutes` 方法获取到当前url的路由信息，并收集到所有的 `i18n` namespaces。
```ts
function resolveNamespace(pathname = window.location.pathname) {
  return matchRoutes(routes, pathname)
    ?.map((route) => route.route.handle)
    .filter((t) => t?.i18n)
    .map((t) => t.i18n)
    .flat()
}
```

3. 把收集到的 namespaces 传给 i18nAlly 初始化
```ts
const { asyncLoadResource } = i18nAlly({
  namespaces: resolveNamespace(),
  // ...
})
```

4. 在语言更改时，重复第3步
```ts
const changeLanguage = i18next.changeLanguage
i18next.changeLanguage = async (lng?: string, ...args) => {
  await asyncLoadResource(lng || i18next.language, {
    namespaces: resolveNamespace(),
  })
  return changeLanguage(lng, ...args)
}
```

5. 在路由变化时，重复第3步
```ts
// root.tsx
let url: URL

export const loader: LoaderFunction = async () => {
  if (url) {
    await asyncLoadResource(i18next.language, {
      namespaces: resolveNamespace(url.pathname),
    })
  }
  return null
}

export const shouldRevalidate: ShouldRevalidateFunction = ({ nextUrl }: ShouldRevalidateFunctionArgs) => {
  url = nextUrl
  return true
}
```
