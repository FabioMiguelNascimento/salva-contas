"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";

type Props = {
  newPassword: string;
  confirmPassword: string;
  setNewPassword: (s: string) => void;
  setConfirmPassword: (s: string) => void;
  onChangePassword: () => void | Promise<void>;
  savingPassword: boolean;
};

export default function SecurityCard({ newPassword, confirmPassword, setNewPassword, setConfirmPassword, onChangePassword, savingPassword }: Props) {
  return (
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
          <Button size="sm" onClick={onChangePassword} disabled={savingPassword}>{savingPassword ? 'Salvando...' : 'Alterar senha'}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
