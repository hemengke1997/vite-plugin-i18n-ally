import type { EntryContext } from '@remix-run/node'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs'
import { createReadableStreamFromReadable } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import { createInstance } from 'i18next'
import { isbot } from 'isbot'
import { PassThrough } from 'node:stream'
import { renderToPipeableStream } from 'react-dom/server'
import { i18nServer, i18nServerOptions } from '@/i18n/i18n.server'

const ABORT_DELAY = 5000

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const isbotRequest = isbot(request.headers.get('user-agent'))
  const callbackName = isbotRequest ? 'onAllReady' : 'onShellReady'

  const i18nInstance = createInstance()

  const localeFromPath = new URL(request.url).pathname.split('/').filter(Boolean)[0]
  const lng = i18nServerOptions.supportedLngs.includes(localeFromPath)
    ? localeFromPath
    : await i18nServer.getLocale(request)

  await i18nInstance.use(initReactI18next).init({
    ...i18nServerOptions,
    lng,
    ns: i18nServerOptions.resources[lng]
      ? Object.keys(i18nServerOptions.resources[lng])
      : [...i18nServerOptions.defaultNS],
  })

  return new Promise((resolve, reject) => {
    let shellRendered = false
    let isStyleExtracted = false
    const cache = createCache()
    const { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={i18nInstance} defaultNS={i18nServerOptions.defaultNS}>
        <StyleProvider cache={cache}>
          <RemixServer context={remixContext} url={request.url}></RemixServer>
        </StyleProvider>
      </I18nextProvider>,
      {
        [callbackName]: () => {
          shellRendered = true
          const body = new PassThrough({
            transform(chunk, _, callback) {
              if (!isStyleExtracted) {
                const str: string = chunk.toString()
                if (str.includes('__ANTD_STYLE__')) {
                  chunk = str.replace('__ANTD_STYLE__', isbotRequest ? '' : extractStyle(cache))
                  isStyleExtracted = true
                }
              }
              callback(null, chunk)
            },
          })
          const stream = createReadableStreamFromReadable(body)
          responseHeaders.set('Content-Type', 'text/html')
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          )
          pipe(body)
        },
        onShellError(error) {
          reject(error)
        },
        onError(error) {
          if (shellRendered) {
            console.error(error)
          }
        },
      },
    )

    setTimeout(abort, ABORT_DELAY)
  })
}
