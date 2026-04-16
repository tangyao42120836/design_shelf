export type TagPreset = {
  key: string
  zh: string
  en: string
}

export type TagPresetGroup = {
  label: string
  tags: TagPreset[]
}

export const tagPresetGroups: TagPresetGroup[] = [
  {
    label: '材质',
    tags: [
      { key: 'glass', zh: '玻璃', en: 'Glass' },
      { key: 'metal', zh: '金属', en: 'Metal' },
      { key: 'paper', zh: '纸张', en: 'Paper' },
      { key: 'fabric', zh: '织物', en: 'Fabric' },
      { key: 'grain', zh: '颗粒', en: 'Grain' },
      { key: 'noise', zh: '噪点', en: 'Noise' },
      { key: 'blur', zh: '模糊', en: 'Blur' },
      { key: 'gradient', zh: '渐变', en: 'Gradient' },
    ],
  },
  {
    label: '风格',
    tags: [
      { key: 'minimal', zh: '极简', en: 'Minimal' },
      { key: 'editorial', zh: '杂志感', en: 'Editorial' },
      { key: 'brutalist', zh: '粗野主义', en: 'Brutalist' },
      { key: 'retro', zh: '复古', en: 'Retro' },
      { key: 'futuristic', zh: '未来感', en: 'Futuristic' },
      { key: 'cute', zh: '可爱', en: 'Cute' },
      { key: 'luxury', zh: '高级', en: 'Luxury' },
      { key: 'bold', zh: '大胆', en: 'Bold' },
    ],
  },
  {
    label: '布局',
    tags: [
      { key: 'grid', zh: '网格', en: 'Grid' },
      { key: 'asymmetric', zh: '非对称', en: 'Asymmetric' },
      { key: 'split', zh: '分栏', en: 'Split' },
      { key: 'cards', zh: '卡片', en: 'Cards' },
      { key: 'hero', zh: '大标题首屏', en: 'Hero' },
      { key: 'sticky', zh: '吸顶/粘性', en: 'Sticky' },
      { key: 'timeline', zh: '时间线', en: 'Timeline' },
      { key: 'gallery', zh: '画廊', en: 'Gallery' },
    ],
  },
  {
    label: '动效',
    tags: [
      { key: 'hover', zh: '悬停', en: 'Hover' },
      { key: 'scroll', zh: '滚动', en: 'Scroll' },
      { key: 'parallax', zh: '视差', en: 'Parallax' },
      { key: 'transition', zh: '转场', en: 'Transition' },
      { key: 'micro-interaction', zh: '微交互', en: 'Micro-interaction' },
      { key: '3d', zh: '3D', en: '3D' },
      { key: 'loading', zh: '加载', en: 'Loading' },
    ],
  },
  {
    label: '场景',
    tags: [
      { key: 'landing', zh: '落地页', en: 'Landing' },
      { key: 'pricing', zh: '定价页', en: 'Pricing' },
      { key: 'ecommerce', zh: '电商', en: 'E-commerce' },
      { key: 'dashboard', zh: '仪表盘', en: 'Dashboard' },
      { key: 'portfolio', zh: '作品集', en: 'Portfolio' },
      { key: 'saas', zh: 'SaaS', en: 'SaaS' },
      { key: 'blog', zh: '博客', en: 'Blog' },
      { key: 'docs', zh: '文档', en: 'Docs' },
      { key: 'medicine', zh: '医疗', en: 'Medicine' },

    ],
  },
]

const presetList = tagPresetGroups.flatMap((g) => g.tags)
const presetByKey = new Map(presetList.map((t) => [t.key.toLowerCase(), t] as const))
const presetByZh = new Map(presetList.map((t) => [t.zh.trim(), t] as const))
const presetByEn = new Map(presetList.map((t) => [t.en.toLowerCase(), t] as const))

export function normalizePresetKey(input: string): string {
  const raw = input.trim()
  if (!raw) return ''
  const byKey = presetByKey.get(raw.toLowerCase())
  if (byKey) return byKey.key
  const byZh = presetByZh.get(raw)
  if (byZh) return byZh.key
  const byEn = presetByEn.get(raw.toLowerCase())
  if (byEn) return byEn.key
  return raw
}

export function getTagDisplay(tag: string): string {
  const preset = presetByKey.get(tag.toLowerCase())
  if (!preset) return tag
  return `${preset.zh} / ${preset.en}`
}

export function getTagSortKey(tag: string): string {
  const preset = presetByKey.get(tag.toLowerCase())
  if (!preset) return tag.toLowerCase()
  return `${preset.zh} ${preset.en}`.toLowerCase()
}
