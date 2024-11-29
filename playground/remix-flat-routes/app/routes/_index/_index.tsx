import { useTranslation } from 'react-i18next'

export default function () {
  const { t } = useTranslation()

  return (
    <>
      <div>{t('home.home')}</div>
    </>
  )
}

export const handle = {
  i18n: ['home'],
}
