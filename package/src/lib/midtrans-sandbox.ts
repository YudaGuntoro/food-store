// Server-only: imported by payment route handlers, never by client components.
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { products } from "./catalog";

export class PaymentError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export const sessionCookie = "foodstore-sandbox-payment";
export const sessionLifetime = 60 * 60 * 24;
export function sandboxKey() {
  const key = process.env.MIDTRANS_SERVER_KEY?.trim();
  if (!key || !key.startsWith("SB-Mid-server-"))
    throw new PaymentError("Midtrans Sandbox belum dikonfigurasi. Isi MIDTRANS_SERVER_KEY sandbox di .env.local, lalu restart server.", 503);
  return key;
}
function text(value: unknown, name: string, max: number, optional = false) {
  if (optional && (value === undefined || value === "")) return "";
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    throw new PaymentError(`${name} belum lengkap atau terlalu panjang.`);
  return value.trim();
}
export function buildPayment(input: unknown, now = new Date()) {
  if (!input || typeof input !== "object") throw new PaymentError("Data pembayaran tidak valid.");
  const data = input as Record<string, unknown>;
  if (!Array.isArray(data.items) || !data.items.length || data.items.length > products.length)
    throw new PaymentError("Isi keranjang tidak valid.");
  const seen = new Set<string>();
  const items = data.items.map((raw: unknown) => {
    if (!raw || typeof raw !== "object") throw new PaymentError("Menu tidak valid.");
    const item = raw as Record<string, unknown>;
    const product = products.find(p => p.id === item.id);
    if (!product || seen.has(product.id) || !Number.isInteger(item.quantity) || Number(item.quantity) < 1 || Number(item.quantity) > 999)
      throw new PaymentError("Menu atau jumlah pesanan tidak valid.");
    seen.add(product.id);
    return { id: product.id, name: product.name.slice(0, 50), price: product.price, quantity: Number(item.quantity) };
  });
  const name = text(data.name, "Nama", 100);
  const address = text(data.address, "Alamat", 500);
  const date = text(data.date, "Tanggal", 10);
  const notes = text(data.notes, "Catatan", 1000, true);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date < today)
    throw new PaymentError("Tanggal acara harus valid dan tidak boleh sudah lewat.");
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (total > 100_000_000) throw new PaymentError("Total uji pembayaran maksimal Rp100.000.000.");
  return { items, total, name, address, date, notes };
}
export type PaymentSession = { orderId: string; total: number; redirectUrl: string; expires: number; items?: { id: string; quantity: number }[] };
export function signSession(session: PaymentSession, key: string) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${createHmac("sha256", key).update(payload).digest("base64url")}`;
}
export function readSession(value: string | undefined, key: string): PaymentSession {
  try {
    if (!value || value.length > 3000) throw new Error();
    const [payload, signature, extra] = value.split(".");
    if (!payload || !signature || extra) throw new Error();
    const expected = createHmac("sha256", key).update(payload).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error();
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as PaymentSession;
    if (!/^FS-SB-[a-f0-9-]{36}$/.test(session.orderId) || !Number.isSafeInteger(session.total) || session.total <= 0 || !Number.isFinite(session.expires) || session.expires <= Date.now()) throw new Error();
    validateRedirect(session.redirectUrl);
    return session;
  } catch { throw new PaymentError("Sesi pembayaran tidak ditemukan atau sudah kedaluwarsa. Gunakan browser yang sama saat memulai pembayaran.", 401); }
}
export function validateRedirect(value: unknown): string {
  if (typeof value !== "string") throw new PaymentError("Tautan pembayaran tidak valid.", 502);
  const url = new URL(value);
  if (url.origin !== "https://app.sandbox.midtrans.com" || !url.pathname.startsWith("/snap/") || url.username || url.password)
    throw new PaymentError("Tautan pembayaran sandbox tidak valid.", 502);
  return url.href;
}
async function midtransRequest(url: string, key: string, body?: unknown) {
  let response: Response;
  try {
    response = await fetch(url, { method: body ? "POST" : "GET", headers: { Authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}`, "Content-Type": "application/json", Accept: "application/json" }, body: body ? JSON.stringify(body) : undefined, cache: "no-store", signal: AbortSignal.timeout(15000) });
  } catch { throw new PaymentError("Midtrans belum dapat dihubungi. Coba lagi sebentar.", 502); }
  const result = await response.json().catch(() => null);
  if (!response.ok && response.status !== 404) throw new PaymentError("Midtrans menolak permintaan. Periksa konfigurasi sandbox atau coba lagi.", 502);
  if (!result || typeof result !== "object") throw new PaymentError("Respons Midtrans tidak valid.", 502);
  return { result, status: response.status };
}
export async function createPayment(input: unknown, origin: string, key: string): Promise<PaymentSession> {
  const order = buildPayment(input);
  const orderId = `FS-SB-${randomUUID()}`;
  const { result, status } = await midtransRequest("https://app.sandbox.midtrans.com/snap/v1/transactions", key, {
    transaction_details: { order_id: orderId, gross_amount: order.total },
    item_details: order.items,
    customer_details: { first_name: order.name, shipping_address: { first_name: order.name, address: order.address, country_code: "IDN" } },
    custom_field1: order.date,
    // Explicit other_qris keeps the generic QRIS choice visible on desktop and mobile.
    enabled_payments: ["other_qris", "bca_va", "bni_va", "bri_va", "permata_va", "echannel"],
    callbacks: { finish: `${origin}/pembayaran` },
    expiry: { unit: "hours", duration: 1 },
    page_expiry: { unit: "hours", duration: 1 },
  });
  if (status >= 400) throw new PaymentError("Transaksi sandbox belum berhasil dibuat.", 502);
  return { orderId, total: order.total, items: order.items.map(({ id, quantity }) => ({ id, quantity })), redirectUrl: validateRedirect(result.redirect_url), expires: Date.now() + sessionLifetime * 1000 };
}
export type PaymentState = "pending" | "paid" | "failed" | "expired" | "refunded" | "review";
export function verifiedState(result: Record<string, unknown>, session: PaymentSession): PaymentState {
  if (result.order_id !== session.orderId || Number(result.gross_amount) !== session.total)
    throw new PaymentError("Rincian pembayaran tidak cocok. Status belum dapat dikonfirmasi.", 502);
  const status = result.transaction_status;
  if (result.fraud_status === "deny") return "failed";
  if (result.fraud_status === "challenge") return "review";
  if (status === "settlement" || (status === "capture" && result.fraud_status === "accept")) return "paid";
  if (status === "deny" || status === "cancel" || status === "failure") return "failed";
  if (status === "expire") return "expired";
  if (["refund", "partial_refund", "chargeback", "partial_chargeback"].includes(String(status))) return "refunded";
  return status === "pending" ? "pending" : "review";
}
export async function paymentStatus(session: PaymentSession, key: string) {
  const { result, status } = await midtransRequest(`https://api.sandbox.midtrans.com/v2/${session.orderId}/status`, key);
  // Snap has no Core API transaction until the buyer chooses a payment method.
  if (status === 404 || result.status_code === "404") return "pending" as const;
  return verifiedState(result, session);
}
