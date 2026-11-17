// Local integration: creates only synthetic applicants; never edits existing registrations.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mysql } from './lib/local-mysql.mjs';
import { browserSignIn } from './lib/browser-sign-in.mjs';
const apiBase = process.env.CMS_API_URL || 'http://localhost:5243';
const dashboard = process.env.CMS_DASHBOARD_URL || 'http://localhost:3002';
const website = process.env.SCHOOL_WEBSITE_URL || 'http://localhost:3000';
const tag = `SLETTER-${Date.now()}`;
const pdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 0/Kids[]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF');
let token, browser;
function sql(statement) { const result = mysql(statement); assert.equal(result.status, 0, 'Fixture SQL failed'); return result.stdout.trim(); }
const originals = sql('SELECT Id,Status,PaymentStatus,Version FROM spmb_applications ORDER BY Id');
const periods = sql('SELECT AcademicYear,WaveNumber,Revision FROM spmb_wave_periods ORDER BY AcademicYear,WaveNumber,Revision');
function fixture(suffix) {
  const name = tag + '-' + suffix, nisn = String(parseInt(randomUUID().slice(0,8),16)).padStart(10,'0');
  const id = Number(sql(`INSERT INTO spmb_applications(SubmissionKey,RegistrationNumber,AcademicYear,WaveNumber,WaveRevision,StudentName,Nisn,BirthPlace,BirthDate,Gender,PreviousSchool,TargetGrade,GuardianName,GuardianPhone,GuardianEmail,Address,Status,PaymentStatus,SubmittedAt,UpdatedAt,Version)
    SELECT '${randomUUID()}','${name}',AcademicYear,WaveNumber,Revision,'${name}','${nisn}','Purwakarta','2014-01-01','Laki-laki','SD UJI','VII','WALI UJI','081234567890','uji@example.test','ALAMAT UJI','Baru','Belum bayar',UTC_TIMESTAMP(6),UTC_TIMESTAMP(6),1
    FROM spmb_wave_periods ORDER BY AcademicYear,WaveNumber,Revision LIMIT 1; SELECT LAST_INSERT_ID();`));
  assert.ok(id > 0); return { id, name, nisn };
}
async function api(path, method='GET', body, auth=token) {
  const form = body instanceof FormData;
  return fetch(apiBase + '/api' + path, { method, headers: { ...(!form && body ? {'Content-Type':'application/json'} : {}), ...(auth ? {Authorization:`Bearer ${auth}`} : {}) }, body: body === undefined ? undefined : form ? body : JSON.stringify(body) });
}
async function data(response) { assert.equal(response.status,200,await response.clone().text()); return (await response.json()).data; }
function form(version, bytes=pdf, filename='surat.pdf', status='Diterima') {
  const body = new FormData(); body.set('status',status); body.set('paymentStatus','Lunas'); body.set('version',String(version));
  if (bytes) body.set('acceptanceLetter',new Blob([bytes],{type:'application/pdf'}),filename); return body;
}
function identity(target) { return {studentName:target.name,nisn:target.nisn}; }
try {
  token=(await data(await api('/auth/login','POST',{username:'admin',password:process.env.CMS_ADMIN_PASSWORD || 'admin123'},''))).access_token;
  const target=fixture('API'), ui=fixture('UI'), concurrent=fixture('RACE');
  const racePath=`/spmb/applications/${concurrent.id}`;
  const race=await Promise.all([api(racePath+'/status','PUT',form(1)),api(racePath+'/status','PUT',form(1))]);
  assert.deepEqual(race.map(r=>r.status).sort(),[200,409],'Concurrent acceptance saves have one winner');
  assert.equal((await data(await api(racePath))).version,2);
  assert.equal(sql(`SELECT COUNT(*) FROM spmb_acceptance_letters WHERE ApplicationId=${concurrent.id}`),'1');
  const path=`/spmb/applications/${target.id}`;
  assert.equal((await api(path+'/status','PUT',form(1), '')).status,401);
  assert.equal((await api(path+'/status','PUT',{status:'Diterima',version:1})).status,400);
  assert.equal((await api(path+'/status','PUT',form(1,null))).status,400);
  assert.equal((await api(path+'/status','PUT',form(1,Buffer.from('invalid file')))).status,400);
  assert.equal((await api(path+'/status','PUT',form(1,pdf,'file.txt'))).status,400);
  assert.equal((await api(path+'/status','PUT',form(1,Buffer.alloc(1048577)))).status,400);
  assert.equal((await api(path+'/status','PUT',form(1,pdf,'surat.pdf','Ditolak'))).status,400);
  assert.equal((await data(await api(path))).version,1,'Invalid uploads must not save status/payment');
  assert.equal(sql(`SELECT COUNT(*) FROM spmb_acceptance_letters WHERE ApplicationId=${target.id}`),'0');
  const saved=await data(await api(path+'/status','PUT',form(1)));
  assert.equal(saved.status,'Diterima'); assert.equal(saved.version,2); assert.equal(saved.hasAcceptanceLetter,true);
  const stored=await api(path+'/acceptance-letter'); assert.equal(stored.status,200); assert.equal(stored.headers.get('content-type'),'application/pdf');
  assert.deepEqual(Buffer.from(await stored.arrayBuffer()),pdf);
  assert.equal((await api(path+'/acceptance-letter','GET',undefined,'')).status,401);
  const download=await api('/spmb/acceptance-letter','POST',identity(target),''); assert.equal(download.status,200);
  assert.equal(download.headers.get('cache-control'),'no-store'); assert.equal(download.headers.get('x-content-type-options'),'nosniff');
  assert.deepEqual(Buffer.from(await download.arrayBuffer()),pdf);
  assert.equal((await api('/spmb/acceptance-letter','POST',{...identity(target),studentName:'WRONG NAME'},'')).status,404);
  assert.equal((await api('/spmb/acceptance-letter','POST',{...identity(target),nisn:'0000000000'},'')).status,404);
  const lookup=await data(await api('/spmb/check-status','POST',identity(target),''));
  assert.equal(lookup.registration.hasAcceptanceLetter,true); assert.equal(lookup.registration.id,undefined); assert.equal(lookup.registration.content,undefined);
  assert.equal((await api(path+'/status','PUT',form(1,Buffer.from('%PDF-1.4 stale replacement')))).status,409);
  assert.deepEqual(Buffer.from(await (await api(path+'/acceptance-letter')).arrayBuffer()),pdf,'Stale upload must not replace letter');
  assert.equal((await data(await api(path+'/status','PUT',{status:'Diterima',paymentStatus:'Belum bayar',version:2}))).version,3,'Existing letter permits later status/payment edits');
  await data(await api(path+'/status','PUT',{status:'Ditolak',version:3}));
  assert.equal((await api('/spmb/acceptance-letter','POST',identity(target),'')).status,404);
  assert.equal((await data(await api('/spmb/check-status','POST',identity(target),''))).registration.hasAcceptanceLetter,false);
  // The latest matching registration must win, even if an older year was accepted.
  if (Number(sql('SELECT COUNT(DISTINCT AcademicYear) FROM spmb_wave_periods')) > 1) {
    sql(`UPDATE spmb_applications AS latest JOIN spmb_applications AS older ON older.Id=${concurrent.id}
      JOIN spmb_wave_periods AS period ON period.AcademicYear<>older.AcademicYear
      SET latest.AcademicYear=period.AcademicYear,latest.WaveNumber=period.WaveNumber,latest.WaveRevision=period.Revision,
          latest.StudentName='${concurrent.name}',latest.Nisn='${concurrent.nisn}',latest.SubmittedAt=DATE_ADD(UTC_TIMESTAMP(6),INTERVAL 1 MINUTE)
      WHERE latest.Id=${target.id}`);
    assert.equal((await api('/spmb/acceptance-letter','POST',identity(concurrent),'')).status,404,'Never fall back to an older accepted registration');
  }

  // Older accepted registrations without letters are preserved and can be completed by staff.
  sql(`UPDATE spmb_applications SET Status='Diterima' WHERE Id=${ui.id}`);
  assert.equal((await data(await api('/spmb/check-status','POST',identity(ui),''))).registration.hasAcceptanceLetter,false);
  const {chromium}=await import('../.verify-cms/node_modules/playwright/index.mjs');
  browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL || 'chrome'});
  const context=await browser.newContext({viewport:{width:1440,height:1000}}); await browserSignIn(context);
  const page=await context.newPage(); await page.goto(dashboard+'/spmb/pendaftar',{waitUntil:'domcontentloaded',timeout:90000});
  await page.getByRole('textbox',{name:'Cari pendaftar'}).fill(ui.name);
  await page.getByRole('button',{name:ui.name,exact:true}).click();
  const dialog=page.locator('dialog[open]');
  const save=dialog.getByRole('button',{name:'Simpan status',exact:true});
  await dialog.getByLabel('Status pendaftaran',{exact:true}).selectOption('Diproses');
  assert.equal(await dialog.locator('input[type=file]').count(),0);
  await dialog.getByLabel('Status pendaftaran',{exact:true}).selectOption('Diterima');
  assert.equal(await save.isDisabled(),true,'Selecting Diterima requires an upload');
  await dialog.getByLabel('Status pembayaran',{exact:true}).selectOption('Lunas');
  assert.equal(await save.isDisabled(),true,'Accepted requires letter even on payment-only saves');
  const input=dialog.locator('input[type=file]');
  await input.setInputFiles({name:'invalid.txt',mimeType:'text/plain',buffer:pdf});
  await dialog.getByRole('alert').waitFor(); assert.equal(await save.isDisabled(),true);
  await input.setInputFiles({name:'surat.pdf',mimeType:'application/pdf',buffer:pdf});
  assert.equal(await save.isEnabled(),true);
  assert.equal((await context.request.put(dashboard+`/api/spmb/applications/${ui.id}/status`,{multipart:{status:'Diterima',version:'1'}})).status(),403,'CSRF required');
  const saving=page.waitForResponse(r=>r.url().endsWith(`/api/spmb/applications/${ui.id}/status`) && r.request().method()==='PUT');
  await save.click(); assert.equal((await saving).status(),200);
  await dialog.getByRole('button',{name:'Unduh surat tersimpan',exact:true}).waitFor();
  assert.equal(await save.isDisabled(),true);
  const staffDownload=page.waitForEvent('download'); await dialog.getByRole('button',{name:'Unduh surat tersimpan',exact:true}).click();
  assert.deepEqual(readFileSync(await (await staffDownload).path()),pdf);
  await page.setViewportSize({width:390,height:844});
  assert.ok(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'Mobile dialog does not overflow horizontally');
  const publicPage=await browser.newPage({viewport:{width:390,height:844}});
  await publicPage.goto(website+'/spmb/cek-status',{waitUntil:'domcontentloaded',timeout:90000});
  await publicPage.locator('input[name=studentName]').fill(ui.name); await publicPage.locator('input[name=nisn]').fill(ui.nisn);
  await publicPage.getByRole('button',{name:'Cek Status Pendaftaran',exact:true}).click();
  const button=publicPage.getByRole('button',{name:'Unduh surat diterima (PDF)',exact:true}); await button.waitFor();
  assert.ok(await button.isVisible());
  const receipt=publicPage.getByRole('region',{name:'DITERIMA',exact:true});
  assert.ok(await receipt.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'Mobile acceptance card does not overflow');
  const downloaded=publicPage.waitForEvent('download'); await button.click(); const file=await downloaded;
  assert.equal(file.suggestedFilename(),ui.name+'-surat-diterima.pdf'); assert.deepEqual(readFileSync(await file.path()),pdf);
  await publicPage.emulateMedia({media:'print'}); assert.equal(await button.isVisible(),false); await publicPage.emulateMedia({media:'screen'});
  const proxy=await fetch(website+'/api/spmb/acceptance-letter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(identity(ui))});
  assert.equal(proxy.status,200); assert.equal(proxy.headers.get('cache-control'),'no-store'); assert.deepEqual(Buffer.from(await proxy.arrayBuffer()),pdf);
  assert.equal((await fetch(website+'/api/spmb/acceptance-letter?nisn='+ui.nisn)).status,405,'No GET identity lookup');
  const invalid=await fetch(website+'/api/spmb/acceptance-letter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentName:ui.name,nisn:'bad'})}); assert.equal(invalid.status,400);
  // A retained letter must not be public after the current admission decision changes.
  await data(await api(`/spmb/applications/${ui.id}/status`,'PUT',{status:'Diproses',version:2}));
  await publicPage.getByRole('button',{name:'Cek Status Pendaftaran',exact:true}).click();
  await publicPage.getByRole('region',{name:'DIPROSES',exact:true}).waitFor(); assert.equal(await button.count(),0);
  assert.equal((await fetch(website+'/api/spmb/acceptance-letter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(identity(ui))})).status,404);
  await data(await api(path,'DELETE',{confirmed:true,version:4}));
  assert.equal(sql(`SELECT COUNT(*) FROM spmb_acceptance_letters WHERE ApplicationId=${target.id}`),'0','Delete cascades letter');
  console.log('PASS: required PDF, invalid/oversize uploads, atomic versioned saves, stale replacement, private/public downloads, identity/status gates, legacy records, CSRF, mobile and print.');
} finally {
  await browser?.close();
  sql(`DELETE FROM spmb_applications WHERE StudentName LIKE '${tag}-%' AND RegistrationNumber LIKE '${tag}-%'`);
  assert.equal(sql('SELECT Id,Status,PaymentStatus,Version FROM spmb_applications ORDER BY Id'),originals,'Original registrations remain unchanged');
  assert.equal(sql('SELECT AcademicYear,WaveNumber,Revision FROM spmb_wave_periods ORDER BY AcademicYear,WaveNumber,Revision'),periods,'Original periods remain unchanged');
}
