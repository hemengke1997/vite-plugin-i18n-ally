type Handle = {
  i18n?: string[]
}

declare global {
  interface Window {
    __asyncLoadResource?: (
      language?: string,
      options?: {
        namespaces?: string[] | string
      },
    ) => Promise<void>
  }
}

export {}
