declare global {
  interface Window {
    asyncLoadResource?: (
      language?: string,
      options?: {
        namespaces?: string[] | string
      },
    ) => Promise<void>
  }
}

export {}
