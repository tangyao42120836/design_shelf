import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'

export type CaptureStatus = 'pending' | 'processing' | 'ready' | 'failed'

export type DesignItem = {
  id: string
  url: string
  title: string | null
  siteName: string | null
  faviconUrl: string | null
  previewImagePath: string | null
  previewWidth: number | null
  previewHeight: number | null
  status: CaptureStatus
  errorMessage: string | null
  tags: string[]
  note: string | null
  createdAt: string
  updatedAt: string
}

const dataDir = path.join(process.cwd(), 'data')
const assetsDir = path.join(dataDir, 'assets')

fs.mkdirSync(assetsDir, { recursive: true })

const dbPath = path.join(dataDir, 'app.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.exec(`
  CREATE TABLE IF NOT EXISTS design_items (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT,
    site_name TEXT,
    favicon_url TEXT,
    preview_image_path TEXT,
    preview_width INTEGER,
    preview_height INTEGER,
    status TEXT NOT NULL,
    error_message TEXT,
    tags_json TEXT NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_design_items_url ON design_items(url);
  CREATE INDEX IF NOT EXISTS idx_design_items_created_at ON design_items(created_at);
`)

type DbRow = {
  id: string
  url: string
  title: string | null
  site_name: string | null
  favicon_url: string | null
  preview_image_path: string | null
  preview_width: number | null
  preview_height: number | null
  status: string
  error_message: string | null
  tags_json: string
  note: string | null
  created_at: string
  updated_at: string
}

function rowToItem(row: DbRow): DesignItem {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    siteName: row.site_name,
    faviconUrl: row.favicon_url,
    previewImagePath: row.preview_image_path,
    previewWidth: row.preview_width,
    previewHeight: row.preview_height,
    status: row.status as CaptureStatus,
    errorMessage: row.error_message,
    tags: safeParseTags(row.tags_json),
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function safeParseTags(tagsJson: string): string[] {
  try {
    const parsed = JSON.parse(tagsJson)
    if (Array.isArray(parsed)) return parsed.map((v) => String(v)).filter(Boolean)
    return []
  } catch {
    return []
  }
}

export const storage = {
  dataDir,
  assetsDir,
}

function escapeLike(input: string): string {
  return input.replace(/[\\%_]/g, (m) => `\\${m}`)
}

export function listItems(params: { search?: string | null; tag?: string | null } = {}): DesignItem[] {
  const search = (params.search ?? '').trim()
  const tag = (params.tag ?? '').trim()

  if (!search && !tag) {
    const rows = db
      .prepare(
        `SELECT * FROM design_items
         ORDER BY datetime(created_at) DESC
         LIMIT 400`,
      )
      .all() as DbRow[]
    return rows.map(rowToItem)
  }

  const where: string[] = []
  const args: unknown[] = []

  if (search) {
    const like = `%${escapeLike(search)}%`
    where.push(`(url LIKE ? ESCAPE '\\' OR title LIKE ? ESCAPE '\\' OR site_name LIKE ? ESCAPE '\\')`)
    args.push(like, like, like)
  }

  if (tag) {
    const likeTag = `%\\"${escapeLike(tag)}\\"%`
    where.push(`tags_json LIKE ? ESCAPE '\\'`)
    args.push(likeTag)
  }

  const rows = db
    .prepare(
      `SELECT * FROM design_items
       WHERE ${where.join(' AND ')}
       ORDER BY datetime(created_at) DESC
       LIMIT 400`,
    )
    .all(...args) as DbRow[]

  return rows.map(rowToItem)
}

export function getItemById(id: string): DesignItem | null {
  const row = db.prepare(`SELECT * FROM design_items WHERE id = ?`).get(id) as DbRow | undefined
  return row ? rowToItem(row) : null
}

export function getItemByUrl(url: string): DesignItem | null {
  const row = db.prepare(`SELECT * FROM design_items WHERE url = ?`).get(url) as DbRow | undefined
  return row ? rowToItem(row) : null
}

export function createItem(input: { url: string; tags?: string[]; note?: string | null }): DesignItem {
  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  const tagsJson = JSON.stringify((input.tags ?? []).map((t) => String(t)).filter(Boolean))

  try {
    db.prepare(
      `INSERT INTO design_items (
        id, url, title, site_name, favicon_url,
        preview_image_path, preview_width, preview_height,
        status, error_message, tags_json, note, created_at, updated_at
      ) VALUES (
        @id, @url, NULL, NULL, NULL,
        NULL, NULL, NULL,
        @status, NULL, @tags_json, @note, @created_at, @updated_at
      )`,
    ).run({
      id,
      url: input.url,
      status: 'pending',
      tags_json: tagsJson,
      note: input.note ?? null,
      created_at: now,
      updated_at: now,
    })
  } catch (err) {
    const existing = getItemByUrl(input.url)
    if (existing) return existing
    throw err
  }

  const created = getItemById(id)
  if (!created) throw new Error('Failed to create item')
  return created
}

export function updateItemFields(id: string, patch: { tags?: string[]; note?: string | null }): DesignItem | null {
  const now = new Date().toISOString()
  const tagsJson = patch.tags ? JSON.stringify(patch.tags.map((t) => String(t)).filter(Boolean)) : null

  const current = getItemById(id)
  if (!current) return null

  db.prepare(
    `UPDATE design_items
     SET tags_json = @tags_json, note = @note, updated_at = @updated_at
     WHERE id = @id`,
  ).run({
    id,
    tags_json: tagsJson ?? JSON.stringify(current.tags),
    note: patch.note ?? current.note,
    updated_at: now,
  })

  return getItemById(id)
}

export function updateItemUrl(id: string, url: string): DesignItem | null {
  const now = new Date().toISOString()
  const current = getItemById(id)
  if (!current) return null

  if (current.url === url) return current

  db.prepare(
    `UPDATE design_items
     SET url = @url,
         title = NULL,
         site_name = NULL,
         favicon_url = NULL,
         preview_image_path = NULL,
         preview_width = NULL,
         preview_height = NULL,
         status = 'pending',
         error_message = NULL,
         updated_at = @updated_at
     WHERE id = @id`,
  ).run({ id, url, updated_at: now })

  return getItemById(id)
}

export function setItemProcessing(id: string): void {
  const now = new Date().toISOString()
  db.prepare(
    `UPDATE design_items
     SET status = 'processing', error_message = NULL, updated_at = @updated_at
     WHERE id = @id`,
  ).run({ id, updated_at: now })
}

export function setItemFailed(id: string, errorMessage: string): void {
  const now = new Date().toISOString()
  db.prepare(
    `UPDATE design_items
     SET status = 'failed', error_message = @error_message, updated_at = @updated_at
     WHERE id = @id`,
  ).run({ id, error_message: errorMessage, updated_at: now })
}

export function setItemCaptured(input: {
  id: string
  title: string | null
  siteName: string | null
  faviconUrl: string | null
  previewImagePath: string
  previewWidth: number
  previewHeight: number
}): void {
  const now = new Date().toISOString()
  db.prepare(
    `UPDATE design_items
     SET status = 'ready',
         title = @title,
         site_name = @site_name,
         favicon_url = @favicon_url,
         preview_image_path = @preview_image_path,
         preview_width = @preview_width,
         preview_height = @preview_height,
         error_message = NULL,
         updated_at = @updated_at
     WHERE id = @id`,
  ).run({
    id: input.id,
    title: input.title,
    site_name: input.siteName,
    favicon_url: input.faviconUrl,
    preview_image_path: input.previewImagePath,
    preview_width: input.previewWidth,
    preview_height: input.previewHeight,
    updated_at: now,
  })
}

export function deleteItemById(id: string): DesignItem | null {
  const existing = getItemById(id)
  if (!existing) return null

  db.prepare(`DELETE FROM design_items WHERE id = ?`).run(id)
  return existing
}
