"use client";

import CategoryDonut from "@/components/category-donut";
import ChartCard from "@/components/chart-card";
import { DynamicIcon } from "@/components/dynamic-icon";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import type { CategoryBreakdownItem, TransactionCategory } from "@/types/finance";
import Link from "next/link";

export interface CategoryBreakdownCardProps {
  breakdown: CategoryBreakdownItem[];
  total: number;
  categoriesMeta: TransactionCategory[];
  topN?: number;
  isLoading?: boolean;
}

const chartColors = [
  "#10b981",
  "#6366f1",
  "#f97316",
  "#0ea5e9",
  "#ec4899",
];

export default function CategoryBreakdownCard({ breakdown, total, categoriesMeta, topN = 4, isLoading }: CategoryBreakdownCardProps) {
  return (
    <ChartCard title="Gastos por categoria">
      {isLoading ? (
        <div className="flex items-center justify-center p-6">
          <div className="h-32 w-32 sm:h-44 sm:w-44 rounded-full bg-muted/30" />
        </div>
      ) : (
        <CategoryDonut data={breakdown} total={total} />
      )}

      <div className="w-full mt-4 space-y-2 sm:space-y-3">
        {breakdown.slice(0, topN).map((item, index) => {
          const matched = categoriesMeta.find((c) => c.name === item.category);
          const color = chartColors[index % chartColors.length];

          return (
            <Link
              key={item.category}
              href={`/extrato?categoryId=${encodeURIComponent(matched?.id ?? item.category)}`}
              className="flex items-center justify-between gap-2 hover:bg-muted/30 rounded-md px-2 py-1"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {matched?.icon ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
                    <DynamicIcon name={matched.icon} className="h-3 w-3 text-white" />
                  </span>
                ) : (
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                )}

                <span className="text-sm font-medium truncate">{item.category}</span>
              </div>
              <span className="text-sm text-muted-foreground shrink-0">{currencyFormatter.format(item.total)}</span>
            </Link>
          );
        })}
      </div>
    </ChartCard>
  );
}
