import { DynamicIcon } from "@/components/dynamic-icon";
import { FlagIcon } from "@/components/flag-icon";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/currency-utils";
import { getFrequencyLabel, getScheduleLabel } from "@/lib/subscriptions/utils";
import type { Subscription } from "@/types/finance";

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
}

export function SubscriptionTable({ subscriptions, onEdit }: SubscriptionTableProps) {
  return (
    <Table className="min-w-[1100px]">
      <TableHeader>
        <TableRow>
          <TableHead>Descrição</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Cartão</TableHead>
          <TableHead>Frequencia</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map((subscription) => (
          <TableRow
            key={subscription.id}
            onClick={() => onEdit(subscription)}
            className="cursor-pointer hover:bg-muted/30"
          >
            <TableCell className="max-w-[320px]">
              <div className="min-w-0">
                <p className="truncate font-semibold">{subscription.description}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {subscription.createdAt ? `Criado em ${dateFormatter.format(new Date(subscription.createdAt))}` : "—"}
                </p>
                </div>
                </TableCell>
                <TableCell>{formatCurrency(subscription.amount)}</TableCell>
                <TableCell className="text-muted-foreground">{getScheduleLabel(subscription)}</TableCell>
                <TableCell>
                {subscription.category ? (
                <div className="flex items-center gap-2 min-w-0">
                  <DynamicIcon
                    name={subscription.category.icon ?? "tag"}
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                  />
                  <span className="truncate">{subscription.category.name}</span>
                </div>
                ) : (
                <span className="text-xs text-muted-foreground">—</span>
                )}
                </TableCell>
                <TableCell>
                {subscription.creditCard ? (
                <div className="flex items-center gap-2">
                  <FlagIcon flag={subscription.creditCard.flag} className="h-5 w-auto" />
                  <span className="text-xs text-muted-foreground">{subscription.creditCard.name}</span>
                </div>
                ) : (
                <span className="text-xs text-muted-foreground">—</span>
                )}
                </TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs">
                {getFrequencyLabel(subscription.frequency)}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={subscription.isActive ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}>
                {subscription.isActive ? "Ativa" : "Inativa"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}



