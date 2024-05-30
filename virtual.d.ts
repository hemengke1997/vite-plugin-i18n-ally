declare module 'virtual:i18n-ally-helper' {
  type I18nAllyHelper = Record<string, () => Promise<{ default: Record<string, any> | undefined }>>
  const i18nAllyHelper: I18nAllyHelper
  export default i18nAllyHelper
}
