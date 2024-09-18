import { useTranslation } from 'react-i18next'
import { type LinksFunction, type LoaderFunctionArgs, type MetaFunction, redirect } from '@remix-run/node'
import { json, Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react'
import { isBrowser } from 'browser-or-node'
import { useChangeLanguage } from 'remix-i18next/react'
import { ExternalScripts } from 'remix-utils/external-scripts'
import { resources } from 'virtual:i18n-ally-async-resource'
import { manifest } from 'virtual:public-typescript-manifest'
import AntdConfigProvider from './components/antd-config-provider'
import { ErrorBoundaryComponent } from './components/error-boundary'
import globalCss from './css/global.css?url'
import { useChangeI18n } from './hooks/use-change-i18n'
import { i18nOptions } from './i18n/i18n'
import { i18nServer, localeCookie } from './i18n/i18n.server'
import { siteConfig } from './utils/constants/site'
import { isDev } from './utils/env'

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: siteConfig.title },
    {
      name: 'description',
      content: siteConfig.description,
    },
    {
      name: 'keyword',
      content: siteConfig.keyword,
    },
  ]
}

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: globalCss },
    {
      rel: 'icon',
      href: siteConfig.favicon,
      type: 'image/x-icon',
    },
  ]
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const locale = Object.keys(resources)
    .filter((key) => !key.includes('/'))
    .includes(params.lang!)
    ? params.lang!
    : await i18nServer.getLocale(request)

  if (!params.lang) {
    let pathWithSearch = ''

    const url = new URL(request.url)
    if (url.pathname === '/') {
      pathWithSearch = `/${locale}${url.search}`
    } else {
      pathWithSearch = `/${locale}${url.pathname}${url.search}`
    }
    throw redirect(pathWithSearch)
  }

  return json(
    { locale },
    {
      headers: { 'Set-Cookie': await localeCookie.serialize(locale) },
    },
  )
}

function Document({
  children,
  lang = i18nOptions.fallbackLng,
  dir = 'ltr',
}: {
  children: React.ReactNode
  lang?: string
  dir?: 'ltr' | 'rtl'
}) {
  return (
    <html lang={lang} dir={dir} data-theme='dark' suppressHydrationWarning>
      <head>
        <meta charSet='utf-8' />
        <meta
          name='viewport'
          content='width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=0'
        />
        <meta name='renderer' content='webkit' />

        {/* https://github.com/remix-run/remix/issues/9242 */}
        <Meta />
        <Links />

        {<script src={manifest.flexible} />}

        {!isBrowser && !isDev() && '__ANTD_STYLE__'}
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <ExternalScripts />
      </body>
    </html>
  )
}

export default function App() {
  const { locale } = useLoaderData<typeof loader>()
  const { i18n } = useTranslation()
  useChangeLanguage(locale)
  useChangeI18n()

  return (
    <Document lang={locale ?? i18nOptions.fallbackLng} dir={i18n.dir()}>
      <AntdConfigProvider>
        <Outlet />
      </AntdConfigProvider>
    </Document>
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent />
}
