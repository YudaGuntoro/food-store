import { schoolApiHeaders } from '../../../school-api-headers'

const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff' }
const invalid = () => Response.json({ success: false, message: 'Masukkan nama lengkap dan NISN 10 digit sesuai data pendaftaran.' }, { status: 400, headers })

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) return invalid()
  const reader = request.body?.getReader()
  if (!reader) return invalid()
  let input: { studentName?: unknown; nisn?: unknown }
  try {
    const chunks: Uint8Array[] = []; let size = 0
    while (true) {
      const { done, value } = await reader.read(); if (done) break
      size += value.length
      if (size > 2048) { await reader.cancel(); return invalid() }
      chunks.push(value)
    }
    const body = new Uint8Array(size); let offset = 0
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length }
    input = JSON.parse(new TextDecoder().decode(body))
    if (!input || typeof input.studentName !== 'string' || typeof input.nisn !== 'string') return invalid()
    if (input.studentName.trim().length < 2 || input.studentName.trim().length > 150 || !/^[0-9]{10}$/.test(input.nisn.trim())) return invalid()
  } catch { return invalid() }
  const api = process.env.SCHOOL_API_URL
  if (!api) return Response.json({ success: false, message: 'Layanan pengecekan belum tersedia.' }, { status: 503, headers })
  try {
    const response = await fetch(`${api.replace(/\/$/, '')}/api/spmb/acceptance-letter`, {
      method: 'POST', headers: { ...schoolApiHeaders(request), 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName: (input.studentName as string).trim(), nisn: (input.nisn as string).trim() }),
      cache: 'no-store', signal: AbortSignal.timeout(10000),
    })
    if (response.status >= 500) throw new Error('Unavailable')
    if (response.ok) {
      if (response.headers.get('content-type')?.split(';')[0] !== 'application/pdf') throw new Error('Invalid file')
      const bytes = await response.arrayBuffer()
      if (bytes.byteLength < 8 || bytes.byteLength > 1048576 || new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-') throw new Error('Invalid file')
      return new Response(bytes, { headers: { ...headers, 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="surat-diterima.pdf"' } })
    }
    return Response.json(await response.json(), { status: response.status, headers: { ...headers, ...(response.headers.get('retry-after') ? { 'Retry-After': response.headers.get('retry-after')! } : {}) } })
  } catch { return Response.json({ success: false, message: 'Surat belum dapat diunduh. Silakan cek status kembali atau hubungi admin sekolah.' }, { status: 503, headers }) }
}
