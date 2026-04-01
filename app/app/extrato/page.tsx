"use client";

import { Filter } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { AttachmentViewer } from "@/components/attachment-viewer";
import { NewTransactionDialog } from "@/components/new-transaction-sheet";
import { PageHeader } from "@/components/page-header";
import { useFinancePeriod } from "@/context/finance-period-context";
import { TransactionsProvider, useTransactions } from "@/context/transactions-context";
import { TopbarAction } from "@/contexts/topbar-action-context";

import { DeleteTransactionDialog } from "@/components/transactions/DeleteTransactionDialog";
import { EditTransactionSheet } from "@/components/transactions/EditTransactionSheet";
import { FilterBar } from "@/components/transactions/FilterBar";
import { PaginationControls } from "@/components/transactions/PaginationControls";
import { TransactionCard } from "@/components/transactions/TransactionCard";
import { TransactionTable } from "@/components/transactions/TransactionTable";

import { useTransactionEditor } from "@/hooks/use-transaction-editor";
import { useTransactionFilters } from "@/hooks/use-transaction-filters";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";


import { CardsProvider } from "@/context/cards-context";
import type { Transaction } from "@/types/finance";

function ExtratoPageContent() {
  const {
    transactions: serverTransactions,
    isLoading,
    isSyncing,
    categories,
    removeTransaction,
    totalPages,
    currentPage,
    refresh,
  } = useTransactions();

  const { filters, setFilters } = useFinancePeriod();

  const {
    filters: urlFilters,
    setType,
    setStatus,
    setCategory,
    setSearch,
    goToPage,
  } = useTransactionFilters();

  const editor = useTransactionEditor();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; transaction?: Transaction }>({ open: false });
  const [attachmentViewer, setAttachmentViewer] = useState<{ open: boolean; transaction?: Transaction }>({ open: false });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    void refresh(urlFilters.page, {
      query: urlFilters.search || undefined,
      type: urlFilters.type !== "all" ? (urlFilters.type as "expense" | "income") : undefined,
      status: urlFilters.status !== "all" ? (urlFilters.status as "paid" | "pending") : undefined,
      categoryId: urlFilters.categoryId || undefined,
      month: filters.month,
      year: filters.year,
      startDate: undefined,
      endDate: undefined,
    });
  }, [refresh, urlFilters.page, urlFilters.search, urlFilters.type, urlFilters.status, urlFilters.categoryId, filters.month, filters.year]);


  const handleDelete = async () => {
    if (!deleteDialog.transaction) return;
    setIsProcessing(true);
    try {
      await removeTransaction(deleteDialog.transaction.id);
      setDeleteDialog({ open: false });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <TopbarAction>
        <NewTransactionDialog trigger={<Button>Nova Transação</Button>} />
      </TopbarAction>

      <PageHeader
        tag="Histórico"
        title="Extrato e transações"
        description="Consulte todas as movimentações processadas pela IA. Filtre por período, categoria e status para investigações detalhadas."
      />

      <Card>
        <CardHeader className="gap-4">
          <CardTitle className="flex flex-wrap items-center gap-3 text-base font-semibold">
            <Filter className="h-4 w-4" /> Filtros inteligentes
          </CardTitle>
          <FilterBar
            search={urlFilters.search}
            type={urlFilters.type}
            status={urlFilters.status}
            month={filters.month}
            year={filters.year}
            categoryId={urlFilters.categoryId}
            categories={categories}
            isSearching={isSyncing}
            onSearchChange={setSearch}
            onMonthChange={(v) => setFilters({ ...filters, month: v })}
            onYearChange={(v) => setFilters({ ...filters, year: v })}
            onCategoryChange={setCategory}
            onTypeChange={setType}
            onStatusChange={setStatus}
          />
        </CardHeader>
        <CardContent>
          <div className="hidden overflow-x-auto md:block">
            <TransactionTable
              transactions={serverTransactions}
              isLoading={isLoading}
              onEdit={editor.openEditor}
              onDelete={(tx) => setDeleteDialog({ open: true, transaction: tx })}
              onViewAttachment={(tx) => setAttachmentViewer({ open: true, transaction: tx })}
            />
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-28 w-full rounded-2xl" />
              ))
            ) : serverTransactions.length ? (
              serverTransactions.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  onEdit={editor.openEditor}
                  onDelete={() => setDeleteDialog({ open: true, transaction: tx })}
                  onViewAttachment={
                    tx.attachmentUrl ? () => setAttachmentViewer({ open: true, transaction: tx }) : undefined
                  }
                  isLoading={false}
                />
              ))
            ) : ( 
              <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                Nenhuma transação encontrada.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        disabled={isLoading || serverTransactions.length === 0}
        onPageChange={goToPage}
      />

      <DeleteTransactionDialog
        open={deleteDialog.open}
        transaction={deleteDialog.transaction}
        isProcessing={isProcessing}
        onClose={() => setDeleteDialog({ open: false })}
        onDelete={handleDelete}
      />

      <EditTransactionSheet
        open={editor.open}
        transaction={editor.transaction}
        isProcessing={editor.isProcessing}
        error={editor.error}
        editDescription={editor.editDescription}
        editAmount={editor.editAmount}
        editType={editor.editType}
        editStatus={editor.editStatus}
        editDate={editor.editDate}
        editCategoryId={editor.editCategoryId}
        editCreditCardId={editor.editCreditCardId}
        editDebitCardId={editor.editDebitCardId}
        editPaymentMethod={editor.editPaymentMethod}
        editIsSplitMode={editor.editIsSplitMode}
        editSplits={editor.editSplits}
        installmentTransactions={editor.installmentTransactions}
        isLoadingInstallments={editor.isLoadingInstallments}
        setEditDescription={editor.setEditDescription}
        setEditAmount={editor.setEditAmount}
        setEditType={editor.setEditType}
        setEditStatus={editor.setEditStatus}
        setEditDate={editor.setEditDate}
        setEditCategoryId={editor.setEditCategoryId}
        setEditCreditCardId={editor.setEditCreditCardId}
        setEditDebitCardId={editor.setEditDebitCardId}
        setEditPaymentMethod={editor.setEditPaymentMethod}
        setEditIsSplitMode={editor.setEditIsSplitMode}
        setEditSplits={editor.setEditSplits}
        onClose={editor.closeEditor}
        onSubmit={editor.handleSubmit}
      />

      <AttachmentViewer
        open={attachmentViewer.open}
        onOpenChange={(open) => setAttachmentViewer({ open, transaction: undefined })}
        attachmentUrl={attachmentViewer.transaction?.attachmentUrl}
        attachmentOriginalName={attachmentViewer.transaction?.attachmentOriginalName}
        attachmentMimeType={attachmentViewer.transaction?.attachmentMimeType}
      />
    </div>
  );
}

export default function ExtratoPage() {
  return (
    <TransactionsProvider>
      <CardsProvider >
        <AppShell>
          <ExtratoPageContent />
        </AppShell>
      </CardsProvider>
    </TransactionsProvider>
  );
}
