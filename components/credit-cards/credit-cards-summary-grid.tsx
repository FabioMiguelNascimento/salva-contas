import { SummaryCardsGrid } from "@/components/summary-cards-grid";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency-utils";
import { CreditCard as CreditCardIcon, TrendingDown, Wallet } from "lucide-react";

interface CreditCardStats {
  totalCards: number;
  totalDebitCards: number;
  totalLimit: number;
  totalAvailable: number;
  totalUsed: number;
  highUsageCards: number;
}

interface CreditCardsSummaryGridProps {
  stats: CreditCardStats;
}

export function CreditCardsSummaryGrid({ stats }: CreditCardsSummaryGridProps) {
  return (
    <SummaryCardsGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-white shadow-sm border border-gray-100 h-[230px] md:h-60 rounded-none border-r">
        <CardContent className="h-full flex flex-col p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-600">
            <CreditCardIcon className="h-4 w-4" />
            Cartoes cadastrados
          </div>
          <div className="space-y-3">
            <CardStat label="Credito ativos" value={stats.totalCards} />
            <CardStat label="Debito ativos" value={stats.totalDebitCards} />
          </div>
          <div className="flex-1" />
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border border-gray-100 h-[230px] md:h-60 rounded-none border-r">
        <CardContent className="h-full flex flex-col p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-600">
            <Wallet className="h-4 w-4" />
            Limites de credito
          </div>
          <div className="space-y-3">
            <CardStat label="Limite total" value={formatCurrency(stats.totalLimit)} />
            <CardStat label="Limite disponivel" value={formatCurrency(stats.totalAvailable)} />
          </div>
          <div className="flex-1" />
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border border-gray-100 h-[230px] md:h-60 rounded-none border-r">
        <CardContent className="h-full flex flex-col p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-600">
            <TrendingDown className="h-4 w-4" />
            Uso e alerta
          </div>
          <div className="space-y-3">
            <CardStat label="Total utilizado" value={formatCurrency(stats.totalUsed)} />
            <CardStat label="Limite alto" value={stats.highUsageCards} />
          </div>
          <div className="flex-1" />
        </CardContent>
      </Card>
    </SummaryCardsGrid>
  );
}

function CardStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-base font-semibold">{value}</span>
    </div>
  );
}
