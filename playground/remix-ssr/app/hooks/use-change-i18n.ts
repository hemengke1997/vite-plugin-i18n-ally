import { useUpdateEffect } from 'ahooks'
import { useTranslation } from 'react-i18next'

export function useChangeI18n() {
  const { i18n } = useTranslation()
  const lang = i18n.language

  useUpdateEffect(() => {
    fetch('/action/set-locale', {
      method: 'POST',
      body: JSON.stringify({ locale: lang }),
    })
  }, [i18n.language])
}
