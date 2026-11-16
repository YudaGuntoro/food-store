import { pageMetadata } from '../seo'
import type { Metadata } from 'next'
import SocialPostsPage from '../components/SocialPostsPage'

export const metadata: Metadata = pageMetadata("/tiktok", "TikTok Sekolah", "Cerita, kegiatan, dan momen terbaru SMPIT Cendekia di TikTok.")

export default function TikTokPage() {
  return <SocialPostsPage platform='tiktok' />
}
