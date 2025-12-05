"use client";

import { AuthContext } from "@/contexts/auth-context";
import { useContext } from "react";

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de AuthProvider");
  }

  return context;
}