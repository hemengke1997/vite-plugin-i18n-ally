import { type ParserConstructor } from './parsers/Parser'

export interface I18nAllyOptions {
  /**
   * @description locales directory paths
   *
   * @note localesPaths are relative to root
   *
   * @example ```
   * ['./locales', './src/locales', './app/locales']
   * ```
   *
   */
  localesPaths?: string[]
  /**
   * @description root path
   * @default process.cwd()
   */
  root?: string
  /**
   * @description rule of matching locale file
   *
   * @see https://github.com/lokalise/i18n-ally/wiki/Path-Matcher
   *
   * auto detect dir structure
   * if file, default is `{locale}.{ext}`
   * if dir, default is `{locale}/**\/*.{ext}`
   * if namespace is true, default is `{locale}/**\/{namespaces}.{ext}`
   *
   * @example
   * `{locale}.{ext}`
   * `{locale}/{namespaces}.{ext}`
   * `{locale}/{namespace}.json`
   * `{namespaces}/{locale}`
   * `something/{locale}/{namespace}`
   */
  pathMatcher?: string
  /**
   * @description
   * parser plugins
   *
   * You can add custom parser plugin if there is no built in parser for your file extension
   * @example
   * ```js
   * [{
   *    ext: 'json',
   *    parser: (text) => JSON.parse(text),
   * }]
   * ```
   */
  parserPlugins?: ParserPlugin[]
  /**
   * @default false
   * @see https://github.com/lokalise/i18n-ally/wiki/Namespaces
   */
  namespace?: boolean
  /**
   * @description Automatically uses the configuration of the `i18-ally` vscode extension
   * @default true
   */
  useVscodeI18nAllyConfig?:
    | boolean
    | {
        stopAt: string
      }
}

export type ParserPlugin = ParserConstructor | undefined
