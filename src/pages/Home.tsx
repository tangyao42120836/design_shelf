import { useEffect, useMemo, useState } from 'react'
import { Moon, Plus, Search, Sun, Tag } from 'lucide-react'
import AddUrlModal from '@/components/AddUrlModal'
import DesignCard from '@/components/DesignCard'
import DesignDetailModal from '@/components/DesignDetailModal'
import { useTheme } from '@/hooks/useTheme'
import { useDesignItemsStore } from '@/stores/designItems'
import { getTagDisplay, getTagSortKey, tagPresetGroups } from '@/lib/tagPresets'

export default function Home() {
  const { isDark, toggleTheme } = useTheme()
  const [addOpen, setAddOpen] = useState(false)

  const items = useDesignItemsStore((s) => s.items)
  const isLoading = useDesignItemsStore((s) => s.isLoading)
  const error = useDesignItemsStore((s) => s.error)
  const selectedId = useDesignItemsStore((s) => s.selectedId)
  const search = useDesignItemsStore((s) => s.search)
  const tag = useDesignItemsStore((s) => s.tag)
  const setSearch = useDesignItemsStore((s) => s.setSearch)
  const setTag = useDesignItemsStore((s) => s.setTag)
  const load = useDesignItemsStore((s) => s.load)
  const add = useDesignItemsStore((s) => s.add)
  const update = useDesignItemsStore((s) => s.update)
  const refresh = useDesignItemsStore((s) => s.refresh)
  const changeUrl = useDesignItemsStore((s) => s.changeUrl)
  const remove = useDesignItemsStore((s) => s.remove)
  const select = useDesignItemsStore((s) => s.select)

  const selectedItem = useMemo(
    () => items.find((it) => it.id === selectedId) ?? null,
    [items, selectedId],
  )

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const hasPending = items.some((it) => it.status === 'pending' || it.status === 'processing')
    if (!hasPending) return

    const t = window.setInterval(() => {
      void load()
    }, 2500)

    return () => window.clearInterval(t)
  }, [items, load])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 250)
    return () => window.clearTimeout(t)
  }, [search, tag, load])

  const tagGroups = useMemo(() => {
    const activeTags = new Set<string>()
    for (const it of items) {
      for (const t of it.tags) activeTags.add(t)
    }
    if (tag.trim()) activeTags.add(tag.trim())

    const groups: { label: string; options: string[] }[] = []
    const usedTags = new Set<string>()

    // 按照预设分类进行分组
    for (const g of tagPresetGroups) {
      const options: string[] = []
      for (const pt of g.tags) {
        const match = Array.from(activeTags).find((t) => t.toLowerCase() === pt.key.toLowerCase())
        if (match) {
          options.push(match)
          usedTags.add(match.toLowerCase())
        }
      }
      if (options.length > 0) {
        groups.push({ label: g.label, options })
      }
    }

    // 其他未在预设中的自定义标签
    const others: string[] = []
    for (const t of activeTags) {
      if (!usedTags.has(t.toLowerCase())) {
        others.push(t)
      }
    }
    if (others.length > 0) {
      groups.push({
        label: '其他',
        options: others.sort((a, b) => getTagSortKey(a).localeCompare(getTagSortKey(b))),
      })
    }

    return groups
  }, [items, tag])

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 hidden bg-[radial-gradient(circle_at_20%_10%,rgba(163,230,53,0.14),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.10),transparent_45%),radial-gradient(circle_at_40%_80%,rgba(244,63,94,0.06),transparent_45%)] dark:block" />
        <div className="absolute inset-0 hidden opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:48px_48px] dark:block" />
        <div className="absolute inset-0 hidden bg-gradient-to-b from-zinc-950/20 via-zinc-950/70 to-zinc-950 dark:block" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(163,230,53,0.10),transparent_45%),radial-gradient(circle_at_70%_0%,rgba(56,189,248,0.08),transparent_55%)] dark:hidden" />
        <div className="absolute inset-0 opacity-[0.5] [background-image:linear-gradient(rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:48px_48px] dark:hidden" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-zinc-50 to-zinc-50 dark:hidden" />
      </div>

      <div className="relative flex min-h-screen flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 border-b border-black/5 bg-zinc-50/80 px-5 py-4 backdrop-blur-xl dark:border-white/5 dark:bg-zinc-950/80">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-4 sm:w-auto">
              <div className="flex items-center gap-2.5">
                <img src="/favicon.svg" alt="Logo" className="h-7 w-7 select-none" />
                <div className="font-serif text-[26px] tracking-tight text-zinc-950 dark:text-zinc-50">
                  Design Shelf
                </div>
              </div>
              <div className="flex items-center gap-2 sm:hidden">
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-black/10 bg-black/5 px-3 text-sm text-zinc-900 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                  onClick={toggleTheme}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-lime-300 px-3 text-sm font-medium text-zinc-950 transition hover:bg-lime-200"
                  onClick={() => setAddOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-end gap-3">
              <div className="flex w-full flex-1 items-center gap-3 sm:max-w-[600px]">
                <div className="relative w-full">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="搜索标题 / 域名 / URL"
                    className="h-10 w-full rounded-xl border border-black/10 bg-black/5 pl-9 pr-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-black/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:focus:border-white/20"
                  />
                </div>

                <div className="relative w-full sm:max-w-[200px]">
                  <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="h-10 w-full appearance-none rounded-xl border border-black/10 bg-black/5 pl-9 pr-9 text-sm text-zinc-900 outline-none focus:border-black/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:focus:border-white/20"
                  >
                    <option value="">全部标签</option>
                    {tagGroups.map((g) => (
                      <optgroup key={g.label} label={g.label}>
                        {g.options.map((t) => (
                          <option key={t} value={t}>
                            {getTagDisplay(t)}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    ▾
                  </div>
                </div>
              </div>

              <div className="hidden items-center gap-2 sm:flex">
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-black/5 px-3 text-sm text-zinc-900 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                  onClick={toggleTheme}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  主题
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-lime-300 px-4 text-sm font-medium text-zinc-950 transition hover:bg-lime-200"
                  onClick={() => setAddOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  新增
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative mx-auto w-full max-w-6xl flex-1 px-5 pb-14 pt-6">
          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <div>{isLoading ? '加载中…' : `${items.length} 条收藏`}</div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200/30 bg-rose-200/20 px-4 py-3 text-sm text-rose-900 dark:border-rose-200/20 dark:bg-rose-300/10 dark:text-rose-100">
              {error}
            </div>
          ) : null}

          {items.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it) => (
                <DesignCard key={it.id} item={it} onClick={() => select(it.id)} />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-black/10 bg-black/[0.03] p-10 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="max-w-xl">
                <div className="text-lg font-medium text-zinc-950 dark:text-zinc-50">还没有收藏</div>
                <div className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  粘贴一个你觉得很棒的网站链接，系统会自动抓标题、站点信息并生成预览截图。
                </div>
                <button
                  type="button"
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-lime-300 px-4 text-sm font-medium text-zinc-950 transition hover:bg-lime-200"
                  onClick={() => setAddOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  新增第一条
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddUrlModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={async (input) => {
          await add({ url: input.url, tags: input.tags, note: input.note })
          void load()
        }}
      />

      <DesignDetailModal
        open={!!selectedId}
        item={selectedItem}
        onClose={() => select(null)}
        onRefresh={async (id) => {
          await refresh(id)
          void load()
        }}
        onChangeUrl={async (id, url) => {
          await changeUrl(id, url)
          void load()
        }}
        onDelete={async (id) => {
          await remove(id)
          void load()
        }}
        onUpdate={async (id, patch) => {
          await update(id, patch)
          void load()
        }}
      />
    </div>
  )
}
