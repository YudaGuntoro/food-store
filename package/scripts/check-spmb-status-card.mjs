// UI-only fixture responses. No registrations or database values are changed.
import assert from 'node:assert/strict'
import { chromium } from '../../cendekia-dashboard/.verify-cms/node_modules/playwright/index.mjs'

const base = process.env.SCHOOL_WEBSITE_URL || 'http://localhost:3000'
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) })
const fixture = {
  registrationNumber: 'SPMB-2027-UJI-STATUS', studentName: 'CALON MURID UJI STATUS', nisn: '0123456789',
  academicYear: '2027/2028', waveNumber: 1, submittedAt: '2026-11-17T01:00:00Z',
  previousSchool: 'SD UJI', targetGrade: 'VII', paymentStatus: 'Lunas', whatsappGroupUrl: '',
}
let status = 'Ditolak', found = true, requests = 0
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
  await page.route('**/api/spmb/check-status', async route => {
    assert.equal(route.request().method(), 'POST')
    assert.deepEqual(route.request().postDataJSON(), { studentName: fixture.studentName, nisn: fixture.nisn })
    requests++
    await route.fulfill({ json: { success: true, data: found ? { found: true, registration: { ...fixture, status } } : { found: false } } })
  })
  await page.goto(base + '/spmb/cek-status', { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.locator('input[name="studentName"]').fill(fixture.studentName)
  await page.locator('input[name="nisn"]').fill(fixture.nisn)
  const cases = [
    ['Ditolak', 'bg-red-50', 'Mohon maaf, Anda dinyatakan ditolak.'],
    ['Diterima', 'bg-emerald-50', 'Selamat! Anda dinyatakan diterima.'],
    ['Diproses', 'bg-blue-50', 'Pendaftaran Anda masih dalam proses pemeriksaan.'],
    ['Baru', 'bg-amber-50', 'Pendaftaran Anda sudah tercatat dan menunggu pemeriksaan admin sekolah.'],
  ]
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const [value, color, message] of cases) {
      status = value
      await page.getByRole('button', { name: 'Cek Status Pendaftaran', exact: true }).click()
      const card = page.getByRole('region', { name: value.toLocaleUpperCase('id-ID'), exact: true })
      await card.waitFor()
      assert.ok((await card.getAttribute('class')).includes(color), value)
      assert.ok((await card.innerText()).includes(message), value)
      assert.equal(await card.getByRole('heading', { level: 3 }).innerText(), value.toLocaleUpperCase('id-ID'))
      assert.ok(await card.evaluate(node => {
        const number = node.previousElementSibling
        return number?.textContent.includes('SPMB-2027-UJI-STATUS') && node.getBoundingClientRect().top >= number.getBoundingClientRect().bottom - 1
      }), 'Status card sits below registration number')
      assert.equal(await card.evaluate(node => getComputedStyle(node).textAlign), 'center')
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No mobile overflow')
      assert.ok(!(await page.content()).includes('Pendaftaran belum dapat diterima.'), 'Old duplicate message is removed')
    }
  }
  await page.emulateMedia({ media: 'print' })
  assert.ok(await page.getByRole('region', { name: 'BARU', exact: true }).isVisible(), 'Status is included in printed receipt')
  await page.emulateMedia({ media: 'screen' })
  found = false
  await page.getByRole('button', { name: 'Cek Status Pendaftaran', exact: true }).click()
  await page.getByRole('heading', { name: 'Data pendaftaran belum ditemukan' }).waitFor()
  assert.equal(await page.locator('#spmb-admission-status').count(), 0, 'No stale status after an unmatched search')
  assert.equal(requests, 9)
  console.log('PASS: four uppercase centered statuses, matching colors/messages, position below registration number, payment independence, desktop/mobile, printing and no stale result. No database writes.')
} finally { await browser.close() }
