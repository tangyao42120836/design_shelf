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

