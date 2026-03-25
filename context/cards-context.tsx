"use client";

import {
    createCreditCard,
    deleteCreditCard,
    fetchCreditCards,
    updateCreditCard,
} from "@/services/credit-cards";
import {
    createDebitCard,
    deleteDebitCard,
    fetchDebitCards,
    updateDebitCard,
} from "@/services/debit-cards";
import type {
    CreateCreditCardPayload,
    CreateDebitCardPayload,
    CreditCard,
    DebitCard,
    UpdateCreditCardPayload,
    UpdateDebitCardPayload,
} from "@/types/finance";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface CardsContextValue {
  creditCards: CreditCard[];
  debitCards: DebitCard[];
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

export function CardsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCardsRoute = pathname.startsWith("/cartoes");

  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [debitCards, setDebitCards] = useState<DebitCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isCardsRoute) return;
    setIsLoading(true);
    try {
      const [cards, debits] = await Promise.all([fetchCreditCards(), fetchDebitCards()]);
      setCreditCards(cards);
      setDebitCards(debits);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar cartões");
    } finally {
      setIsLoading(false);
    }
  }, [isCardsRoute]);

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

  const createCreditCardEntry = useCallback(async (payload: CreateCreditCardPayload) => {
    const card = await createCreditCard(payload);
    setCreditCards((prev) => [card, ...prev]);
    return card;
  }, []);

  const updateCreditCardEntry = useCallback(async (id: string, payload: UpdateCreditCardPayload) => {
    const card = await updateCreditCard(id, payload);
    setCreditCards((prev) => prev.map((item) => (item.id === id ? card : item)));
    return card;
  }, []);

  const deleteCreditCardEntry = useCallback(async (id: string) => {
    await deleteCreditCard(id);
    setCreditCards((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const createDebitCardEntry = useCallback(async (payload: CreateDebitCardPayload) => {
    const card = await createDebitCard(payload);
    setDebitCards((prev) => [card, ...prev]);
    return card;
  }, []);

  const updateDebitCardEntry = useCallback(async (id: string, payload: UpdateDebitCardPayload) => {
    const card = await updateDebitCard(id, payload);
    setDebitCards((prev) => prev.map((item) => (item.id === id ? card : item)));
    return card;
  }, []);

  const deleteDebitCardEntry = useCallback(async (id: string) => {
    await deleteDebitCard(id);
    setDebitCards((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <CardsContext.Provider
      value={{
        creditCards,
        debitCards,
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
