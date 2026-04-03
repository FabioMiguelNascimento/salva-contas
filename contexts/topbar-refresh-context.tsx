"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface TopbarRefreshContextValue {
  refresh: (() => void) | null;
  setRefresh: (refresh: (() => void) | null) => void;
}

const TopbarRefreshContext = createContext<TopbarRefreshContextValue | null>(null);

export function TopbarRefreshProvider({ children }: { children: ReactNode }) {
  const [refresh, setRefresh] = useState<(() => void) | null>(null);

  return (
    <TopbarRefreshContext.Provider value={{ refresh, setRefresh }}>
      {children}
    </TopbarRefreshContext.Provider>
  );
}

export function useTopbarRefresh() {
  const context = useContext(TopbarRefreshContext);
  if (!context) {
    throw new Error("useTopbarRefresh must be used within TopbarRefreshProvider");
  }
  return context;
}

export function TopbarRefresh({ refresh }: { refresh: () => void }) {
  const { setRefresh } = useTopbarRefresh();

  useEffect(() => {
    setRefresh(() => refresh);
    return () => setRefresh(null);
  }, [refresh, setRefresh]);

  return null;
}