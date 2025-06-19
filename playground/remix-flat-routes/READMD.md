# 配合 vite-plugin-remix-flat-routes 实现按namespace请求国际化资源

实现了按 「语言」+「命名空间」 请求国际化资源

## 核心逻辑

1. 通过 `vite-plugin-remix-flat-routes` 的 Meta 约定，导出路由所需要的namespaces。

```ts
export const handle = {
  i18n: ['home'],
}
```

2. 在 react router 的 `dataStrategy` 中加载收集到所有的 `i18n` namespaces，并加载资源

```ts
let namespaces: string[] = []

createBrowserRouter(routes, {
  dataStrategy: async ({ matches }) => {
    const matchesToLoad = matches.filter(m => m.shouldLoad)
    const results = await Promise.all(matchesToLoad.map(m => m.resolve()))
    namespaces = (await Promise.all(matches.map(m => m.route.handle)))
      .filter(t => t?.i18n)
      .map(t => t.i18n)
      .flat()

    await i18nAlly.asyncLoadResource(i18next.language, {
      namespaces,
    })

    return results.reduce(
      (acc, result, i) => Object.assign(acc, { [matchesToLoad[i].route.id]: result }),
      {},
    )
  },
})
```

3. 在语言更改时，重新加载资源

```ts
const changeLanguage = i18next.changeLanguage
i18next.changeLanguage = async (lng?: string, ...args) => {
  await i18nAlly.asyncLoadResource(lng || i18next.language, {
    namespaces,
  })
  return changeLanguage(lng, ...args)
}
```

4. 确保路由切换时，重新加载资源

```ts
// root.tsx

export const loader = () => null

export const shouldRevalidate = () => true
```
