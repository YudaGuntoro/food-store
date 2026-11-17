"use client";
import { useState } from "react";

export default function AcceptanceLetterUpload({ applicantId, hasLetter, disabled, onChange }: {
  applicantId: number; hasLetter: boolean; disabled: boolean; onChange: (file: File | null) => void;
}) {
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  async function download() {
    setDownloading(true); setError("");
    try {
      const response = await fetch(`/api/spmb/applications/${applicantId}/acceptance-letter`, { cache: "no-store", credentials: "same-origin" });
      if (!response.ok) throw new Error("Surat tidak dapat diunduh. Silakan coba kembali.");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a"); link.href = url; link.download = "surat-diterima.pdf"; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal mengunduh surat."); }
    finally { setDownloading(false); }
  }
  return <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
    <label className="block">Upload surat diterima {!hasLetter && <span className="text-red-600">*</span>}
      <input type="file" accept="application/pdf,.pdf" disabled={disabled} required={!hasLetter} className="mt-2 block w-full text-sm" onChange={event => {
        const file = event.target.files?.[0] || null; setError(""); onChange(null);
        if (file && (!/\.pdf$/i.test(file.name) || file.size < 8 || file.size > 1048576)) { setError("Pilih PDF yang valid, maksimal 1 MB."); event.target.value = ""; return; }
        onChange(file);
      }} />
    </label>
    <p className="mt-2 text-xs leading-5 text-slate-500">{hasLetter ? "Surat sudah tersimpan. Unggah PDF baru jika ingin menggantinya." : "Wajib PDF, maksimal 1 MB. Status Diterima dapat disimpan setelah surat dipilih."}</p>
    {hasLetter && <button type="button" className="cms-button-secondary mt-3" disabled={disabled || downloading} onClick={() => void download()}>{downloading ? "Mengunduh..." : "Unduh surat tersimpan"}</button>}
    {error && <p role="alert" className="cms-error mt-2">{error}</p>}
  </section>;
}
