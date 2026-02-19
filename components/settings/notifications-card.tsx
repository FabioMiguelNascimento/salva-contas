"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell } from "lucide-react";

type NotificationsState = { vencimentos: boolean; insights: boolean; propostas: boolean };

type Props = {
  notifications: NotificationsState;
  setNotifications: (n: NotificationsState) => void;
  onSave: () => void | Promise<void>;
};

export default function NotificationsCard({ notifications, setNotifications, onSave }: Props) {
  const items: { key: keyof NotificationsState; label: string; description: string }[] = [
    { key: 'vencimentos', label: 'Contas prestes a vencer', description: 'Receba 1 e-mail diário com o resumo.' },
    { key: 'insights', label: 'Insights de gastos', description: 'Alertas sobre picos ou categorias incomuns.' },
    { key: 'propostas', label: 'Propostas da IA', description: 'Sugestões de parcelamento, renegociação e ajustes.' },
  ];

  return (
    <Card id="notifications">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4" /> Notificações</CardTitle>
        <CardDescription>Escolha quais alertas você deseja receber.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <label key={item.key} className="flex items-start gap-3 rounded-2xl border border-border/60 p-4">
            <Checkbox checked={notifications[item.key]} onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: Boolean(checked) } as NotificationsState)} />
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </label>
        ))}
        <div className="md:col-span-2 flex justify-end">
          <Button size="sm" onClick={onSave}>Salvar notificações</Button>
        </div>
      </CardContent>
    </Card>
  );
}
