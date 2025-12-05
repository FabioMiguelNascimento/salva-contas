"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface TopbarActionContextValue {
  actionNode: ReactNode | null;
  setActionNode: (node: ReactNode | null) => void;
}

const TopbarActionContext = createContext<TopbarActionContextValue | null>(null);

export function TopbarActionProvider({ children }: { children: ReactNode }) {
  const [actionNode, setActionNode] = useState<ReactNode | null>(null);

  return (
    <TopbarActionContext.Provider value={{ actionNode, setActionNode }}>
      {children}
    </TopbarActionContext.Provider>
  );
}

export function useTopbarAction() {
  const context = useContext(TopbarActionContext);
  if (!context) {
    throw new Error("useTopbarAction must be used within TopbarActionProvider");
  }
  return context;
}

/**
 * Componente para definir o botão de ação da topbar.
 * Renderiza null mas registra a ação no contexto.
 */
export function TopbarAction({ children }: { children: ReactNode }) {
  const { setActionNode } = useTopbarAction();

  useEffect(() => {
    setActionNode(children);
    return () => setActionNode(null);
  }, [children, setActionNode]);

  return null;
}
