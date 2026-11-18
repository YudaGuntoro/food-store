"use client";

import { createContext } from "react";

export type PaidReceipt = { orderId: string; total: number; items?: { id: string; quantity: number }[] };
export const PaymentCartContext = createContext<((receipt: PaidReceipt) => void) | null>(null);
