"use client";
import RegistrationDocumentDetails from "@/cms/RegistrationDocumentDetails";
import PaymentProofDetails from "@/cms/PaymentProofDetails";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPut, apiRequest } from "@/lib/api";
import ContactApplicantButton from "@/components/common/ContactApplicantButton";
import ExportApplicantsButton from "@/components/common/ExportApplicantsButton";
import ApplicantDetailButton from "@/components/common/ApplicantDetailButton";
import RowActions from "@/components/common/RowActions";
import { getStoredUser } from "@/lib/auth";
import { CloseIcon, TrashBinIcon } from "@/icons";
import { useToast } from "@/context/ToastContext";
import { Applicant, ApplicantDetail, Settings, dateTime, dateOnly, statuses, payments } from "./types";

type Result = { items: Applicant[]; total: number; years: string[] };
export default function Applicants() {
  const [data, setData] = useState<Result>({ items: [], total: 0, years: [] });
  const [year, setYear] = useState(""); const [wave, setWave] = useState(""); const [status, setStatus] = useState(""); const [payment, setPayment] = useState("");
  const [search, setSearch] = useState(""); const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1); const [limit, setLimit] = useState(10);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [detail, setDetail] = useState<ApplicantDetail | null>(null); const [newStatus, setNewStatus] = useState(""); const [newPayment, setNewPayment] = useState("");
  const [detailError, setDetailError] = useState(""); const [saving, setSaving] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null); const toast = useToast();
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<Applicant | null>(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deleteInFlight = useRef(false);
  const [deleteError, setDeleteError] = useState("");
  const [canDelete, setCanDelete] = useState(false);
  useEffect(() => { setCanDelete(["ADMIN", "SUPERVISOR", "OPERATOR"].includes(getStoredUser()?.role || "")); }, []);
  useEffect(() => { const timer = setTimeout(() => { setKeyword(search); setPage(1); }, 250); return () => clearTimeout(timer); }, [search]);
  const load = useCallback(async (signal?: AbortSignal) => { setLoading(true); setError(""); try {
    const query = new URLSearchParams({ year, wave, status, payment, search: keyword, page: String(page), limit: String(limit) });
    const result = await apiRequest<Result>(`/api/spmb/applications?${query}`, { signal });
    if (!signal?.aborted) setData(result);
  } catch (e) { if (!signal?.aborted) setError(e instanceof Error ? e.message : "Gagal memuat pendaftar."); } finally { if (!signal?.aborted) setLoading(false); } }, [year, wave, status, payment, keyword, page, limit]);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  useEffect(() => { apiGet<Settings>("/api/spmb/settings").then(setSettings).catch(() => {}); }, []);
  async function open(id: number) {
    try { const value = await apiGet<ApplicantDetail>(`/api/spmb/applications/${id}`); setDetail(value); setNewStatus(value.status); setNewPayment(value.paymentStatus); setDetailError(""); dialog.current?.showModal(); }
    catch (e) { toast.error({ message: e instanceof Error ? e.message : "Gagal memuat detail." }); }
  }
  async function saveStatus() {
    if (!detail) return; setSaving(true); setDetailError("");
    try { const value = await apiPut<{ status: string; paymentStatus: string; version: number }>(`/api/spmb/applications/${detail.id}/status`, { status: newStatus, paymentStatus: newPayment, version: detail.version }); setDetail({ ...detail, ...value }); toast.success({ message: "Status pendaftar disimpan." }); await load(); }
    catch (e) { setDetailError(e instanceof Error ? e.message : "Gagal menyimpan status."); }
    finally { setSaving(false); }
  }
  function confirmDelete(row: Applicant) {
    setDeleteTarget(row); setDeleteConfirmed(false); setDeleteError("");
    deleteDialog.current?.showModal();
  }
  async function remove() {
    if (!deleteTarget || !deleteConfirmed || !canDelete || deleteInFlight.current) return;
    deleteInFlight.current = true; setDeleting(true); setDeleteError("");
    try {
      await apiRequest(`/api/spmb/applications/${deleteTarget.id}`, { method: "DELETE", body: JSON.stringify({ confirmed: true, version: deleteTarget.version }) });
      deleteDialog.current?.close();
      toast.success({ message: "Pendaftar SPMB berhasil dihapus." });
      if (page > 1 && data.items.length === 1) setPage(page - 1);
      else await load();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Gagal menghapus pendaftar.");
      setDeleteConfirmed(false);
    } finally { deleteInFlight.current = false; setDeleting(false); }
  }
  const years = [...new Set([settings?.academicYear, ...data.years].filter(Boolean))] as string[];
  const pages = Math.max(1, Math.ceil(data.total / limit));
  return <div className="cms-page"><div className="cms-page-heading"><div><p className="cms-eyebrow">PENERIMAAN MURID BARU</p><h1>Pendaftar SPMB</h1><p>Data dari formulir website, otomatis dikelompokkan berdasarkan tanggal submit dalam WIB.</p></div><div className="cms-applicant-actions"><a className="cms-button-secondary" href="/spmb/gelombang">Pengaturan gelombang</a><ExportApplicantsButton module="spmb" filters={{ year, wave, status, payment, search: keyword }} /></div></div><div className="cms-stat-strip"><span><strong>{data.total}</strong> Pendaftar sesuai filter</span>{settings?.activeWave && <span><i className="cms-dot" /> Gelombang {settings.activeWave} terbuka</span>}</div>
    <section className="cms-panel"><div className="cms-toolbar spmb-applicant-toolbar"><label className="cms-page-size">Tampilkan <select aria-label="Jumlah baris" value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}><option>10</option><option>25</option><option>50</option></select> baris</label><div className="cms-toolbar-end"><select aria-label="Filter tahun ajaran" value={year} onChange={e => { setYear(e.target.value); setPage(1); }}><option value="">Semua tahun</option>{years.map(y => <option key={y}>{y}</option>)}</select><select aria-label="Filter gelombang" value={wave} onChange={e => { setWave(e.target.value); setPage(1); }}><option value="">Semua gelombang</option>{[1,2,3,4].map(n => <option key={n} value={n}>Gelombang {n}</option>)}</select><select aria-label="Filter status pendaftaran" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">Semua status</option>{statuses.map(s => <option key={s}>{s}</option>)}</select><select aria-label="Filter pembayaran" value={payment} onChange={e => { setPayment(e.target.value); setPage(1); }}><option value="">Semua pembayaran</option>{payments.map(s => <option key={s}>{s}</option>)}</select><label className="cms-search">Cari<input aria-label="Cari pendaftar" value={search} onChange={e => setSearch(e.target.value)} placeholder="Nama, NISN, atau nomor daftar" /></label></div></div>
    {loading ? <TableSkeleton headers={["Nomor pendaftaran", "Calon siswa", "Gelombang", "Kelas", "Waktu submit (WIB)", "Status", "Pembayaran", "Aksi"]} label="Memuat pendaftar" className="spmb-applicants-table" /> : error ? <div className="cms-empty" role="alert">{error}<br /><button className="cms-button-secondary" onClick={() => void load()}>Coba lagi</button></div> : !data.items.length ? <div className="cms-empty"><h2>Belum ada pendaftar</h2><p>Data akan tampil setelah formulir website berhasil disubmit pada jadwal yang aktif.</p></div> : <div className="cms-table-wrap"><table className="cms-table spmb-applicants-table"><thead><tr><th>Nomor pendaftaran</th><th>Calon siswa</th><th>Gelombang</th><th>Kelas</th><th>Waktu submit (WIB)</th><th>Status</th><th>Pembayaran</th><th>Aksi</th></tr></thead><tbody>{data.items.map(entry => <tr key={entry.id}><td>{entry.registrationNumber}<small className="spmb-row-subtitle">{entry.academicYear}</small></td><td><button className="cms-title-link" onClick={() => void open(entry.id)}>{entry.studentName}</button><small className="spmb-row-subtitle">{entry.previousSchool}</small></td><td>Gelombang {entry.waveNumber}</td><td>{entry.targetGrade}</td><td>{dateTime(entry.submittedAt)}</td><td><span className={`cms-badge ${entry.status === "Diterima" ? "published" : "navy"}`}>{entry.status}</span></td><td><span className={`cms-badge ${entry.paymentStatus === "Lunas" ? "published" : "navy"}`}>{entry.paymentStatus}</span></td><td><div className="flex items-center justify-center gap-2"><ApplicantDetailButton studentName={entry.studentName} onClick={() => void open(entry.id)} />{canDelete && <RowActions onDelete={() => confirmDelete(entry)} deleteDisabled={deleting} deleteLabel={`Hapus pendaftar ${entry.studentName}`} />}</div></td></tr>)}</tbody></table></div>}
    <div className="cms-table-footer"><span>Menampilkan {data.total ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, data.total)} dari {data.total} pendaftar</span><nav className="cms-pagination" aria-label="Navigasi pendaftar"><button aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => setPage(page - 1)}>Sebelumnya</button><span>{page} / {pages}</span><button aria-label="Halaman berikutnya" disabled={page >= pages} onClick={() => setPage(page + 1)}>Berikutnya</button></nav></div></section>
    <dialog ref={dialog} className="cms-dialog" onCancel={e => { if (saving) e.preventDefault(); }}><header><div><p className="cms-eyebrow">PENDAFTAR SPMB</p><h2>Detail pendaftaran</h2></div><button className="cms-close" aria-label="Tutup detail" disabled={saving} onClick={() => dialog.current?.close()}><CloseIcon aria-hidden="true" /></button></header>{detail && <div className="cms-form-body"><div className="spmb-detail-banner"><strong>{detail.registrationNumber}</strong><p>{detail.academicYear} · Gelombang {detail.waveNumber}</p><small>{dateOnly(detail.waveStartDate)} — {dateOnly(detail.waveEndDate)}</small></div><dl className="spmb-detail-grid">{[["Nama calon siswa", detail.studentName], ["NISN", detail.nisn || "Tidak diisi"], ["Tempat, tanggal lahir", `${detail.birthPlace}, ${dateOnly(detail.birthDate)}`], ["Jenis kelamin", detail.gender], ["Asal sekolah", detail.previousSchool], ["Kelas tujuan", detail.targetGrade], ["Nama wali", detail.guardianName || "Tidak diisi"], ["WhatsApp", detail.guardianPhone], ["Email", detail.guardianEmail || "Tidak diisi"], ["Waktu submit (WIB)", dateTime(detail.submittedAt)], ["Alamat", detail.address]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{detail.profile && <section><h3 className="mb-4 font-semibold">Data tambahan calon murid</h3><dl className="spmb-detail-grid">{[
 ["Nama panggilan", detail.profile.nickname], ["Agama", detail.profile.religion], ["Riwayat penyakit", detail.profile.medicalHistory || "Tidak diisi"], ["Tinggi badan", `${detail.profile.heightCm} cm`], ["Berat badan", `${detail.profile.weightKg} kg`], ["Golongan darah", detail.profile.bloodGroup],
 ["No. HP ayah/ibu", detail.profile.parentPhone], ["Nama ayah", detail.profile.fatherName], ["Nama ibu", detail.profile.motherName], ["Pekerjaan ayah", detail.profile.fatherOccupation], ["Pekerjaan ibu", detail.profile.motherOccupation], ["Pekerjaan wali", detail.profile.guardianOccupation || "Tidak diisi"], ["Alamat orang tua/wali", detail.profile.parentAddress], ["Keadaan ekonomi", detail.profile.economicCondition], ["Bahasa sehari-hari", detail.profile.dailyLanguage || "Tidak diisi"]
].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>}{detail.hasDocument && <RegistrationDocumentDetails key={`document-${detail.id}`} endpoint={`/api/spmb/applications/${detail.id}/document`} registrationNumber={detail.registrationNumber} hasDocument={detail.hasDocument} />}<PaymentProofDetails key={detail.id} endpoint={`/api/spmb/applications/${detail.id}/payment-proof`} registrationNumber={detail.registrationNumber} accountHolderName={detail.transferAccountName} hasPaymentProof={detail.hasPaymentProof} />{detailError && <p className="cms-error" role="alert">{detailError}</p>}<div className="grid gap-5 sm:grid-cols-2"><label>Status pendaftaran<select aria-label="Status pendaftaran" value={newStatus} onChange={e => setNewStatus(e.target.value)}>{statuses.map(s => <option key={s}>{s}</option>)}</select></label><label>Status pembayaran<select aria-label="Status pembayaran" value={newPayment} onChange={e => setNewPayment(e.target.value)}>{payments.map(s => <option key={s}>{s}</option>)}</select></label></div></div>}<footer>{detail && <ContactApplicantButton phone={detail.guardianPhone} />}<button className="cms-button-secondary" disabled={saving} onClick={() => dialog.current?.close()}>Tutup</button><button className="cms-button" disabled={saving || (newStatus === detail?.status && newPayment === detail?.paymentStatus)} onClick={() => void saveStatus()}>{saving ? "Menyimpan…" : "Simpan status"}</button></footer></dialog>
    <dialog ref={deleteDialog} className="cms-dialog applicant-delete-dialog" aria-labelledby="spmb-delete-title" aria-describedby="spmb-delete-description" onCancel={event => { if (deleteInFlight.current) event.preventDefault(); }} onClose={() => { setDeleteTarget(null); setDeleteConfirmed(false); setDeleteError(""); }}>
      <form onSubmit={event => { event.preventDefault(); void remove(); }}>
        <header><h2 id="spmb-delete-title">Hapus pendaftar SPMB</h2><button type="button" aria-label="Tutup konfirmasi hapus" className="cms-close" disabled={deleting} onClick={() => deleteDialog.current?.close()}><CloseIcon aria-hidden="true" /></button></header>
        <div className="cms-form-body">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10"><TrashBinIcon aria-hidden="true" className="size-6" /></div>
          <p id="spmb-delete-description" className="break-words text-base leading-7">Apakah Anda yakin akan menghapus pendaftar dengan nama <strong>{deleteTarget?.studentName}</strong>?</p>
          <p className="mt-2 text-sm text-slate-500">Nomor pendaftaran: <strong>{deleteTarget?.registrationNumber}</strong></p>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Data pendaftaran, profil keluarga, berkas, dan bukti pembayaran akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.</p>
          <label className="applicant-delete-confirm"><input type="checkbox" checked={deleteConfirmed} disabled={deleting} onChange={event => setDeleteConfirmed(event.target.checked)} /><span>Saya sudah membaca dan yakin ingin menghapus pendaftar ini.</span></label>
          {deleteError && <p role="alert" className="cms-error mt-4">{deleteError}</p>}
        </div>
        <footer><button type="button" className="cms-button-secondary" disabled={deleting} onClick={() => deleteDialog.current?.close()}>Batal</button><button type="submit" disabled={!deleteConfirmed || deleting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"><TrashBinIcon aria-hidden="true" className="size-4" />{deleting ? "Menghapus..." : "Hapus"}</button></footer>
      </form>
    </dialog>
  </div>;
}
