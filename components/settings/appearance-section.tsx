"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Palette, Monitor, Sun, Moon, LayoutGrid, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  theme: "auto" | "light" | "dark";
  setTheme: (t: "auto" | "light" | "dark") => void;
  density: "compact" | "comfortable";
  setDensity: (d: "compact" | "comfortable") => void;
  onSave: () => void | Promise<void>;
};

export default function AppearanceSection({ theme, setTheme, density, setDensity, onSave }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="h-5 w-5 text-emerald-600" />
          Aparência
        </h3>
        <p className="text-sm text-slate-500">Customize como o Salva Contas aparece para você.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-slate-700 font-medium">Tema da interface</Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'auto', label: 'Sistema', icon: Monitor },
              { id: 'light', label: 'Claro', icon: Sun },
              { id: 'dark', label: 'Escuro', icon: Moon },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id as any)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-sm font-medium",
                  theme === t.id 
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" 
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <t.icon className={cn("h-5 w-5", theme === t.id ? "text-emerald-600" : "text-slate-400")} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-slate-700 font-medium">Densidade visual</Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'compact', label: 'Compacto', icon: LayoutGrid, desc: 'Mais conteúdo por tela' },
              { id: 'comfortable', label: 'Confortável', icon: LayoutTemplate, desc: 'Maior espaçamento' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDensity(d.id as any)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border transition-all text-left",
                  density === d.id 
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" 
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <div className={cn("p-2 rounded-lg", density === d.id ? "bg-emerald-100" : "bg-slate-100")}>
                  <d.icon className={cn("h-4 w-4", density === d.id ? "text-emerald-600" : "text-slate-500")} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{d.label}</p>
                  <p className="text-xs text-slate-500">{d.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <Button size="sm" onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700">
          Salvar preferências
        </Button>
      </div>
    </div>
  );
}
