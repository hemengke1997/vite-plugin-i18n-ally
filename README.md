# vite-plugin-i18n-detector

> Lazyloadable i18n locales detector

## Features

- Unawared DX
- **lazyload** locale resource

## Install

```bash
pnpm add vite-plugin-i18n-detector i18next
```

## Usage

### vite.config.ts
```ts
import { defineConfig } from 'vite'
import { i18nDetector } from 'vite-plugin-i18n-detector'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    i18nDetector({
      localeEntry: './src/locale',
    }),
  ],
})

```

### main.tsx

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { setupI18n } from 'vite-plugin-i18n-detector/client'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

// The following is an example
const lookupTarget = 'lang'
i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    returnNull: false,
    react: {
      useSuspense: true,
    },
    debug: import.meta.env.DEV,
    resources: {},
    nsSeparator: '.',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
    fallbackLng: 'en',
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator'],
      caches: ['localStorage', 'sessionStorage', 'cookie'],
      lookupQuerystring: lookupTarget,
      lookupLocalStorage: lookupTarget,
      lookupSessionStorage: lookupTarget,
      lookupCookie: lookupTarget,
    },
  })

setupI18n({
  onLocaleChange: () => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  },
  setQueryOnChange: {
    lookupTarget,
  }
})

```

### App.tsx

```tsx
import { useTranslation } from 'react-i18next'

function App() {
  const { t, i18n } = useTranslation()

  return <div onClick={() => i18n.changeLanguage('zh')}>{t('namespace.key')}</div>
}
```


### .vscode => settings.json
``` json
{
  "i18n-ally.localesPaths": ["src/locale"],
  "i18n-ally.keystyle": "flat",
  "i18n-ally.enabledParsers": ["json"],
  "i18n-ally.enabledFrameworks": ["react", "i18next"],
  "i18n-ally.namespace": true,
  "i18n-ally.pathMatcher": "{locale}/{namespaces}.json",
  "i18n-ally.sourceLanguage": "en"
}
```


## ⚠️ Warning

Currently, we only support `.json(5)` file
