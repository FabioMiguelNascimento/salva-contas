"use client";

import { FinanceContext } from "@/context/finance-context";
import { useContext } from "react";

export function useFinance() {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error("useFinance deve ser utilizado dentro de FinanceProvider");
  }

  return context;
}
