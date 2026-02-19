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
import { cn } from "@/lib/utils";
import * as workspaceService from "@/services/workspace";
import { WorkspaceMemberWithUser } from "@/types/workspace";
import { Bell, Check, Home, Palette, Plus, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import InviteWorkspaceDialog from "./invite-workspace-dialog";

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



  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState<WorkspaceMemberWithUser[] | null>(null);
  const [membersLoading, setMembersLoading] = useState(false);

  async function loadMembers() {
    if (!currentWorkspace) return;
    setMembersLoading(true);
    try {
      const data = await (await import('@/services/workspace')).getMembers(currentWorkspace.id);
      setMembers(data);
    } catch (err) {
      (await import('sonner')).toast.error('Erro ao carregar membros');
    } finally {
      setMembersLoading(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!currentWorkspace) return;
    if (!confirm('Remover este membro do workspace?')) return;
    try {
      await (await import('@/services/workspace')).removeMember(currentWorkspace.id, userId);
      (await import('sonner')).toast.success('Membro removido');
      await loadMembers();
      await refreshWorkspaces();
    } catch (err: any) {
      (await import('sonner')).toast.error(err?.message ?? 'Erro ao remover membro');
    }
  }

  // --- per-workspace accordion state/functions (each workspace row can expand to show members) ---
  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState<string | null>(null);
  const [membersByWorkspace, setMembersByWorkspace] = useState<Record<string, WorkspaceMemberWithUser[] | null>>({});
  const [membersLoadingByWorkspace, setMembersLoadingByWorkspace] = useState<Record<string, boolean>>({});

  async function loadMembersForWorkspace(workspaceId: string) {
    if (!workspaceId) return;
    // already loaded
    if (membersByWorkspace[workspaceId]) return;
    setMembersLoadingByWorkspace((p) => ({ ...p, [workspaceId]: true }));
    try {
      const data = await workspaceService.getMembers(workspaceId);
      setMembersByWorkspace((p) => ({ ...p, [workspaceId]: data }));
    } catch (err) {
      (await import('sonner')).toast.error('Erro ao carregar membros');
    } finally {
      setMembersLoadingByWorkspace((p) => ({ ...p, [workspaceId]: false }));
    }
  }

  async function handleRemoveMemberFromWorkspace(workspaceId: string, userId: string) {
    if (!workspaceId) return;
    if (!confirm('Remover este membro do workspace?')) return;
    try {
      await workspaceService.removeMember(workspaceId, userId);
      (await import('sonner')).toast.success('Membro removido');
      const updated = await workspaceService.getMembers(workspaceId);
      setMembersByWorkspace((p) => ({ ...p, [workspaceId]: updated }));
      await refreshWorkspaces();
    } catch (err: any) {
      (await import('sonner')).toast.error(err?.message ?? 'Erro ao remover membro');
    }
  }

  const [inviteDialogOpenFor, setInviteDialogOpenFor] = useState<string | null>(null);

  useEffect(() => {
    console.log('🟢 inviteDialogOpenFor mudou:', inviteDialogOpenFor);
  }, [inviteDialogOpenFor]);

  const inviteWorkspace = workspaces.find((x) => x.id === inviteDialogOpenFor);

  const workspacesCard = (
    <Card id="workspaces">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Home className="h-4 w-4" /> Workspaces</CardTitle>
        <CardDescription>Gerencie seus workspaces — ative, crie, convide e veja membros.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Members accordion */}
        {currentWorkspace && (
          <div className="border border-border/60 rounded-2xl p-3">
            <button className="w-full flex items-center justify-between gap-3" onClick={async () => { setShowMembers((s) => !s); if (!members) await loadMembers(); }}>
              <div className="flex items-center gap-3">
                <strong>Membros</strong>
                <span className="text-sm text-muted-foreground">{members ? members.length : '—'}</span>
              </div>
              <div className={cn('transition-transform', showMembers ? 'rotate-180' : '')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </button>

            {showMembers && (
              <div className="mt-3 space-y-2">
                {membersLoading ? (
                  <div className="text-sm text-muted-foreground">Carregando membros...</div>
                ) : members && members.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Nenhum membro encontrado.</div>
                ) : (
                  members?.map((m) => (
                    <div key={m.userId} className="flex items-center justify-between gap-3 rounded-lg border border-border/40 p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-semibold">{String(m.name ?? m.email ?? (m.userId === user?.id ? user?.name ?? 'Usuário' : 'Usuário')).split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase()}</div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{m.name ?? m.email ?? (m.userId === user?.id ? user?.name : 'Usuário não encontrado')}</div>
                          <div className="text-xs text-muted-foreground truncate">{m.email ?? (m.userId === user?.id ? user?.email : '')}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground">{m.role}</div>
                        {currentWorkspace.role === 'ADMIN' && m.userId !== user?.id && (
                          <Button size="sm" variant="destructive" onClick={() => handleRemoveMember(m.userId)}>Remover</Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {workspacesLoading ? (
          <div className="text-sm text-muted-foreground">Carregando workspaces...</div>
        ) : workspaces.length === 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">Nenhum workspace encontrado.</p>
            <CreateWorkspaceDialog />
          </div>
        ) : (
          <div className="space-y-3">
            {workspaces.map((w) => {
              const expanded = expandedWorkspaceId === w.id;
              const workspaceMembers = membersByWorkspace[w.id];
              const workspaceLoading = membersLoadingByWorkspace[w.id];

              return (
                <div key={w.id} className="rounded-2xl border border-border/60 overflow-hidden">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={async () => { setExpandedWorkspaceId(expanded ? null : w.id); if (!expanded) await loadMembersForWorkspace(w.id); }}
                    onKeyDown={async (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedWorkspaceId(expanded ? null : w.id); if (!expanded) await loadMembersForWorkspace(w.id); } }}
                    className="w-full flex items-center justify-between gap-4 p-3"
                    aria-expanded={expanded}
                  >
                    <div className="min-w-0 text-left">
                      <p className="font-medium truncate">{w.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{w.description ?? '—'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {currentWorkspace?.id === w.id ? (
                        <Button size="sm" variant="default" className="gap-2" onClick={(e) => { e.stopPropagation(); (async () => (await import('sonner')).toast.success('Workspace ativo'))(); }}>
                          <Check className="h-4 w-4" /> Ativo
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setCurrentWorkspace(w.id); (async () => (await import('sonner')).toast.success('Workspace ativado'))(); }}>
                          Ativar
                        </Button>
                      )}

                      <Button size="sm" variant="outline" className="gap-2" onClick={(e) => { 
                        console.log('🔵 Botão Convidar clicado', { workspaceId: w.id, workspaceName: w.name });
                        e.stopPropagation(); 
                        console.log('🔵 Antes de setInviteDialogOpenFor:', inviteDialogOpenFor);
                        setInviteDialogOpenFor(w.id); 
                        console.log('🔵 Depois de setInviteDialogOpenFor:', w.id);
                      }}>
                        <Plus className="h-4 w-4" />
                        Convidar
                      </Button>

                      <div className={cn('transition-transform', expanded ? 'rotate-180' : '')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>

                  {expanded && (
                    <div className="border-t border-border/40 p-3 space-y-2 bg-background">
                      {workspaceLoading ? (
                        <div className="text-sm text-muted-foreground">Carregando membros...</div>
                      ) : workspaceMembers && workspaceMembers.length === 0 ? (
                        <div className="text-sm text-muted-foreground">Nenhum membro encontrado.</div>
                      ) : (
                        workspaceMembers?.map((m) => (
                          <div key={m.userId} className="flex items-center justify-between gap-3 rounded-lg border border-border/40 p-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-semibold">{(m.name || m.email || m.userId).split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase()}</div>
                              <div className="min-w-0">
                                <div className="font-medium truncate">{m.name ?? m.email ?? m.userId}</div>
                                <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="text-sm text-muted-foreground">{m.role}</div>
                              { /* allow admins to remove members from that workspace */ }
                              {w.role === 'ADMIN' && m.userId !== user?.id && (
                                <Button size="sm" variant="destructive" onClick={() => handleRemoveMemberFromWorkspace(w.id, m.userId)}>Remover</Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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

  return (
    <>
      {Cards}
      
      {console.log('🟣 Renderizando InviteWorkspaceDialog com props:', { 
        inviteDialogOpenFor, 
        open: Boolean(inviteDialogOpenFor),
        workspaceName: inviteWorkspace?.name
      })}
      
      <InviteWorkspaceDialog
        workspaceId={inviteDialogOpenFor ?? undefined}
        workspaceName={inviteWorkspace?.name}
        open={Boolean(inviteDialogOpenFor)}
        onOpenChange={(open) => { if (!open) setInviteDialogOpenFor(null); }}
        onInvited={async () => { if (inviteDialogOpenFor) await loadMembersForWorkspace(inviteDialogOpenFor); await refreshWorkspaces(); setInviteDialogOpenFor(null); }}
      />
    </>
  );
}
