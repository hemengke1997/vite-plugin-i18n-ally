declare module 'virtual:i18n-ally-async-resource' {
  type I18nAllyAsyncResource = {
    [lng__ns: string]: () => Promise<{ default: Record<string, any> | undefined }>
  }
  const resources: I18nAllyAsyncResource
  export { resources }
}

declare module 'virtual:i18n-ally-resource' {
  type I18nAllyResource = {
    [lng: string]: Record<string, any>
  }
  const resources: I18nAllyResource
  export { resources }
}

declare module 'virtual:i18n-ally-empty-resource' {
  type I18nAllyEmptyResource = {
    [lng__ns: string]: object
  }
  const resources: I18nAllyEmptyResource
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
