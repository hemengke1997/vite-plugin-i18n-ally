declare module 'virtual:i18n-helper' {
  export default Record<string, () => Promise<{ default: Record<string, any> | undefined }>>
}
