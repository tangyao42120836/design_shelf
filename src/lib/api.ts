import type { DesignItem } from '@/types/design'

const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true'

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  const json = (await res.json()) as ApiResponse<T>
  if (json.success === false) throw new Error(json.error || 'Request failed')
  return json.data
}

export async function fetchItems(params: { search?: string; tag?: string } = {}): Promise<DesignItem[]> {
  if (isStaticMode) {
    const data = await request<DesignItem[]>('./data.json')
    let items = data
    if (params.search) {
      const s = params.search.toLowerCase()
      items = items.filter(it => 
        (it.title && it.title.toLowerCase().includes(s)) || 
        (it.url && it.url.toLowerCase().includes(s)) ||
        (it.siteName && it.siteName.toLowerCase().includes(s))
      )
    }
    if (params.tag) {
      items = items.filter(it => it.tags.some(t => t.toLowerCase() === params.tag!.toLowerCase()))
    }
    return items
  }

  const sp = new URLSearchParams()
  if (params.search) sp.set('search', params.search)
  if (params.tag) sp.set('tag', params.tag)
  const q = sp.size ? `?${sp.toString()}` : ''
  return request<DesignItem[]>(`/api/items${q}`)
}

function checkStaticWrite() {
  if (isStaticMode) {
    throw new Error('当前为静态只读分享模式，不支持修改操作')
  }
}

export async function createItem(input: { url: string; tags?: string[]; note?: string | null }): Promise<DesignItem> {
  checkStaticWrite()
  return request<DesignItem>(`/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export async function updateItem(
  id: string,
  patch: { tags?: string[]; note?: string | null },
): Promise<DesignItem> {
  checkStaticWrite()
  return request<DesignItem>(`/api/items/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
}

export async function refreshItem(id: string): Promise<DesignItem> {
  checkStaticWrite()
  return request<DesignItem>(`/api/items/${encodeURIComponent(id)}/refresh`, {
    method: 'POST',
  })
}

export async function updateItemUrl(id: string, url: string): Promise<DesignItem> {
  checkStaticWrite()
  return request<DesignItem>(`/api/items/${encodeURIComponent(id)}/url`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
}

export async function deleteItem(id: string): Promise<DesignItem> {
  checkStaticWrite()
  return request<DesignItem>(`/api/items/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
