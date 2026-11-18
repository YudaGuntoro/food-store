import { test, expect } from "@playwright/test";
import { NextRequest } from "next/server";
import { buildPayment, createPayment, readSession, signSession, verifiedState, sandboxKey, paymentStatus, sessionCookie, type PaymentSession } from "../src/lib/midtrans-sandbox";
import { POST } from "../src/app/api/payments/sandbox/route";
import { GET } from "../src/app/api/payments/sandbox/status/route";

const key = "SB-Mid-server-foodstore-test-only";
const valid = { items: [{ id: "box-ayam", quantity: 2, price: 1 }], total: 1, name: "Pembeli Sandbox", date: "2099-05-20", address: "Alamat uji Jakarta", notes: "Uji saja" };
const session: PaymentSession = { orderId: "FS-SB-11111111-1111-4111-8111-111111111111", total: 50000, redirectUrl: "https://app.sandbox.midtrans.com/snap/v4/redirection/test-token", expires: Date.now() + 3600000 };
let originalFetch: typeof fetch;
let originalKey: string | undefined;
test.beforeEach(() => { originalFetch = globalThis.fetch; originalKey = process.env.MIDTRANS_SERVER_KEY; process.env.MIDTRANS_SERVER_KEY = key; });
test.afterEach(() => { globalThis.fetch = originalFetch; if (originalKey === undefined) delete process.env.MIDTRANS_SERVER_KEY; else process.env.MIDTRANS_SERVER_KEY = originalKey; });

test("server ignores supplied prices and validates all cart and date fields", () => {
  expect(buildPayment(valid).total).toBe(50000);
  for (const items of [[], [{ id: "fake", quantity: 1 }], [{ id: "box-ayam", quantity: 0 }], [{ id: "box-ayam", quantity: 1.5 }], [{ id: "box-ayam", quantity: 1000 }], [valid.items[0], valid.items[0]]])
    expect(() => buildPayment({ ...valid, items })).toThrow();
  for (const date of ["2099-02-30", "2000-01-01", "tomorrow"]) expect(() => buildPayment({ ...valid, date })).toThrow();
  expect(() => buildPayment({ ...valid, name: "   " })).toThrow();
  expect(() => buildPayment({ ...valid, address: "" })).toThrow();
  expect(() => buildPayment({ ...valid, notes: "a".repeat(1001) })).toThrow();
});

test("only sandbox credentials and signed unexpired sessions are accepted", () => {
  delete process.env.MIDTRANS_SERVER_KEY;
  expect(() => sandboxKey()).toThrow(/belum dikonfigurasi/);
  process.env.MIDTRANS_SERVER_KEY = "Mid-server-production-key";
  expect(() => sandboxKey()).toThrow();
  const token = signSession(session, key);
  expect(readSession(token, key).total).toBe(50000);
  expect(() => readSession(token + "x", key)).toThrow();
  expect(() => readSession(token, "wrong-key")).toThrow();
  expect(() => readSession(undefined, key)).toThrow();
  expect(() => readSession(signSession({ ...session, expires: 1 }, key), key)).toThrow();
});

test("checkout route sends authoritative totals to sandbox and returns HttpOnly session", async () => {
  let body = {} as { transaction_details: { gross_amount: number; order_id: string }; item_details: { price: number }[]; callbacks: { finish: string }; enabled_payments: string[] };
  globalThis.fetch = async (url, options) => {
    expect(String(url)).toBe("https://app.sandbox.midtrans.com/snap/v1/transactions");
    expect((options?.headers as Record<string, string>).Authorization).toBe(`Basic ${Buffer.from(key + ":").toString("base64")}`);
    body = JSON.parse(String(options?.body));
    return Response.json({ token: "test-token", redirect_url: session.redirectUrl }, { status: 201 });
  };
  const response = await POST(new NextRequest("https://foodstore.test/api/payments/sandbox", { method: "POST", headers: { origin: "https://foodstore.test" }, body: JSON.stringify(valid) }));
  expect(response.status).toBe(200);
  expect(body.transaction_details.gross_amount).toBe(50000);
  expect(body.item_details[0].price).toBe(25000);
  expect(body.enabled_payments).toContain("other_qris");
  expect(body.enabled_payments).toContain("bca_va");
  expect(body.callbacks.finish).toBe("https://foodstore.test/pembayaran");
  expect(body.transaction_details.order_id).toMatch(/^FS-SB-/);
  const cookie = response.cookies.get(sessionCookie)!;
  expect(readSession(cookie.value, key).orderId).toBe(body.transaction_details.order_id);
  expect(readSession(cookie.value, key).items).toEqual([{ id: "box-ayam", quantity: 2 }]);
  const header = response.headers.get("set-cookie")!;
  expect(header).toMatch(/HttpOnly/i); expect(header).toMatch(/SameSite=lax/i); expect(header).toMatch(/Secure/i);
  expect(JSON.stringify(await response.json())).not.toContain(key);
});

