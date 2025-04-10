import { type Detector } from './types'

// Adopted from js-cookie

export interface CookieAttributes {
  /**
   * Define when the cookie will be removed. Value can be a Number
   * which will be interpreted as days from time of creation or a
   * Date instance. If omitted, the cookie becomes a session cookie.
   */
  expires?: number | Date | undefined

  /**
   * Define the path where the cookie is available. Defaults to '/'
   */
  path?: string | undefined

  /**
   * Define the domain where the cookie is available. Defaults to
   * the domain of the page where the cookie was created.
   */
  domain?: string | undefined

  /**
   * A Boolean indicating if the cookie transmission requires a
   * secure protocol (https). Defaults to false.
   */
  secure?: boolean | undefined

  /**
   * Asserts that a cookie must not be sent with cross-origin requests,
   * providing some protection against cross-site request forgery
   * attacks (CSRF)
   */
  sameSite?: 'strict' | 'Strict' | 'lax' | 'Lax' | 'none' | 'None' | undefined

  /**
   * An attribute which will be serialized, conformably to RFC 6265
   * section 5.2.
   */
  [property: string]: any
}

export class Cookie implements Detector {
  name = 'cookie' as const
  resolveLng(options: { lookup: string }) {
    const reader = (value: string) => {
      if (value[0] === '"') {
        value = value.slice(1, -1)
      }
      return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
    }
    const name = options.lookup

    if (!name) return null

    // To prevent the for loop in the first place assign an empty array
    // in case there are no cookies at all.
    const cookies = document.cookie ? document.cookie.split('; ') : []
    const jar: Record<string, string> = {}
    for (let i = 0; i < cookies.length; i++) {
      const parts = cookies[i].split('=')
      const value = parts.slice(1).join('=')

      try {
        const found = decodeURIComponent(parts[0])
        if (!(found in jar)) jar[found] = reader(value)
        if (name === found) {
          break
        }
      } catch {
        // Do nothing...
      }
    }

    return jar[name] || null
  }
  persistLng(lng: string, options: { lookup: string; attributes?: CookieAttributes }) {
    const { lookup } = options

    if (!lookup) return

    const write = (value: string) =>
      encodeURIComponent(value).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent)

    let name = options.lookup

    let attributes: CookieAttributes = Object.assign({}, { path: '/' })
    if (options.attributes) {
      attributes = Object.assign(attributes, options.attributes)
      if (typeof attributes.expires === 'number') {
        attributes.expires = new Date(Date.now() + attributes.expires * 864e5)
      }
      if (attributes.expires) {
        // @ts-expect-error
        attributes.expires = attributes.expires.toUTCString()
      }
    }

    name = encodeURIComponent(name)
      .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape)

    let stringifiedAttributes = ''
    for (const attributeName in attributes) {
      if (!attributes[attributeName]) {
        continue
      }

      stringifiedAttributes += `; ${attributeName}`

      if (attributes[attributeName] === true) {
        continue
      }

      // Considers RFC 6265 section 5.2:
      // ...
      // 3.  If the remaining unparsed-attributes contains a %x3B (";")
      //     character:
      // Consume the characters of the unparsed-attributes up to,
      // not including, the first %x3B (";") character.
      // ...
      stringifiedAttributes += `=${attributes[attributeName].split(';')[0]}`
    }

    return (document.cookie = `${name}=${write(lng)}${stringifiedAttributes}`)
  }
}
