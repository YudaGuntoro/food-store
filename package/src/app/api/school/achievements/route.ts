import { getAchievements } from '../../../prestasi/data'

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const offset = Number(params.get('offset') ?? 0)
  const limit = Number(params.get('limit') ?? 8)
  const query = (params.get('query') ?? '').trim()
  const headers = { 'Cache-Control': 'no-store' }
  if (!Number.isInteger(offset) || offset < 0 || offset > 1000000 || !Number.isInteger(limit) || limit < 1 || limit > 8 || query.length > 200)
    return Response.json({ message: 'Parameter pencarian tidak valid.' }, { status: 400, headers })
  try {
    return Response.json(await getAchievements(offset, limit, query), { headers })
  } catch {
    return Response.json({ message: 'Prestasi belum dapat dimuat. Silakan coba lagi.' }, { status: 502, headers })
  }
}
