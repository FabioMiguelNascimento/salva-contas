"use client";

import { AttachmentUploader } from "@/components/new-transaction/attachment-uploader";
import { Input } from "@/components/ui/input";
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
    <TabsContent value="ai" className="mt-4 flex flex-col gap-3">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="file">Anexo</Label>
            <AttachmentUploader
              file={selectedFile}
              onFileChange={onFileChange}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="upload-text-input">Descrição / contexto</Label>
            <Textarea
              id="upload-text-input"
              value={textInput}
              onChange={(e) => onTextInputChange(e.target.value)}
              placeholder="Adicione uma observação que será enviada junto com o arquivo"
              className="min-h-20 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-installments">Parcelas (opcional)</Label>
            <Input
              id="ai-installments"
              type="number"
              min={1}
              value={installments}
              onChange={(e) => onInstallmentsChange(e.target.value)}
              placeholder="1"
            />
          </div>
        </div>
      </div>
    </TabsContent>
  );
}