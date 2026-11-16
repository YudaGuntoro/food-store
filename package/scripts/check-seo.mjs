// Read-only SEO check. Requires the website and its configured API to be running.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const base = process.env.SCHOOL_WEBSITE_URL || 'http://localhost:3000'
const origin = process.env.SCHOOL_SITE_URL || 'https://smpitcendekiapwk.sch.id'
function evaluate(file, mocks) {
  const source = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const exports = {}
  vm.runInNewContext(source, { exports, require: name => {
    if (name === 'server-only') return {}
    if (Object.hasOwn(mocks, name)) return mocks[name]
    throw Error(`Unexpected import: ${name}`)
  }, process: { env: {} }, URL })
  return exports
}
const seo = evaluate('src/app/seo.ts', {})
const article = seo.pageMetadata('/berita/uji', 'Berita Uji', 'Ringkasan berita', { image: '/api/school/images/test-photo', publishedTime: '2026-11-16' })
assert.equal(article.openGraph.type, 'article')
assert.equal(article.openGraph.publishedTime, '2026-11-16')
assert.equal(article.openGraph.images[0].url, 'https://smpitcendekiapwk.sch.id/api/school/images/test-photo')
assert.equal(article.alternates.canonical, 'https://smpitcendekiapwk.sch.id/berita/uji')
const injected = { name: '</script><script>alert(1)</script>' }
assert.ok(!seo.jsonLd(injected).includes('<'))
assert.deepEqual(JSON.parse(seo.jsonLd(injected)), injected)
let entries = [{ collection: 'berita', slug: 'berita-uji' }, { collection: 'ekstrakurikuler', slug: 'panahan' }, { collection: 'guru', slug: 'bukan-detail-publik' }, { collection: 'berita', slug: '../invalid' }]
const sitemapModule = evaluate('src/app/sitemap.ts', { './seo': seo, './cms-content': { getCmsContent: async () => entries } })
const first = await sitemapModule.default()
assert.ok(first.some(item => item.url.endsWith('/berita/berita-uji')))
assert.ok(first.some(item => item.url.endsWith('/ekstrakurikuler/panahan')))
assert.ok(!first.some(item => item.url.includes('invalid') || item.url.includes('bukan-detail-publik')))
entries = []
assert.ok(!(await sitemapModule.default()).some(item => item.url.endsWith('/berita/berita-uji')), 'Removed content disappears from the next sitemap request')

const sitemapResponse = await fetch(base + '/sitemap.xml')
assert.equal(sitemapResponse.status, 200)
assert.match(sitemapResponse.headers.get('content-type'), /xml/)
const xml = await sitemapResponse.text()
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].replaceAll('&amp;', '&'))
assert.equal(new Set(urls).size, urls.length)
for (const path of seo.publicPaths) assert.ok(urls.includes(new URL(path, origin).href), path)
for (const url of urls) {
  assert.equal(new URL(url).origin, new URL(origin).origin)
  assert.ok(!/\/api\/|\/daftar$|\/cek-status$|\/ppdb(?:\/|$)/.test(url))
}
const robotsResponse = await fetch(base + '/robots.txt')
assert.equal(robotsResponse.status, 200)
const robots = await robotsResponse.text()
assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`))
assert.ok(robots.includes('Disallow: /api/'))
assert.ok(robots.includes('Allow: /api/school/images/'))
assert.ok(!robots.includes('Disallow: /spmb/cek-status'), 'Noindex pages remain crawlable so their meta directive can be read')
const imageResponse = await fetch(base + '/og')
assert.equal(imageResponse.status, 200)
assert.match(imageResponse.headers.get('content-type'), /image\/png/)
const png = Buffer.from(await imageResponse.arrayBuffer())
assert.equal(png.readUInt32BE(16), 1200)
assert.equal(png.readUInt32BE(20), 630)


const decode = text => text.replace(/&(?:amp|lt|gt|quot|#x27|#39);/g, entity => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#x27;': "'", '&#39;': "'" })[entity])
function tags(html, name) {
  return [...html.matchAll(new RegExp('<' + name + '\\b[^>]*>', 'g'))].map(match => Object.fromEntries([...match[0].matchAll(/([\w:-]+)="([^"]*)"/g)].map(attr => [attr[1], decode(attr[2])])) )
}
async function crawl(path) {
  const response = await fetch(base + path, { headers: { 'User-Agent': 'Twitterbot/1.0' }, signal: AbortSignal.timeout(90000) })
  return { response, html: await response.text() }
}
const dynamicPaths = urls.filter(url => /\/(berita|ekstrakurikuler)\/[^/]+$/.test(new URL(url).pathname)).map(url => new URL(url).pathname)
const paths = [...seo.publicPaths, '/spmb/daftar', '/lmp/daftar', '/spmb/cek-status', '/lmp/cek-status', ...dynamicPaths.slice(0, 1), ...dynamicPaths.filter(path => path.startsWith('/ekstrakurikuler/')).slice(0, 1)]
for (const path of [...new Set(paths)]) {
  const { response, html } = await crawl(path)
  assert.equal(response.status, 200, path)
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] || ''
  const links = tags(head, 'link'), metas = tags(head, 'meta')
  const meta = key => metas.find(tag => tag.name === key || tag.property === key)?.content
  const canonical = new URL(path, origin).href
  assert.equal(new URL(links.find(tag => tag.rel === 'canonical')?.href).href, canonical, path)
  assert.equal(new URL(meta('og:url')).href, canonical, path)
  assert.ok(meta('description'), path)
  const title = decode(head.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '')
  assert.ok(title.includes('SMPIT Cendekia Purwakarta'), path)
  assert.equal(title.split('SMPIT Cendekia Purwakarta').length - 1, 1, 'No duplicate school suffix')
  assert.equal(meta('og:title'), title)
  assert.equal(meta('twitter:card'), 'summary_large_image')
  assert.match(meta('og:image'), /^https?:\/\//)
  if (/\/(daftar|cek-status)$/.test(path)) assert.match(meta('robots'), /noindex/)
  if (path === '/') {
    const graphs = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]))
    const graph = graphs.find(value => value['@graph'])['@graph']
    const school = graph.find(value => value['@type'] === 'School')
    assert.equal(school.url, origin + '/')
    assert.ok(graph.some(value => value['@type'] === 'WebSite'))
    assert.ok(school.telephone || school.email || school.address, 'School schema includes configured contact information')
  }
  console.log('Checked SSR metadata:', path)
}
const missing = await crawl('/berita/seo-check-missing-page')
assert.ok(missing.response.status === 404 || missing.html.includes('NEXT_HTTP_ERROR_FALLBACK;404'))
assert.ok(tags(missing.html, 'meta').some(tag => tag.name === 'robots' && tag.content.includes('noindex')))
assert.ok(!tags(missing.html, 'link').some(tag => tag.rel === 'canonical'), 'A missing page must not inherit a homepage canonical')
const alias = await fetch(base + '/ppdb', { redirect: 'manual' })
assert.equal(alias.status, 308)
assert.equal(alias.headers.get('location'), '/spmb')
console.log('PASS: canonical sitemap URLs; live CMS changes; robots; SSR titles/descriptions/canonicals; OG/Twitter; 1200x630 PNG; School/WebSite JSON-LD; script escaping; noindex forms/lookups/404; legacy redirect.')
