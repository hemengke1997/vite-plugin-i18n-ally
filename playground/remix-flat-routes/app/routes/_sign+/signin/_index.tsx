import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatches } from 'react-router-dom'

export function Component() {
  const { t } = useTranslation()
  const matches = useMatches()
  useEffect(() => {
    console.log(matches, 'useMatches')
  }, [])
  return <div>{t('sign.signin.title')}</div>
}
