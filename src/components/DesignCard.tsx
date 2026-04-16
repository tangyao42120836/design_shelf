import type { DesignItem } from '@/types/design'
import { cn } from '@/lib/utils'
import { getTagDisplay } from '@/lib/tagPresets'

function getHost(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

export default function DesignCard(props: { item: DesignItem; onClick: () => void }) {
  const host = getHost(props.item.url)
  const status = props.item.status

  return (
    <button
      type="button"
      className={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-black/[0.03] text-left shadow-[0_30px_60px_-50px_rgba(0,0,0,0.18)] transition',
        'hover:-translate-y-0.5 hover:border-black/20 hover:bg-black/[0.05] hover:shadow-[0_40px_80px_-50px_rgba(0,0,0,0.22)]',
        'dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_30px_60px_-50px_rgba(0,0,0,0.9)]',
        'dark:hover:border-white/20 dark:hover:bg-white/[0.05] dark:hover:shadow-[0_40px_80px_-50px_rgba(0,0,0,0.95)]',
      )}
      onClick={props.onClick}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-b from-black/[0.04] to-black/[0.01] dark:from-white/[0.06] dark:to-white/[0.02]">
        {props.item.previewImagePath ? (
          <img
            src={props.item.previewImagePath}
            alt={props.item.title ?? host}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div className="grid gap-2 text-center">
              <div className="text-xs tracking-wide text-zinc-600 dark:text-zinc-300">
                {status === 'failed' ? '生成失败' : status === 'processing' ? '生成中…' : '等待生成'}
              </div>
              <div className="mx-auto h-1.5 w-40 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div
                  className={cn(
                    'h-full w-1/3 rounded-full',
                    status === 'failed' ? 'bg-rose-300/70' : 'bg-lime-300/70',
                    status === 'processing' ? 'animate-pulse' : '',
                  )}
                />
              </div>
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/70 to-transparent dark:from-zinc-950/70" />
      </div>

      <div className="flex flex-col gap-3 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate font-[520] tracking-tight text-zinc-950 dark:text-zinc-100">
              {props.item.title ?? host}
            </div>
            <div className="truncate text-xs text-zinc-600 dark:text-zinc-400">{host}</div>
          </div>
          <div className="shrink-0 pt-0.5">
            {props.item.faviconUrl ? (
              <img
                src={props.item.faviconUrl}
                alt=""
                className="h-6 w-6 rounded-md border border-black/10 bg-black/5 object-cover dark:border-white/10 dark:bg-white/5"
                loading="lazy"
              />
            ) : (
              <div className="h-6 w-6 rounded-md border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5" />
            )}
          </div>
        </div>

        {props.item.tags.length ? (
          <div className="flex flex-wrap gap-1.5">
            {props.item.tags.slice(0, 3).map((t) => (
              <div
                key={t}
                className="rounded-full border border-black/10 bg-black/5 px-2 py-0.5 text-[11px] text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
              >
                {getTagDisplay(t)}
              </div>
            ))}
            {props.item.tags.length > 3 ? (
              <div className="rounded-full border border-black/10 bg-black/5 px-2 py-0.5 text-[11px] text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                +{props.item.tags.length - 3}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="h-5" />
        )}
      </div>
    </button>
  )
}
