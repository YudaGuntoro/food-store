"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Icon from "@/components/icon";
import DatePicker from "@/components/date-picker";
import { feedbackEmailDraft, feedbackEmailIsExample } from "@/lib/feedback-contact";
import styles from "./feedback.module.css";

export default function FeedbackForm() {
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const review = useRef<HTMLDivElement>(null);
  const formTitle = useRef<HTMLHeadingElement>(null);

  useEffect(() => { if (summary) review.current?.focus(); }, [summary]);

  function prepareFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (key: string) => String(data.get(key) || "").trim();
    if (field("name").length < 2 || field("message").length < 10) {
      setError("Isi nama minimal 2 karakter dan ceritakan masukanmu minimal 10 karakter.");
      return;
    }
    setError("");
    const date = field("date") ? field("date").split("-").reverse().join("/") : "-";
    setSummary(`Halo FoodStore, saya ingin menyampaikan ${field("type").toLowerCase()}.\n\nNama: ${field("name")}\nNomor pesanan: ${field("order") || "-"}\nTanggal pesanan: ${date}\n\nPesan:\n${field("message")}\n\nHarapan / usulan:\n${field("expectation") || "-"}\n\nTerima kasih.`);
  }

  return (
    <div className={styles.card}>
      <form className={styles.form} onSubmit={prepareFeedback} hidden={Boolean(summary)}>
        <div className={styles.formHeading}><h2 ref={formTitle} tabIndex={-1}>Saran & keluhan</h2><p>Kolom bertanda * wajib diisi.</p></div>
        <div className={styles.fields}>
          <label>Nama lengkap *<input name="name" autoComplete="name" placeholder="Nama kamu" required minLength={2} maxLength={100} /></label>
          <label>Jenis pesan *<select name="type" required defaultValue=""><option value="" disabled>Pilih jenis pesan</option><option>Saran</option><option>Keluhan</option><option>Apresiasi</option><option>Pertanyaan</option></select></label>
          <label>Nomor pesanan <span>(opsional)</span><input name="order" placeholder="Contoh: FS-00123" maxLength={80} /></label>
          <DatePicker id="feedback-date" name="date" label="Tanggal pesanan" optional />
        </div>
        <label>Ceritakan kepada kami *<textarea name="message" placeholder="Apa yang ingin kamu sampaikan? Untuk keluhan, tuliskan detail pesanan dan kendalanya." rows={5} required minLength={10} maxLength={3000} /></label>
        <label>Harapan atau usulanmu <span>(opsional)</span><textarea name="expectation" placeholder="Bagaimana kami bisa membantu?" rows={3} maxLength={1500} /></label>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <p className={styles.deliveryNote}>Periksa pesanmu terlebih dahulu, lalu pilih WhatsApp atau email untuk mengirimnya ke tim FoodStore.</p>
        <button className={styles.primary} type="submit">Tinjau pesan <Icon name="arrow" size={18} /></button>
      </form>
      {summary && (
        <div className={styles.review} ref={review} tabIndex={-1} aria-labelledby="review-title">
          <span className={styles.reviewIcon}><Icon name="chat" size={26} /></span>
          <h2 id="review-title">Periksa pesanmu</h2>
          <p>Pesan belum terkirim. Pastikan isinya sudah sesuai, lalu pilih WhatsApp atau email.</p>
          <pre>{summary}</pre>
          <a className={styles.primary} href={`https://wa.me/6285157742849?text=${encodeURIComponent(summary)}`} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={20} /> Lanjutkan ke WhatsApp</a>
          <a className={styles.emailAction} href={feedbackEmailDraft(summary)}><Icon name="mail" size={19} /> Lanjutkan ke email</a>
          {feedbackEmailIsExample && <p className={styles.emailExample}>Alamat email masih contoh untuk pratinjau.</p>}
          <button className={styles.edit} type="button" onClick={() => { setSummary(""); requestAnimationFrame(() => formTitle.current?.focus()); }}>Ubah pesan</button>
        </div>
      )}
    </div>
  );
}
