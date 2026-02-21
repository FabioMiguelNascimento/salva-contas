"use client"

import { currencyFormatter } from "@/lib/subscriptions/constants";
import { useRouter } from "next/navigation";

export type CategoryDonutItem = { category: string; total: number };

import ChartTooltipContent from "@/components/ui/chart-tooltip";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export function CategoryDonut({ data, total }: { data: CategoryDonutItem[]; total: number }) {
  const router = useRouter();
  const colors = ["#10b981", "#6366f1", "#f97316", "#0ea5e9", "#ec4899"];

  const pieData = data.map((d, i) => ({ name: d.category, value: d.total, color: colors[i % colors.length] }));

  if (total === 0) {
    // fallback visual when there's no data
    return (
      <div className="flex flex-col items-center gap-2 w-full overflow-hidden">
        <div className="relative h-32 w-32 sm:h-44 sm:w-44 shrink-0">
          <div className="h-full w-full rounded-full bg-muted/30" />
          <div className="absolute inset-4 sm:inset-6 flex flex-col items-center justify-center rounded-full bg-card text-center">
            <span className="text-[8px] sm:text-xs uppercase tracking-widest text-muted-foreground">Total</span>
            <strong className="text-sm sm:text-lg">{currencyFormatter.format(total)}</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full overflow-hidden">
      <div className="relative h-32 w-32 sm:h-44 sm:w-44 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius="65%"
              outerRadius="90%"
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip wrapperStyle={{zIndex: 1000}} content={<ChartTooltipContent />} formatter={(value: any) => currencyFormatter.format(value)} />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-4 sm:inset-6 flex flex-col items-center justify-center rounded-full bg-card text-center z-0 pointer-events-none">
          <span className="text-[8px] sm:text-xs uppercase tracking-widest text-muted-foreground">Total</span>
          <strong className="text-sm sm:text-lg">{currencyFormatter.format(total)}</strong>
        </div>
      </div>
    </div>
  );
}

export default CategoryDonut;
