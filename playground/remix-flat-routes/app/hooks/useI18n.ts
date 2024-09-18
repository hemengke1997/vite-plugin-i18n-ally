import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

export function useI18n() {
  const { i18n } = useTranslation()
  const location = useLocation()

  useEffect(() => {
    i18n.changeLanguage(i18n.language)
  }, [location.pathname])
}
