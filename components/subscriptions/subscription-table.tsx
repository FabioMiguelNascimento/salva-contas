import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import { getFrequencyLabel } from "@/lib/subscriptions/utils";
import type { Subscription } from "@/types/finance";
import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
  actionsHeader?: ReactNode;
}

export function SubscriptionTable({ subscriptions, onEdit, onDelete, actionsHeader = "Ações" }: SubscriptionTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descrição</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Frequência</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">{actionsHeader}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map((subscription) => (
          <TableRow key={subscription.id}>
            <TableCell>
              <div>
                <p className="font-semibold">{subscription.description}</p>
                <p className="text-xs text-muted-foreground">
                  {subscription.createdAt ? `Criado em ${dateFormatter.format(new Date(subscription.createdAt))}` : "—"}
                </p>
              </div>
            </TableCell>
            <TableCell>{currencyFormatter.format(subscription.amount)}</TableCell>
            <TableCell>{subscription.category?.name ?? "–"}</TableCell>
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
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(subscription)}>
                  Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(subscription)}>
                  <Trash2 className="mr-1 h-4 w-4" />Cancelar
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
