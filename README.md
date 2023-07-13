# vite-plugin-i18n-detector

> Lazyloadable i18n locales detector

## Features

- Unawared DX
- **Lazyload** locale resource
- Options like 'i18n-ally'

## Install

```bash
pnpm add vite-plugin-i18n-detector
```

## Example

### vite.config.ts
```ts
import path from 'path'
import { defineConfig } from 'vite'
import { i18nDetector } from 'vite-plugin-i18n-detector'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    i18nDetector({
      localesPaths: [path.join(__dirname, './src/locale')],
      pathMatcher: '{locale}/{namespaces}.{ext}',
      enabledParsers: ['json', 'json5'],
    }),
  ],
})

```

### i18next example

```tsx
import ReactDOM from 'react-dom/client'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import { setupI18n } from 'vite-plugin-i18n-detector/client' // If you use i18next
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

// The following is an example
const fallbackLng = 'en'
const lookupTarget = 'lang'

i18next
  .use(initReactI18next)
  .init({
    fallbackLng,
    resources: {},
  })

const { loadResource, onLanguageChanged } = setupI18n({
	language: i18next.language,
	onInit(langs) {
    if (!langs.includes(i18next.language)) {
      i18next.changeLanguage(fallbackLng)
    }
  },
  onLocaleChange: () => {
    root.render(
      <App />
    )
  },
  fallbackLng,
  setQuery: {
    lookupTarget,
  }
})

const _changeLanguage = i18next.changeLanguage
i18next.changeLanguage = async (lang: string | undefined, ...args) => {
  let currentLng = i18next.language
  // If language did't change, return
  if (currentLng === lang) return undefined as any
  currentLng = lang || currentLng
  await loadResource(lang)
  return _changeLanguage(lang, ...args)
}

i18next.on('languageChanged', (lang) => {
  onLanguageChanged(lang)
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
  "i18n-ally.enabledParsers": ["json", "json5"],
  "i18n-ally.enabledFrameworks": ["react", "i18next"],
  "i18n-ally.namespace": true,
  "i18n-ally.pathMatcher": "{locale}/{namespaces}.{ext}",
  "i18n-ally.sourceLanguage": "en"
}
```


## ⚠️ Warning

Currently, we only support `.json(5)` file
