# 服务端配置

## fallbackLng

- **类型**: `string`

默认回退语言，必传参数

## supportedLngs

- **类型**: `string[]`

支持的语言列表，必传参数

## lowerCaseLng

- **类型**: `boolean`
- **默认值**: `false`

是否忽略语言标识大小写，如果忽略大小写，会把 `zh-CN` 和 `zh-cn` 视为相同的语言标识。

## detection

- **类型**: `Array`

语言探测。当探测到语言标识时，将不再继续探测。越靠前优先级越高。

参考：[语言探测](../guides/language-detection.md#服务端)
