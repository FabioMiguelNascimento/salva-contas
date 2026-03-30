"use client";

import {
  createCreditCard,
  deleteCreditCard,
  fetchCreditCardMetrics,
  fetchCreditCards,
  updateCreditCard,
} from "@/services/credit-cards";
import {
  createDebitCard,
  deleteDebitCard,
  fetchDebitCardMetrics,
  fetchDebitCards,
  updateDebitCard,
} from "@/services/debit-cards";
import type {
  CreateCreditCardPayload,
  CreateDebitCardPayload,
  CreditCard,
  CreditCardMetrics,
  DebitCard,
  DebitCardMetrics,
  UpdateCreditCardPayload,
  UpdateDebitCardPayload,
} from "@/types/finance";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

interface CardsStats {
  totalCards: number;
  totalDebitCards: number;
  totalLimit: number;
  totalAvailable: number;
  totalUsed: number;
  highUsageCards: number;
}

interface CardsContextValue {
  creditCards: CreditCard[];
  debitCards: DebitCard[];
  creditCardMetrics: CreditCardMetrics | null;
  debitCardMetrics: DebitCardMetrics | null;
  stats: CardsStats;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createCreditCardEntry: (payload: CreateCreditCardPayload) => Promise<CreditCard>;
  updateCreditCardEntry: (id: string, payload: UpdateCreditCardPayload) => Promise<CreditCard>;
  deleteCreditCardEntry: (id: string) => Promise<void>;
  createDebitCardEntry: (payload: CreateDebitCardPayload) => Promise<DebitCard>;
  updateDebitCardEntry: (id: string, payload: UpdateDebitCardPayload) => Promise<DebitCard>;
  deleteDebitCardEntry: (id: string) => Promise<void>;
}

const CardsContext = createContext<CardsContextValue | null>(null);

const getHighUsageCards = (cards: CreditCard[]) =>
  cards.filter((card) => {
    if (card.limit <= 0) {
      return false;
    }

    const usedPercentage = ((card.limit - card.availableLimit) / card.limit) * 100;
    return usedPercentage > 80;
  }).length;

export function CardsProvider({ children }: { children: React.ReactNode }) {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [debitCards, setDebitCards] = useState<DebitCard[]>([]);
  const [creditCardMetrics, setCreditCardMetrics] = useState<CreditCardMetrics | null>(null);
  const [debitCardMetrics, setDebitCardMetrics] = useState<DebitCardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cards, debits, creditMetrics, debitMetrics] = await Promise.all([
        fetchCreditCards(),
        fetchDebitCards(),
        fetchCreditCardMetrics(),
        fetchDebitCardMetrics(),
      ]);
      setCreditCards(cards);
      setDebitCards(debits);
      setCreditCardMetrics(creditMetrics);
      setDebitCardMetrics(debitMetrics);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar cartões");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const lastRefreshLoad = useRef<any>(null);

  useEffect(() => {
    if (lastRefreshLoad.current === load) {
      return;
    }
    lastRefreshLoad.current = load;
    void load();
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const stats = useMemo(() => {
    const activeCards = creditCards.filter((card) => card.status === "active");
    const activeDebitCards = debitCards.filter((card) => card.status === "active");

    const totalLimit = creditCardMetrics?.totalLimit ?? activeCards.reduce((acc, card) => acc + card.limit, 0);
    const totalAvailable = creditCardMetrics?.availableLimit ?? activeCards.reduce((acc, card) => acc + card.availableLimit, 0);
    const totalUsed = creditCardMetrics?.totalUsed ?? totalLimit - totalAvailable;

    return {
      totalCards: creditCardMetrics?.activeCardsCount ?? activeCards.length,
      totalDebitCards: debitCardMetrics?.activeCardsCount ?? activeDebitCards.length,
      totalLimit,
      totalAvailable,
      totalUsed,
      highUsageCards: getHighUsageCards(activeCards),
    };
  }, [creditCards, debitCards, creditCardMetrics, debitCardMetrics]);

  const createCreditCardEntry = useCallback(async (payload: CreateCreditCardPayload) => {
    const card = await createCreditCard(payload);
    setCreditCards((prev) => [card, ...prev]);
    setCreditCardMetrics(null);
    return card;
  }, []);

  const updateCreditCardEntry = useCallback(async (id: string, payload: UpdateCreditCardPayload) => {
    const card = await updateCreditCard(id, payload);
    setCreditCards((prev) => prev.map((item) => (item.id === id ? card : item)));
    setCreditCardMetrics(null);
    return card;
  }, []);

  const deleteCreditCardEntry = useCallback(async (id: string) => {
    await deleteCreditCard(id);
    setCreditCards((prev) => prev.filter((item) => item.id !== id));
    setCreditCardMetrics(null);
  }, []);

  const createDebitCardEntry = useCallback(async (payload: CreateDebitCardPayload) => {
    const card = await createDebitCard(payload);
    setDebitCards((prev) => [card, ...prev]);
    setDebitCardMetrics(null);
    return card;
  }, []);

  const updateDebitCardEntry = useCallback(async (id: string, payload: UpdateDebitCardPayload) => {
    const card = await updateDebitCard(id, payload);
    setDebitCards((prev) => prev.map((item) => (item.id === id ? card : item)));
    setDebitCardMetrics(null);
    return card;
  }, []);

  const deleteDebitCardEntry = useCallback(async (id: string) => {
    await deleteDebitCard(id);
    setDebitCards((prev) => prev.filter((item) => item.id !== id));
    setDebitCardMetrics(null);
  }, []);

  return (
    <CardsContext.Provider
      value={{
        creditCards,
        debitCards,
        creditCardMetrics,
        debitCardMetrics,
        stats,
        isLoading,
        error,
        refresh,
        createCreditCardEntry,
        updateCreditCardEntry,
        deleteCreditCardEntry,
        createDebitCardEntry,
        updateDebitCardEntry,
        deleteDebitCardEntry,
      }}
    >
      {children}
    </CardsContext.Provider>
  );
}

export function useCards() {
  const context = useContext(CardsContext);
  if (!context) {
    throw new Error("useCards deve ser utilizado dentro de CardsProvider");
  }
  return context;
}
