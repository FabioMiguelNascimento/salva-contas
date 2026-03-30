"use client";

import { AttachmentUploader } from "@/components/new-transaction/attachment-uploader";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type AiTransactionTabProps = {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  textInput: string;
  onTextInputChange: (value: string) => void;
  installments: string;
  onInstallmentsChange: (value: string) => void;
};

export function AiTransactionTab({
  selectedFile,
  onFileChange,
  textInput,
  onTextInputChange,
  installments,
  onInstallmentsChange,
}: AiTransactionTabProps) {
  return (
    <TabsContent value="ai" className="mt-4 flex flex-col gap-4">
      <div className="space-y-4">
        <AttachmentUploader file={selectedFile} onFileChange={onFileChange} />

        <div className="space-y-2">
          <Label htmlFor="upload-text-input" className="text-sm font-semibold text-muted-foreground">
            Descrição / contexto (opcional)
          </Label>
          <Textarea
            id="upload-text-input"
            value={textInput}
            onChange={(e) => onTextInputChange(e.target.value)}
            placeholder="Adicione uma observacao que será enviada junto com o arquivo"
            className="min-h-20 resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Envie um arquivo, um texto (min. 6 caracteres) ou ambos.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ai-installments" className="text-sm font-semibold text-muted-foreground">
            Parcelas (opcional)
          </Label>
          <input
            id="ai-installments"
            type="number"
            min={1}
            value={installments}
            onChange={(e) => onInstallmentsChange(e.target.value)}
            placeholder="Ex: 1 para à vista, 3 para parcelado"
            className="w-full rounded-sm border border-border px-2 py-1"
          />
          <p className="text-xs text-muted-foreground">
            Força número de parcelas caso a IA não tenha identificado corretamente.
          </p>
        </div>
      </div>
    </TabsContent>
  );
}


