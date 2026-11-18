# FoodStore

Website katalog catering bernuansa oranye dan krem, menggunakan Next.js, React, dan TypeScript. Fondasi berasal dari template website sekolah; modul sekolah, dashboard, database, dan aset sekolah sudah dikeluarkan dari project aktif. Riwayat awal dan lisensi template tetap dipertahankan.

## Menjalankan

Node.js 20.9+ diperlukan. Jalankan dari folder `package`:

```bash
npm ci
npm run dev
```

Buka http://localhost:3000. Untuk produksi, jalankan `npm run build` lalu `npm start`. Root aplikasi untuk hosting adalah `package`; Dockerfile juga tersedia di sana.

## Deployment

Domain tujuan: **https://foodstore.nusakaryadigital.com**.

- Repository: `https://github.com/YudaGuntoro/food-store`, branch `main`.
- Root aplikasi/build context: `package`.
- Build: `npm ci` lalu `npm run build`. Start: `npm start`, port `3000`.
- Untuk Docker, gunakan `package/Dockerfile` dengan build context `package`; aplikasi standalone berjalan pada port `3000`.
- Simpan `MIDTRANS_SERVER_KEY` sandbox sebagai environment variable rahasia di hosting saat runtime. File `.env.local` tidak dikirim ke GitHub atau image Docker.
- Isi konfigurasi `NEXT_PUBLIC_STORE_*` sebelum build bila ingin mengaktifkan kontak yang dikonfigurasi lewat environment.
- Pasang domain dan sertifikat HTTPS pada hosting/reverse proxy, dan pertahankan header `Host` sesuai domain publik agar pemeriksaan origin checkout berfungsi.

Payment gateway tetap dalam mode **Sandbox** meskipun website dibuka dari domain ini.

### Docker Compose di VPS

Jalankan dari root repository (folder yang berisi `compose.yaml`):

```bash
git pull --ff-only origin main
cp .env.example .env
nano .env
docker compose up -d --build
docker compose ps
curl -I http://127.0.0.1:3101
```

Salin `.env.example` hanya pada setup pertama. Isi `MIDTRANS_SERVER_KEY` sandbox di `.env` pada VPS; jangan commit file tersebut. Saat update berikutnya, cukup `git pull --ff-only origin main` lalu `docker compose up -d --build`.

Container hanya membuka port di loopback VPS. Arahkan reverse proxy yang sudah digunakan ke `http://127.0.0.1:3101`, pasang domain `foodstore.nusakaryadigital.com` beserta HTTPS, dan teruskan header `Host` asli. Ubah `FOODSTORE_PORT` di `.env` bila port tersebut sudah dipakai. Docker Compose ini tidak mengubah reverse proxy atau sertifikat yang sudah ada.

Log aplikasi: `docker compose logs --tail=100 -f foodstore`.

## Fitur

- Tampilan responsif dengan katalog nasi box, tumpeng, nasi kebuli, dan snack box.
- Pencarian, filter kategori, detail menu, serta keranjang dengan kontrol jumlah dan penyimpanan di browser.
- Ringkasan pesanan berisi nama, tanggal, alamat, dan catatan; konsultasi acara dengan jumlah tamu.
- Ringkasan bisa disalin atau dibuka di WhatsApp setelah nomor toko dikonfigurasi.
- Navigasi ponsel, dialog dengan pengelolaan fokus bawaan browser, dan dukungan reduced motion.
- Uji pembayaran Midtrans Sandbox melalui QRIS/virtual account dan halaman pemeriksaan status dari server.

Ini adalah pratinjau toko: semua menu, porsi, dan harga merupakan contoh. Foto adalah ilustrasi AI, bukan foto produk asli. Pembayaran tersedia khusus Midtrans Sandbox tanpa uang asli. Belum tersedia penyimpanan pesanan, pembayaran produksi, ongkir otomatis, atau dashboard admin. Persetujuan toko tetap diperlukan untuk pesanan catering.

## Mencoba payment gateway

Isi `MIDTRANS_SERVER_KEY` sandbox di `package/.env.local`, lalu restart server. Di keranjang, lengkapi form dan klik **Coba bayar di Sandbox**. Gunakan simulator bank Midtrans untuk membayar virtual account percobaan, lalu periksa hasil di `/pembayaran`. Jangan gunakan rekening bank asli.

Panduan konfigurasi, simulasi, dan batas implementasi: [Midtrans Sandbox](package/docs/midtrans-sandbox.md).

## Mengisi data toko

### Banner slider

Hero berisi 3 banner gambar lengkap (foto dan tulisan menyatu), berganti otomatis setiap 6 detik. Tersedia panah, titik navigasi, keyboard kiri/kanan, drag dengan mouse, dan swipe di ponsel. Banner mengikuti gerakan drag, lalu meluncur ke slide tujuan atau kembali saat tarikan terlalu pendek. Rotasi berhenti ketika kursor/fokus berada pada slider, tab browser tidak aktif, atau pengguna mengaktifkan reduced motion.

Ganti file desktop dan ponsel di `package/public/images/banners/`. Daftar gambar, alt text, tautan, dan kategori tujuan diatur pada `package/src/lib/hero-slides.ts`. Rasio desktop 1600 × 610; versi ponsel 780 × 1460. Pertahankan rasio ini agar desain tidak terdistorsi. Banner awal dibuat dari layout HTML/CSS dan ilustrasi menu yang sudah ada. Untuk mengekspor ulang contoh banner, jalankan `node scripts/export-hero-banners.mjs` dari `package` (memerlukan Google Chrome).

### Katalog dan kontak

1. Ubah katalog dan harga di `package/src/lib/catalog.ts`.
2. Ganti foto ilustrasi di `package/public/images/food/` dengan foto produk toko.
3. Salin `package/.env.example` menjadi `package/.env.local`, lalu isi `NEXT_PUBLIC_STORE_WHATSAPP` dengan nomor asli beserta kode negara, format `62…` tanpa tanda baca. Restart server; untuk produksi, build ulang.
4. Perbarui konten, area layanan, kebijakan, dan identitas toko sebelum digunakan untuk transaksi nyata.

Tanpa nomor WhatsApp, website hanya menyediakan ringkasan yang dapat disalin dan menjelaskan bahwa pesan belum dikirim. Keranjang tersimpan di perangkat yang sama, tanpa data pribadi. Formulir tidak disimpan ke localStorage.

## Pemeriksaan

```bash
cd package
npm run typecheck
npm run build
npm run test:e2e
```

Pengujian browser memakai Google Chrome yang terpasang di komputer. Konfigurasi ada di `package/playwright.config.ts`; ubah channel jika memakai browser lain. Pengujian mencakup desktop dan ponsel, pencarian, filter, detail, keranjang persisten, ringkasan pesanan, konsultasi, serta data keranjang tidak valid.

Catatan asal ilustrasi dan prompt berada di `package/docs/image-prompts.md`. Lisensi template awal tetap tersedia pada `LICENSE.txt`. Remote Git aktif: https://github.com/YudaGuntoro/food-store.
