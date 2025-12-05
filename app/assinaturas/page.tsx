"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFinance } from "@/hooks/use-finance";
import type { Subscription, SubscriptionFrequency } from "@/types/finance";
import { Loader2, PlusCircle, Shield, Zap } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useMemo, useState } from "react";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const frequencyOptions: Array<{ value: SubscriptionFrequency; label: string; helper: string }> = [
  { value: "monthly", label: "Mensal", helper: "Repete em um dia específico todo mês" },
  { value: "weekly", label: "Semanal", helper: "Repete em um dia fixo da semana" },
  { value: "yearly", label: "Anual", helper: "Repete em um dia e mês específicos" },
];

const weekDays = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

const months = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

export default function SubscriptionsPage() {
  const { subscriptions, isLoading, createSubscriptionRule } = useFinance();
  const [activeFilter, setActiveFilter] = useState<"all" | SubscriptionFrequency>("all");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [frequency, setFrequency] = useState<SubscriptionFrequency>("monthly");
  const [dayOfMonth, setDayOfMonth] = useState(15);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [month, setMonth] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filteredSubscriptions = useMemo(() => {
    if (activeFilter === "all") {
      return subscriptions;
    }
    return subscriptions.filter((item) => item.frequency === activeFilter);
  }, [subscriptions, activeFilter]);

  const stats = useMemo(() => {
    const totalActive = subscriptions.filter((item) => item.isActive).length;
    const totalAmount = subscriptions.reduce((sum, item) => sum + item.amount, 0);
    const byFrequency = subscriptions.reduce<Record<string, number>>((acc, item) => {
      acc[item.frequency] = (acc[item.frequency] ?? 0) + 1;
      return acc;
    }, {});
    return { totalActive, totalAmount, byFrequency };
  }, [subscriptions]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!description.trim() || !amount.trim() || !categoryId.trim()) {
      setFormError("Preencha descrição, valor e categoria.");
      return;
    }

    const parsedAmount = Number(amount.replace(/,/g, "."));
    if (Number.isNaN(parsedAmount)) {
      setFormError("Informe um valor válido.");
      return;
    }

    if ((frequency === "monthly" || frequency === "yearly") && (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 31)) {
      setFormError("O dia do mês precisa estar entre 1 e 31.");
      return;
    }

    if (frequency === "weekly" && (dayOfWeek < 0 || dayOfWeek > 6)) {
      setFormError("Selecione um dia da semana válido.");
      return;
    }

    if (frequency === "yearly" && (month < 1 || month > 12)) {
      setFormError("Selecione um mês válido.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createSubscriptionRule({
        description: description.trim(),
        amount: parsedAmount,
        categoryId: categoryId.trim(),
        frequency,
        dayOfMonth: frequency === "weekly" ? null : dayOfMonth,
        dayOfWeek: frequency === "weekly" ? dayOfWeek : null,
        month: frequency === "yearly" ? month : null,
        isActive,
      });
      setDescription("");
      setAmount("");
      setCategoryId("");
      setDayOfMonth(15);
      setDayOfWeek(1);
      setMonth(1);
      setIsActive(true);
      setSuccessMessage("Assinatura criada com sucesso!");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível criar a assinatura agora.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Recorrências</p>
        <h1 className="text-3xl font-semibold">Assinaturas e débitos automáticos</h1>
        <p className="text-sm text-muted-foreground">
          Configure regras para Netflix, aluguel e outros serviços para que o AI Finance gere as transações sem digitação.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Zap}
          label="Assinaturas ativas"
          value={stats.totalActive}
          helper="Regras prontas para gerar lançamentos"
        />
        <SummaryCard
          icon={Shield}
          label="Comprometido/mês"
          value={currency.format(stats.totalAmount)}
          helper="Soma considerando valores atuais"
        />
        {frequencyOptions.slice(0, 2).map((option) => (
          <SummaryCard
            key={option.value}
            icon={PlusCircle}
            label={`Frequência ${option.label}`}
            value={stats.byFrequency[option.value] ?? 0}
            helper={option.helper}
          />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Assinaturas configuradas</CardTitle>
              <CardDescription>Gerencie e acompanhe todas as recorrências automatizadas.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("all")}
              >
                Todas
              </Button>
              {frequencyOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={activeFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-14 w-full animate-pulse rounded-xl bg-muted/50" />
                ))}
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                Nenhuma assinatura cadastrada ainda. Utilize o formulário ao lado para criar a primeira regra.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Frequência</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscriptions.map((subscription) => (
                        <SubscriptionRow key={subscription.id} subscription={subscription} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="grid gap-3 md:hidden">
                  {filteredSubscriptions.map((subscription) => (
                    <SubscriptionCard key={subscription.id} subscription={subscription} />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nova assinatura</CardTitle>
            <CardDescription>Informe os parâmetros para gerar o lançamento automaticamente.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex.: Netflix" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <Input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="120,00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoria (ID)</Label>
                <Input id="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} placeholder="Informe o UUID da categoria" required />
                <p className="text-xs text-muted-foreground">Use o ID exibido no painel de categorias da API.</p>
              </div>
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select value={frequency} onValueChange={(value: SubscriptionFrequency) => setFrequency(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(frequency === "monthly" || frequency === "yearly") && (
                <div className="space-y-2">
                  <Label>Dia do mês</Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={dayOfMonth}
                    onChange={(event) => setDayOfMonth(Number(event.target.value))}
                  />
                </div>
              )}
              {frequency === "weekly" && (
                <div className="space-y-2">
                  <Label>Dia da semana</Label>
                  <Select value={String(dayOfWeek)} onValueChange={(value) => setDayOfWeek(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weekDays.map((day) => (
                        <SelectItem key={day.value} value={String(day.value)}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {frequency === "yearly" && (
                <div className="space-y-2">
                  <Label>Mês</Label>
                  <Select value={String(month)} onValueChange={(value) => setMonth(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((item) => (
                        <SelectItem key={item.value} value={String(item.value)}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <label className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
                <Checkbox checked={isActive} onCheckedChange={(checked) => setIsActive(Boolean(checked))} />
                <div>
                  <p className="font-medium">Ativar assinatura</p>
                  <p className="text-sm text-muted-foreground">Desmarque para guardar a regra sem gerar faturas.</p>
                </div>
              </label>
              {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}
              {successMessage && <p className="text-sm font-medium text-emerald-600">{successMessage}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Cadastrar assinatura
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SubscriptionRow({ subscription }: { subscription: Subscription }) {
  return (
    <TableRow>
      <TableCell>
        <div>
          <p className="font-semibold">{subscription.description}</p>
          <p className="text-xs text-muted-foreground">Criado em {subscription.createdAt ? new Intl.DateTimeFormat("pt-BR").format(new Date(subscription.createdAt)) : "—"}</p>
        </div>
      </TableCell>
      <TableCell>{currency.format(subscription.amount)}</TableCell>
      <TableCell>{subscription.category?.name ?? "–"}</TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">{getFrequencyLabel(subscription.frequency)}</Badge>
      </TableCell>
      <TableCell>
        <Badge className={subscription.isActive ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}>
          {subscription.isActive ? "Ativa" : "Inativa"}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  return (
    <div className="rounded-2xl border border-border/60 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{subscription.description}</p>
          <p className="text-xs text-muted-foreground">{subscription.category?.name ?? "Sem categoria"}</p>
        </div>
        <Badge variant="outline" className="text-xs">{getFrequencyLabel(subscription.frequency)}</Badge>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <strong>{currency.format(subscription.amount)}</strong>
        <Badge className={subscription.isActive ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}>
          {subscription.isActive ? "Ativa" : "Inativa"}
        </Badge>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Dia programado: {getScheduleLabel(subscription)}
      </p>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: number | string;
  helper: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-6">
        <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function getFrequencyLabel(frequency: SubscriptionFrequency) {
  switch (frequency) {
    case "weekly":
      return "Semanal";
    case "monthly":
      return "Mensal";
    case "yearly":
      return "Anual";
    default:
      return frequency;
  }
}

function getScheduleLabel(subscription: Subscription) {
  if (subscription.frequency === "weekly" && subscription.dayOfWeek !== null && subscription.dayOfWeek !== undefined) {
    return weekDays.find((day) => day.value === subscription.dayOfWeek)?.label ?? "Dia não definido";
  }

  if (subscription.frequency === "yearly") {
    const monthLabel = subscription.month ? months.find((item) => item.value === subscription.month)?.label : null;
    return subscription.dayOfMonth && monthLabel
      ? `${subscription.dayOfMonth} de ${monthLabel}`
      : "Periodicidade incompleta";
  }

  if (subscription.frequency === "monthly" && subscription.dayOfMonth) {
    return `Todo dia ${subscription.dayOfMonth}`;
  }

  return "Periodicidade não configurada";
}
