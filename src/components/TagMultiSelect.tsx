import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTagDisplay, normalizePresetKey, tagPresetGroups } from '@/lib/tagPresets'

function normalizeTag(tag: string): string {
  return normalizePresetKey(tag.trim().replace(/\s+/g, ' '))
}

function uniq(tags: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of tags) {
    const v = normalizeTag(t)
    if (!v) continue
    const key = v.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(v)
  }
  return out
}

export default function TagMultiSelect(props: {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  defaultExpanded?: boolean
}) {
  const [draft, setDraft] = useState('')
  const [expanded, setExpanded] = useState(!!props.defaultExpanded)

  const selected = props.value

  const selectedKeySet = useMemo(() => new Set(selected.map((t) => t.toLowerCase())), [selected])

  const quickTags = useMemo(() => {
    const picks = tagPresetGroups.flatMap((g) => g.tags).slice(0, 10)
    return picks
  }, [])

  const addTag = (tag: string) => {
    const next = uniq([...selected, tag])
    props.onChange(next)
  }

  const removeTag = (tag: string) => {
    const key = tag.toLowerCase()
    props.onChange(selected.filter((t) => t.toLowerCase() !== key))
  }

  const toggleTag = (tag: string) => {
    const key = tag.toLowerCase()
    if (selectedKeySet.has(key)) removeTag(tag)
    else addTag(tag)
  }

  const commitDraft = () => {
    const raw = draft.trim()
    if (!raw) return
    const parts = raw
      .split(',')
      .map(normalizeTag)
      .filter(Boolean)
    if (parts.length) props.onChange(uniq([...selected, ...parts]))
    setDraft('')
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {selected.length ? (
          selected.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => removeTag(t)}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-black/5 px-2.5 py-1 text-[12px] text-zinc-900 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
            >
              <span>{getTagDisplay(t)}</span>
              <X className="h-3.5 w-3.5 opacity-60" />
            </button>
          ))
        ) : (
          <div className="text-xs text-zinc-500 dark:text-zinc-500">未选择标签</div>
        )}
      </div>

      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitDraft}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            commitDraft()
          }
        }}
        placeholder={props.placeholder ?? '输入标签并回车（或逗号）'}
        className="h-10 w-full rounded-xl border border-black/10 bg-black/5 px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-black/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:focus:border-white/20"
      />

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] font-medium tracking-wide text-zinc-600 dark:text-zinc-400">
            预设标签
          </div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg border border-black/10 bg-black/5 px-2.5 py-1 text-[11px] text-zinc-700 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
          >
            {expanded ? '收起' : '展开'}
          </button>
        </div>

        {!expanded ? (
          <div className="flex flex-wrap gap-2">
            {quickTags.map((t) => {
              const active = selectedKeySet.has(t.key.toLowerCase())
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => toggleTag(t.key)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[12px] transition',
                    active
                      ? 'border-lime-300/40 bg-lime-300/25 text-lime-900 hover:bg-lime-300/30 dark:text-lime-200'
                      : 'border-black/10 bg-black/5 text-zinc-800 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10',
                  )}
                >
                  {t.zh} / {t.en}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="max-h-64 overflow-auto pr-1">
            <div className="grid gap-3">
              {tagPresetGroups.map((g) => (
                <div key={g.label} className="grid gap-2">
                  <div className="text-[11px] font-medium tracking-wide text-zinc-600 dark:text-zinc-400">
                    {g.label}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {g.tags.map((t) => {
                      const active = selectedKeySet.has(t.key.toLowerCase())
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => toggleTag(t.key)}
                          className={cn(
                            'rounded-full border px-2.5 py-1 text-[12px] transition',
                            active
                              ? 'border-lime-300/40 bg-lime-300/25 text-lime-900 hover:bg-lime-300/30 dark:text-lime-200'
                              : 'border-black/10 bg-black/5 text-zinc-800 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10',
                          )}
                        >
                          {t.zh} / {t.en}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
