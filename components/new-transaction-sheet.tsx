"use client";

import { CreditCardSelect } from "@/components/credit-card-select";
import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useFinance } from "@/hooks/use-finance";
import { cn } from "@/lib/utils";
import { formatISO } from "date-fns";
import { Loader2, TextQuote, Upload } from "lucide-react";
import { useCallback, useState } from "react";

interface NewTransactionSheetProps {
  trigger: React.ReactNode;
}

export function NewTransactionDialog({ trigger }: NewTransactionSheetProps) {
  const { processUnstructuredTransaction } = useFinance();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "text">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedCreditCardId, setSelectedCreditCardId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setActiveTab("upload");
    setSelectedFile(null);
    setTextInput("");
    setIsScheduled(false);
    setSelectedDate(undefined);
    setSelectedCreditCardId(null);
    setIsSubmitting(false);
    setError(null);
    setSuccessMessage(null);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (activeTab === "upload" && !selectedFile) {
      setError("Selecione um recibo ou boleto para continuar.");
      return;
    }

    if (activeTab === "text" && textInput.trim().length < 6) {
      setError("Descreva brevemente a transação para a IA entender o contexto.");
      return;
    }

    if (!selectedDate) {
      setError(isScheduled ? "Informe a data de vencimento." : "Informe a data da compra.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await processUnstructuredTransaction({
        file: activeTab === "upload" ? selectedFile ?? undefined : undefined,
        text: activeTab === "text" ? textInput.trim() : undefined,
        isScheduled,
        date: formatISO(selectedDate),
        creditCardId: selectedCreditCardId ?? undefined,
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
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
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Nova Transação assistida por IA</SheetTitle>
          <SheetDescription>
            Envie um comprovante ou descreva rapidamente o gasto. O Gemini identifica categoria, datas e valores para
            você não perder tempo preenchendo tabelas.
          </SheetDescription>
        </SheetHeader>

        <form id="new-transaction-form" onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <SheetBody className="space-y-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "upload" | "text")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" /> Upload
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <TextQuote className="h-4 w-4" /> Texto livre
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-4 space-y-4">
                <Label className="text-sm font-semibold text-muted-foreground">Arraste o arquivo ou clique para procurar</Label>
                <label
                  htmlFor="file"
                  className={cn(
                    "flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/40 text-center",
                    selectedFile && "border-emerald-400 bg-emerald-50 text-emerald-600"
                  )}
                >
                  <Input id="file" type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm">
                    {selectedFile ? selectedFile.name : "JPG, PNG ou PDF até 10MB"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Capturamos automaticamente valores, datas e categorias.
                  </p>
                </label>
              </TabsContent>

              <TabsContent value="text" className="mt-4 space-y-4">
                <Label htmlFor="text-input" className="text-sm font-semibold text-muted-foreground">
                  Descreva a transação
                </Label>
                <Textarea
                  id="text-input"
                  value={textInput}
                  onChange={(event) => setTextInput(event.target.value)}
                  placeholder="Ex.: Gastei 42,90 no mercado Dia para comprar itens do jantar"
                  className="min-h-[120px] resize-none"
                />
              </TabsContent>
            </Tabs>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Detalhes do lançamento</Label>
              <div className="flex items-center gap-2 rounded-xl border border-border/60 p-4">
                <Checkbox id="schedule" checked={isScheduled} onCheckedChange={(value) => setIsScheduled(Boolean(value))} />
                <div className="space-y-0.5">
                  <Label htmlFor="schedule" className="font-medium">
                    É uma conta a pagar/agendamento?
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Se marcado, definimos data de vencimento. Caso contrário, consideramos como compra já realizada.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-1">
                <div className="space-y-2">
                  <Label>{isScheduled ? "Data de vencimento" : "Data da compra"}</Label>
                  <DatePicker
                    date={selectedDate}
                    onChange={setSelectedDate}
                    placeholder={isScheduled ? "Quando vence?" : "Quando aconteceu?"}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cartão de crédito (opcional)</Label>
                <CreditCardSelect
                  value={selectedCreditCardId}
                  onValueChange={setSelectedCreditCardId}
                  placeholder="Nenhum"
                />
                <p className="text-xs text-muted-foreground">
                  Se for uma compra no cartão, selecione para vincular automaticamente.
                </p>
              </div>
            </div>

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
