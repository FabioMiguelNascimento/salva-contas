"use client";

import { Button } from "@/components/ui/button";
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
};

export default function ProfileSection({ name, onNameChange, userEmail, onReset, onSave, saving }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="h-5 w-5 text-emerald-600" />
          Perfil
        </h3>
        <p className="text-sm text-slate-500">Gerencie suas informações básicas de identificação.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-700 font-medium">Nome completo</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => onNameChange(e.target.value)}
            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">Endereço de e-mail</Label>
          <Input 
            value={userEmail ?? ""} 
            disabled 
            className="bg-slate-100 border-slate-200 text-slate-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-500 hover:text-slate-900">
          Descartar
        </Button>
        <Button size="sm" onClick={onSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </div>
  );
}
