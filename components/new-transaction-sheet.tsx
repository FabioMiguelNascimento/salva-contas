"use client";

import { AiTransactionTab } from "@/components/new-transaction/ai-transaction-tab";
import { ManualTransactionTab } from "@/components/new-transaction/manual-transaction-tab";
import type { SplitRow } from "@/components/new-transaction/split-payment-builder";
import { TransactionDetails } from "@/components/new-transaction/transaction-details";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Sheet,
    SheetBody,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactions } from "@/context/transactions-context";
import { createManualTransaction } from "@/services/transactions";
import type { TransactionStatus, TransactionType } from "@/types/finance";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

interface NewTransactionSheetProps {
  trigger: React.ReactNode;
}

export function NewTransactionDialog({ trigger }: NewTransactionSheetProps) {
  const { processUnstructuredTransaction, categories, refresh } = useTransactions();
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualCategoryId, setManualCategoryId] = useState<string | null>(null);
  const [manualType, setManualType] = useState<TransactionType>("expense");
  const [manualStatus, setManualStatus] = useState<TransactionStatus>("paid");
  const [isScheduled, setIsScheduled] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedCreditCardId, setSelectedCreditCardId] = useState<string | null>(null);
  const [selectedDebitCardId, setSelectedDebitCardId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "debit" | "pix" | "cash" | "transfer" | "other">("cash");
  const [manualInstallments, setManualInstallments] = useState<string>("");
  const [aiInstallments, setAiInstallments] = useState<string>("");
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [splits, setSplits] = useState<SplitRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setMode("ai");
    setSelectedFile(null);
    setTextInput("");
    setManualDescription("");
    setManualAmount("");
    setManualCategoryId(null);
    setManualType("expense");
    setManualStatus("paid");
    setIsScheduled(false);
    setSelectedDate(undefined);
    setSelectedCreditCardId(null);
    setSelectedDebitCardId(null);
    setPaymentMethod("cash");
    setManualInstallments("");
    setAiInstallments("");
    setIsSplitMode(false);
    setSplits([]);
    setIsSubmitting(false);
    setError(null);
    setSuccessMessage(null);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "ai") {
        if (!selectedFile && textInput.trim().length < 6) {
          setError("Envie um arquivo ou descreva a transação (min. 6 caracteres).");
          return;
        }

        await processUnstructuredTransaction({
          file: selectedFile ?? undefined,
          text: textInput.trim() ? textInput.trim() : undefined,
          isScheduled,
          date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
          creditCardId: paymentMethod === "credit_card" ? (selectedCreditCardId ?? undefined) : undefined,
          debitCardId: paymentMethod === "debit" ? (selectedDebitCardId ?? undefined) : undefined,
          installments: aiInstallments ? Number(aiInstallments) : undefined,
        });

        setSuccessMessage("Transação enviada! A IA já está organizando tudo por aqui.");
      } else {
        const amountValue = Number(manualAmount.replace(",", "."));
        if (!manualDescription.trim()) {
          setError("Informe a descrição da transação.");
          return;
        }
        if (!Number.isFinite(amountValue) || amountValue <= 0) {
          setError("Informe um valor valido maior que zero.");
          return;
        }
        if (!manualCategoryId) {
          setError("Selecione uma categoria.");
          return;
        }
        if (!isSplitMode && paymentMethod === "credit_card" && !selectedCreditCardId) {
          setError("Selecione um cartão de crédito.");
          return;
        }
        if (!isSplitMode && paymentMethod === "debit" && !selectedDebitCardId) {
          setError("Selecione um cartão de débito.");
          return;
        }

        const installmentsValue = Number(manualInstallments);
        if (manualInstallments && (!Number.isInteger(installmentsValue) || installmentsValue < 1)) {
          setError("Informe um número de parcelas válido (inteiro maior que 0).");
          return;
        }

        if (isSplitMode) {
          if (splits.length < 2) {
            setError("Adicione pelo menos 2 metodos para dividir o pagamento.");
            return;
          }

          const splitTotal = splits.reduce((sum, split) => sum + (Number(split.amount) || 0), 0);
          if (Math.abs(splitTotal - amountValue) > 0.01) {
            setError("A soma dos metodos de pagamento deve ser igual ao valor total.");
            return;
          }

          const invalidCreditSplit = splits.some(
            (split) => split.paymentMethod === "credit_card" && !split.creditCardId,
          );
          if (invalidCreditSplit) {
            setError("Selecione o cartão em todos os splits de crédito.");
            return;
          }

          const invalidDebitSplit = splits.some(
            (split) => split.paymentMethod === "debit" && !split.debitCardId,
          );
          if (invalidDebitSplit) {
            setError("Selecione o cartão em todos os splits de débito.");
            return;
          }
        }

        const category = categories.find((item) => item.id === manualCategoryId);
        if (!category) {
          setError("Categoria invalida.");
          return;
        }

        await createManualTransaction({
          amount: amountValue,
          description: manualDescription.trim(),
          category: category.name,
          type: manualType,
          status: manualStatus,
          dueDate: isScheduled && selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
          paymentDate: !isScheduled && selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
          installments: manualInstallments ? Number(manualInstallments) : undefined,
          creditCardId: !isSplitMode && paymentMethod === "credit_card" ? (selectedCreditCardId ?? undefined) : undefined,
          debitCardId: !isSplitMode && paymentMethod === "debit" ? (selectedDebitCardId ?? undefined) : undefined,
          splits: isSplitMode
            ? splits.map((split) => ({
                amount: Number(split.amount),
                paymentMethod: split.paymentMethod,
                creditCardId: split.paymentMethod === "credit_card" ? (split.creditCardId ?? null) : null,
                debitCardId: split.paymentMethod === "debit" ? (split.debitCardId ?? null) : null,
              }))
            : undefined,
        });

        await refresh();
        setSuccessMessage("Transação manual criada com sucesso.");
      }

      setTimeout(() => {
        setOpen(false);
        resetState();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível processar a transação agora.");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          resetState();
        }
      }}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="mx-auto w-full max-w-3xl flex flex-col overflow-y-auto overflow-x-hidden p-2 sm:p-2">
        <SheetHeader className="p-0">
          <SheetTitle className="text-lg">Nova Transação</SheetTitle>
          <SheetDescription>
            Escolha entre criacao manual ou assistida por IA.
          </SheetDescription>
        </SheetHeader>

        <form id="new-transaction-form" onSubmit={handleSubmit} className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          <SheetBody className="space-y-6 overflow-x-hidden">
            <Tabs value={mode} onValueChange={(value) => setMode(value as "ai" | "manual")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ai">Assistida por IA</TabsTrigger>
                <TabsTrigger value="manual">Manual</TabsTrigger>
              </TabsList>

              <AiTransactionTab
                selectedFile={selectedFile}
                onFileChange={(file) => {
                  setSelectedFile(file);
                  setError(null);
                }}
                textInput={textInput}
                onTextInputChange={setTextInput}
                installments={aiInstallments}
                onInstallmentsChange={setAiInstallments}
              />

              <ManualTransactionTab
                manualDescription={manualDescription}
                onManualDescriptionChange={setManualDescription}
                manualAmount={manualAmount}
                onManualAmountChange={setManualAmount}
                manualInstallments={manualInstallments}
                onManualInstallmentsChange={setManualInstallments}
                manualCategoryId={manualCategoryId}
                onManualCategoryIdChange={setManualCategoryId}
                manualType={manualType}
                onManualTypeChange={setManualType}
                manualStatus={manualStatus}
                onManualStatusChange={setManualStatus}
              />
            </Tabs>

            <TransactionDetails
              isScheduled={isScheduled}
              onIsScheduledChange={(v) => setIsScheduled(v)}
              date={selectedDate}
              onDateChange={setSelectedDate}
              creditCardId={selectedCreditCardId}
              onCreditCardChange={setSelectedCreditCardId}
              debitCardId={selectedDebitCardId}
              onDebitCardChange={setSelectedDebitCardId}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              isSplitMode={isSplitMode}
              onSplitModeChange={setIsSplitMode}
              splits={splits}
              onSplitsChange={setSplits}
              totalAmount={mode === "manual" ? Number(manualAmount || 0) : 0}
            />

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            {successMessage && <p className="text-sm font-medium text-emerald-600">{successMessage}</p>}

            <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status do envio</span>
                <span className="text-xs text-muted-foreground">
                  {isSubmitting
                    ? mode === "ai"
                      ? "IA estruturando dados"
                      : "Salvando transação"
                    : "Pronto para enviar"}
                </span>
              </div>
              <Progress value={isSubmitting ? 66 : successMessage ? 100 : 4} className="h-2" />
            </div>
          </SheetBody>

          <SheetFooter className="gap-2 sm:flex-row">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting} className="w-full sm:flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:flex-1">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "ai" ? "Enviar para IA" : "Salvar manualmente"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}



