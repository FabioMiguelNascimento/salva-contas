"use client";

import { usePaginatedList } from "@/hooks/use-paginated-list";
import { categoriesQueryKey, fetchCategories, updateCategory } from "@/services/categories";
import type { TransactionCategory } from "@/types/finance";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 8;

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function useCategoriesPage() {
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategories,
    staleTime: 10 * 60_000,
    placeholderData: keepPreviousData,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftIcon, setDraftIcon] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const normalizedSearch = useMemo(() => normalizeText(searchTerm.trim()), [searchTerm]);

  const filteredCategories = useMemo(() => {
    const allCategories = categoriesQuery.data ?? [];

    if (!normalizedSearch) {
      return allCategories;
    }

    return allCategories.filter((category) => {
      return (
        normalizeText(category.name).includes(normalizedSearch) ||
        normalizeText(category.icon ?? "").includes(normalizedSearch)
      );
    });
  }, [categoriesQuery.data, normalizedSearch]);

  const { paginated: categories, totalPages } = usePaginatedList(filteredCategories, page, PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [normalizedSearch]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  const totalCategories = categoriesQuery.data?.length ?? 0;
  const globalCategories = categoriesQuery.data?.filter((category) => Boolean(category.isGlobal)).length ?? 0;
  const personalCategories = totalCategories - globalCategories;
  const categoriesWithIcon = categoriesQuery.data?.filter((category) => Boolean(category.icon?.trim())).length ?? 0;

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
  }, [queryClient]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const openEditor = useCallback((category: TransactionCategory) => {
    if (category.isGlobal) {
      toast.error('Categorias globais são protegidas e não podem ser editadas.');
      return;
    }

    setEditingCategory(category);
    setDraftName(category.name);
    setDraftIcon(category.icon ?? "");
    setFormError(null);
    setIsSaving(false);
  }, []);

  const closeEditor = useCallback(() => {
    setEditingCategory(null);
    setDraftName("");
    setDraftIcon("");
    setFormError(null);
    setIsSaving(false);
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!editingCategory) {
        return;
      }

      if (editingCategory.isGlobal) {
        const message = 'Categorias globais são protegidas e não podem ser alteradas.';
        setFormError(message);
        toast.error(message);
        return;
      }

      const nextName = draftName.trim();
      const nextIcon = draftIcon.trim();

      if (!nextName) {
        setFormError("Informe um nome para a categoria.");
        return;
      }

      if (nextIcon.length > 0 && nextIcon.length < 3) {
        setFormError("O nome do ícone precisa ter pelo menos 3 caracteres.");
        return;
      }

      try {
        setIsSaving(true);
        setFormError(null);

        await updateCategory(editingCategory.id, {
          name: nextName,
          ...(nextIcon ? { icon: nextIcon } : {}),
        });

        await refresh();
        toast.success("Categoria atualizada com sucesso.");
        closeEditor();
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : "Não foi possível atualizar a categoria.";
        setFormError(message);
        toast.error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [closeEditor, draftIcon, draftName, editingCategory, refresh],
  );

  return {
    categories,
    filteredCategories,
    totalCategories,
    globalCategories,
    personalCategories,
    categoriesWithIcon,
    currentPage: page,
    totalPages,
    searchTerm,
    setSearchTerm,
    clearSearch,
    setPage,
    isLoading: categoriesQuery.isLoading,
    isSyncing: categoriesQuery.isFetching,
    error: categoriesQuery.error instanceof Error ? categoriesQuery.error.message : null,
    refresh,
    editingCategory,
    draftName,
    draftIcon,
    isSaving,
    formError,
    openEditor,
    closeEditor,
    setDraftName,
    setDraftIcon,
    handleSubmit,
  };
}

export type CategoriesPageHook = ReturnType<typeof useCategoriesPage>;