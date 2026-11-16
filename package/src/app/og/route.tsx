import { ImageResponse } from 'next/og'
import { siteUrl } from '../seo'

export function GET() {
  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: '64px 72px', background: '#102d4e', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', background: '#ffd45c', color: '#102d4e', padding: '14px 24px', borderRadius: 12, fontSize: 25, fontWeight: 700 }}>SMPIT CENDEKIA</div>
        <div style={{ display: 'flex', fontSize: 24, color: '#cceaff' }}>PURWAKARTA</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', fontSize: 64, lineHeight: 1.15, fontWeight: 700 }}>Unggul dalam Bina</div>
        <div style={{ display: 'flex', fontSize: 64, lineHeight: 1.15, fontWeight: 700, color: '#ffd45c' }}>Iman, Ilmu dan Amal.</div>
        <div style={{ display: 'flex', fontSize: 25, marginTop: 12, color: '#cceaff' }}>Informasi sekolah · SPMB · Lomba Mata Pelajaran</div>
      </div>
      <div style={{ display: 'flex', borderTop: '1px solid #456380', paddingTop: 24, fontSize: 24 }}>{new URL(siteUrl).hostname}</div>
    </div>,
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=86400' } },
  )
}
