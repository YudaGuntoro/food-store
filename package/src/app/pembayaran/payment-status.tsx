"use client";

import Link from "next/link";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { PaymentCartContext } from "@/components/payment-cart-context";
import Icon from "@/components/icon";
import { rupiah } from "@/lib/catalog";

type State = "pending" | "paid" | "failed" | "expired" | "refunded" | "review";
type Result = { orderId: string; total: number; state: State; redirectUrl?: string; items?: { id: string; quantity: number }[] };
const messages: Record<State, { title: string; text: string }> = {
  pending: { title: "Menunggu pembayaran", text: "Pilih QRIS atau virtual account di Midtrans, lalu selesaikan uji pembayaran melalui simulator yang sesuai." },
  paid: { title: "Simulasi pembayaran berhasil!", text: "Midtrans telah mengonfirmasi pembayaran sandbox. Tidak ada uang asli yang dibayarkan dan belum ada pesanan catering yang diproses." },
  failed: { title: "Pembayaran tidak berhasil", text: "Transaksi ditolak atau dibatalkan. Kamu bisa kembali ke keranjang untuk memulai uji pembayaran baru." },
  expired: { title: "Pembayaran kedaluwarsa", text: "Waktu pembayaran sudah habis. Mulai uji pembayaran baru melalui keranjang." },
  refunded: { title: "Pengembalian dana tercatat", text: "Midtrans mencatat pengembalian dana atau penyesuaian pada transaksi percobaan ini." },
  review: { title: "Pembayaran sedang ditinjau", text: "Hasil pembayaran belum dapat dinyatakan berhasil. Periksa kembali statusnya sebentar lagi." },
};

export default function PaymentStatus() {
  const confirmPaidCart = useContext(PaymentCartContext);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [copied, setCopied] = useState(false);
  const inFlight = useRef(false);
  const check = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    try {
      const response = await fetch("/api/payments/sandbox/status", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Status belum dapat diperiksa.");
      if (!messages[data.state as State]) throw new Error("Status pembayaran tidak dikenal.");
      setResult(data);
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Status belum dapat diperiksa."); }
    finally { setBusy(false); inFlight.current = false; }
  }, []);
  useEffect(() => { void check(); }, [check]);
  useEffect(() => {
    if (result?.state === "paid" && !error) confirmPaidCart?.(result);
  }, [result, error, confirmPaidCart]);
  useEffect(() => {
    if (!result || !["pending", "review"].includes(result.state)) return;
    const timer = window.setInterval(() => { if (!document.hidden) void check(); }, 10000);
    return () => window.clearInterval(timer);
  }, [result, check]);
  const message = result ? messages[result.state] : null;
  const redirect = result?.redirectUrl?.startsWith("https://app.sandbox.midtrans.com/snap/") ? result.redirectUrl : null;
  const isPaid = result?.state === "paid" && !error;
  const isFailed = !!error || result?.state === "failed" || result?.state === "expired";
  const stateLabel = error ? "Perlu diperiksa" : result ? ({ paid: "Berhasil", pending: "Menunggu pembayaran", failed: "Tidak berhasil", expired: "Kedaluwarsa", refunded: "Pengembalian dana", review: "Dalam peninjauan" }[result.state]) : "Memeriksa";
  async function copyId() {
    if (!result) return;
    try { await navigator.clipboard.writeText(result.orderId); setCopied(true); }
    catch { setCopied(false); }
  }
  return <section className="payment-status-section">
    <div className="payment-page-heading"><Link href="/#menu"><Icon name="chevron" size={15} /> Kembali ke toko</Link><span>Status pembayaran</span></div>
    <div className={`payment-status-layout ${isPaid ? "payment-paid" : isFailed ? "payment-failed" : ""}`}>
      <div className="payment-result">
        <div className="payment-status-icon"><Icon name={isPaid ? "check" : isFailed ? "close" : "clock"} size={34} /></div>
        <span className="payment-result-label">{isPaid ? "PEMBAYARAN TERKONFIRMASI" : "PEMBAYARAN FOODSTORE"}</span>
        <div aria-live="polite"><h1>{error ? "Status belum dapat dipastikan" : message?.title || "Memeriksa pembayaran..."}</h1><p>{error || (isPaid ? "Terima kasih. Transaksi uji cobamu sudah dikonfirmasi oleh Midtrans. Seluruh rinciannya bisa kamu lihat di ringkasan pembayaran." : message?.text)}</p></div>
        {result?.state === "pending" && !error && <div className="payment-instructions"><strong>Langkah berikutnya</strong><ol><li>Pilih QRIS atau virtual account di halaman Midtrans.</li><li>Untuk QRIS, salin URL gambar QR ke simulator QRIS. Untuk virtual account, gunakan simulator bank yang dipilih.</li><li>Kembali ke sini, lalu periksa statusnya.</li></ol><a href="https://docs.midtrans.com/docs/testing-payment-on-sandbox" target="_blank" rel="noopener noreferrer">Buka panduan simulator <Icon name="arrow" size={15} /></a></div>}
        <div className="payment-help"><Icon name="whatsapp" size={20} /><div><strong>Butuh bantuan?</strong><p>Tim FoodStore siap membantu pertanyaanmu.</p><a href="https://wa.me/6285157742849?text=Halo%20FoodStore%2C%20saya%20ingin%20bertanya%20tentang%20pembayaran." target="_blank" rel="noopener noreferrer">Hubungi kami <Icon name="arrow" size={14} /></a></div></div>
      </div>
      <div className="payment-summary">
        <div className="payment-summary-heading"><h2>Ringkasan pembayaran</h2><span className="payment-mode">Sandbox</span></div>
        {result ? <>
          <div className="payment-amount"><span>Total pembayaran uji coba</span><strong>{rupiah(result.total)}</strong><span className="payment-state-pill"><span />{stateLabel}</span></div>
          <dl className="payment-details"><div><dt>Penyedia pembayaran</dt><dd>Midtrans</dd></div><div><dt>Lingkungan transaksi</dt><dd>Sandbox</dd></div><div className="payment-reference"><dt>Nomor transaksi</dt><dd><span>{result.orderId}</span><button type="button" onClick={() => void copyId()} aria-label="Salin nomor transaksi">{copied ? "Tersalin" : "Salin"}</button></dd></div></dl>
        </> : <p className="payment-summary-empty">Rincian akan muncul setelah transaksi berhasil ditemukan.</p>}
        <div className="payment-status-actions">{redirect && !error ? <a className="button primary" href={redirect}>Lanjutkan pembayaran <Icon name="arrow" size={17} /></a> : <Link href="/#menu" className="button primary">Kembali ke menu <Icon name="arrow" size={17} /></Link>}<button className="payment-refresh" disabled={busy} onClick={() => void check()}>{busy ? "Memeriksa..." : "Periksa status"}</button></div>
        <div className="payment-sandbox-note"><Icon name="bowl" size={18} /><p>Ini adalah transaksi simulasi. Tidak ada uang asli yang dibayarkan atau pesanan catering yang diproses.</p></div>
      </div>
    </div>
  </section>;
}
