import 'server-only'
import type { Metadata } from 'next'

export const schoolName = 'SMPIT Cendekia Purwakarta'
export const siteDescription = 'Website resmi SMPIT Cendekia Purwakarta. Temukan informasi sekolah, program belajar, prestasi murid, SPMB, dan Lomba Mata Pelajaran (LMP).'

const configuredUrl = new URL(process.env.SCHOOL_SITE_URL || 'https://smpitcendekiapwk.sch.id')
if (configuredUrl.username || configuredUrl.password || configuredUrl.search || configuredUrl.hash || configuredUrl.pathname !== '/'
  || (configuredUrl.protocol !== 'https:' && !(configuredUrl.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(configuredUrl.hostname))))
  throw new Error('SCHOOL_SITE_URL harus berupa origin HTTPS website, tanpa path atau kredensial.')
export const siteUrl = configuredUrl.origin
export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString()

type PageOptions = { noIndex?: boolean; image?: string; publishedTime?: string }
export function pageMetadata(path: string, title: string, description = siteDescription, options: PageOptions = {}): Metadata {
  const fullTitle = title.includes(schoolName) ? title : `${title} | ${schoolName}`
  const image = options.image || '/og'
  return {
    title: { absolute: fullTitle }, description,
    alternates: { canonical: absoluteUrl(path) },
    ...(options.noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: options.publishedTime ? 'article' : 'website',
      title: fullTitle, description, url: absoluteUrl(path), siteName: schoolName, locale: 'id_ID',
      images: [{ url: absoluteUrl(image), alt: options.image ? title : schoolName, ...(!options.image ? { width: 1200, height: 630 } : {}) }],
      ...(options.publishedTime ? { publishedTime: options.publishedTime } : {}),
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [absoluteUrl(image)] },
  }
}

// Only public information pages belong in the sitemap; forms and lookups are noindex.
export const publicPaths = [
  '/', '/sejarah', '/struktur-organisasi', '/guru', '/osis', '/fasilitas', '/ekstrakurikuler',
  '/kegiatan-rutin', '/berita', '/pengumuman', '/prestasi', '/spmb', '/lmp', '/aspirasi', '/instagram', '/tiktok',
]

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
