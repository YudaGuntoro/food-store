# Midtrans Sandbox FoodStore

Integrasi ini khusus transaksi percobaan, menggunakan Snap Redirect dengan QRIS dan transfer virtual account. Tidak ada jalur ke API produksi. Tidak memerlukan Client Key atau SDK tambahan.

## Konfigurasi lokal

1. Daftar/login di [dashboard Midtrans](https://dashboard.midtrans.com/), lalu pilih lingkungan **Sandbox**.
2. Buka **Settings → Access Keys** dan salin **Server Key** sandbox (awalan `SB-Mid-server-`). Jangan gunakan kunci produksi.
3. Isi file `package/.env.local`:

   ```dotenv
   MIDTRANS_SERVER_KEY=isi_server_key_sandbox_di_sini
   ```

   File ini diabaikan Git. Jangan kirim key lewat chat, commit, atau menambahkan awalan `NEXT_PUBLIC_` pada variabel ini.
4. Restart `npm run dev` dari folder `package`. Tidak perlu mengisi URL webhook untuk percobaan ini.

## Menjalankan simulasi

1. Buka FoodStore, tambah menu ke keranjang, dan lengkapi nama, tanggal acara, serta alamat dengan data uji.
2. Klik **Coba bayar di Sandbox**. Jumlah yang disimulasikan hanya subtotal menu, tanpa ongkir.
3. Di halaman Midtrans, pilih **QRIS** atau virtual account bank yang tersedia. Ketersediaan metode mengikuti pengaturan akun sandbox. QRIS ditampilkan melalui `other_qris`, yang membutuhkan GoPay atau ShopeePay QRIS aktif pada akun merchant.
4. Untuk QRIS, salin URL gambar QR ke simulator QRIS dari [panduan resmi Midtrans](https://docs.midtrans.com/docs/testing-payment-on-sandbox#e-wallet). Untuk VA, salin nomor VA lalu gunakan simulator bank yang sesuai pada panduan tersebut. Bayar hanya melalui simulator, jangan melalui aplikasi bank/e-wallet asli.
5. Klik kembali ke merchant setelah simulasi, atau buka `/pembayaran` di browser dan hostname yang sama. Misalnya, tetap gunakan `localhost` bila checkout dimulai dari `localhost`, bukan berganti ke `127.0.0.1`.
6. Klik **Periksa status**. Status pending/review juga diperiksa setiap 10 detik saat halaman aktif.

Transaksi yang belum dipilih metode pembayarannya dapat belum ditemukan di Core API Midtrans; FoodStore menampilkannya sebagai menunggu pembayaran. Status deny/cancel/failure, expire, dan refund ditampilkan sesuai respons Midtrans. Parameter sukses dari URL kembali tidak dipercaya sebagai hasil transaksi.

Perubahan daftar metode pembayaran berlaku pada transaksi baru. Transaksi lama yang dibuat saat hanya virtual account diaktifkan tetap menggunakan pilihan sebelumnya. Referensi: [Other QRIS](https://docs.midtrans.com/reference/other-qris).

## Batas percobaan

- Tidak ada uang asli atau pemrosesan pesanan catering. Form ringkasan/WhatsApp tetap tersedia secara terpisah.
- Total dihitung ulang di server dari ID menu dan jumlah. Harga dan total kiriman browser tidak digunakan.
- Data uji nama/alamat/tanggal dikirim ke Midtrans. Catatan form tetap digunakan untuk ringkasan konsultasi; belum ada penyimpanan pesanan di FoodStore.
- Cookie HttpOnly bertanda tangan menyimpan ID transaksi, ID/jumlah menu, subtotal, tautan Snap, dan kedaluwarsa, tanpa nama/alamat. Cookie berlaku 24 jam; masa pembayaran/Snap satu jam. Hanya transaksi terakhir pada browser tersebut yang ditampilkan.
- Ketika halaman status menerima konfirmasi `paid` dari server, jumlah menu yang dibayar dikurangi dari keranjang. Menu lain dan tambahan jumlah tetap tersimpan. ID transaksi yang sudah diterapkan disimpan di browser agar refresh tidak menghapus item lagi. Pembayaran pending, gagal, atau kedaluwarsa tidak mengubah keranjang. Untuk sesi lama tanpa rincian menu, keranjang hanya dikosongkan bila subtotalnya sama persis dengan transaksi yang berhasil.
- Tombol checkout dicegah mengirim ganda selama permintaan berlangsung. Memulai uji baru setelahnya membuat transaksi baru.
- Tidak ada database pesanan atau webhook. Status ditarik server langsung dari Midtrans saat halaman status dibuka/diperbarui. Ini belum menjadi fondasi penerimaan pesanan produksi.
- Kunci yang kosong atau bukan sandbox ditolak dengan pesan konfigurasi; tidak ada transaksi berhasil palsu sebagai pengganti.

## Pemeriksaan

```powershell
cd package
npm run typecheck
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:3000'
npm run test:e2e -- tests/payment-server.spec.ts --project=desktop
npm run test:e2e -- tests/payment-ui.spec.ts
```

Pengujian otomatis memakai respons Midtrans yang dimock: validasi harga/jumlah/tanggal, signature dan expiry cookie, endpoint sandbox, kegagalan upstream, penolakan redirect produksi, pemeriksaan status/nominal/ID, serta tampilan dan alur redirect checkout. Pengujian transaksi nyata ke sandbox memerlukan key akun sendiri dan simulator Midtrans.

Referensi: [Snap integration](https://docs.midtrans.com/docs/snap-snap-integration-guide), [parameter Snap](https://docs.midtrans.com/reference/request-body-json-parameter), [status API](https://docs.midtrans.com/reference/get-transaction-status).
