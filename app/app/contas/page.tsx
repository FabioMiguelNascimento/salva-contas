"use client";

import { AppShell } from "@/components/app-shell";
import { AttachmentViewer } from "@/components/attachment-viewer";
import { DatePicker } from "@/components/date-picker";
import { DynamicIcon } from "@/components/dynamic-icon";
import { PageHeader } from "@/components/page-header";
import { SummaryCard } from "@/components/summary-card";
import { SummaryCardsGrid } from "@/components/summary-cards-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/currency-utils";
import { cn, getTransactionCategoryLabel, parseDateOnly, toDateOnlyString } from "@/lib/utils";
import { fetchPendingBills, updateTransaction } from "@/services/transactions";
import type { PendingBillsFilter, Transaction } from "@/types/finance";
import { useQuery } from "@tanstack/react-query";
import { differenceInCalendarDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, Calendar, CheckCircle2, FileText, MoreHorizontal, PencilLine, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const filterTabs = [
  { value: "all", label: "Todas" },
  { value: "overdue", label: "Atrasadas" },
  { value: "today", label: "Vencem hoje" },
  { value: "upcoming", label: "Próximos 3 dias" },
] as const;

function ContasPageContent() {
  const [activeFilter, setActiveFilter] = useState<PendingBillsFilter>("all");
  const [payDialog, setPayDialog] = useState<{ open: boolean; bill?: Transaction }>({ open: false });
  const [editSheet, setEditSheet] = useState<{ open: boolean; bill?: Transaction }>({ open: false });
  const [attachmentViewer, setAttachmentViewer] = useState<{ open: boolean; bill?: Transaction }>({ open: false });
  const [editDate, setEditDate] = useState<Date | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");

  const {
    data: pendingBillsData,
    isLoading,
    refetch: refetchPendingBills,
  } = useQuery({
    queryKey: ["pending-bills", activeFilter],
    queryFn: () =>
      fetchPendingBills({
        filter: activeFilter,
        page: 1,
        limit: 1000,
      }),
  });

  const summary = pendingBillsData?.summary ?? {
    total: 0,
    overdueAmount: 0,
    overdueCount: 0,
    todayCount: 0,
    upcomingCount: 0,
  };
  const filteredBills = pendingBillsData?.data ?? [];

  const openEditSheet = (bill: Transaction) => {
    setEditSheet({ open: true, bill });
    setEditDate(bill.dueDate ? parseDateOnly(bill.dueDate)! : undefined);
    setAmountInput(String(bill.amount));
    setDescriptionInput(bill.description);
  };

  const handleMarkAsPaid = async () => {
    if (!payDialog.bill) return;
    try {
      setIsProcessing(true);
      await updateTransaction(payDialog.bill.id, {
        status: "paid",
        paymentDate: toDateOnlyString(new Date()),
      });
      await refetchPendingBills();
      setPayDialog({ open: false });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editSheet.bill) return;

    const parsedAmount = Number(amountInput.replace(/,/g, "."));
    if (Number.isNaN(parsedAmount)) {
      return;
    }

    setIsProcessing(true);
    try {
      await updateTransaction(editSheet.bill.id, {
        description: descriptionInput,
        amount: parsedAmount,
        dueDate: toDateOnlyString(editDate),
      });
      await refetchPendingBills();
      setEditSheet({ open: false });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyTransactionId = async (bill: Transaction) => {
    try {
      await navigator.clipboard.writeText(bill.id);
      toast.success("ID da transação copiado");
    } catch {
      toast.error("Não foi possível copiar o ID");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        tag="Fluxo futuro"
        title="Contas a pagar"
        description="Monitore boletos, antecipações e despesas recorrentes. Integração com IA garante leitura precisa dos vencimentos."
      />

      <SummaryCardsGrid>
        <SummaryCard
          icon={Calendar}
          title="Total pendente"
          value={formatCurrency(summary.total)}
          helper="Inclui todos os lançamentos aguardando pagamento"
        />
        <SummaryCard
          icon={AlertTriangle}
          title="Atrasados"
          value={`${summary.overdueCount} boletos`}
          helper={formatCurrency(summary.overdueAmount)}
          variant="danger"
        />
        <SummaryCard
          icon={ShieldCheck}
          title="Vence hoje"
          value={`${summary.todayCount}`}
          helper="Priorize estes pagamentos"
          variant="warning"
        />
        <SummaryCard
          icon={CheckCircle2}
          title="Próximos 3 dias"
          value={`${summary.upcomingCount}`}
          helper="Organize o caixa com antecedência"
          variant="success"
        />
      </SummaryCardsGrid>

      <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label="Filtros de contas">
        {filterTabs.map((filter) => (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? "default" : "outline"}
            onClick={() => setActiveFilter(filter.value)}
            size="sm"
            className="w-full sm:w-auto"
            aria-pressed={activeFilter === filter.value}
          >
            {filter.label}
          </Button>
        ))}
        <Button variant="ghost" className="w-full text-sm sm:ml-auto sm:w-auto" asChild>
          <Link href="/app/extrato">Ver extrato</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agenda de pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="hidden md:block">
            <Table className="min-w-[1100px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Dias restantes</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredBills.length ? (
                  filteredBills.map((bill) => {
                    const categoryLabel = getTransactionCategoryLabel(bill);
                    return (
                      <TableRow key={bill.id}>
                        <TableCell className="max-w-[320px]">
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => copyTransactionId(bill)}
                              className="block w-full truncate font-semibold text-left hover:underline decoration-dotted"
                              title="Clique para copiar o ID da transação"
                            >
                              {bill.description}
                            </button>
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <DynamicIcon
                                name={bill.categoryRel?.icon ?? "tag"}
                                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                              />
                              <span className="truncate">{categoryLabel}</span>
                            </p>
                            {bill.createdByName ? (
                              <p className="text-[11px] text-muted-foreground">Criado por {bill.createdByName}</p>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge bill={bill} />
                        </TableCell>
                        <TableCell>{formatCurrency(bill.amount)}</TableCell>
                        <TableCell>{bill.dueDate ? format(parseDateOnly(bill.dueDate)!, "dd/MM", { locale: ptBR }) : "—"}</TableCell>
                        <TableCell>{formatDaysRemaining(bill)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Ações</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {bill.attachmentUrl && (
                                <DropdownMenuItem onClick={() => setAttachmentViewer({ open: true, bill })}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Ver anexo
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => setPayDialog({ open: true, bill })}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Marcar como pago
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditSheet(bill)}>
                                <PencilLine className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      Nenhuma conta encontrada para este filtro.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
          <div className="flex flex-col gap-3 md:hidden">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-32 w-full rounded-2xl" />
                ))
              : filteredBills.length
              ? filteredBills.map((bill) => {
                  const categoryLabel = getTransactionCategoryLabel(bill);
                  return (
                    <div key={bill.id} className="rounded-2xl border border-border/60 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <button
                            type="button"
                            onClick={() => copyTransactionId(bill)}
                            className="font-semibold text-left hover:underline decoration-dotted"
                            title="Clique para copiar o ID da transação"
                          >
                            {bill.description}
                          </button>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <DynamicIcon
                              name={bill.categoryRel?.icon ?? "tag"}
                              className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                            />
                            <span className="truncate">{categoryLabel}</span>
                          </p>
                          {bill.createdByName ? (
                            <p className="text-[11px] text-muted-foreground">Criado por {bill.createdByName}</p>
                          ) : null}
                        </div>
                        <StatusBadge bill={bill} />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Valor</p>
                          <p>{formatCurrency(bill.amount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Vence</p>
                          <p>{bill.dueDate ? format(parseDateOnly(bill.dueDate)!, "dd/MM") : "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Tempo</p>
                          <p>{formatDaysRemaining(bill)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        {bill.attachmentUrl && (
                          <Button variant="ghost" size="sm" onClick={() => setAttachmentViewer({ open: true, bill })}>
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        <Button className="flex-1" size="sm" onClick={() => setPayDialog({ open: true, bill })}>
                          Pagar
                        </Button>
                        <Button className="flex-1" variant="outline" size="sm" onClick={() => openEditSheet(bill)}>
                          Editar
                        </Button>
                      </div>
                    </div>
                  );
                })
              : (
                  <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                    Nenhuma conta para este filtro.
                  </div>
                )}
          </div>
        </CardContent>
      </Card>

      <Sheet open={payDialog.open} onOpenChange={(open) => setPayDialog({ open })}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Confirmar pagamento</SheetTitle>
            <SheetDescription>
              Esta ação irá marcar a conta como paga.
            </SheetDescription>
          </SheetHeader>

          <SheetBody>
            <p className="text-sm text-muted-foreground">
              {payDialog.bill ? `Deseja marcar "${payDialog.bill.description}" como pago?` : ""}
            </p>
          </SheetBody>

          <SheetFooter className="flex-row gap-2">
            <Button variant="ghost" onClick={() => setPayDialog({ open: false })} disabled={isProcessing} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleMarkAsPaid} disabled={isProcessing} className="flex-1">
              {isProcessing ? "Processando..." : "Confirmar"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={editSheet.open} onOpenChange={(open) => setEditSheet({ open })}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Editar conta</SheetTitle>
          </SheetHeader>

          <form id="edit-bill-form" onSubmit={handleEditSubmit} className="flex flex-1 flex-col">
            <SheetBody className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={descriptionInput} onChange={(event) => setDescriptionInput(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input value={amountInput} onChange={(event) => setAmountInput(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Data de vencimento</Label>
                <DatePicker date={editDate} onChange={setEditDate} placeholder="Selecione a data" />
              </div>
            </SheetBody>

            <SheetFooter className="flex-row gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditSheet({ open: false })} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isProcessing} className="flex-1">
                {isProcessing ? "Salvando..." : "Salvar"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AttachmentViewer
        open={attachmentViewer.open}
        onOpenChange={(open) => setAttachmentViewer({ open, bill: undefined })}
        attachmentUrl={attachmentViewer.bill?.attachmentUrl}
        attachmentOriginalName={attachmentViewer.bill?.attachmentOriginalName}
        attachmentMimeType={attachmentViewer.bill?.attachmentMimeType}
      />
    </div>
  );
}

function StatusBadge({ bill }: { bill: Transaction }) {
  const meta = getStatusMeta(bill);
  return (
    <Badge className={cn("border-transparent text-xs", meta.className)}>{meta.label}</Badge>
  );
}

function getStatusMeta(bill: Transaction) {
  if (!bill.dueDate) {
    return {
      label: "EM ABERTO",
      className: "bg-slate-200 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
    };
  }
  const diff = differenceInCalendarDays(parseDateOnly(bill.dueDate)!, new Date());
  if (diff < 0) {
    return { label: "ATRASADO", className: "bg-destructive/15 text-destructive" };
  }
  if (diff === 0) {
    return { label: "VENCE HOJE", className: "bg-amber-200 text-amber-900" };
  }
  if (diff < 3) {
    return { label: "PRÓXIMO", className: "bg-yellow-200 text-yellow-900" };
  }
  return { label: "EM ABERTO", className: "bg-emerald-200 text-emerald-900" };
}

function formatDaysRemaining(bill: Transaction) {
  if (!bill.dueDate) return "—";
  const diff = differenceInCalendarDays(parseDateOnly(bill.dueDate)!, new Date());
  const prefix = diff > 0 ? "+" : "";
  return `${prefix}${diff} dias`;
}

export default function ContasPage() {
  return (
    <AppShell>
      <ContasPageContent />
    </AppShell>
  );
}
