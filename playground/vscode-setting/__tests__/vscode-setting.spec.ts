import { describe, expect, test } from 'vitest'
import {
  // addFile,
  editFile,
  isBuild,
  isServe,
  page,
  // removeDir,
  // removeFile,
  // renameDir,
  untilUpdated,
} from '~utils'

describe('e2e', () => {
  test('should render en by default', async () => {
    expect(await page.textContent('#language')).toBe('en')
  })

  test.runIf(isServe)('should lazyload locale js after click', async () => {
    let request = page.waitForResponse((res) => res.url().includes('@i18n-ally/virtual:i18n-ally-zh'), {
      timeout: 1500,
    })
    await page.click('#zh')
    let response = await request.then(() => ({ status: () => 1 }))
    expect(response.status()).toBe(1)

    request = page.waitForResponse((res) => res.url().includes('@i18n-ally/virtual:i18n-ally-de'), {
      timeout: 1500,
    })
    await page.click('#de')
    response = await request.then(() => ({ status: () => 1 }))
    expect(response.status()).toBe(1)
  })

  test('should change language', async () => {
    await page.click('#zh')

    await untilUpdated(() => page.textContent('#language'), '中文')

    await page.click('#de')

    await untilUpdated(() => page.textContent('#language'), 'Deutsch')

    await page.click('#en')
  })

  test('should set html attribute lang', async () => {
    expect(await page.getAttribute('html', 'lang')).toBe('en')

    await page.click('#zh')

    expect(await page.getAttribute('html', 'lang')).toBe('zh')

    await page.click('#de')

    expect(await page.getAttribute('html', 'lang')).toBe('de')

    await page.click('#en')
  })

  test('should set url query', async () => {
    await page.click('#zh')
    let currentUrl = page.url()
    let urlSearchParams = new URLSearchParams(currentUrl.split('?')[1])
    let lang = urlSearchParams.get('lang')
    expect(lang).toBe('zh')

    await page.click('#en')
    currentUrl = page.url()
    urlSearchParams = new URLSearchParams(currentUrl.split('?')[1])
    lang = urlSearchParams.get('lang')
    expect(lang).toBe('en')
  })
})

describe.skipIf(isBuild)('server related tests', () => {
  describe('hmr', () => {
    test('should trigger hmr when locale files changed', async () => {
      await page.click('#en')
      editFile('src/locales/en/test.json', (text) => {
        return text.replace(`"key": "en"`, `"key": "updated en"`)
      })

      await untilUpdated(() => page.textContent('#language'), 'updated en')
    })

    // test('should page reload when locale dir removed', async () => {
    //   const request = page.waitForResponse(/src\/App\.tsx$/, { timeout: 1500 })
    //   removeDir('src/locales/zh-tw/')
    //   const response = await request.then(() => ({ status: () => 1 }))
    //   expect(response.status()).toBe(1)
    // })

    // test('should page reload when locale files removed', async () => {
    //   const request = page.waitForResponse(/src\/App\.tsx$/, { timeout: 1500 })
    //   removeFile('src/locales/de/test.json')
    //   const response = await request.then(() => ({ status: () => 1 }))
    //   expect(response.status()).toBe(1)
    // })

    // test('should page reload when locale dir name changed', async () => {
    //   const request = page.waitForResponse(/src\/App\.tsx$/, { timeout: 1500 })

    //   renameDir('src/locales/en/', 'src/locales/en-US/')
    //   let response = await request.then(() => ({ status: () => 1 }))
    //   expect(response.status()).toBe(1)
    //   renameDir('src/locales/en-US/', 'src/locales/en/')
    //   response = await request.then(() => ({ status: () => 1 }))
    //   expect(response.status()).toBe(1)
    // })

    // test('should page reload when locale file added', async () => {
    //   const request = page.waitForResponse(/src\/App\.tsx$/, { timeout: 1500 })
    //   addFile('src/locales/en/test.json', '{}')
    //   const response = await request.then(() => ({ status: () => 1 }))
    //   expect(response.status()).toBe(1)
    // })
  })
})
