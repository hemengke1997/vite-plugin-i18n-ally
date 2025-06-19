# 语言探测

此库提供了强大的语言标识探测功能，可以检测用户的语言偏好，也可以缓存语言偏好。

在客户端和服务端都提供了探测API：`detection`。

根据传入`detection`数组的先后顺序，会依次探测语言，直到找到第一个可用的语言标识。越靠前的探测器优先级越高。

## 客户端

我们内置了以下**7**种探测器：

### 1. html tag

```ts
new I18nAllyClient({
  detection: [
    {
      detect: 'htmlTag',
      lookup: 'lang', // 探测的html标签属性名
      cache: true, // 是否把探测到的语言缓存到html标签属性上
    }
  ]
})
```

#### 探测

根据网页 html 标签的 `lang` 属性来探测语言。

如：

```html
<html lang="en">
</html>
```

即探测语言为 `en`。

#### 缓存

开启缓存后，会将探测到的语言设置到 html 的 `lang` 属性上。

### 2. url query

```ts
new I18nAllyClient({
  detection: [
    {
      detect: 'querystring',
      lookup: 'locale', // 探测url query的参数名
      cache: true, // 是否把探测到的语言缓存到url query上
    }
  ]
})
```

#### 探测

根据网页的url query参数来探测语言。

如：`http://www.example.com?locale=en`，即探测语言为 `en`。

#### 缓存

开启缓存后，会将探测到的语言设置到url query的 `locale` 参数上。

### 3. cookie

```ts
new I18nAllyClient({
  detection: [
    {
      detect: 'cookie',
      lookup: 'locale_cookie', // 探测cookie的参数名
      cache: true, // 是否把探测到的语言缓存到cookie上
    }
  ]
})
```

#### 探测

根据网页的cookie来探测语言。

如：`document.cookie` 为 `locae_cookie=en`时，探测语言为 `en`。

#### 缓存

开启缓存后，会将探测到的语言设置到cookie的 `locale_cookie` 中。

### 4. localStorage

```ts
new I18nAllyClient({
  detection: [
    {
      detect: 'localStorage',
      lookup: 'locale', // 探测localStorage的参数名
      cache: true, // 是否把探测到的语言缓存到localStorage上
    }
  ]
})
```

#### 探测

根据网页的localStorage来探测语言。

如：`localStorage.getItem('locale')` 为 `en`时，探测语言为 `en`。

#### 缓存

开启缓存后，会将探测到的语言设置到localStorage的 `locale` 中。

### 5. sessionStorage

```ts
new I18nAllyClient({
  detection: [
    {
      detect: 'sessionStorage',
      lookup: 'locale', // 探测sessionStorage的参数名
      cache: true, // 是否把探测到的语言缓存到sessionStorage上
    }
  ]
})
```

#### 探测

根据网页的sessionStorage来探测语言。

如：`sessionStorage.getItem('locale')` 为 `en`时，探测语言为 `en`。

#### 缓存

开启缓存后，会将探测到的语言设置到sessionStorage的 `locale` 中。

### 6. url pathname

```ts
new I18nAllyClient({
  detection: [
    {
      detect: 'path',
      lookup: 0, // url pathname的index索引
      cache: true, // 是否把探测到的语言缓存到url pathname上
    }
  ]
})
```

#### 探测

根据网页的url pathname对应索引来探测语言。

如：`lookup`为0时，`http://www.example.com/en/hello`，探测语言为 `en`。

#### 缓存

开启缓存后，会将探测到的语言设置到url pathname的对应索引上。

### 7. navigator

```ts
new I18nAllyClient({
  detection: [
    {
      detect: 'navigator',
    }
  ]
})
```

#### 探测

根据浏览器的navigator来探测语言。

#### 缓存

不可以缓存到navigator上。

## 服务端

此插件提供了服务端的语言探测能力，根据请求的Request来探测语言。

支持以下**4**种探测器：

### 1. cookie

```ts
const i18nAllyServer = new I18nAllyServer({
  detection: [
    {
      detect: 'cookie',
      lookup: 'locale_cookie', // 探测cookie的参数名
    }
  ]
})

i18nAllyServer.detect(request)
```

#### 探测

根据请求的cookie来探测语言。

如：`request.headers.get('cookie')` 为 `locale_cookie=en`时，探测语言为 `en`。

### 2. header

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

#### 探测

根据请求的header来探测语言。

如：`request.headers.get('accept-language')` 为 `en`时，探测语言为 `en`。

### 3. path

```ts
const i18nAllyServer = new I18nAllyServer({
  detection: [
    {
      detect: 'path',
      lookup: 0, // url pathname的index索引
    }
  ]
})
i18nAllyServer.detect(request)
```

#### 探测

根据请求的url pathname对应索引来探测语言。

如：`lookup`为0时，`http://www.example.com/en/hello`，探测语言为 `en`。

### 4. url query

```ts
const i18nAllyServer = new I18nAllyServer({
  detection: [
    {
      detect: 'querystring',
      lookup: 'locale', // 探测url query的参数名
    }
  ]
})
i18nAllyServer.detect(request)
```

#### 探测

根据请求的url query参数来探测语言。

如：`http://www.example.com?locale=en`，即探测语言为 `en`。
