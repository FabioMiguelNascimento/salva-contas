"use client";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, CalendarClock, CreditCard, HandCoins, PiggyBank, ReceiptText, Repeat } from "lucide-react";
import Link from "next/link";

const reportCards = [
  {
    title: "Contas a pagar",
    description: "Relatorios de vencimentos, atrasos e recorrencia de pagamentos.",
    href: "/app/relatorios/contas",
    icon: CalendarClock,
  },
  {
    title: "Cartoes",
    description: "Uso de limite, gastos por cartao e tendencias de fatura.",
    href: "/app/relatorios/cartoes",
    icon: CreditCard,
  },
  {
    title: "Transacoes",
    description: "Movimentacoes por periodo, categoria, status e tipo.",
    href: "/app/relatorios/transacoes",
    icon: ReceiptText,
  },
  {
    title: "Assinaturas",
    description: "Custos recorrentes, renovacoes e peso no fluxo mensal.",
    href: "/app/relatorios/assinaturas",
    icon: Repeat,
  },
  {
    title: "Orcamentos",
    description: "Acompanhamento de metas, consumo e desvios por categoria.",
    href: "/app/relatorios/orcamentos",
    icon: HandCoins,
  },
  {
    title: "Cofrinhos",
    description: "Aportes, evolucao de saldo e progresso por objetivo.",
    href: "/app/relatorios/cofrinhos",
    icon: PiggyBank,
  },
];

export default function RelatoriosPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          tag="Inteligencia"
          title="Hub de relatorios"
          description="Acesse relatorios por funcionalidade e exporte em CSV ou PDF conforme seu plano."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reportCards.map((report) => {
            const Icon = report.icon;
            return (
              <Link key={report.href} href={report.href}>
                <Card className="h-full transition-colors hover:border-primary/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Icon className="h-4 w-4" />
                      {report.title}
                    </CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Abrir relatorio</span>
                    <BarChart3 className="h-4 w-4" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
