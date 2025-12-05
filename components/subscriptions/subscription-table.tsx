import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import { getFrequencyLabel } from "@/lib/subscriptions/utils";
import type { Subscription } from "@/types/finance";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
}

export function SubscriptionTable({ subscriptions, onEdit, onDelete }: SubscriptionTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descrição</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Frequência</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-12" />
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
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(subscription)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(subscription)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Cancelar assinatura
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
