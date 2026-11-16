// Local integration check: creates and deletes only its own synthetic applicants/account.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mysql } from './lib/local-mysql.mjs';
import { browserSignIn } from './lib/browser-sign-in.mjs';

const base = process.env.CMS_API_URL || 'http://localhost:5243';
const web = process.env.CMS_DASHBOARD_URL || 'http://localhost:3002';
const tag = `DELETE-CHECK-${Date.now()}`;
let token, viewerId, browser;
function sql(statement) {
  const result = mysql(statement);
  assert.equal(result.status, 0, 'Synthetic fixture database operation failed.');
  return result.stdout.trim();
}
async function api(path, method = 'GET', body, access = token) {
  const response = await fetch(base + '/api' + path, { method,
    headers: { 'Content-Type': 'application/json', ...(access ? { Authorization: `Bearer ${access}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body) });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, data: payload.data };
}
function fixture(suffix) {
  const name = `${tag}-${suffix}`;
  const id = Number(sql(`INSERT INTO lmp_applications(SubmissionKey,RegistrationNumber,EventId,StudentName,Nisn,PreviousSchool,Grade,SubjectId,ContactName,ContactPhone,Status,PaymentStatus,SubmittedAt,Version)
    VALUES('${randomUUID()}','${name}',(SELECT Id FROM lmp_events ORDER BY Id LIMIT 1),'${name}','0123456789','SD UJI HAPUS',5,(SELECT Id FROM lmp_subjects ORDER BY Id LIMIT 1),'WALI UJI','081234567890','Baru','Belum bayar',UTC_TIMESTAMP(6),1);
    SELECT LAST_INSERT_ID();`));
  assert.ok(id > 0);
  sql(`INSERT INTO lmp_application_documents(ApplicationId,Content) VALUES(${id},'%PDF-1.4 synthetic');
    INSERT INTO lmp_payment_proofs(ApplicationId,AccountHolderName,ContentType,Content) VALUES(${id},'WALI UJI','application/pdf','%PDF-1.4 synthetic');`);
  return { id, name };
}
function children(id) {
  return sql(`SELECT (SELECT COUNT(*) FROM lmp_application_documents WHERE ApplicationId=${id})+(SELECT COUNT(*) FROM lmp_payment_proofs WHERE ApplicationId=${id});`);
}
const originalIds = sql('SELECT Id FROM lmp_applications ORDER BY Id;');
const originalEvents = sql('SELECT Id FROM lmp_events ORDER BY Id;');
try {
  const login = await api('/auth/login', 'POST', { username: 'admin', password: process.env.CMS_ADMIN_PASSWORD || 'admin123' }, '');
  assert.equal(login.status, 200); token = login.data.access_token;
  const target = fixture('API'), ui = fixture('UI'), keep = fixture('KEEP');
  const path = `/lmp/applications/${target.id}`;
  assert.equal((await api(path, 'DELETE', { confirmed: true, version: 1 }, '')).status, 401);
  const viewer = await api('/users', 'POST', { username: tag.toLowerCase(), password: `${tag}!`, full_name: tag, role: 'VIEWER', status: 'ACTIVE' });
  assert.equal(viewer.status, 201); viewerId = viewer.data.id;
  const viewerLogin = await api('/auth/login', 'POST', { username: tag.toLowerCase(), password: `${tag}!` }, '');
  assert.equal((await api(path, 'DELETE', { confirmed: true, version: 1 }, viewerLogin.data.access_token)).status, 403);
  assert.equal((await api(path, 'DELETE', { confirmed: false, version: 1 })).status, 400);
  assert.equal((await api(path, 'DELETE', { confirmed: true, version: 0 })).status, 400);
  assert.equal((await api(path, 'DELETE', { confirmed: true, version: 2 })).status, 409);
  assert.equal((await api(path)).status, 200);
  assert.equal(children(target.id), '2');
  assert.equal((await api(path, 'DELETE', { confirmed: true, version: 1 })).status, 200);
  assert.equal((await api(path)).status, 404);
  assert.equal(children(target.id), '0');
  assert.equal((await api(path, 'DELETE', { confirmed: true, version: 1 })).status, 404);
  assert.equal((await api(`/lmp/applications/${keep.id}`)).status, 200);
  assert.equal(children(keep.id), '2');

  const { chromium } = await import('../.verify-cms/node_modules/playwright/index.mjs');
  browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await browserSignIn(context);
  const page = await context.newPage();
  async function searchFor(name) {
    const response = page.waitForResponse(response => {
      const url = new URL(response.url());
      return url.pathname === '/api/lmp/applications' && url.searchParams.get('search') === name && response.request().method() === 'GET';
    });
    await page.getByRole('textbox', { name: 'Cari peserta LMP' }).fill(name);
    assert.equal((await response).status(), 200);
  }
  await page.goto(web + '/lmp/pendaftar', { waitUntil: 'domcontentloaded' });
  await searchFor(ui.name);
  const rowDelete = page.getByRole('button', { name: `Hapus pendaftar ${ui.name}`, exact: true });
  await rowDelete.waitFor();
  let deletes = 0;
  page.on('request', request => { if (request.method() === 'DELETE') deletes++; });
  await rowDelete.click();
  const dialog = page.getByRole('dialog', { name: 'Hapus pendaftar LMP' });
  const confirm = dialog.getByRole('checkbox');
  const remove = dialog.getByRole('button', { name: 'Hapus', exact: true });
  assert.match(await dialog.innerText(), new RegExp(ui.name));
  assert.equal(await confirm.isChecked(), false);
  assert.equal(await remove.isDisabled(), true);
  await dialog.getByRole('button', { name: 'Batal', exact: true }).click();
  assert.equal(deletes, 0);
  assert.equal((await api(`/lmp/applications/${ui.id}`)).status, 200);
  await rowDelete.click();
  await confirm.check();
  assert.equal(await remove.isEnabled(), true);
  await dialog.getByRole('button', { name: 'Batal', exact: true }).click();
  await rowDelete.click();
  assert.equal(await confirm.isChecked(), false, 'Confirmation resets after reopening');
  // The browser session must not be allowed to delete without CSRF.
  assert.equal((await context.request.delete(`${web}/api/lmp/applications/${ui.id}`, { data: { confirmed: true, version: 1 } })).status(), 403);
  deletes = 0;
  // Simulate another staff edit after opening the popup; the first delete must fail.
  sql(`UPDATE lmp_applications SET Version=Version+1 WHERE Id=${ui.id} AND StudentName='${ui.name}';`);
  await confirm.check();
  await remove.click();
  await dialog.getByRole('alert').waitFor();
  assert.equal(await confirm.isChecked(), false);
  assert.equal(await remove.isDisabled(), true);
  assert.equal((await api(`/lmp/applications/${ui.id}`)).status, 200);
  await dialog.getByRole('button', { name: 'Batal', exact: true }).click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await searchFor(ui.name);
  await rowDelete.click();
  await confirm.check();
  const response = page.waitForResponse(response => response.request().method() === 'DELETE' && response.url().endsWith(`/applications/${ui.id}`));
  await remove.click();
  assert.equal((await response).status(), 200);
  await dialog.waitFor({ state: 'hidden' });
  await page.getByRole('heading', { name: 'Belum ada peserta sesuai filter' }).waitFor();
  assert.equal(deletes, 2, 'One failed stale request and one successful confirmed request');
  assert.equal(children(ui.id), '0');
  assert.equal((await api(`/lmp/applications/${keep.id}`)).status, 200);
  await page.setViewportSize({ width: 390, height: 844 });
  await searchFor(keep.name);
  await page.getByRole('button', { name: `Hapus pendaftar ${keep.name}`, exact: true }).click();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.getByRole('dialog', { name: 'Hapus pendaftar LMP' }).getByRole('button', { name: 'Batal', exact: true }).click();
  console.log('PASS: authorization, CSRF, confirmation, stale version, named popup, checkbox gating/reset, cancel, deletion, attachment cascade, table refresh, mobile, unrelated applicants preserved.');
} finally {
  await browser?.close();
  if (viewerId) assert.equal((await api('/users/' + viewerId, 'DELETE')).status, 200);
  assert.match(tag, /^DELETE-CHECK-\d+$/);
  sql(`DELETE FROM lmp_applications WHERE StudentName LIKE '${tag}-%';`);
  assert.equal(sql('SELECT Id FROM lmp_applications ORDER BY Id;'), originalIds, 'Original applicants must remain unchanged');
  assert.equal(sql('SELECT Id FROM lmp_events ORDER BY Id;'), originalEvents, 'Historical events must remain unchanged');
}
