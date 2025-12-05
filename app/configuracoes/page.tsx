"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Palette, Shield } from "lucide-react";
import { useState } from "react";

export default function ConfiguracoesPage() {
  const [notifications, setNotifications] = useState({ vencimentos: true, insights: true, propostas: false });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Workspace</p>
        <h1 className="text-3xl font-semibold">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Personalize a experiência visual, alertas e credenciais utilizadas pelo AI Finance Tracker.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4" /> Aparência
            </CardTitle>
            <CardDescription>Defina o comportamento do modo escuro e densidade dos componentes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="tema">Tema padrão</Label>
              <select id="tema" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                <option value="auto">Automático (sistema)</option>
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Densidade dos cards</Label>
              <div className="flex gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input type="radio" name="density" defaultChecked />
                  Compacta
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="density" />
                  Conforto
                </label>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Salvar preferências
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" /> Tokens & segurança
            </CardTitle>
            <CardDescription>Gerencie as credenciais utilizadas pela IA e webhooks de auditoria.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="apiKey">Token do Gemini</Label>
              <Input id="apiKey" placeholder="sk-live-********" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="webhook">Webhook de auditoria</Label>
              <Input id="webhook" placeholder="https://seu-endpoint.com/finance" />
            </div>
            <Button size="sm">Atualizar credenciais</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" /> Alertas inteligentes
          </CardTitle>
          <CardDescription>Selecione quais eventos geram notificações para você e seu squad.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[
            { key: "vencimentos", label: "Contas prestes a vencer", description: "Receba 1 e-mail diário com o resumo." },
            { key: "insights", label: "Insights de gastos", description: "Alertas sobre picos ou categorias incomuns." },
            { key: "propostas", label: "Propostas da IA", description: "Sugestões de parcelamento, renegociação e ajustes." },
          ].map((item) => (
            <label key={item.key} className="flex items-start gap-3 rounded-2xl border border-border/60 p-4">
              <Checkbox
                checked={notifications[item.key as keyof typeof notifications]}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, [item.key]: Boolean(checked) }))
                }
              />
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
