"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

type Props = {
  name: string;
  onNameChange: (v: string) => void;
  userEmail: string;
  onReset: () => void;
  onSave: () => void | Promise<void>;
  saving: boolean;
  setTheme: (t: "auto" | "light" | "dark") => void;
  setDensity: (d: "compact" | "comfortable") => void;
};

export default function ProfileCard({ name, onNameChange, userEmail, onReset, onSave, saving, setTheme, setDensity }: Props) {
  return (
    <Card id="profile">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" /> Perfil</CardTitle>
        <CardDescription>Nome e preferências do seu usuário.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" value={name} onChange={(e) => onNameChange(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input value={userEmail ?? ""} disabled />
        </div>
        <div className="md:col-span-2 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            Reverter
          </Button>
          <Button size="sm" onClick={onSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar perfil'}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
