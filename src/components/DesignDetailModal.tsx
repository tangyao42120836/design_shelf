import { useEffect, useState } from 'react'
import { ExternalLink, RefreshCw, Trash2, Save } from 'lucide-react'
import Modal from '@/components/Modal'
import type { DesignItem } from '@/types/design'
import TagMultiSelect from '@/components/TagMultiSelect'
import { cn } from '@/lib/utils'

function getHost(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

export default function DesignDetailModal(props: {
  open: boolean
  item: DesignItem | null
  onClose: () => void
  onRefresh: (id: string) => Promise<void>
  onChangeUrl: (id: string, url: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onUpdate: (id: string, patch: { tags: string[]; note: string | null }) => Promise<void>
}) {
  const item = props.item
  const [zoomed, setZoomed] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [urlDraft, setUrlDraft] = useState('')
  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [isChangingUrl, setIsChangingUrl] = useState(false)

  useEffect(() => {
    if (!props.open) return
    setTags(props.item?.tags ?? [])
    setNote(props.item?.note ?? '')
    setUrlDraft(props.item?.url ?? '')
    setIsEditingUrl(false)
    setZoomed(false)
  }, [props.open, props.item])

  if (!item) return null

  const host = getHost(item.url)

  const restore = () => {
    setTags(item.tags)
    setNote(item.note ?? '')
    setZoomed(false)
  }

  const save = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      await props.onUpdate(item.id, { tags, note: note.trim() ? note.trim() : null })
      props.onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const refresh = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      await props.onRefresh(item.id)
    } finally {
      setIsRefreshing(false)
    }
  }

  const del = async () => {
    if (isDeleting) return
    if (!confirm('确定要删除这条收藏吗？')) return
    setIsDeleting(true)
    try {
      await props.onDelete(item.id)
      props.onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  const changeUrl = async () => {
    if (isChangingUrl) return
    const next = urlDraft.trim()
    if (!next) return
    if (!confirm('确认要更换网址并重新生成预览吗？')) return
    setIsChangingUrl(true)
    try {
      await props.onChangeUrl(item.id, next)
      setIsEditingUrl(false)
    } finally {
      setIsChangingUrl(false)
    }
  }

  const title = item.title ?? host

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      title={title}
      className="max-w-[1240px]"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 grid content-start gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-base font-medium tracking-wide text-zinc-950 dark:text-zinc-50" title={title}>
                {title}
              </div>
              <div className="mt-1 truncate text-[13px] text-zinc-500 dark:text-zinc-400" title={item.url}>
                {item.url}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-black/10 bg-black/5 px-3 text-sm text-zinc-900 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
              >
                <ExternalLink className="h-4 w-4" />
                打开原站
              </a>
              <button
                type="button"
                onClick={refresh}
                disabled={isRefreshing}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-black/10 bg-black/5 px-3 text-sm text-zinc-900 transition hover:bg-black/10 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
              >
                <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                刷新
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.03]">
            {item.previewImagePath ? (
              <div className="max-h-[72vh] overflow-auto">
                <img
                  src={item.previewImagePath}
                  alt={title}
                  className={
                    zoomed
                      ? 'w-full max-w-none origin-top-left cursor-zoom-out select-none object-contain'
                      : 'w-full cursor-zoom-in select-none object-contain'
                  }
                  style={zoomed ? { width: '160%' } : undefined}
                  onClick={() => setZoomed((z) => !z)}
                />
              </div>
            ) : (
              <div className="grid h-[340px] place-items-center p-8 text-center">
                <div className="grid gap-2">
                  <div className="text-sm font-medium text-zinc-950 dark:text-zinc-100">
                    {item.status === 'failed'
                      ? '预览生成失败'
                      : item.status === 'processing'
                        ? '预览生成中…'
                        : '预览等待生成'}
                  </div>
                  {item.errorMessage ? (
                    <div className="text-xs leading-relaxed text-rose-800/80 dark:text-rose-200/80">
                      {item.errorMessage}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      可以稍等一下，或点击右上角刷新
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-[420px] shrink-0 grid content-start gap-4">
          <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-medium tracking-wide text-zinc-800 dark:text-zinc-200">信息</div>
              <div
                className={
                  item.status === 'ready'
                    ? 'rounded-full bg-lime-300/20 px-2 py-0.5 text-[11px] text-lime-900 dark:bg-lime-300/15 dark:text-lime-200'
                    : item.status === 'failed'
                      ? 'rounded-full bg-rose-300/20 px-2 py-0.5 text-[11px] text-rose-900 dark:bg-rose-300/15 dark:text-rose-200'
                      : 'rounded-full bg-black/10 px-2 py-0.5 text-[11px] text-zinc-700 dark:bg-white/10 dark:text-zinc-300'
                }
              >
                {item.status}
              </div>
            </div>

            <div className="mt-3 grid gap-2">
              <div className="flex items-center gap-2">
                {item.faviconUrl ? (
                  <img
                    src={item.faviconUrl}
                    alt=""
                    className="h-6 w-6 rounded-md border border-black/10 bg-black/5 object-cover dark:border-white/10 dark:bg-white/5"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-md border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5" />
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm text-zinc-950 dark:text-zinc-100">{item.siteName ?? host}</div>
                  <div className="truncate text-[11px] text-zinc-500 dark:text-zinc-500">
                    创建于 {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-black/10 bg-black/5 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] font-medium tracking-wide text-zinc-600 dark:text-zinc-400">
                    网址
                  </div>
                  {!isEditingUrl ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingUrl(true)}
                      className="text-[11px] text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                    >
                      更换
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setUrlDraft(item.url)
                        setIsEditingUrl(false)
                      }}
                      className="text-[11px] text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                    >
                      取消
                    </button>
                  )}
                </div>

                {!isEditingUrl ? (
                  <div className="mt-1 truncate text-xs text-zinc-800 dark:text-zinc-200" title={item.url}>
                    {item.url}
                  </div>
                ) : (
                  <div className="mt-2 grid gap-2">
                    <input
                      value={urlDraft}
                      onChange={(e) => setUrlDraft(e.target.value)}
                      placeholder="https://..."
                      className="h-9 w-full rounded-xl border border-black/10 bg-black/5 px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-black/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:focus:border-white/20"
                    />
                    <button
                      type="button"
                      onClick={changeUrl}
                      disabled={isChangingUrl}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-black/10 bg-black/5 px-3 text-sm text-zinc-900 transition hover:bg-black/10 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                    >
                      {isChangingUrl ? '更换中…' : '应用并重新生成'}
                    </button>
                  </div>
                )}
              </div>

              {item.previewWidth && item.previewHeight ? (
                <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  视口 {item.previewWidth}×{item.previewHeight}
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="text-xs font-medium tracking-wide text-zinc-800 dark:text-zinc-200">标签</div>
            <div className="mt-2">
              <TagMultiSelect value={tags} onChange={setTags} />
            </div>

            <div className="mt-4 text-xs font-medium tracking-wide text-zinc-800 dark:text-zinc-200">备注</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2 min-h-[140px] w-full resize-none rounded-xl border border-black/10 bg-black/5 px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-black/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:focus:border-white/20"
              placeholder="记录动效、布局、排版等关键点"
            />

            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={del}
                disabled={isDeleting}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-black/5 px-3 text-sm text-zinc-900 transition hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/20 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/20 dark:hover:text-rose-400"
              >
                <Trash2 className="h-4 w-4" />
                删除
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={restore}
                  className="h-10 rounded-xl border border-black/10 bg-black/5 px-4 text-sm text-zinc-900 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                >
                  还原
                </button>
                <button
                  type="button"
                  onClick={save}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-lime-300 px-4 text-sm font-medium text-zinc-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? '保存中…' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
