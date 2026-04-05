"use client";

import { AppShell } from "@/components/app-shell";
import { CategoriesTable, CategoriesTableSkeleton } from "@/components/categories/categories-table";
import { CategoryCreateSheet } from "@/components/categories/category-create-sheet";
import { CategoryDeleteSheet } from "@/components/categories/category-delete-sheet";
import { CategoryEditSheet } from "@/components/categories/category-edit-sheet";
import { PageHeader } from "@/components/page-header";
import { PaginationControls } from "@/components/transactions/PaginationControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TopbarAction } from "@/contexts/topbar-action-context";
import { TopbarRefresh } from "@/contexts/topbar-refresh-context";
import { useCategoriesPage } from "@/hooks/use-categories-page";
import { createCategory, deleteCategory } from "@/services/categories";
import { PlusCircle, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function CategoriesPageContent() {
  const {
    categories,
    filteredCategories,
    currentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    clearSearch,
    setPage,
    isLoading,
    isSyncing,
    error,
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
  } = useCategoriesPage();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<typeof editingCategory>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const hasSearchResults = filteredCategories.length > 0;
  const showPagination = hasSearchResults && totalPages > 1;

  return (
    <div className="space-y-8">
      <TopbarAction>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusCircle data-icon="inline-start" />
          Nova Categoria
        </Button>
      </TopbarAction>

      <TopbarRefresh refresh={refresh} />

      <PageHeader
        tag="Organização"
        title="Categorias"
        description="Gerencie suas categorias para organizar suas transações. Categorias globais são mantidas pela plataforma."
      />

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="font-medium text-destructive">Não foi possível carregar as categorias.</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nome ou ícone..."
                className="pl-9"
              />
            </div>

            {searchTerm ? (
              <button
                type="button"
                onClick={clearSearch}
                className="text-sm text-muted-foreground underline hover:text-foreground"
              >
                Limpar busca
              </button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-6">
            {isLoading ? (
              <CategoriesTableSkeleton />
            ) : (
              <>
                <CategoriesTable
                  categories={categories}
                  onSelect={openEditor}
                  emptyTitle={searchTerm ? "Nenhuma categoria encontrada." : "Ainda não há categorias cadastradas."}
                  emptyDescription={
                    searchTerm
                      ? "Ajuste o filtro ou limpe a busca para ver todas as categorias."
                      : "Assim que houver categorias disponíveis, elas aparecerão nesta lista."
                  }
                />

                {showPagination ? (
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    disabled={isSyncing}
                    onPageChange={setPage}
                  />
                ) : null}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <CategoryCreateSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={async (payload) => {
          await createCategory(payload);
          await refresh();
          toast.success("Categoria criada com sucesso.");
        }}
      />

      <CategoryEditSheet
        open={Boolean(editingCategory)}
        category={editingCategory}
        name={draftName}
        icon={draftIcon}
        isSaving={isSaving}
        error={formError}
        onNameChange={setDraftName}
        onIconChange={setDraftIcon}
        onClose={closeEditor}
        onSubmit={handleSubmit}
        onDelete={() => {
          setDeleteTarget(editingCategory);
          setDeleteError(null);
          closeEditor();
          setTimeout(() => setDeleteOpen(true), 150);
        }}
      />

      <CategoryDeleteSheet
        open={deleteOpen}
        category={deleteTarget}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setIsDeleting(true);
          setDeleteError(null);
          try {
            await deleteCategory(deleteTarget.id);
            toast.success("Categoria excluída com sucesso.");
            await refresh();
            setDeleteOpen(false);
            setDeleteTarget(null);
          } catch (err: any) {
            setDeleteError(err.response?.data?.message || "Não foi possível excluir a categoria.");
          } finally {
            setIsDeleting(false);
          }
        }}
      />
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <AppShell>
      <CategoriesPageContent />
    </AppShell>
  );
}
