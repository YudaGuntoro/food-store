# SEO website Cendekia

Origin canonical default: `https://smpitcendekiapwk.sch.id`. Override melalui environment server `SCHOOL_SITE_URL` hanya jika domain resmi berubah. Nilainya origin HTTPS tanpa path, query, fragment atau kredensial. Header Host dari pengunjung tidak digunakan untuk canonical. HTTP localhost diizinkan untuk pemeriksaan lokal.

- `/sitemap.xml` dinamis: halaman informasi publik dan slug berita/ekstrakurikuler yang sudah terbit dari API. Konten terhapus/draf tidak dikembalikan oleh API publik, sehingga tidak muncul pada permintaan sitemap berikutnya. Tanggal `lastmod` tidak dikarang jika API tidak menyediakan tanggal perubahan.
- `/robots.txt` menyertakan sitemap dan membatasi crawling API; endpoint gambar publik tetap diizinkan. Aset Next.js tetap dapat diakses crawler. Robots.txt bukan mekanisme otorisasi.
- Semua halaman informasi memiliki canonical, judul/deskripsi, Open Graph dan Twitter metadata tersendiri. Detail berita/ekskul memakai judul, ringkasan dan foto konten. Halaman 404 tidak mewarisi canonical beranda. `/ppdb` tetap redirect permanen ke `/spmb`.
- Formulir dan cek status SPMB/LMP memakai noindex serta dikeluarkan dari sitemap. Halaman tersebut tetap crawlable agar crawler dapat membaca noindex. Tidak ada data pendaftar dalam sitemap atau metadata.
- JSON-LD `School` dan `WebSite` mengambil alamat, nomor kontak, email dan akun sosial dari pengaturan kontak CMS. Kolom kosong dihilangkan; tidak mengarang koordinat, ulasan atau rating. Serialisasi mengamankan karakter `<` agar nilai dari CMS tidak dapat menutup elemen script.
- `/og` menghasilkan gambar brand PNG 1200×630 untuk preview berbagi, tanpa layanan gambar eksternal. Foto konten menggantikan gambar default pada halaman detail bila tersedia.

Deploy ulang website (`package`). Tidak ada perubahan API/skema database. Environment lokal dan credential tetap di luar Git. Setelah deploy, periksa `https://smpitcendekiapwk.sch.id/robots.txt`, `/sitemap.xml`, dan `/og`. Verifikasi domain di Google Search Console melalui DNS lalu kirim `/sitemap.xml`; langkah akun/DNS ini tidak dijalankan oleh perubahan kode. Hasil indeks dan tampilan preview dapat memerlukan crawling ulang/cache refresh.

Verifikasi lokal: jalankan website dan API, lalu dari `package` jalankan `node scripts/check-seo.mjs`. Tes bersifat read-only dan memeriksa HTML server dengan user-agent crawler tanpa mengeksekusi JavaScript: metadata SSR, sitemap/konten dinamis, noindex, structured data, sanitasi script, redirect dan ukuran gambar. Build: `npm run build`.
