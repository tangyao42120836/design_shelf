import { Router, type Request, type Response } from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import {
  createItem,
  deleteItemById,
  getItemById,
  listItems,
  storage,
  updateItemFields,
  updateItemUrl,
} from '../designStore.js'
import { enqueueCapture } from '../captureQueue.js'

const router = Router()

function normalizeTags(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input.map((t) => String(t).trim()).filter(Boolean)
}

function validateHttpUrl(input: unknown): string | null {
  if (typeof input !== 'string') return null
  try {
    const url = new URL(input.trim())
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

router.get('/', (req: Request, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search : null
  const tag = typeof req.query.tag === 'string' ? req.query.tag : null
  const items = listItems({ search, tag })
  res.status(200).json({ success: true, data: items })
})

router.get('/:id', (req: Request, res: Response) => {
  const item = getItemById(req.params.id)
  if (!item) {
    res.status(404).json({ success: false, error: 'Not found' })
    return
  }
  res.status(200).json({ success: true, data: item })
})

router.post('/', (req: Request, res: Response) => {
  const url = validateHttpUrl(req.body?.url)
  if (!url) {
    res.status(400).json({ success: false, error: 'Invalid url' })
    return
  }

  const tags = normalizeTags(req.body?.tags)
  const note = typeof req.body?.note === 'string' ? req.body.note : null

  const item = createItem({ url, tags, note })
  enqueueCapture(item.id)

  res.status(201).json({ success: true, data: item })
})

router.patch('/:id', (req: Request, res: Response) => {
  const id = req.params.id
  const tags = req.body?.tags !== undefined ? normalizeTags(req.body.tags) : undefined
  const note = req.body?.note !== undefined ? (typeof req.body.note === 'string' ? req.body.note : null) : undefined

  const updated = updateItemFields(id, { tags, note })
  if (!updated) {
    res.status(404).json({ success: false, error: 'Not found' })
    return
  }

  res.status(200).json({ success: true, data: updated })
})

router.post('/:id/refresh', (req: Request, res: Response) => {
  const id = req.params.id
  const item = getItemById(id)
  if (!item) {
    res.status(404).json({ success: false, error: 'Not found' })
    return
  }

  enqueueCapture(id)
  res.status(200).json({ success: true, data: item })
})

router.patch('/:id/url', async (req: Request, res: Response) => {
  const id = req.params.id
  const url = validateHttpUrl(req.body?.url)
  if (!url) {
    res.status(400).json({ success: false, error: 'Invalid url' })
    return
  }

  const existing = getItemById(id)
  if (!existing) {
    res.status(404).json({ success: false, error: 'Not found' })
    return
  }

  const previousPreview = existing.previewImagePath

  try {
    const updated = updateItemUrl(id, url)
    if (!updated) {
      res.status(404).json({ success: false, error: 'Not found' })
      return
    }

    if (previousPreview && previousPreview.startsWith('/api/assets/')) {
      const fileName = previousPreview.replace('/api/assets/', '')
      await fs.rm(path.join(storage.assetsDir, fileName), { force: true })
    }

    enqueueCapture(id)
    res.status(200).json({ success: true, data: updated })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('UNIQUE') || msg.includes('unique') || msg.includes('constraint')) {
      res.status(409).json({ success: false, error: 'URL already exists' })
      return
    }
    throw err
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  const deleted = deleteItemById(req.params.id)
  if (!deleted) {
    res.status(404).json({ success: false, error: 'Not found' })
    return
  }

  if (deleted.previewImagePath && deleted.previewImagePath.startsWith('/api/assets/')) {
    const fileName = deleted.previewImagePath.replace('/api/assets/', '')
    await fs.rm(path.join(storage.assetsDir, fileName), { force: true })
  }

  res.status(200).json({ success: true, data: deleted })
})

export default router
