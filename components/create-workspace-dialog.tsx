"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/hooks/use-workspace";
import * as workspaceService from "@/services/workspace";
import { useState } from "react";
import { toast } from "sonner";

export function CreateWorkspaceDialog() {
  const { refreshWorkspaces, setCurrentWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onCreate(e?: React.FormEvent) {
    e?.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("O nome do workspace é obrigatório.");
      return;
    }

    try {
      setIsLoading(true);
      const workspace = await workspaceService.createWorkspace({ name: trimmed, description: description.trim() || undefined });

      await refreshWorkspaces();
      setCurrentWorkspace(workspace.id);
      toast.success("Workspace criado com sucesso");
      setOpen(false);
      setName("");
      setDescription("");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Erro ao criar workspace");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <span className="text-sm">Criar novo Workspace</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Workspace</DialogTitle>
          <DialogDescription>Crie um novo workspace para compartilhar dados com outras pessoas.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onCreate} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="workspace-name">Nome</Label>
            <Input id="workspace-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Empresa, Família, Pessoal" />
          </div>

          <div>
            <Label htmlFor="workspace-desc">Descrição (opcional)</Label>
            <Textarea id="workspace-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição curta (opcional)" className="min-h-20 resize-none" />
          </div>

          <DialogFooter>
            <DialogClose>
              <Button variant="ghost" disabled={isLoading}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading} className="min-w-[140px]" onClick={onCreate}>
              {isLoading ? "Criando..." : "Criar Workspace"}
            </Button>
          </DialogFooter>
        </form>

        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
