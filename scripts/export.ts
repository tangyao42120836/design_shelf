import fs from 'node:fs/promises'
import path from 'node:path'
import { listItems } from '../api/designStore.js'

async function exportStaticSite() {
  const distDir = path.join(process.cwd(), 'dist')
  const distAssetsDir = path.join(distDir, 'api', 'assets')
  const srcAssetsDir = path.join(process.cwd(), 'data', 'assets')

  console.log('Generating static data.json...')
  const items = listItems().map(item => {
    // 将绝对路径转为相对路径，以便兼容 GitHub Pages 的子目录
    if (item.previewImagePath && item.previewImagePath.startsWith('/')) {
      return { ...item, previewImagePath: '.' + item.previewImagePath }
    }
    return item
  })
  await fs.writeFile(path.join(distDir, 'data.json'), JSON.stringify({ success: true, data: items }, null, 2))
  
  console.log(`Exported ${items.length} items to data.json`)

  console.log('Copying images to dist/api/assets...')
  await fs.mkdir(distAssetsDir, { recursive: true })

  try {
    const files = await fs.readdir(srcAssetsDir)
    let count = 0
    for (const file of files) {
      const srcFile = path.join(srcAssetsDir, file)
      const destFile = path.join(distAssetsDir, file)
      await fs.copyFile(srcFile, destFile)
      count++
    }
    console.log(`Copied ${count} images.`)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log('No assets directory found, skipping image copy.')
    } else {
      throw err
    }
  }

  console.log('Static export complete! You can now publish the "dist" folder.')
}

exportStaticSite().catch(console.error)
