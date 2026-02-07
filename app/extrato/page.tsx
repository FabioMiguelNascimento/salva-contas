"use client";

import { AttachmentViewer } from "@/components/attachment-viewer";
import { CategorySelect } from "@/components/category-select";
import { CreditCardSelect } from "@/components/credit-card-select";
import { CardFlagIcon } from "@/components/credit-cards/card-flag-icon";
import { DatePicker } from "@/components/date-picker";
import { NewTransactionDialog } from "@/components/new-transaction-sheet";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { TopbarAction } from "@/contexts/topbar-action-context";
import { useFinance } from "@/hooks/use-finance";
import { currencyFormatter, getAvailableYears, monthsShort } from "@/lib/subscriptions/constants";
import { cn, getTransactionCategoryLabel } from "@/lib/utils";
import type { Transaction } from "@/types/finance";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Filter, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function ExtratoPage() {
  const {
    transactions,
    filters,
    setFilters,
    isLoading,
    updateExistingTransaction,
    removeTransaction,
  } = useFinance();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; transaction?: Transaction }>({ open: false });
  const [editing, setEditing] = useState<{ open: boolean; transaction?: Transaction }>({ open: false });
  const [attachmentViewer, setAttachmentViewer] = useState<{ open: boolean; transaction?: Transaction }>({ open: false });
  const [editDate, setEditDate] = useState<Date | undefined>();
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editCreditCardId, setEditCreditCardId] = useState<string | null>(null);
  const [editType, setEditType] = useState("expense");
  const [editStatus, setEditStatus] = useState("paid");
  const [isProcessing, setIsProcessing] = useState(false);

  const years = getAvailableYears();
  const pageSize = 8;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const term = search.trim().toLowerCase();
      const matchesSearch = term
        ? `${transaction.description} ${transaction.category}`.toLowerCase().includes(term)
        : true;
      const matchesType = typeFilter === "all" || transaction.type === typeFilter;
      const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [transactions, search, typeFilter, statusFilter]);

  const totalPages = Math.max(Math.ceil(filteredTransactions.length / pageSize), 1);
  const paginatedTransactions = filteredTransactions.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [transactions]);

  const openEdit = (transaction: Transaction) => {
    setEditing({ open: true, transaction });
    setEditDescription(transaction.description);
    setEditAmount(String(transaction.amount));
    setEditCategoryId(transaction.categoryId ?? null);
    setEditCreditCardId(transaction.creditCardId ?? null);
    setEditType(transaction.type);
    setEditStatus(transaction.status);
    setEditDate(transaction.paymentDate ? new Date(transaction.paymentDate) : undefined);
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing.transaction) return;

    const parsedAmount = Number(editAmount.replace(/,/g, "."));
    setIsProcessing(true);
    try {
      await updateExistingTransaction(editing.transaction.id, {
        description: editDescription,
        amount: parsedAmount,
        type: editType as Transaction["type"],
        status: editStatus as Transaction["status"],
        paymentDate: editDate ? editDate.toISOString() : null,
        categoryId: editCategoryId,
        creditCardId: editCreditCardId,
      });
      setEditing({ open: false });
    } finally {
      setIsProcessing(false);
    }
  };

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
          <div className="flex flex-wrap gap-3">
            <Input placeholder="Buscar por descrição ou categoria" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full sm:max-w-xs" />
            <Select value={String(filters.month)} onValueChange={(value) => setFilters({ ...filters, month: Number(value) })}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {monthsShort.map((month) => (
                  <SelectItem key={month.value} value={String(month.value)}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(filters.year)} onValueChange={(value) => setFilters({ ...filters, year: Number(value) })}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Cartão</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: pageSize }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedTransactions.length ? (
                  paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatTransactionDate(transaction)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.status === "paid" ? "Liquidado" : "Pendente"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getTransactionCategoryLabel(transaction)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.creditCard ? (
                          <div className="flex items-center gap-2">
                            <CardFlagIcon flag={transaction.creditCard.flag} className="h-5 w-auto" />
                            <span className="text-xs text-muted-foreground">{transaction.creditCard.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", transaction.type === "income" ? "bg-emerald-100 text-emerald-800" : "bg-destructive/15 text-destructive") }>
                          {transaction.type === "income" ? "Receita" : "Despesa"}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn("font-semibold", transaction.type === "income" ? "text-emerald-600" : "text-destructive") }>
                        {transaction.type === "income" ? "+" : "-"}
                        {currencyFormatter.format(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(transaction)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteDialog({ open: true, transaction })}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                      Nenhuma transação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="flex flex-col gap-3 md:hidden">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 w-full rounded-2xl" />)
              : paginatedTransactions.length
              ? paginatedTransactions.map((transaction) => (
                  <div key={transaction.id} className="rounded-2xl border border-border/60 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatTransactionDate(transaction)}</span>
                          {transaction.creditCard && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <CardFlagIcon flag={transaction.creditCard.flag} className="h-3.5 w-auto" />
                                <span>{transaction.creditCard.name}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {transaction.attachmentUrl && (
                            <DropdownMenuItem onClick={() => setAttachmentViewer({ open: true, transaction })}>
                              <FileText className="mr-2 h-4 w-4" />
                              Ver anexo
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => openEdit(transaction)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteDialog({ open: true, transaction })}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <Badge variant="outline">{getTransactionCategoryLabel(transaction)}</Badge>
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-xs", transaction.type === "income" ? "bg-emerald-100 text-emerald-900" : "bg-destructive/15 text-destructive") }>
                          {transaction.type === "income" ? "Receita" : "Despesa"}
                        </Badge>
                        <span className={cn("font-semibold", transaction.type === "income" ? "text-emerald-600" : "text-destructive") }>
                          {transaction.type === "income" ? "+" : "-"}
                          {currencyFormatter.format(transaction.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              : (
                  <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                    Nenhuma transação encontrada.
                  </div>
                )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Página {page} de {totalPages} • {filteredTransactions.length} lançamentos
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages || filteredTransactions.length === 0}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Próxima
          </Button>
        </div>
      </div>

      {/* Sheet de deletar transação */}
      <Sheet open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Remover transação</SheetTitle>
            <SheetDescription>
              Esta ação não pode ser desfeita.
            </SheetDescription>
          </SheetHeader>

          <SheetBody>
            <p className="text-sm text-muted-foreground">
              {deleteDialog.transaction
                ? `Deseja excluir a transação "${deleteDialog.transaction.description}"?`
                : ""}
            </p>
          </SheetBody>

          <SheetFooter className="flex-row gap-2">
            <Button variant="ghost" onClick={() => setDeleteDialog({ open: false })} disabled={isProcessing} className="flex-1">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isProcessing} className="flex-1">
              {isProcessing ? "Removendo..." : "Excluir"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Sheet de editar transação */}
      <Sheet open={editing.open} onOpenChange={(open) => setEditing({ open })}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Editar transação</SheetTitle>
          </SheetHeader>

          <form id="edit-transaction-form" onSubmit={handleEditSubmit} className="flex flex-1 flex-col">
            <SheetBody className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={editDescription} onChange={(event) => setEditDescription(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <CategorySelect value={editCategoryId} onValueChange={setEditCategoryId} />
              </div>
              <div className="space-y-2">
                <Label>Cartão de crédito</Label>
                <CreditCardSelect value={editCreditCardId} onValueChange={setEditCreditCardId} placeholder="Nenhum (opcional)" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input value={editAmount} onChange={(event) => setEditAmount(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={editType} onValueChange={setEditType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="income">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{editStatus === "paid" ? "Data do pagamento" : "Data prevista"}</Label>
                  <DatePicker date={editDate} onChange={setEditDate} placeholder="Selecione" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notas internas</Label>
                <Textarea placeholder="Adicione um contexto adicional" disabled />
              </div>
            </SheetBody>

            <SheetFooter className="flex-row gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditing({ open: false })} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isProcessing} className="flex-1">
                {isProcessing ? "Salvando..." : "Salvar alterações"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

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

function formatTransactionDate(transaction: Transaction) {
  if (transaction.paymentDate) {
    return format(new Date(transaction.paymentDate), "dd/MM/yyyy", { locale: ptBR });
  }
  if (transaction.dueDate) {
    return `${format(new Date(transaction.dueDate), "dd/MM", { locale: ptBR })} (previsto)`;
  }
  return "—";
}
