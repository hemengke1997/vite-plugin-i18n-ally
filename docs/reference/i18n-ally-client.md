# i18nAlly Client Options

## language

- **Type**: `string`

Initial language identifier

## namespaces

- **Type**: `string[]`

Namespaces to load initially

## fallbackLng

- **Type**: `string`

Default language identifier

## onInit

- **Type**: `(
    current: { language: string; namespaces: string[] },
    all: {
      languages: string[]
      namespaces: {
        [lang: string]: string[]
      }
    },
  ) => Promise<void> | void`

Called during initialization, before i18n resources are loaded. Typically used to initialize the i18n library.

## onInited

- **Type**: `(
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

Called after initialization is complete and i18n resources are loaded for the first time. Typically used to render the application.

## onResourceLoaded

- **Type**: `(
    resources: {
      [key in string]: string
    },
    current: {
      language: string
      namespace: string
    },
  ) => Promise<void> | void`

Called after resources are loaded. Typically used to add resources to the i18n library.

## detection

- **Type**: `Array`

Language detection and caching. Once a language identifier is detected, further detection will stop. The priority is higher the earlier it appears.

Supports the following types:

- `htmlTag`
  - `lookup` - Attribute name to get the language identifier from the HTML tag, default is `lang`
  - `cache` - Whether to cache the language identifier
- `querystring`
  - `lookup` - Attribute name to get the language identifier from the querystring, default is `lang`
  - `cache` - Whether to cache the language identifier
- `cookie`
  - `lookup` - Attribute name to get the language identifier from the cookie
  - `attribute: CookieAttributes` - Cookie attributes
  - `cache` - Whether to cache the language identifier
- `localStorage`
  - `lookup` - Attribute name to get the language identifier from localStorage
  - `cache` - Whether to cache the language identifier
- `sessionStorage`
  - `lookup` - Attribute name to get the language identifier from sessionStorage
  - `cache` - Whether to cache the language identifier
- `path`
  - `lookup` - Index to get the language identifier from the URL pathname, default is `0`
  - `cache` - Whether to cache the language identifier
- `navigator`

Refer: [Language Detection](../guides/language-detection.md#client-side)


## customDetectors

- **Type**: `Detector[]`

Custom language detectors. If the built-in detectors do not meet your needs, you can add custom detectors using this option.

After adding custom detectors, you need to add the corresponding detection configuration in.

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
        // Custom detection logic
      },
    },
    {
      name: 'onemore',
      lookup: ({ lookup }) => {
        // Custom detection logic
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
