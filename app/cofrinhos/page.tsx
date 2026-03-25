"use client";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SummaryCard } from "@/components/summary-card";
import { SummaryCardsGrid } from "@/components/summary-cards-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VaultAmountSheet } from "@/components/vaults/vault-amount-sheet";
import { VaultCard } from "@/components/vaults/vault-card";
import { VaultFormSheet } from "@/components/vaults/vault-form-sheet";
import { VaultTable } from "@/components/vaults/vault-table";
import { useVaults, VaultsProvider } from "@/context/vaults-context";
import { TopbarAction } from "@/contexts/topbar-action-context";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import type { Vault } from "@/types/finance";
import { PiggyBank, PlusCircle, Target, Wallet2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type VaultActionType = "deposit" | "withdraw" | "yield";

interface VaultActionState {
  type: VaultActionType;
  vault: Vault;
}

function VaultsPageContent() {
  const {
    vaults,
    isLoading,
    metrics,
    createVaultEntry,
    updateVaultEntry,
    deleteVaultEntry,
    depositVaultAmount,
    withdrawVaultAmount,
    addVaultYieldAmount,
  } = useVaults();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingVault, setEditingVault] = useState<Vault | null>(null);
  const [actionState, setActionState] = useState<VaultActionState | null>(null);

  const savedAmount = metrics?.financials.savedAmount ?? 0;
  const availableBalance = metrics?.financials.availableBalance ?? metrics?.financials.balance ?? 0;

  const withTargetCount = useMemo(
    () => vaults.filter((vault) => (vault.targetAmount ?? 0) > 0).length,
    [vaults],
  );
  const withoutTargetCount = Math.max(vaults.length - withTargetCount, 0);

  const handleDelete = async (vault: Vault) => {
    const confirmed = window.confirm(
      `Excluir o cofrinho \"${vault.name}\"? Esta ação não pode ser desfeita.`,
    );

    if (!confirmed) return;

    await deleteVaultEntry(vault.id);
    toast.success("Cofrinho removido com sucesso");
  };

  const submitAction = async (value: number) => {
    if (!actionState) return;

    if (actionState.type === "deposit") {
      await depositVaultAmount(actionState.vault.id, { amount: value });
      toast.success("Valor guardado com sucesso");
      return;
    }

    if (actionState.type === "withdraw") {
      await withdrawVaultAmount(actionState.vault.id, { amount: value });
      toast.success("Resgate realizado com sucesso");
      return;
    }

    await addVaultYieldAmount(actionState.vault.id, { amount: value });
    toast.success("Rendimento registrado com sucesso");
  };

  const actionConfig = actionState
    ? {
        deposit: {
          title: `Guardar em ${actionState.vault.name}`,
          description: "Este valor será movido do saldo disponível para o cofrinho.",
          submitLabel: "Guardar",
        },
        withdraw: {
          title: `Resgatar de ${actionState.vault.name}`,
          description: "Este valor sairá do cofrinho e voltará ao saldo disponível.",
          submitLabel: "Resgatar",
        },
        yield: {
          title: `Rendimento de ${actionState.vault.name}`,
          description: "Registre rendimento manual sem debitar o saldo principal.",
          submitLabel: "Adicionar rendimento",
        },
      }[actionState.type]
    : null;

  return (
    <div className="space-y-8">
      <TopbarAction>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusCircle data-icon="inline-start" />
          Novo Cofrinho
        </Button>
      </TopbarAction>

      <PageHeader
        tag="Objetivos"
        title="Meus Cofrinhos"
        description="Separe dinheiro para metas, registre depósitos, resgates e rendimentos manuais."
      />

      <SummaryCardsGrid className="sm:grid-cols-3!">
        <SummaryCard
          icon={Target}
          title="Objetivos ativos"
          value={vaults.length}
          helper={`${withoutTargetCount} sem meta definida`}
        />
        <SummaryCard
          icon={PiggyBank}
          title="Dinheiro guardado"
          value={currencyFormatter.format(savedAmount)}
          helper="Total alocado em cofrinhos"
          variant="success"
        />
        <SummaryCard
          icon={Wallet2}
          title="Saldo disponível"
          value={currencyFormatter.format(availableBalance)}
          helper="Saldo fora dos cofrinhos"
        />
      </SummaryCardsGrid>

      <Card>
        <CardHeader>
          <CardTitle>Progresso dos cofrinhos</CardTitle>
          <CardDescription>
            Acompanhe saldo, metas e movimentações de cada cofrinho.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-24 w-full animate-pulse rounded-xl bg-muted/50" />
              ))}
            </div>
          ) : vaults.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              Nenhum cofrinho criado ainda. Clique em "Novo Cofrinho" para começar.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="hidden md:block overflow-x-auto">
                <VaultTable
                  vaults={vaults}
                  onDeposit={(vault) => setActionState({ type: "deposit", vault })}
                  onWithdraw={(vault) => setActionState({ type: "withdraw", vault })}
                  onYield={(vault) => setActionState({ type: "yield", vault })}
                  onEdit={setEditingVault}
                  onDelete={handleDelete}
                />
              </div>
              <div className="grid gap-3 md:hidden">
                {vaults.map((vault) => (
                  <VaultCard
                    key={vault.id}
                    vault={vault}
                    onDeposit={() => setActionState({ type: "deposit", vault })}
                    onWithdraw={() => setActionState({ type: "withdraw", vault })}
                    onYield={() => setActionState({ type: "yield", vault })}
                    onEdit={() => setEditingVault(vault)}
                    onDelete={() => handleDelete(vault)}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <VaultFormSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={async (payload) => {
          await createVaultEntry(payload);
          toast.success("Cofrinho criado com sucesso");
        }}
        onUpdate={async () => undefined}
      />

      <VaultFormSheet
        open={Boolean(editingVault)}
        onOpenChange={(open) => {
          if (!open) setEditingVault(null);
        }}
        vault={editingVault}
        onCreate={async () => undefined}
        onUpdate={async (id, payload) => {
          await updateVaultEntry(id, payload);
          toast.success("Cofrinho atualizado com sucesso");
          setEditingVault(null);
        }}
      />

      <VaultAmountSheet
        open={Boolean(actionState && actionConfig)}
        onOpenChange={(open) => {
          if (!open) setActionState(null);
        }}
        title={actionConfig?.title ?? "Movimentar cofrinho"}
        description={actionConfig?.description ?? "Informe o valor."}
        submitLabel={actionConfig?.submitLabel ?? "Salvar"}
        onSubmit={submitAction}
      />
    </div>
  );
}

export default function VaultsPage() {
  return (
    <VaultsProvider>
      <AppShell>
        <VaultsPageContent />
      </AppShell>
    </VaultsProvider>
  );
}
