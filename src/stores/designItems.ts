import { create } from 'zustand'
import type { DesignItem } from '@/types/design'
import * as api from '@/lib/api'

type DesignItemsState = {
  items: DesignItem[]
  isLoading: boolean
  error: string | null
  selectedId: string | null
  search: string
  tag: string
  setSearch: (search: string) => void
  setTag: (tag: string) => void
  select: (id: string | null) => void
  load: () => Promise<void>
  add: (input: { url: string; tags?: string[]; note?: string | null }) => Promise<void>
  update: (id: string, patch: { tags?: string[]; note?: string | null }) => Promise<void>
  refresh: (id: string) => Promise<void>
  changeUrl: (id: string, url: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useDesignItemsStore = create<DesignItemsState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  selectedId: null,
  search: '',
  tag: '',
  setSearch: (search) => set({ search }),
  setTag: (tag) => set({ tag }),
  select: (id) => set({ selectedId: id }),
  load: async () => {
    const search = get().search.trim()
    const tag = get().tag.trim()
    set({ isLoading: true, error: null })
    try {
      const items = await api.fetchItems({
        ...(search ? { search } : {}),
        ...(tag ? { tag } : {}),
      })
      set({ items, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '加载失败' })
    }
  },
  add: async (input) => {
    set({ error: null })
    try {
      const item = await api.createItem(input)
      set((s) => ({ items: [item, ...s.items] }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '新增失败' })
    }
  },
  update: async (id, patch) => {
    set({ error: null })
    try {
      const updated = await api.updateItem(id, patch)
      set((s) => ({ items: s.items.map((it) => (it.id === id ? updated : it)) }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '更新失败' })
    }
  },
  refresh: async (id) => {
    set({ error: null })
    try {
      const updated = await api.refreshItem(id)
      set((s) => ({ items: s.items.map((it) => (it.id === id ? updated : it)) }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '刷新失败' })
    }
  },
  changeUrl: async (id, url) => {
    set({ error: null })
    try {
      const updated = await api.updateItemUrl(id, url)
      set((s) => ({ items: s.items.map((it) => (it.id === id ? updated : it)) }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '更新网址失败' })
    }
  },
  remove: async (id) => {
    set({ error: null })
    try {
      await api.deleteItem(id)
      set((s) => ({
        items: s.items.filter((it) => it.id !== id),
        selectedId: s.selectedId === id ? null : s.selectedId,
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '删除失败' })
    }
  },
}))
