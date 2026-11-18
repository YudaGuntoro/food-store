import type { Metadata } from "next";
import Storefront from "@/components/storefront";
import PaymentStatus from "./payment-status";

export const metadata: Metadata = { title: "Status Pembayaran Sandbox | FoodStore", robots: { index: false, follow: false } };
export default function PaymentPage() {
  return <Storefront activePage="/pembayaran" showReservation={false}><PaymentStatus /></Storefront>;
}
