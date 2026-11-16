import type { MetadataRoute } from 'next'
import { absoluteUrl } from './seo'

export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/api/school/images/', '/api/school/homepage-images/', '/api/social-image'],
      disallow: ['/api/'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
