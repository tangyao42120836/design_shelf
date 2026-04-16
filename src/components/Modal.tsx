import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

export default function Modal(props: {
  open: boolean
  title?: string
  actions?: React.ReactNode
  onClose: () => void
  children: React.ReactNode
  className?: string
}) {
  const open = props.open
  const onClose = props.onClose
  const actions = props.actions

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/70"
        onClick={onClose}
        role="button"
        tabIndex={-1}
      />
      <div className="absolute inset-0 flex items-center justify-center p-5">
        <div
          className={cn(
            'flex max-h-[calc(100vh-40px)] w-full max-w-[1100px] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_40px_100px_-40px_rgba(0,0,0,0.20)] dark:border-white/10 dark:bg-zinc-950 dark:shadow-[0_40px_100px_-40px_rgba(0,0,0,0.85)]',
            props.className,
          )}
        >
          {props.title ? (
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 px-5 py-3 dark:border-white/10">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium tracking-wide text-zinc-950 dark:text-zinc-100">
                  {props.title}
                </div>
              </div>
              <div className="flex items-center gap-2">
                  {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
                  <button
                    className="rounded-lg border border-black/10 bg-black/5 px-3 py-1.5 text-xs text-zinc-900 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                    onClick={onClose}
                    type="button"
                  >
                    关闭
                  </button>
                </div>
            </div>
          ) : null}
          <div className="min-h-0 overflow-auto p-5">{props.children}</div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
