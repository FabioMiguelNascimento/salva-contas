"use client";

import { WorkspaceContext } from "@/contexts/workspace-context";
import { useContext } from "react";

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace deve ser utilizado dentro de WorkspaceProvider");
  }

  return context;
}
