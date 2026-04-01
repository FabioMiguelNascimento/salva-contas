"use client";

import { useAuth } from "@/contexts/auth-context";
import { getUsage, UsageData } from "@/services/usage";
import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode
} from "react";

interface UsageContextValue {
  usageData: UsageData | null;
  isLoading: boolean;
  refreshUsage: () => Promise<void>;
}

const UsageContext = createContext<UsageContextValue | null>(null);

export function UsageProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsage = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const data = await getUsage();
      setUsageData(data);
    } catch (error) {
      console.error("Erro ao buscar uso:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  return (
    <UsageContext.Provider
      value={{
        usageData,
        isLoading,
        refreshUsage: fetchUsage,
      }}
    >
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  const context = useContext(UsageContext);
  if (!context) {
    throw new Error("useUsage deve ser usado dentro de um UsageProvider");
  }
  return context;
}
