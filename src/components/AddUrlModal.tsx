import { useState } from 'react'
import Modal from '@/components/Modal'
import TagMultiSelect from '@/components/TagMultiSelect'

export default function AddUrlModal(props: {
  open: boolean
  onClose: () => void
  onSubmit: (input: { url: string; tags: string[]; note: string | null }) => Promise<void>
}) {
  const [url, setUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = url.trim().length > 6 && !isSubmitting

  const submit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    try {
      await props.onSubmit({ url: url.trim(), tags, note: note.trim() ? note.trim() : null })
      setUrl('')
      setTags([])
      setNote('')
      props.onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={props.open} onClose={props.onClose} title="新增收藏" className="max-w-[720px]">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <div className="text-xs font-medium tracking-wide text-zinc-800 dark:text-zinc-200">网址</div>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="h-11 w-full rounded-xl border border-black/10 bg-black/5 px-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-black/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:focus:border-white/20"
          />
        </div>

        <div className="grid gap-2">
          <div className="text-xs font-medium tracking-wide text-zinc-800 dark:text-zinc-200">标签</div>
          <TagMultiSelect value={tags} onChange={setTags} />
        </div>

        <div className="grid gap-2">
          <div className="text-xs font-medium tracking-wide text-zinc-800 dark:text-zinc-200">备注（可选）</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="你想记下来的关键点..."
            className="min-h-[96px] w-full resize-none rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-black/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:focus:border-white/20"
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            className="h-10 rounded-xl border border-black/10 bg-black/5 px-4 text-sm text-zinc-900 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
            onClick={props.onClose}
            type="button"
          >
            取消
          </button>
          <button
            className="h-10 rounded-xl bg-lime-300 px-4 text-sm font-medium text-zinc-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={submit}
            disabled={!canSubmit}
            type="button"
          >
            {isSubmitting ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
