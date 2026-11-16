// Browser contract check with an isolated upstream fixture; never connects to the database.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { chromium } from '../../cendekia-dashboard/.verify-cms/node_modules/playwright/index.mjs'

const entries = Array.from({ length: 17 }, (_, i) => ({ slug: `prestasi-${i + 1}`, title: `Prestasi ${i + 1}${i % 3 === 0 ? ' dengan judul panjang untuk memeriksa kerataan kartu prestasi' : ''}`, level: 'Kabupaten', body: 'Cerita prestasi dari fixture.' }))
const requests = []
let failNext = false
const upstream = createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost')
  response.setHeader('Content-Type', 'application/json')
  if (url.pathname === '/api/school/contact') {
    response.end(JSON.stringify({ success: true, data: { whatsappNumber: '', email: '', address: '', instagramUrl: '', tiktokUrl: '', facebookUrl: '' } }))
    return
  }
  if (url.pathname !== '/api/school/achievements') { response.writeHead(404).end(); return }
  const offset = Number(url.searchParams.get('offset')), limit = Number(url.searchParams.get('limit'))
  const query = url.searchParams.get('query') || ''
  requests.push({ offset, limit, query })
  if (failNext) { failNext = false; response.writeHead(503).end('{}'); return }
  const filtered = entries.filter(entry => `${entry.title} ${entry.level}`.toLowerCase().includes(query.toLowerCase()))
  response.end(JSON.stringify({ success: true, data: { items: filtered.slice(offset, offset + limit), total: filtered.length } }))
})
await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve))
const port = Number(process.env.ACHIEVEMENTS_CHECK_PORT || 3019)
const next = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '-p', String(port)], {
  cwd: new URL('..', import.meta.url), windowsHide: true,
  env: { ...process.env, SCHOOL_API_URL: `http://127.0.0.1:${upstream.address().port}`, NEXT_TELEMETRY_DISABLED: '1' },
  stdio: ['ignore', 'pipe', 'pipe'],
})
let logs = ''
next.stdout.on('data', chunk => { logs += chunk })
next.stderr.on('data', chunk => { logs += chunk })
let browser
try {
  await new Promise((resolve, reject) => {
    const deadline = setTimeout(() => { clearInterval(timer); reject(new Error('Next startup timeout')) }, 60000)
    const timer = setInterval(() => {
      if (logs.includes('Ready in')) { clearTimeout(deadline); clearInterval(timer); resolve() }
      else if (next.exitCode !== null) { clearTimeout(deadline); clearInterval(timer); reject(new Error(logs)) }
    }, 250)
  })
  browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(`http://127.0.0.1:${port}/prestasi`, { waitUntil: 'networkidle', timeout: 90000 })
  const cards = page.locator('article')
  assert.equal(await cards.count(), 8)
  assert.deepEqual(requests, [{ offset: 0, limit: 8, query: '' }])
  const summaries = await page.locator('article summary').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().top))
  assert.ok(Math.max(...summaries.slice(0, 4)) - Math.min(...summaries.slice(0, 4)) < 2, 'Story controls align across the row')
  const more = page.getByRole('button', { name: 'Lihat lebih banyak', exact: true })
  failNext = true
  await more.click()
  await page.getByRole('alert').waitFor()
  assert.equal(await cards.count(), 8, 'A failed request preserves loaded cards')
  await more.click()
  await page.waitForFunction(() => document.querySelectorAll('article').length === 12)
  await more.click()
  await page.waitForFunction(() => document.querySelectorAll('article').length === 16)
  await more.click()
  await page.waitForFunction(() => document.querySelectorAll('article').length === 17)
  assert.equal(await more.count(), 0, 'Load more disappears after the last card')
  assert.equal(new Set(await cards.evaluateAll(nodes => nodes.map(node => node.id))).size, 17)
  assert.deepEqual(requests.slice(1).map(({ offset, limit }) => [offset, limit]), [[8, 4], [8, 4], [12, 4], [16, 4]])
  await page.getByRole('textbox', { name: 'Cari prestasi' }).fill('Prestasi 17')
  await page.waitForFunction(() => document.querySelectorAll('article').length === 1)
  assert.match(await cards.first().textContent(), /Prestasi 17/)
  await page.getByRole('textbox', { name: 'Cari prestasi' }).fill('tidak-ada')
  await page.getByText('Prestasi yang dicari belum ditemukan.').waitFor()
  await page.getByRole('textbox', { name: 'Cari prestasi' }).fill('')
  await page.waitForFunction(() => document.querySelectorAll('article').length === 8)
  await page.setViewportSize({ width: 375, height: 812 })
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow on mobile')
  const invalid = await page.request.get(`http://127.0.0.1:${port}/api/school/achievements?limit=100`)
  assert.equal(invalid.status(), 400)
  console.log('PASS: initial 8; +4 per request; retry preserves cards; all 17 accessible; full search; aligned stories; mobile; parameter limits.')
} catch (error) {
  console.error(logs.slice(-3000))
  throw error
} finally {
  await browser?.close()
  next.kill()
  upstream.closeAllConnections()
  await new Promise(resolve => upstream.close(resolve))
}
