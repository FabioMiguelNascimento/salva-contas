import { Card, CardContent } from "@/components/ui/card";
import type { ComponentType, SVGProps } from "react";

interface SubscriptionSummaryCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: number | string;
  helper: string;
}

export function SubscriptionSummaryCard({ icon: Icon, label, value, helper }: SubscriptionSummaryCardProps) {
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
