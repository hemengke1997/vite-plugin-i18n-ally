import { useTranslation } from 'react-i18next'

export function Component() {
  const { t } = useTranslation()
  return <div>{t('sign.signup.title')}</div>
}
