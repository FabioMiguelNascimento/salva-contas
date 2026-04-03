"use client";

import { 
  AppearanceSection, 
  FamilyShareCard, 
  MercadoPagoSettings, 
  NotificationsSection, 
  ProfileSection, 
  SecuritySection 
} from "@/components/settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFamilyInvite } from "@/context/family-invite-context";
import { useAuth } from "@/hooks/use-auth";
import { useUsage } from "@/hooks/use-usage";
import { useEffect, useState } from "react";


export default function SettingsContent({ view = 'page', selectedTab, onTabChange }: { view?: 'page' | 'tabs'; selectedTab?: string; onTabChange?: (tab: string) => void }) {
  const { user, updateUser } = useAuth();
  const { refreshUsage } = useUsage();
  const { refresh: refreshFamily } = useFamilyInvite();
  const [notifications, setNotifications] = useState({ vencimentos: true, insights: true, propostas: false });
  const [theme, setTheme] = useState<"auto" | "light" | "dark">("auto");
  const [density, setDensity] = useState<"compact" | "comfortable">("compact");

  const [name, setName] = useState(user?.name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [activeTab, setActiveTab] = useState<string>(selectedTab ?? 'profile');

  // sync selectedTab prop
  useEffect(() => {
    if (selectedTab) setActiveTab(selectedTab);
  }, [selectedTab]);

  useEffect(() => {
    onTabChange?.(activeTab);
  }, [activeTab, onTabChange]);

  // Lazy load usage data when billing tab is accessed
  useEffect(() => {
    if (activeTab === 'billing') {
      void refreshUsage();
    }
  }, [activeTab, refreshUsage]);

  // Lazy load family data when family tab is accessed
  useEffect(() => {
    if (activeTab === 'family') {
      void refreshFamily();
    }
  }, [activeTab, refreshFamily]);

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

  const profileSection = (
    <ProfileSection
      name={name}
      onNameChange={setName}
      userEmail={user?.email ?? ""}
      onReset={() => { setName(user?.name ?? ""); setTheme("auto"); setDensity("compact"); }}
      onSave={saveProfile}
      saving={savingProfile}
    />
  );

  const appearanceSection = (
    <AppearanceSection
      theme={theme}
      setTheme={setTheme}
      density={density}
      setDensity={setDensity}
      onSave={saveProfile}
    />
  );

  const notificationsSection = (
    <NotificationsSection
      notifications={notifications}
      setNotifications={setNotifications}
      onSave={saveProfile}
    />
  );

  const securitySection = (
    <SecuritySection
      newPassword={newPassword}
      confirmPassword={confirmPassword}
      setNewPassword={setNewPassword}
      setConfirmPassword={setConfirmPassword}
      onChangePassword={changePassword}
      savingPassword={savingPassword}
    />
  );

  const familyShareSection = <FamilyShareCard />;
  const mercadoPagoSettings = <MercadoPagoSettings />;

  if (selectedTab) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {selectedTab === 'profile' && profileSection}
        {selectedTab === 'appearance' && appearanceSection}
        {selectedTab === 'notifications' && notificationsSection}
        {selectedTab === 'security' && securitySection}
        {selectedTab === 'billing' && mercadoPagoSettings}
        {selectedTab === 'family' && familyShareSection}
      </div>
    );
  }

  const Sections = (
    <div className="space-y-12">
      {profileSection}
      {appearanceSection}
      {notificationsSection}
      {securitySection}
      {mercadoPagoSettings}
      {familyShareSection}
    </div>
  );

  if (view === 'tabs') {
    return (
      <div className="flex flex-col h-full">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
          <TabsList className="mb-8 bg-slate-100/50 p-1 rounded-xl">
            <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Perfil</TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Aparência</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Notificações</TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Segurança</TabsTrigger>
            <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Faturamento</TabsTrigger>
            <TabsTrigger value="family" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Partilha</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="profile" className="animate-in fade-in duration-300">{profileSection}</TabsContent>
            <TabsContent value="appearance" className="animate-in fade-in duration-300">{appearanceSection}</TabsContent>
            <TabsContent value="notifications" className="animate-in fade-in duration-300">{notificationsSection}</TabsContent>
            <TabsContent value="security" className="animate-in fade-in duration-300">{securitySection}</TabsContent>
            <TabsContent value="billing" className="animate-in fade-in duration-300">{mercadoPagoSettings}</TabsContent>
            <TabsContent value="family" className="animate-in fade-in duration-300">{familyShareSection}</TabsContent>
          </div>
        </Tabs>
      </div>
    );
  }

  return Sections;
}
