"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Palette } from "lucide-react";

type Props = {
  theme: "auto" | "light" | "dark";
  setTheme: (t: "auto" | "light" | "dark") => void;
  density: "compact" | "comfortable";
  setDensity: (d: "compact" | "comfortable") => void;
  onSave: () => void | Promise<void>;
};

export default function AppearanceCard({ theme, setTheme, density, setDensity, onSave }: Props) {
  return (
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
          <Button size="sm" onClick={onSave}>Salvar preferências</Button>
        </div>
      </CardContent>
    </Card>
  );
}
