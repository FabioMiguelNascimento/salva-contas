"use client";

import { useAuth } from "@/hooks/use-auth";
import { generateInvite as apiGenerateInvite, removeFamilyMember as apiRemoveFamilyMember, getFamilyInviteTokens, getFamilyMembers } from "@/services/family-invites";
import type {
    FamilyInviteTokensResponse,
    FamilyMembersResponse,
    GenerateInviteResponse
} from "@/types/invites";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface FamilyInviteContextValue {
  family: FamilyMembersResponse | null;
  inviteTokens: FamilyInviteTokensResponse | null;
  inviteUrl: string;
  isFamilyPlan: boolean;
  isLoadingMembers: boolean;
  isLoadingTokens: boolean;
  isGenerating: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMembers: () => Promise<void>;
  loadInviteTokens: () => Promise<void>;
  generateInvite: () => Promise<GenerateInviteResponse | null>;
  clearInviteUrl: () => void;
  removeFamilyMember: (memberId: string) => Promise<void>;
}

const FamilyInviteContext = createContext<FamilyInviteContextValue | null>(null);

export function FamilyInviteProvider({ children }: { children: ReactNode }) {
  const [family, setFamily] = useState<FamilyMembersResponse | null>(null);
  const [inviteTokens, setInviteTokens] = useState<FamilyInviteTokensResponse | null>(null);
  const [inviteUrl, setInviteUrl] = useState("");
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [isFamilyPlan, setIsFamilyPlan] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!isFamilyPlan) {
      setFamily(null);
      return;
    }

    setIsLoadingMembers(true);
    try {
      const data = await getFamilyMembers();
      setFamily(data);
      setError(null);
    } catch (err: any) {
      const msg = err?.message || "Não foi possível carregar os membros vinculados.";
      setError(msg);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [isFamilyPlan]);

  const loadInviteTokens = useCallback(async () => {
    if (!isFamilyPlan) {
      setInviteTokens(null);
      return;
    }

    setIsLoadingTokens(true);
    try {
      const data = await getFamilyInviteTokens();
      setInviteTokens(data);
      setError(null);
    } catch (err: any) {
      const msg = err?.message || "Não foi possível carregar os tokens de convite.";
      setError(msg);
    } finally {
      setIsLoadingTokens(false);
    }
  }, [isFamilyPlan]);

  const refresh = useCallback(async () => {
    if (!isFamilyPlan) {
      setIsRefreshing(false);
      return;
    }

    setIsRefreshing(true);
    try {
      await Promise.all([loadMembers(), loadInviteTokens()]);
    } catch {
    } finally {
      setIsRefreshing(false);
    }
  }, [isFamilyPlan, loadMembers, loadInviteTokens]);

  const generateInvite = useCallback(async () => {
    if (!isFamilyPlan) {
      setError("Plano Família necessário para gerar convites.");
      return null;
    }

    setIsGenerating(true);
    try {
      const result = await apiGenerateInvite();
      setInviteUrl(result.inviteUrl);
      await loadInviteTokens();
      setError(null);
      return result;
    } catch (err: any) {
      setError(err?.message || "Não foi possível gerar o convite.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [isFamilyPlan, loadInviteTokens]);

  const clearInviteUrl = useCallback(() => setInviteUrl(""), []);

  const removeFamilyMember = useCallback(
    async (memberId: string) => {
      if (!isFamilyPlan) {
        throw new Error("Plano Família necessário para remover membros.");
      }
      try {
        await apiRemoveFamilyMember(memberId);
        await refresh();
      } catch (err: any) {
        setError(err?.message || "Não foi possível remover membro.");
        throw err;
      }
    },
    [isFamilyPlan, refresh],
  );

  useEffect(() => {
    setIsFamilyPlan(user?.planTier === "FAMILY");
  }, [user]);

  const value = useMemo<FamilyInviteContextValue>(
    () => ({
      family,
      inviteTokens,
      inviteUrl,
      isFamilyPlan,
      isLoadingMembers,
      isLoadingTokens,
      isGenerating,
      isRefreshing,
      error,
      refresh,
      loadMembers,
      loadInviteTokens,
      generateInvite,
      clearInviteUrl,
      removeFamilyMember,
    }),
    [
      family,
      inviteTokens,
      inviteUrl,
      isFamilyPlan,
      isLoadingMembers,
      isLoadingTokens,
      isGenerating,
      isRefreshing,
      error,
      refresh,
      loadMembers,
      loadInviteTokens,
      generateInvite,
      clearInviteUrl,
    ],
  );

  return <FamilyInviteContext.Provider value={value}>{children}</FamilyInviteContext.Provider>;
}

export function useFamilyInvite() {
  const context = useContext(FamilyInviteContext);
  if (!context) {
    throw new Error("useFamilyInvite deve ser usado dentro de FamilyInviteProvider");
  }
  return context;
}
