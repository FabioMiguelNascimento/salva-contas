"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell } from "lucide-react";

type NotificationsState = { vencimentos: boolean; insights: boolean; propostas: boolean };

type Props = {
  notifications: NotificationsState;
  setNotifications: (n: NotificationsState) => void;
  onSave: () => void | Promise<void>;
};

export default function NotificationsSection({ notifications, setNotifications, onSave }: Props) {
  const items: { key: keyof NotificationsState; label: string; description: string }[] = [
    { key: 'vencimentos', label: 'Contas prestes a vencer', description: 'Receba um resumo diário das contas que vencem hoje ou amanhã.' },
    { key: 'insights', label: 'Insights de gastos', description: 'Alertas sobre variações incomuns nas suas categorias de gastos.' },
    { key: 'propostas', label: 'Propostas da IA', description: 'Sugestões personalizadas de economia e gestão financeira.' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-emerald-600" />
          Notificações
        </h3>
        <p className="text-sm text-slate-500">Gerencie como e quando você quer ser alertado.</p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <label 
            key={item.key} 
            className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="pt-1">
              <Checkbox 
                id={item.key}
                checked={notifications[item.key]} 
                onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: Boolean(checked) } as NotificationsState)} 
                className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-slate-800 group-hover:text-slate-900 transition-colors">{item.label}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <Button size="sm" onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700">
          Salvar notificações
        </Button>
      </div>
    </div>
  );
}
