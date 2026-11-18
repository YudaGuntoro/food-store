import { NextRequest, NextResponse } from "next/server";
import { createPayment, PaymentError, sandboxKey, sessionCookie, sessionLifetime, signSession } from "@/lib/midtrans-sandbox";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    let caller: URL | undefined;
    try { caller = origin ? new URL(origin) : undefined; } catch { /* Rejected below. */ }
    // Next dev can normalize nextUrl.hostname to localhost even for 127.0.0.1.
    // Compare against the request Host, which browsers cannot override in fetch.
    if (!caller || !["http:", "https:"].includes(caller.protocol) || origin !== caller.origin || caller.host !== (request.headers.get("host") ?? request.nextUrl.host))
      throw new PaymentError("Permintaan pembayaran tidak diizinkan.", 403);
    const key = sandboxKey();
    const raw = await request.text();
    if (raw.length > 12000) throw new PaymentError("Data pembayaran terlalu besar.", 413);
    let input: unknown;
    try { input = JSON.parse(raw); } catch { throw new PaymentError("Data pembayaran tidak valid."); }
    const session = await createPayment(input, caller.origin, key);
    const response = NextResponse.json({ redirectUrl: session.redirectUrl }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(sessionCookie, signSession(session, key), { httpOnly: true, secure: caller.protocol === "https:", sameSite: "lax", path: "/", maxAge: sessionLifetime });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof PaymentError ? error.message : "Pembayaran belum dapat dimulai." }, { status: error instanceof PaymentError ? error.status : 500, headers: { "Cache-Control": "no-store" } });
  }
}
