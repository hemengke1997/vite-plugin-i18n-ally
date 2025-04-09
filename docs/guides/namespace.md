# Namespaces

In the [Getting Started](./getting-started) section, we implemented a basic i18n automatic lazy loading feature. However, as the project grows, resource files may become large, and we need fine-grained control over them.

`vite-plugin-i18n-ally` provides the `namespace` configuration to enable namespaces. When enabled, the plugin generates corresponding resource files based on namespaces to reduce file size.

You can set `i18n-ally.namespace`:
```json
{
  "i18n-ally.namespace": true,
  "i18n-ally.pathMatcher": "{locale}/{namespace}.{ext}"
}
```

or configure it in vite.config.ts:

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

After enabling namespaces, resource files will be generated based on namespaces. However, how to load these resource files is a client-side concern.

There are two ways to load resource files:

1. Load all resource files at once
2. Load resource files based on routes

## Load all resource files at once

We can add the corresponding namespace resource files to the internationalization library in the `onResourceLoaded` hook:

```tsx
import { I18nAllyClient } from 'vite-plugin-i18n-ally/client'

new I18nAllyClient({
  onResourceLoaded: (resources) => {
    i18next.addResourceBundle(language, namespace, resources)
  },
})
```

This method is simple and straightforward, but the browser will load all resource files for the current language. Splitting namespaces doesn't make much sense.

## Load resource files based on routes

Since it involves routes, we naturally think of `react-router`. In `react-router^6.4`, [`loader`](https://reactrouter.com/en/main/route/loader) was added to load resource files in the loader.


```tsx
import { createRoutesFromElements, Route } from 'react-router';
import { I18nAllyClient } from 'vite-plugin-i18n-ally/client'

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

This way, we can load the corresponding resource files based on the route, achieving on-demand loading of resource files.

For more advanced methods, you can use `vite-plugin-remix-flat-routes` or `remix`.

References:

- [Implementation with vite-plugin-remix-flat-routes](https://github.com/hemengke1997/vite-plugin-i18n-ally/tree/master/playground/remix-flat-routes) 
- [Implementation with remix](https://github.com/hemengke1997/vite-plugin-i18n-ally/tree/master/playground/remix-ssr)
