import path from 'node:path'
import { chromium, type Browser } from 'playwright'

type CaptureResult = {
  title: string | null
  siteName: string | null
  faviconUrl: string | null
  viewportWidth: number
  viewportHeight: number
}

let browserPromise: Promise<Browser> | null = null

async function getBrowser(): Promise<Browser> {
  if (browserPromise) {
    try {
      const b = await browserPromise
      if (b.isConnected()) return b
    } catch {
      browserPromise = null
    }
    browserPromise = null
  }
  browserPromise = chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage', '--disable-gpu', '--no-sandbox'],
  })
  return browserPromise
}

function safeAbsoluteUrl(baseUrl: string, maybeRelative: string | null): string | null {
  if (!maybeRelative) return null
  try {
    return new URL(maybeRelative, baseUrl).toString()
  } catch {
    return null
  }
}

export async function captureToFile(input: {
  url: string
  outputAbsPath: string
  viewport: { width: number; height: number; dpr: number }
}): Promise<CaptureResult> {
  let browser = await getBrowser()
  let context
  try {
    context = await browser.newContext({
      viewport: { width: input.viewport.width, height: input.viewport.height },
      deviceScaleFactor: input.viewport.dpr,
    })
  } catch {
    browserPromise = null
    browser = await getBrowser()
    context = await browser.newContext({
      viewport: { width: input.viewport.width, height: input.viewport.height },
      deviceScaleFactor: input.viewport.dpr,
    })
  }
  
  let page
  try {
    page = await context.newPage()
  } catch {
    browserPromise = null
    browser = await getBrowser()
    context = await browser.newContext({
      viewport: { width: input.viewport.width, height: input.viewport.height },
      deviceScaleFactor: input.viewport.dpr,
    })
    page = await context.newPage()
  }

  try {
    await page.goto(input.url, { waitUntil: 'domcontentloaded', timeout: 45_000 })

    try {
      await page.waitForLoadState('networkidle', { timeout: 10_000 })
    } catch {
      void 0
    }

    await page.waitForTimeout(2000)

    const title = (await page.title()) || null
    const meta = (await page.evaluate(`(() => {
      const getMeta = (key) => {
        const el = document.querySelector('meta[property="' + key + '"], meta[name="' + key + '"]')
        const content = el && el.getAttribute('content')
        return content || null
      }

      const getLinkHref = (selectors) => {
        for (const selector of selectors) {
          const el = document.querySelector(selector)
          const href = el && (el.href || el.getAttribute('href'))
          if (href) return href
        }
        return null
      }

      return {
        ogTitle: getMeta('og:title'),
        ogSiteName: getMeta('og:site_name'),
        iconHref: getLinkHref([
          'link[rel="icon"]',
          'link[rel="shortcut icon"]',
          'link[rel="apple-touch-icon"]',
          'link[rel="mask-icon"]',
        ])
      }
    })()`)) as { ogTitle: string | null; ogSiteName: string | null; iconHref: string | null }

    const resolvedTitle = meta.ogTitle || title
    const resolvedSiteName = meta.ogSiteName || null
    const resolvedFavicon =
      safeAbsoluteUrl(input.url, meta.iconHref) || safeAbsoluteUrl(input.url, '/favicon.ico')

    await page.screenshot({
      path: input.outputAbsPath,
      type: path.extname(input.outputAbsPath).toLowerCase() === '.png' ? 'png' : 'jpeg',
      quality: 82,
    })

    return {
      title: resolvedTitle,
      siteName: resolvedSiteName,
      faviconUrl: resolvedFavicon,
      viewportWidth: input.viewport.width,
      viewportHeight: input.viewport.height,
    }
  } finally {
    await page.close().catch(() => {})
    await context.close().catch(() => {})
  }
}
