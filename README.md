# vite-plugin-i18n-detector

## Features

- Unawared DX
- **lazyload** locale resource

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
import { setupI18n } from 'vite-plugin-i18n-detector/client'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

setupI18n({
  onLocaleChange: () => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  },
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
