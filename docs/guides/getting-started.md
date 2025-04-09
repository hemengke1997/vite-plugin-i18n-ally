# Getting Started

This guide will help you quickly understand how to use `vite-plugin-i18n-ally` to achieve seamless internationalization in your Vite project.

## Prerequisites

- `vite-plugin-i18n-ally` uses some configurations from [vscode-i18n-ally](https://github.com/lokalise/i18n-ally/blob/main/README.md). We highly recommend installing the `i18n-ally` plugin in VSCode for a better development experience.

- You can use any language framework. This guide will use `React` and `react-i18next` as examples.

## Step 1: Installation

First, install the necessary dependencies:

```bash
npm i vite-plugin-i18n-ally i18next react-i18next
```

## Step 2: Configuration

Import this plugin in your `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import { i18nAlly } from 'vite-plugin-i18n-ally'

export default defineConfig({
  plugins: [i18nAlly()],
})
```

vite-plugin-i18n-ally will automatically read the i18n-ally.* configurations from .vscode/settings.json in your project, so no additional configuration is usually needed.

For more information on vscode-i18n-ally configuration, refer to the [official documentation](https://github.com/lokalise/i18n-ally/wiki/Configurations).

You can also configure the options of the `i18n-ally` plugin in `vite.config.ts`. For more information, refer to [Plugin Options](/reference/plugin-options).

## Step 3: Using in Frontend Code

First, import the client API provided by the plugin from `vite-plugin-i18n-ally/client`. The core of the client API is to allow developers to control how to use the loaded internationalization resources and how to cache language identifiers.

### Loading i18n Resources

```tsx
// main.tsx
import { I18nAllyClient } from 'vite-plugin-i18n-ally/client'
```

The `i18nAlly` API provides some hooks to help developers initialize the application and use resources.

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { initReactI18next } from 'react-i18next'
import i18next from 'i18next'
import { I18nAllyClient } from 'vite-plugin-i18n-ally/client'

const fallbackLng = 'en'

const { asyncLoadResource } = new I18nAllyClient({
  // onInit hook is called when i18nAlly initializes, before resources are loaded
  async onInit({ language }) {
    i18next.use(initReactI18next).init({
      lng: language,
      resources: {}, // Empty object, resources will be loaded in onResourceLoaded hook
      nsSeparator: '.',
      keySeparator: '.',
      fallbackLng,
    })
  },
  // onInited hook is called after i18nAlly initialization is complete and resources are loaded
  onInited() {
    root.render(
      <React.StrictMode>
        { /* Your App */ }
      </React.StrictMode>,
    )
  },
  // onResourceLoaded hook is called after resources are loaded
  // Here we need to add the resources to i18next
  onResourceLoaded: (resources, { language }) => {
    i18next.addResourceBundle(language, i18next.options.defaultNS[0], resources)
  },
  fallbackLng,
})
```

To load resources when switching languages, we need to override the `i18next.changeLanguage` method:

```tsx
const { asyncLoadResource } = i18nAlly()

const i18nextChangeLanguage = i18next.changeLanguage
i18next.changeLanguage = async (lang: string, ...args) => {
  // Load resources before switching languages
  await asyncLoadResource(lang)
  return i18nextChangeLanguage(lang, ...args)
}
```

### Detecting and Caching Language Identifiers

i18nAlly provides language detection and caching similar to [i18next-browser-languageDetector](https://github.com/i18next/i18next-browser-languageDetector).

The detection array has decreasing priority. Once a language identifier is detected, it stops further detection.

```tsx
new I18nAllyClient({
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

For more caching and detection configurations, refer to [i18nAlly configuration](../reference/i18n-ally-client).

## Step 4: Adding Internationalization Resources

Add internationalization resource files to your project. Assuming our configuration is as follows:

```json
{
  "i18n-ally.keystyle": "nested",
  "i18n-ally.localesPaths": ["src/locales"],
  "i18n-ally.pathMatcher": "{locale}.json",
  "i18n-ally.namespace": false,
}
```

Then we need to add a resource file `en.json` in the `src/locales` directory:

```json
{
  "hello": "Hello, World!",
}
```

## Step 5: Using Internationalization Resources

Use the `useTranslation` hook provided by `react-i18next` in your components:

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

Now your project has basic i18n automatic lazy loading functionality!

You no longer need to manually import resource files. Just add resource files in `localesPaths`, and `vite-plugin-i18n-ally` will automatically search for them.
