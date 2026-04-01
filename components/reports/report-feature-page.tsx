"use client";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SummaryCard } from "@/components/summary-card";
import { SummaryCardsGrid } from "@/components/summary-cards-grid";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useReportExport } from "@/hooks/reports/use-report-export";
import { useReportFilters } from "@/hooks/reports/use-report-filters";
import { useReportPreview } from "@/hooks/reports/use-report-preview";
import { useReportTable } from "@/hooks/reports/use-report-table";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { parseDate } from "@/lib/date-utils";
import { getAvailableYears, monthsShort } from "@/lib/subscriptions/constants";
import { cn } from "@/lib/utils";
import type { ReportFeature } from "@/services/reports";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight, CalendarIcon, DollarSign, FileSpreadsheet, FileText, Filter, Lock, Wallet2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";

interface ReportFeaturePageProps {
  feature: ReportFeature;
  tag: string;
  title: string;
  description: string;
  sourceRoute: string;
}

export function ReportFeaturePage({ feature, tag, title, description, sourceRoute }: ReportFeaturePageProps) {
  const { user } = useAuth();
  const canExport = (user?.planTier ?? "FREE") !== "FREE";
  const years = getAvailableYears();
  const isMobile = useIsMobile();

  const { form, setForm, appliedFilters, submitFilters, clearPeriod } = useReportFilters();
  const { preview, isPreviewLoading, previewError } = useReportPreview(feature, appliedFilters);
  const { handleExport, exportingFormat, isExporting } = useReportExport(feature, appliedFilters);
  const { summary, visibleIndexes, formatMoney, formatHeaderLabel, formatCellValue } = useReportTable(preview);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRange = useMemo<DateRange | undefined>(() => {
    if (!form.startDate && !form.endDate) return undefined;

    return {
      from: parseDate(form.startDate),
      to: parseDate(form.endDate),
    };
  }, [form.endDate, form.startDate]);

  const hasDateRange = Boolean(form.startDate || form.endDate);
  const rangeLabel = useMemo(() => {
    if (form.startDate && form.endDate) {
      const from = parseDate(form.startDate);
      const to = parseDate(form.endDate);
      if (from && to) {
        return `${format(from, "dd/MM/yyyy")} - ${format(to, "dd/MM/yyyy")}`;
      }
    }

    if (form.startDate) {
      const from = parseDate(form.startDate);
      if (from) return format(from, "dd/MM/yyyy");
    }

    return "Selecionar período";
  }, [form.endDate, form.startDate]);

  const handleRangeChange = (range: DateRange | undefined) => {
    if (!range?.from) {
      setForm((prev) => ({ ...prev, startDate: "", endDate: "" }));
      return;
    }

    const from = range.from;
    const to = range.to ?? range.from;

    setForm((prev) => ({
      ...prev,
      startDate: format(from, "yyyy-MM-dd"),
      endDate: format(to, "yyyy-MM-dd"),
    }));
  };

  const handleSearch = () => {
    setIsSubmitting(true);
    submitFilters();
    setTimeout(() => setIsSubmitting(false), 0);
  };

  const onExport = async (formatType: "csv" | "pdf") => {
    if (!canExport) return;

    try {
      await handleExport(formatType);
      const { toast } = await import("sonner");
      toast.success(`Relatório ${formatType.toUpperCase()} baixado com sucesso.`);
    } catch (error: any) {
      const { toast } = await import("sonner");
      toast.error(error?.message ?? `Não foi possível exportar ${formatType.toUpperCase()}.`);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader tag={tag} title={title} description={description} />

        <SummaryCardsGrid className="h-[170px] md:h-[190px]">
          <SummaryCard
            icon={Wallet2}
            title="Registros"
            value={summary.records}
            helper="na visualização atual"
            variant="default"
            isLoading={isPreviewLoading}
          />
          <SummaryCard
            icon={DollarSign}
            title="Total"
            value={formatMoney(summary.total)}
            helper="soma do período"
            variant="default"
            isLoading={isPreviewLoading}
          />
          <SummaryCard
            icon={DollarSign}
            title="Total Pago"
            value={formatMoney(summary.paid)}
            helper="status pago"
            variant="success"
            isLoading={isPreviewLoading}
          />
          <SummaryCard
            icon={DollarSign}
            title="Total Pendente"
            value={formatMoney(summary.pending)}
            helper="status pendente"
            variant="danger"
            isLoading={isPreviewLoading}
          />
        </SummaryCardsGrid>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="size-4" />
              Filtros
            </CardTitle>
            <CardDescription>
              Ajuste os filtros e clique em Buscar para atualizar a visualização.
            </CardDescription>
          </CardHeader>
         <CardContent className="space-y-4">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    
    <div className="flex flex-wrap items-end gap-3 lg:flex-nowrap">
      
      <div className="w-full sm:w-[120px]">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Mês</label>
        <Select
          value={String(form.month)}
          onValueChange={(v) => setForm((prev) => ({ ...prev, month: Number(v) }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {monthsShort.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[100px]">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ano</label>
        <Select
          value={String(form.year)}
          onValueChange={(v) => setForm((prev) => ({ ...prev, year: Number(v) }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[130px]">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Status</label>
        <Select
          value={form.status}
          onValueChange={(v) => setForm((prev) => ({ ...prev, status: v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[260px]">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Período</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="dashboard-filter-range"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !hasDateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon data-icon="inline-start" className="mr-2 size-4" />
              <span className="truncate">{rangeLabel}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={selectedRange}
              onSelect={handleRangeChange}
              locale={ptBR}
              numberOfMonths={isMobile ? 1 : 2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSearch} disabled={isSubmitting}>
          Buscar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearPeriod}
          disabled={!form.startDate && !form.endDate}
          className="px-2 text-muted-foreground hover:text-foreground"
        >
          Limpar
        </Button>
      </div>
    </div>

    <div className="flex w-full sm:w-auto items-center gap-2 pt-2 lg:pt-0">
      <div className="hidden h-8 w-px bg-border lg:block mx-2" />
      <Button
        size="sm"
        variant="outline"
        disabled={!canExport || isExporting}
        onClick={() => void onExport("csv")}
      >
        <FileSpreadsheet data-icon="inline-start" className="mr-2 size-4" />
        {exportingFormat === "csv" ? "Exportando..." : "CSV"}
        {!canExport ? <Lock data-icon="inline-end" className="ml-2 size-3 text-muted-foreground" /> : null}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={!canExport || isExporting}
        onClick={() => void onExport("pdf")}
      >
        <FileText data-icon="inline-start" className="mr-2 size-4" />
        {exportingFormat === "pdf" ? "Exportando..." : "PDF"}
        {!canExport ? <Lock data-icon="inline-end" className="ml-2 size-3 text-muted-foreground" /> : null}
      </Button>
    </div>
  </div>
</CardContent>
        </Card>

        <Card>
          <CardContent>
            {isPreviewLoading ? (
              <p className="text-sm text-muted-foreground">Carregando prévia...</p>
            ) : previewError ? (
              <p className="text-sm text-destructive">{previewError}</p>
            ) : !preview || preview.rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum dado encontrado para este relatório.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {visibleIndexes.map((headerIndex) => {
                      const header = preview.headers[headerIndex];
                      return <TableHead key={header}>{formatHeaderLabel(header)}</TableHead>;
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.map((row, rowIndex) => (
                    <TableRow key={`row-${rowIndex}`}>
                      {visibleIndexes.map((cellIndex) => {
                        const header = preview.headers[cellIndex];
                        const cell = row[cellIndex] ?? null;
                        return <TableCell key={`cell-${rowIndex}-${cellIndex}`}>{formatCellValue(header, cell)}</TableCell>;
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{preview?.rows.length ?? 0} registro(s) encontrado(s)</span>
              <Button variant="link" className="h-auto p-0" asChild>
                <Link href={sourceRoute}>
                  Abrir tela de origem
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
