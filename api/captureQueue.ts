import fs from 'node:fs/promises'
import path from 'node:path'
import { captureToFile } from './capture.js'
import {
  storage,
  getItemById,
  setItemCaptured,
  setItemFailed,
  setItemProcessing,
} from './designStore.js'

const queue: string[] = []
let isRunning = false

const defaultViewport = { width: 1440, height: 900, dpr: 2 }

async function safeUnlink(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath)
  } catch {
    return
  }
}

async function runLoop(): Promise<void> {
  if (isRunning) return
  isRunning = true

  try {
    while (queue.length) {
      const id = queue.shift()
      if (!id) continue

      const item = getItemById(id)
      if (!item) continue

      setItemProcessing(id)

      const previousPreview = item.previewImagePath
      const fileName = `${id}-${Date.now()}.jpg`
      const outputAbsPath = path.join(storage.assetsDir, fileName)
      const outputPublicPath = `/api/assets/${fileName}`

      try {
        const result = await captureToFile({
          url: item.url,
          outputAbsPath,
          viewport: defaultViewport,
        })

        setItemCaptured({
          id,
          title: result.title,
          siteName: result.siteName,
          faviconUrl: result.faviconUrl,
          previewImagePath: outputPublicPath,
          previewWidth: result.viewportWidth,
          previewHeight: result.viewportHeight,
        })

        if (previousPreview && previousPreview.startsWith('/api/assets/')) {
          const prevName = previousPreview.replace('/api/assets/', '')
          await safeUnlink(path.join(storage.assetsDir, prevName))
        }
      } catch (err) {
        await safeUnlink(outputAbsPath)
        const message = err instanceof Error ? err.message : 'Capture failed'
        setItemFailed(id, message)
      }
    }
  } finally {
    isRunning = false
  }
}

export function enqueueCapture(id: string): void {
  if (!queue.includes(id)) queue.push(id)
  void runLoop()
}
