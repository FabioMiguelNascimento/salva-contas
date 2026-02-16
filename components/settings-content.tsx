"use client";

import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useWorkspace } from "@/hooks/use-workspace";
import { Bell, Check, Home, Palette, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function SettingsContent({ view = 'page', selectedTab, onTabChange }: { view?: 'page' | 'tabs'; selectedTab?: string; onTabChange?: (tab: string) => void }) {
  const { user, updateUser } = useAuth();
  const [notifications, setNotifications] = useState({ vencimentos: true, insights: true, propostas: false });
  const [theme, setTheme] = useState<"auto" | "light" | "dark">("auto");
  const [density, setDensity] = useState<"compact" | "comfortable">("compact");

  const [name, setName] = useState(user?.name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [activeTab, setActiveTab] = useState<string>(selectedTab ?? 'profile');
  const { workspaces, currentWorkspace, isLoading: workspacesLoading, setCurrentWorkspace, refreshWorkspaces } = useWorkspace();

  // sync selectedTab prop
  useEffect(() => {
    if (selectedTab) setActiveTab(selectedTab);
  }, [selectedTab]);

  useEffect(() => {
    onTabChange?.(activeTab);
  }, [activeTab, onTabChange]);

  async function saveProfile() {
    try {
      setSavingProfile(true);
      const updated = await (await import("@/services/auth")).updateProfile({
        name,
        preferences: { theme, density, notifications },
      });
      if (user) updateUser({ ...user, name: updated.name });
      setSavingProfile(false);
      (await import("sonner")).toast.success("Perfil atualizado");
    } catch (err: any) {
      setSavingProfile(false);
      (await import("sonner")).toast.error(err?.message ?? "Erro ao salvar perfil");
    }
  }

  async function changePassword() {
    if (newPassword.length < 6) {
      (await import("sonner")).toast.error("Senha deve ter ao menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      (await import("sonner")).toast.error("As senhas não coincidem");
      return;
    }

    try {
      setSavingPassword(true);
      await (await import("@/services/auth")).updatePassword({ password: newPassword });
      setSavingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      (await import("sonner")).toast.success("Senha atualizada com sucesso");
    } catch (err: any) {
      setSavingPassword(false);
      (await import("sonner")).toast.error(err?.message ?? "Erro ao atualizar senha");
    }
  }

  const profileCard = (
    <Card id="profile">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" /> Perfil</CardTitle>
        <CardDescription>Nome e preferências do seu usuário.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled />
        </div>
        <div className="md:col-span-2 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => { setName(user?.name ?? ""); setTheme("auto"); setDensity("compact"); }}>
            Reverter
          </Button>
          <Button size="sm" onClick={saveProfile} disabled={savingProfile}>{savingProfile ? 'Salvando...' : 'Salvar perfil'}</Button>
        </div>
      </CardContent>
    </Card>
  );

  const appearanceCard = (
    <Card id="appearance">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Palette className="h-4 w-4" /> Aparência</CardTitle>
        <CardDescription>Defina o tema e densidade dos componentes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <Label>Tema padrão</Label>
            <select value={theme} onChange={(e) => setTheme(e.target.value as any)} className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm w-full">
              <option value="auto">Automático (sistema)</option>
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </div>
          <div>
            <Label>Densidade</Label>
            <div className="flex gap-3 mt-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="density" checked={density === 'compact'} onChange={() => setDensity('compact')} />
                Compacta
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="density" checked={density === 'comfortable'} onChange={() => setDensity('comfortable')} />
                Conforto
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={saveProfile}>Salvar preferências</Button>
        </div>
      </CardContent>
    </Card>
  );

  const notificationsCard = (
    <Card id="notifications">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4" /> Notificações</CardTitle>
        <CardDescription>Escolha quais alertas você deseja receber.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {[
          { key: 'vencimentos', label: 'Contas prestes a vencer', description: 'Receba 1 e-mail diário com o resumo.' },
          { key: 'insights', label: 'Insights de gastos', description: 'Alertas sobre picos ou categorias incomuns.' },
          { key: 'propostas', label: 'Propostas da IA', description: 'Sugestões de parcelamento, renegociação e ajustes.' },
        ].map((item) => (
          <label key={item.key} className="flex items-start gap-3 rounded-2xl border border-border/60 p-4">
            <Checkbox checked={notifications[item.key as keyof typeof notifications]} onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, [item.key]: Boolean(checked) }))} />
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </label>
        ))}
        <div className="md:col-span-2 flex justify-end">
          <Button size="sm" onClick={saveProfile}>Salvar notificações</Button>
        </div>
      </CardContent>
    </Card>
  );

  const securityCard = (
    <Card id="security">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4" /> Segurança</CardTitle>
        <CardDescription>Altere sua senha de acesso.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Nova senha</Label>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <div>
          <Label>Confirmar senha</Label>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <div className="md:col-span-2 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => { setNewPassword(''); setConfirmPassword(''); }}>Limpar</Button>
          <Button size="sm" onClick={changePassword} disabled={savingPassword}>{savingPassword ? 'Salvando...' : 'Alterar senha'}</Button>
        </div>
      </CardContent>
    </Card>
  );

  const workspacesCard = (
    <Card id="workspaces">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Home className="h-4 w-4" /> Workspaces</CardTitle>
        <CardDescription>Gerencie seus workspaces — ative, crie e atualize listas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {workspacesLoading ? (
          <div className="text-sm text-muted-foreground">Carregando workspaces...</div>
        ) : workspaces.length === 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">Nenhum workspace encontrado.</p>
            <CreateWorkspaceDialog />
          </div>
        ) : (
          <div className="space-y-3">
            {workspaces.map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 p-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{w.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{w.description ?? '—'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {currentWorkspace?.id === w.id ? (
                    <Button size="sm" variant="default" className="gap-2" onClick={() => { (async () => (await import('sonner')).toast.success('Workspace ativo'))(); }}>
                      <Check className="h-4 w-4" /> Ativo
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => { setCurrentWorkspace(w.id); (async () => (await import('sonner')).toast.success('Workspace ativado'))(); }}>
                      Ativar
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <div className="pt-2">
              <CreateWorkspaceDialog />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // if a specific tab is requested via prop, render only that section (used by the dialog sidebar)
  if (selectedTab) {
    return (
      <div className="space-y-6">
        {selectedTab === 'profile' && profileCard}
        {selectedTab === 'appearance' && appearanceCard}
        {selectedTab === 'notifications' && notificationsCard}
        {selectedTab === 'security' && securityCard}
        {selectedTab === 'workspaces' && workspacesCard}
      </div>
    );
  }

  const Cards = (
    <>
      {profileCard}
      {appearanceCard}
      {notificationsCard}
      {securityCard}
      {workspacesCard}
    </>
  );

  if (view === 'tabs') {
    return (
      <div className="flex flex-col h-full">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto space-y-6">
            <TabsContent value="profile">{profileCard}</TabsContent>
            <TabsContent value="appearance">{appearanceCard}</TabsContent>
            <TabsContent value="notifications">{notificationsCard}</TabsContent>
            <TabsContent value="security">{securityCard}</TabsContent>
            <TabsContent value="workspaces">{workspacesCard}</TabsContent>
          </div>
        </Tabs>
      </div>
    );
  }

  return Cards;
}