test("checkout refuses cross-origin, missing config, invalid bodies, upstream failures and production redirects", async () => {
  const request = (body: string, origin = "https://foodstore.test") => new NextRequest("https://foodstore.test/api/payments/sandbox", { method: "POST", headers: { origin }, body });
  expect((await POST(request("{}", "https://evil.test"))).status).toBe(403);
  delete process.env.MIDTRANS_SERVER_KEY;
  const loopback = await POST(new NextRequest("http://localhost:3000/api/payments/sandbox", { method: "POST", headers: { origin: "http://127.0.0.1:3000", host: "127.0.0.1:3000" }, body: "{}" }));
  expect(loopback.status).toBe(503);
  expect((await POST(request(JSON.stringify(valid)))).status).toBe(503);
  process.env.MIDTRANS_SERVER_KEY = key;
  expect((await POST(request("{"))).status).toBe(400);
  expect((await POST(request("a".repeat(12001)))).status).toBe(413);
  globalThis.fetch = async () => Response.json({ error: "bad key" }, { status: 401 });
  await expect(createPayment(valid, "https://foodstore.test", key)).rejects.toThrow(/menolak/);
  globalThis.fetch = async () => Response.json({ redirect_url: "https://app.midtrans.com/snap/v4/redirection/live" }, { status: 201 });
  await expect(createPayment(valid, "https://foodstore.test", key)).rejects.toThrow(/sandbox/);
  globalThis.fetch = async () => { throw new Error("network"); };
  await expect(createPayment(valid, "https://foodstore.test", key)).rejects.toThrow(/dihubungi/);
});

test("status verifies amount, order and fraud result; callback flags cannot mark it paid", async () => {
  const result = { order_id: session.orderId, gross_amount: "50000.00", transaction_status: "pending" };
  expect(verifiedState(result, session)).toBe("pending");
  expect(verifiedState({ ...result, transaction_status: "settlement" }, session)).toBe("paid");
  expect(verifiedState({ ...result, transaction_status: "capture", fraud_status: "accept" }, session)).toBe("paid");
  expect(verifiedState({ ...result, transaction_status: "capture", fraud_status: "challenge" }, session)).toBe("review");
  expect(verifiedState({ ...result, transaction_status: "settlement", fraud_status: "deny" }, session)).toBe("failed");
  for (const [status, expected] of [["expire", "expired"], ["cancel", "failed"], ["deny", "failed"], ["refund", "refunded"], ["unknown", "review"]]) expect(verifiedState({ ...result, transaction_status: status }, session)).toBe(expected);
  expect(() => verifiedState({ ...result, gross_amount: "1" }, session)).toThrow();
  expect(() => verifiedState({ ...result, order_id: "other" }, session)).toThrow();
  globalThis.fetch = async url => { expect(String(url)).toContain(session.orderId); return Response.json(result); };
  const cookie = `${sessionCookie}=${signSession(session, key)}`;
  const response = await GET(new NextRequest("https://foodstore.test/api/payments/sandbox/status?transaction_status=settlement&order_id=other", { headers: { cookie } }));
  expect((await response.json()).state).toBe("pending");
  expect((await GET(new NextRequest("https://foodstore.test/api/payments/sandbox/status"))).status).toBe(401);
  globalThis.fetch = async () => Response.json({ status_code: "404" }, { status: 404 });
  expect(await paymentStatus(session, key)).toBe("pending");
});
