# Server Configuration

## fallbackLng

- **Type**: `string`

The default fallback language. This is a required parameter.

## supportedLngs

- **Type**: `string[]`

A list of supported languages. This is a required parameter.

## lowerCaseLng

- **Type**: `boolean`
- **Default**: `false`

Whether to ignore the case of language identifiers. If case is ignored, `zh-CN` and `zh-cn` will be treated as the same language identifier.

## detection

- **Type**: `Array`

Language detection. Once a language identifier is detected, further detection will stop. Detectors listed earlier have higher priority.

Reference: [Language Detection](../guides/language-detection.md#server-side)
