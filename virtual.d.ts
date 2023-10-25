declare module 'virtual:i18n-helper' {
  type I18nHelper = Record<string, () => Promise<{ default: Record<string, any> | undefined }>>
  const i18nHelper: I18nHelper
  export default i18nHelper
}
