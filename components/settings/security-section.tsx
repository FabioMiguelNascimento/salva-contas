"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, KeyRound } from "lucide-react";

type Props = {
  newPassword: string;
  confirmPassword: string;
  setNewPassword: (s: string) => void;
  setConfirmPassword: (s: string) => void;
  onChangePassword: () => void | Promise<void>;
  savingPassword: boolean;
};

export default function SecuritySection({ 
  newPassword, 
  confirmPassword, 
  setNewPassword, 
  setConfirmPassword, 
  onChangePassword, 
  savingPassword 
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-600" />
          Segurança
        </h3>
        <p className="text-sm text-slate-500">Mantenha sua conta protegida atualizando sua senha regularmente.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">Nova senha</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              type="password" 
              placeholder="••••••••"
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">Confirmar senha</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              type="password" 
              placeholder="••••••••"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => { setNewPassword(''); setConfirmPassword(''); }}
          className="text-slate-500 hover:text-slate-900"
        >
          Limpar campos
        </Button>
        <Button 
          size="sm" 
          onClick={onChangePassword} 
          disabled={savingPassword}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {savingPassword ? 'Processando...' : 'Atualizar senha'}
        </Button>
      </div>
    </div>
  );
}
