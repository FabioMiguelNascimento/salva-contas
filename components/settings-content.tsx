"use client";

import AppearanceCard from "@/components/settings/appearance-card";
import NotificationsCard from "@/components/settings/notifications-card";
import ProfileCard from "@/components/settings/profile-card";
import SecurityCard from "@/components/settings/security-card";
import WorkspacesCard from "@/components/settings/workspaces-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useWorkspace } from "@/hooks/use-workspace";
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
    <ProfileCard
      name={name}
      onNameChange={setName}
      userEmail={user?.email ?? ""}
      onReset={() => { setName(user?.name ?? ""); setTheme("auto"); setDensity("compact"); }}
      onSave={saveProfile}
      saving={savingProfile}
      setTheme={setTheme}
      setDensity={setDensity}
    />
  );

  const appearanceCard = (
    <AppearanceCard
      theme={theme}
      setTheme={setTheme}
      density={density}
      setDensity={setDensity}
      onSave={saveProfile}
    />
  );

  const notificationsCard = (
    <NotificationsCard
      notifications={notifications}
      setNotifications={setNotifications}
      onSave={saveProfile}
    />
  );

  const securityCard = (
    <SecurityCard
      newPassword={newPassword}
      confirmPassword={confirmPassword}
      setNewPassword={setNewPassword}
      setConfirmPassword={setConfirmPassword}
      onChangePassword={changePassword}
      savingPassword={savingPassword}
    />
  );



  const workspacesCard = <WorkspacesCard />;

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
      
    </>
  );
}
