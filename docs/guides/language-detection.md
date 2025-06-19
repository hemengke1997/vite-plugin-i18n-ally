# Language Detection

This library provides powerful language detection features, allowing you to detect user language preferences and cache them.

Detection APIs are available on both the client and server: `detection`.

Languages are detected in the order specified in the `detection` array, stopping at the first available language. Detectors listed earlier have higher priority.

## Client-Side

We provide the following **7** built-in detectors:

### 1. HTML Tag

```ts
new I18nAllyClient({
  detection: [
    {
      detect: 'htmlTag',
      lookup: 'lang', // The HTML tag attribute name to detect
      cache: true, // Whether to cache the detected language in the HTML tag attribute
    }
  ]
})
```

#### Detection

Detects the language based on the `lang` attribute of the HTML tag.

Example:

```html
<html lang="en">
</html>
```

The detected language is `en`.

#### Caching

When caching is enabled, the detected language will be set in the `lang` attribute of the HTML tag.

### 2. URL Query

```ts
new I18nAllyClient({
  detection: [
    {
      detect: 'querystring',
      lookup: 'locale', // The URL query parameter name to detect
      cache: true, // Whether to cache the detected language in the URL query
    }
  ]
})
```

#### Detection

Detects the language based on the URL query parameter.

Example: `http://www.example.com?locale=en`, the detected language is `en`.

#### Caching

When caching is enabled, the detected language will be set in the `locale` parameter of the URL query.

### 3. Cookie

```ts
new I18nAllyClient({
  detection: [
    {
      detect: 'cookie',
      lookup: 'locale_cookie', // The cookie parameter name to detect
      cache: true, // Whether to cache the detected language in the cookie
    }
  ]
})
```

#### Detection

Detects the language based on the cookie.

Example: If `document.cookie` is `locale_cookie=en`, the detected language is `en`.

#### Caching

When caching is enabled, the detected language will be set in the `locale_cookie` cookie.

### 4. LocalStorage

```ts
new I18nAllyClient({
  detection: [
    {
      detect: 'localStorage',
      lookup: 'locale', // The localStorage parameter name to detect
      cache: true, // Whether to cache the detected language in localStorage
    }
  ]
})
```

#### Detection

Detects the language based on localStorage.

Example: If `localStorage.getItem('locale')` is `en`, the detected language is `en`.

#### Caching

When caching is enabled, the detected language will be set in the `locale` key of localStorage.

### 5. SessionStorage

```ts
new I18nAllyClient({
  detection: [
    {
      detect: 'sessionStorage',
      lookup: 'locale', // The sessionStorage parameter name to detect
      cache: true, // Whether to cache the detected language in sessionStorage
    }
  ]
})
```

#### Detection

Detects the language based on sessionStorage.

Example: If `sessionStorage.getItem('locale')` is `en`, the detected language is `en`.

#### Caching

When caching is enabled, the detected language will be set in the `locale` key of sessionStorage.

### 6. URL Pathname

```ts
new I18nAllyClient({
  detection: [
    {
      detect: 'path',
      lookup: 0, // The index of the URL pathname
      cache: true, // Whether to cache the detected language in the URL pathname
    }
  ]
})
```

#### Detection

Detects the language based on the specified index of the URL pathname.

Example: If `lookup` is 0, `http://www.example.com/en/hello` detects the language as `en`.

#### Caching

When caching is enabled, the detected language will be set at the corresponding index of the URL pathname.

### 7. Navigator

```ts
new I18nAllyClient({
  detection: [
    {
      detect: 'navigator',
    }
  ]
})
```

#### Detection

Detects the language based on the browser's navigator.

#### Caching

Cannot cache to the navigator.

## Server-Side

This plugin provides server-side language detection capabilities based on the Request object.

The following **4** detectors are supported:

### 1. Cookie

```ts
const i18nAllyServer = new I18nAllyServer({
  detection: [
    {
      detect: 'cookie',
      lookup: 'locale_cookie', // The cookie parameter name to detect
    }
  ]
})

i18nAllyServer.detect(request)
```

#### Detection

Detects the language based on the request's cookie.

Example: If `request.headers.get('cookie')` is `locale_cookie=en`, the detected language is `en`.

### 2. Header

```ts
const i18nAllyServer = new I18nAllyServer({
  detection: [
    {
      detect: 'header',
    }
  ]
})

i18nAllyServer.detect(request)
```

#### Detection

Detects the language based on the request's header.

Example: If `request.headers.get('accept-language')` is `en`, the detected language is `en`.

### 3. Path

```ts
const i18nAllyServer = new I18nAllyServer({
  detection: [
    {
      detect: 'path',
      lookup: 0, // The index of the URL pathname
    }
  ]
})
i18nAllyServer.detect(request)
```

#### Detection

Detects the language based on the specified index of the URL pathname.

Example: If `lookup` is 0, `http://www.example.com/en/hello` detects the language as `en`.

### 4. URL Query

```ts
const i18nAllyServer = new I18nAllyServer({
  detection: [
    {
      detect: 'querystring',
      lookup: 'locale', // The URL query parameter name to detect
    }
  ]
})
i18nAllyServer.detect(request)
```

#### Detection

Detects the language based on the URL query parameter.

Example: `http://www.example.com?locale=en`, the detected language is `en`.
