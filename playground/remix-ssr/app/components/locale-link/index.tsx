import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link, type Path } from '@remix-run/react'
import { type RemixLinkProps } from '@remix-run/react/dist/components'
import { isString } from 'lodash-es'

function generateLocalePath(route: string, locale: string, params: Record<string, string>) {
  route = route.replace(/^\/+/, '')
  return generatePath(`/${locale}/${route}`, { ...params, lang: locale })
}

function LocaleLink(props: RemixLinkProps) {
  const { children, to } = props
  const { i18n } = useTranslation()
  let localoTo: Partial<Path>
  if (isString(to)) {
    localoTo = { pathname: to }
  } else {
    localoTo = to
  }
  return (
    <Link {...props} to={generateLocalePath(localoTo.pathname || '', i18n.language, { ...localoTo })}>
      {children}
    </Link>
  )
}

export default memo(LocaleLink)
