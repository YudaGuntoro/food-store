import { NextRequest, NextResponse } from "next/server";
import { PaymentError, paymentStatus, readSession, sandboxKey, sessionCookie } from "@/lib/midtrans-sandbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const key = sandboxKey();
    const session = readSession(request.cookies.get(sessionCookie)?.value, key);
    const state = await paymentStatus(session, key);
    return NextResponse.json({ orderId: session.orderId, total: session.total, items: state === "paid" ? session.items : undefined, state, redirectUrl: state === "pending" ? session.redirectUrl : undefined }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof PaymentError ? error.message : "Status pembayaran belum dapat diperiksa." }, { status: error instanceof PaymentError ? error.status : 500, headers: { "Cache-Control": "no-store" } });
  }
}
