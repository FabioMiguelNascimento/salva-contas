"use client";

import { FinanceProvider } from "@/context/finance-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <FinanceProvider>{children}</FinanceProvider>;
}
