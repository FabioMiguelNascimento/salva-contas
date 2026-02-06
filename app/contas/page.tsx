"use client";

import { AttachmentViewerDialog } from "@/components/attachments/attachment-viewer-dialog";
import { DatePicker } from "@/components/date-picker";
import { PageHeader } from "@/components/page-header";
import { SummaryCard } from "@/components/summary-card";
import { SummaryCardsGrid } from "@/components/summary-cards-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFinance } from "@/hooks/use-finance";
import { useTransactionAttachments } from "@/hooks/use-transaction-attachments";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import { cn, getTransactionCategoryLabel } from "@/lib/utils";
import type { Transaction } from "@/types/finance";
import { differenceInCalendarDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, Calendar, CheckCircle2, Paperclip, PencilLine, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const filterTabs = [
  { value: "all", label: "Todas" },
  { value: "overdue", label: "Atrasadas" },
  { value: "today", label: "Vencem hoje" },
  { value: "upcoming", label: "Próximos 3 dias" },
];

export default function ContasPage() {
  const { pendingBills, markAsPaid, updateExistingTransaction, isLoading } = useFinance();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [payDialog, setPayDialog] = useState<{ open: boolean; bill?: Transaction }>({ open: false });
  const [editSheet, setEditSheet] = useState<{ open: boolean; bill?: Transaction }>({ open: false });
  const [editDate, setEditDate] = useState<Date | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [attachmentsDialog, setAttachmentsDialog] = useState<{ open: boolean; transactionId?: string }>({ open: false });
  const { attachments, isLoading: isLoadingAttachments, loadAttachments, reset } = useTransactionAttachments();

  const summary = useMemo(() => {
    const overdue = pendingBills.filter((bill) => bill.dueDate && differenceInCalendarDays(new Date(bill.dueDate), new Date()) < 0);
    const today = pendingBills.filter((bill) => bill.dueDate && differenceInCalendarDays(new Date(bill.dueDate), new Date()) === 0);
    const soon = pendingBills.filter((bill) => {
      if (!bill.dueDate) return false;
      const diff = differenceInCalendarDays(new Date(bill.dueDate), new Date());
      return diff > 0 && diff <= 3;
    });

    return {
      total: pendingBills.reduce((sum, bill) => sum + bill.amount, 0),
      overdueAmount: overdue.reduce((sum, bill) => sum + bill.amount, 0),
      overdueCount: overdue.length,
      todayCount: today.length,
      upcomingCount: soon.length,
    };
  }, [pendingBills]);

  const filteredBills = useMemo(() => {
    return pendingBills.filter((bill) => {
      if (!bill.dueDate) return activeFilter === "all";
      const diff = differenceInCalendarDays(new Date(bill.dueDate), new Date());
      if (activeFilter === "overdue") return diff < 0;
      if (activeFilter === "today") return diff === 0;
      if (activeFilter === "upcoming") return diff > 0 && diff <= 3;
      return true;
    });
  }, [pendingBills, activeFilter]);

  const openEditSheet = (bill: Transaction) => {
    setEditSheet({ open: true, bill });
    setEditDate(bill.dueDate ? new Date(bill.dueDate) : undefined);
    setAmountInput(String(bill.amount));
    setDescriptionInput(bill.description);
  };

  const handleMarkAsPaid = async () => {
    if (!payDialog.bill) return;
    try {
      setIsProcessing(true);
      await markAsPaid(payDialog.bill.id);
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
      await updateExistingTransaction(editSheet.bill.id, {
        description: descriptionInput,
        amount: parsedAmount,
        dueDate: editDate ? editDate.toISOString() : null,
      });
      setEditSheet({ open: false });
    } finally {
      setIsProcessing(false);
    }
  };

  const openAttachments = async (transactionId: string) => {
    setAttachmentsDialog({ open: true, transactionId });
    await loadAttachments(transactionId);
  };

  const closeAttachments = () => {
    setAttachmentsDialog({ open: false });
    reset();
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
          value={currencyFormatter.format(summary.total)}
          helper="Inclui todos os lançamentos aguardando pagamento"
        />
        <SummaryCard
          icon={AlertTriangle}
          title="Atrasados"
          value={`${summary.overdueCount} boletos`}
          helper={currencyFormatter.format(summary.overdueAmount)}
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

      <div className="flex flex-wrap gap-3">
        {filterTabs.map((filter) => (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? "default" : "outline"}
            onClick={() => setActiveFilter(filter.value)}
            size="sm"
          >
            {filter.label}
          </Button>
        ))}
        <Button variant="ghost" className="ml-auto text-sm" asChild>
          <Link href="/extrato">Ver extrato</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agenda de pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="hidden md:block">
            <Table>
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
                        <TableCell>
                          <div>
                            <p className="font-semibold">{bill.description}</p>
                            <p className="text-xs text-muted-foreground">{categoryLabel}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge bill={bill} />
                        </TableCell>
                        <TableCell>{currencyFormatter.format(bill.amount)}</TableCell>
                        <TableCell>{bill.dueDate ? format(new Date(bill.dueDate), "dd/MM", { locale: ptBR }) : "—"}</TableCell>
                        <TableCell>{formatDaysRemaining(bill)}</TableCell>
                        <TableCell className="flex justify-end gap-2">
                          {(bill._count?.attachments ?? 0) > 0 && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => openAttachments(bill.id)}
                              className="relative"
                            >
                              <Paperclip className="h-3.5 w-3.5" />
                              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                {bill._count.attachments}
                              </span>
                            </Button>
                          )}
                          <Button size="sm" onClick={() => setPayDialog({ open: true, bill })}>
                            Pagar agora
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openEditSheet(bill)}>
                            <PencilLine className="mr-2 h-3.5 w-3.5" /> Editar
                          </Button>
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
                          <p className="font-semibold">{bill.description}</p>
                          <p className="text-xs text-muted-foreground">{categoryLabel}</p>
                        </div>
                        <StatusBadge bill={bill} />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Valor</p>
                          <p>{currencyFormatter.format(bill.amount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Vence</p>
                          <p>{bill.dueDate ? format(new Date(bill.dueDate), "dd/MM") : "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Tempo</p>
                          <p>{formatDaysRemaining(bill)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button className="flex-1" size="sm" onClick={() => setPayDialog({ open: true, bill })}>
                          Pagar
                        </Button>
                        <Button className="flex-1" variant="outline" size="sm" onClick={() => openEditSheet(bill)}>
                          Editar
                        </Button>
                        {(bill._count?.attachments ?? 0) > 0 && (
                          <Button variant="ghost" size="sm" onClick={() => openAttachments(bill.id)} className="relative">
                            <Paperclip className="h-4 w-4" />
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                              {bill._count.attachments}
                            </span>
                          </Button>
                        )}
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

      <AttachmentViewerDialog
        open={attachmentsDialog.open}
        onOpenChange={closeAttachments}
        attachments={attachments}
        isLoading={isLoadingAttachments}
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
  const diff = differenceInCalendarDays(new Date(bill.dueDate), new Date());
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
  const diff = differenceInCalendarDays(new Date(bill.dueDate), new Date());
  const prefix = diff > 0 ? "+" : "";
  return `${prefix}${diff} dias`;
}
