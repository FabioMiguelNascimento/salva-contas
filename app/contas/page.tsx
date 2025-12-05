"use client";

import { DatePicker } from "@/components/date-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFinance } from "@/hooks/use-finance";
import { cn, getTransactionCategoryLabel } from "@/lib/utils";
import type { Transaction } from "@/types/finance";
import { differenceInCalendarDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, Calendar, CheckCircle2, PencilLine, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { useMemo, useState } from "react";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Fluxo futuro</p>
        <h1 className="text-3xl font-semibold">Contas a pagar</h1>
        <p className="text-sm text-muted-foreground">
          Monitore boletos, antecipações e despesas recorrentes. Integração com IA garante leitura precisa dos vencimentos.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Calendar}
          label="Total pendente"
          value={currency.format(summary.total)}
          highlight="Inclui todos os lançamentos aguardando pagamento"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Atrasados"
          value={`${summary.overdueCount} boletos`}
          highlight={currency.format(summary.overdueAmount)}
          variant="danger"
        />
        <SummaryCard
          icon={ShieldCheck}
          label="Vence hoje"
          value={`${summary.todayCount}`}
          highlight="Priorize estes pagamentos"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Próximos 3 dias"
          value={`${summary.upcomingCount}`}
          highlight="Organize o caixa com antecedência"
        />
      </section>

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
                        <TableCell>{currency.format(bill.amount)}</TableCell>
                        <TableCell>{bill.dueDate ? format(new Date(bill.dueDate), "dd/MM", { locale: ptBR }) : "—"}</TableCell>
                        <TableCell>{formatDaysRemaining(bill)}</TableCell>
                        <TableCell className="flex justify-end gap-2">
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
                          <p>{currency.format(bill.amount)}</p>
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

      <Dialog open={payDialog.open} onOpenChange={(open) => setPayDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar pagamento</DialogTitle>
            <DialogDescription>
              {payDialog.bill ? `Marcar "${payDialog.bill.description}" como pago?` : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPayDialog({ open: false })} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleMarkAsPaid} disabled={isProcessing}>
              {isProcessing ? "Processando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={editSheet.open} onOpenChange={(open) => setEditSheet({ open })}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Editar conta</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleEditSubmit} className="mt-6 space-y-4">
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
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditSheet({ open: false })}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  highlight,
  variant = "default",
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  highlight: string;
  variant?: "default" | "danger";
}) {
  return (
    <Card className={cn(variant === "danger" && "border-destructive/30 bg-destructive/5") }>
      <CardContent className="flex items-center gap-4 py-6">
        <div
          className={cn(
            "rounded-2xl p-3",
            variant === "danger" ? "bg-destructive/15 text-destructive" : "bg-emerald-500/10 text-emerald-600"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{highlight}</p>
        </div>
      </CardContent>
    </Card>
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
