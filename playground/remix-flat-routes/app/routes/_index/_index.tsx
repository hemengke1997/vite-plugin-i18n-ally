import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatches } from 'react-router-dom'

export default function () {
  const { t } = useTranslation()
  const matches = useMatches()
  useEffect(() => {
    console.log(matches, 'useMatches')
  }, [])
  return (
    <>
      <div>{t('home.home')}</div>
    </>
  )
}

export const handle = {
  test: '测试一下handle',
  i18n: ['home'],
}
