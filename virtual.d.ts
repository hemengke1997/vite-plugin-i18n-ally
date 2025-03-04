declare module 'virtual:i18n-ally-async-resource' {
  type I18nAllyAsyncResource = {
    [lang_ns: string]: () => Promise<{ default: Record<string, any> | undefined }>
  }
  const resources: I18nAllyAsyncResource
  export { resources }
}

declare module 'virtual:i18n-ally-config' {
  type I18nAllyConfig = {
    namespace: boolean
    separator: string
  }
  const config: I18nAllyConfig
  export { config }
}

declare module 'virtual:i18n-ally-resource' {
  type I18nAllyResource = {
    [lang: string]: Record<string, any>
  }
  const resources: I18nAllyResource
  export { resources }
}
