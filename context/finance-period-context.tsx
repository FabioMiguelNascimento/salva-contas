"use client";

import { fetchDashboardMetrics } from "@/services/dashboard";
import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";

interface TransactionFilters {
  month: number;
  year: number;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
}

interface FinancePeriodContextValue {
  filters: TransactionFilters;
  setFilters: (filters: TransactionFilters) => void;
  refreshTicket: number;
  triggerRefresh: () => void;
  // Métricas Globais
  pendingBillsCount: number;
  isSyncing: boolean;
  refresh: () => Promise<void>;
}

const FinancePeriodContext = createContext<FinancePeriodContextValue | null>(null);

export function FinancePeriodProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<TransactionFilters>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  
  const [refreshTicket, setRefreshTicket] = useState(0);
  const [pendingBillsCount, setPendingBillsCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const triggerRefresh = useCallback(() => {
    setRefreshTicket(prev => prev + 1);
  }, []);

  const refresh = useCallback(async () => {
    setIsSyncing(true);
    try {
      const metrics = await fetchDashboardMetrics(filters);
      setPendingBillsCount(metrics.pendingBills.count);
    } catch (error) {
      console.error("Erro ao atualizar métricas globais:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [filters]);

  const lastRefresh = useRef<{ ticket: number; filters: string } | null>(null);

  useEffect(() => {
    const filterKey = JSON.stringify(filters);
    if (lastRefresh.current?.ticket === refreshTicket && lastRefresh.current?.filters === filterKey) {
      return;
    }
    lastRefresh.current = { ticket: refreshTicket, filters: filterKey };
    
    refresh();
  }, [refresh, refreshTicket, filters]);

  return (
    <FinancePeriodContext.Provider value={{ 
      filters, 
      setFilters, 
      refreshTicket, 
      triggerRefresh,
      pendingBillsCount,
      isSyncing,
      refresh
    }}>
      {children}
    </FinancePeriodContext.Provider>
  );
}

export function useFinancePeriod() {
  const context = useContext(FinancePeriodContext);
  if (!context) throw new Error("useFinancePeriod deve ser usado dentro de FinancePeriodProvider");
  return context;
}
