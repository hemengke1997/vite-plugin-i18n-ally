import { useTranslation } from 'react-i18next'

export default function () {
  const { t } = useTranslation()
  return <div>{t('other.title')}</div>
}
