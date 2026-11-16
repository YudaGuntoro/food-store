import 'server-only'
import { schoolApiHeaders } from '../school-api-headers'
import type { AchievementPage } from './types'

export async function getAchievements(offset = 0, limit = 8, query = ''): Promise<AchievementPage> {
  const api = process.env.SCHOOL_API_URL
  if (!api) return { items: [], total: 0 }
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit), query })
  const response = await fetch(`${api.replace(/\/$/, '')}/api/school/achievements?${params}`, {
    headers: schoolApiHeaders(), cache: 'no-store', signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error('Prestasi belum dapat dimuat. Coba lagi beberapa saat.')
  const payload = await response.json() as { success: boolean; data: AchievementPage }
  if (!payload.success || !Array.isArray(payload.data?.items) || !Number.isInteger(payload.data.total))
    throw new Error('Respons prestasi tidak valid.')
  return payload.data
}
