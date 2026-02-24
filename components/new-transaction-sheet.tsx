"use client";

import { AttachmentUploader } from "@/components/new-transaction/attachment-uploader";
import { TransactionDetails } from "@/components/new-transaction/transaction-details";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { useFinance } from "@/hooks/use-finance";
import { formatISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

interface NewTransactionSheetProps {
  trigger: React.ReactNode;
}

export function NewTransactionDialog({ trigger }: NewTransactionSheetProps) {
  const { processUnstructuredTransaction } = useFinance();
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedCreditCardId, setSelectedCreditCardId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "debit" | "pix" | "cash" | "transfer" | "other">("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setTextInput("");
    setIsScheduled(false);
    setSelectedDate(undefined);
    setSelectedCreditCardId(null);
    setPaymentMethod("cash");
    setIsSubmitting(false);
    setError(null);
    setSuccessMessage(null);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile && textInput.trim().length < 6) {
      setError("Envie um arquivo ou descreva a transação (mín. 6 caracteres)." );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await processUnstructuredTransaction({
        file: selectedFile ?? undefined,
        text: textInput.trim() ? textInput.trim() : undefined,
        isScheduled,
        date: selectedDate ? formatISO(selectedDate) : undefined,
        creditCardId: paymentMethod === "credit_card" ? (selectedCreditCardId ?? undefined) : undefined,
      });

      setSuccessMessage("Transação enviada! A IA já está organizando tudo por aqui.");
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
      <SheetContent className="flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nova Transação assistida por IA</SheetTitle>
          <SheetDescription>
            Envie um comprovante ou descreva rapidamente o gasto. O Gemini identifica categoria, datas e valores para
            você não perder tempo preenchendo tabelas.
          </SheetDescription>
        </SheetHeader>

        <form id="new-transaction-form" onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <SheetBody className="space-y-6">
              <AttachmentUploader file={selectedFile} onFileChange={(f) => { setSelectedFile(f); setError(null); }} />

              <div className="mt-3 space-y-2">
                <Label htmlFor="upload-text-input" className="text-sm font-semibold text-muted-foreground">Descrição / contexto (opcional)</Label>
                <Textarea
                  id="upload-text-input"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Adicione uma observação que será enviada junto com o arquivo"
                  className="min-h-20 resize-none"
                />
                <p className="text-xs text-muted-foreground">Envie um arquivo, um texto (mín. 6 caracteres) ou ambos.</p>
              </div>

            <TransactionDetails
              isScheduled={isScheduled}
              onIsScheduledChange={(v) => setIsScheduled(v)}
              date={selectedDate}
              onDateChange={setSelectedDate}
              creditCardId={selectedCreditCardId}
              onCreditCardChange={setSelectedCreditCardId}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              isSplitMode={false}
              onSplitModeChange={() => {}}
              splits={[]}
              onSplitsChange={() => {}}
              totalAmount={0}
            />

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            {successMessage && <p className="text-sm font-medium text-emerald-600">{successMessage}</p>}

            <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status do envio</span>
                <span className="text-xs text-muted-foreground">
                  {isSubmitting ? "IA estruturando dados" : "Pronto para enviar"}
                </span>
              </div>
              <Progress value={isSubmitting ? 66 : successMessage ? 100 : 4} className="h-2" />
            </div>
          </SheetBody>

          <SheetFooter className="flex-row gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar para IA
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
