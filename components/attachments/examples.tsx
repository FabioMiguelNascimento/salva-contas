"use client";

/**
 * EXEMPLO DE USO DO ATTACHMENTS MANAGER
 * 
 * Este arquivo demonstra como integrar o componente AttachmentsManager
 * em uma página de detalhes de transação.
 * 
 * Para usar em produção:
 * 1. Copie o código relevante para sua página de transação
 * 2. Ajuste os imports conforme necessário
 * 3. Integre com seu sistema de roteamento
 */

import { AttachmentsManager } from "@/components/attachments/attachments-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface TransactionDetailsProps {
  transactionId: string;
  // Outras props da transação
}

export function TransactionDetailsExample({ transactionId }: TransactionDetailsProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Detalhes da Transação</h1>
      </div>

      {/* Informações da Transação */}
      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Seu conteúdo de transação aqui */}
          <div className="space-y-2">
            <p><strong>Descrição:</strong> Exemplo de transação</p>
            <p><strong>Valor:</strong> R$ 150,00</p>
            <p><strong>Data:</strong> 05/02/2026</p>
          </div>
        </CardContent>
      </Card>

      {/* Gerenciador de Anexos */}
      <AttachmentsManager transactionId={transactionId} />
    </div>
  );
}

// ============================================
// EXEMPLO 2: Integração em modal/dialog
// ============================================

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
}

export function TransactionModalExample({
  isOpen,
  onClose,
  transactionId,
}: TransactionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Transação</DialogTitle>
          <DialogDescription>
            Visualize e gerencie os anexos desta transação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Informações da transação */}
          <div className="grid gap-2">
            <p><strong>Descrição:</strong> Exemplo de transação</p>
            <p><strong>Valor:</strong> R$ 150,00</p>
          </div>

          {/* Anexos */}
          <AttachmentsManager transactionId={transactionId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// EXEMPLO 3: Uso com hook personalizado
// ============================================

import { useAttachments } from "@/hooks/use-attachments";
import { useEffect } from "react";

export function CustomAttachmentsExample({ transactionId }: { transactionId: string }) {
  const {
    attachments,
    isLoading,
    loadAttachments,
    uploadAttachment,
    deleteAttachment,
  } = useAttachments(transactionId);

  useEffect(() => {
    loadAttachments();
  }, [transactionId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadAttachment(file, "Boleto referente a esta transação");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Anexos ({attachments.length})
      </h3>

      {/* Input customizado */}
      <input
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFileUpload}
        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold"
      />

      {/* Lista customizada */}
      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div>
                <p className="font-medium">{attachment.originalName}</p>
                <p className="text-sm text-muted-foreground">
                  {attachment.description}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteAttachment(attachment.id)}
              >
                Remover
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
