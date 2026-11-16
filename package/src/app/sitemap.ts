import type { MetadataRoute } from 'next'
import { getCmsContent } from './cms-content'
import { absoluteUrl, publicPaths } from './seo'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getCmsContent()
  const paths = new Set(publicPaths)
  for (const entry of entries || []) {
    if (['berita', 'ekstrakurikuler'].includes(entry.collection) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug))
      paths.add(`/${entry.collection}/${entry.slug}`)
  }
  return [...paths].map(path => ({ url: absoluteUrl(path) }))
}
