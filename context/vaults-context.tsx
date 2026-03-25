"use client";

import {
    addVaultYield,
    createVault,
    deleteVault,
    depositToVault,
    fetchVaultsSummary,
    updateVault,
    withdrawFromVault
} from "@/services/vaults";
import type {
    CreateVaultPayload,
    DashboardMetrics,
    UpdateVaultPayload,
    Vault,
    VaultAmountPayload,
} from "@/types/finance";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface VaultsContextValue {
  vaults: Vault[];
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSync: string | null;
  refresh: () => Promise<void>;
  createVaultEntry: (payload: CreateVaultPayload) => Promise<Vault>;
  updateVaultEntry: (id: string, payload: UpdateVaultPayload) => Promise<Vault>;
  deleteVaultEntry: (id: string) => Promise<void>;
  depositVaultAmount: (id: string, payload: VaultAmountPayload) => Promise<Vault>;
  withdrawVaultAmount: (id: string, payload: VaultAmountPayload) => Promise<Vault>;
  addVaultYieldAmount: (id: string, payload: VaultAmountPayload) => Promise<Vault>;
}

const VaultsContext = createContext<VaultsContextValue | null>(null);

export function VaultsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isVaultsRoute = pathname === "/cofrinhos" || pathname.startsWith("/cofrinhos/");

  const [vaults, setVaults] = useState<Vault[]>([]);
  const [metrics, setMetrics] = useState<VaultsContextValue["metrics"]>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isVaultsRoute) return;

    setIsSyncing(true);
    try {
      const summary = await fetchVaultsSummary();
      setVaults(summary.vaults);
      setMetrics(summary.metrics as any);
      setError(null);
      setLastSync(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar cofrinhos.");
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, [isVaultsRoute]);

  const lastRefreshParams = useRef<{ refresh: any; isVaultsRoute: boolean } | null>(null);

  useEffect(() => {
    if (
      lastRefreshParams.current?.refresh === refresh &&
      lastRefreshParams.current?.isVaultsRoute === isVaultsRoute
    ) {
      return;
    }
    lastRefreshParams.current = { refresh, isVaultsRoute };

    if (!isVaultsRoute) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    void refresh();
  }, [isVaultsRoute, refresh]);

  const createVaultEntry = useCallback(async (payload: CreateVaultPayload) => {
    const vault = await createVault(payload);
    setVaults((prev) => [vault, ...prev]);
    await refresh();
    return vault;
  }, [refresh]);

  const updateVaultEntry = useCallback(async (id: string, payload: UpdateVaultPayload) => {
    const vault = await updateVault(id, payload);
    setVaults((prev) => prev.map((item) => (item.id === id ? vault : item)));
    await refresh();
    return vault;
  }, [refresh]);

  const deleteVaultEntry = useCallback(async (id: string) => {
    await deleteVault(id);
    setVaults((prev) => prev.filter((item) => item.id !== id));
    await refresh();
  }, [refresh]);

  const depositVaultAmount = useCallback(async (id: string, payload: VaultAmountPayload) => {
    const vault = await depositToVault(id, payload);
    setVaults((prev) => prev.map((item) => (item.id === id ? vault : item)));
    await refresh();
    return vault;
  }, [refresh]);

  const withdrawVaultAmount = useCallback(async (id: string, payload: VaultAmountPayload) => {
    const vault = await withdrawFromVault(id, payload);
    setVaults((prev) => prev.map((item) => (item.id === id ? vault : item)));
    await refresh();
    return vault;
  }, [refresh]);

  const addVaultYieldAmount = useCallback(async (id: string, payload: VaultAmountPayload) => {
    const vault = await addVaultYield(id, payload);
    setVaults((prev) => prev.map((item) => (item.id === id ? vault : item)));
    await refresh();
    return vault;
  }, [refresh]);

  return (
    <VaultsContext.Provider
      value={{
        vaults,
        metrics,
        isLoading,
        isSyncing,
        error,
        lastSync,
        refresh,
        createVaultEntry,
        updateVaultEntry,
        deleteVaultEntry,
        depositVaultAmount,
        withdrawVaultAmount,
        addVaultYieldAmount,
      }}
    >
      {children}
    </VaultsContext.Provider>
  );
}

export function useVaults() {
  const context = useContext(VaultsContext);
  if (!context) {
    throw new Error("useVaults deve ser utilizado dentro de VaultsProvider");
  }
  return context;
}
