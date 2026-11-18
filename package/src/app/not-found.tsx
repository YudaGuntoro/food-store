import Link from "next/link";
export default function NotFound() {
  return (
    <main className="error-page">
      <span className="eyebrow">FOODSTORE · 404</span>
      <h1>Menu halaman ini belum tersedia.</h1>
      <p>Kembali ke beranda untuk menemukan hidangan pilihanmu.</p>
      <Link href="/" className="button primary">
        Kembali ke beranda
      </Link>
    </main>
  );
}
