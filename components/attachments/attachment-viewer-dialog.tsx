"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Attachment } from "@/services/attachments.service";
import { ExternalLink, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface AttachmentViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachments: Attachment[];
  isLoading?: boolean;
}

export function AttachmentViewerDialog({
  open,
  onOpenChange,
  attachments,
  isLoading,
}: AttachmentViewerDialogProps) {
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

  // Seleciona automaticamente o primeiro anexo quando carrega
  useEffect(() => {
    if (!isLoading && attachments.length > 0 && !selectedAttachment) {
      setSelectedAttachment(attachments[0]);
    }
  }, [attachments, isLoading, selectedAttachment]);

  // Reseta seleção quando fecha o dialog
  useEffect(() => {
    if (!open) {
      setSelectedAttachment(null);
    }
  }, [open]);

  const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const renderAttachmentPreview = (attachment: Attachment) => {
    if (attachment.type === "pdf") {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Visualização do PDF</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openInNewTab(attachment.storageUrl)}
            >
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              Abrir em nova aba
            </Button>
          </div>
          <div className="relative w-full overflow-hidden rounded-lg border bg-muted/20">
            <iframe
              src={attachment.storageUrl}
              className="h-[600px] w-full"
              title={attachment.originalName}
            />
          </div>
        </div>
      );
    }

    if (attachment.type === "image") {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Visualização da imagem</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openInNewTab(attachment.storageUrl)}
            >
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              Abrir em nova aba
            </Button>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-muted/20">
            <img
              src={attachment.storageUrl}
              alt={attachment.originalName}
              className="mx-auto max-h-[600px] w-auto object-contain"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <FileText className="mb-2 h-12 w-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Visualização não disponível para este tipo de arquivo
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-4"
          onClick={() => openInNewTab(attachment.storageUrl)}
        >
          <ExternalLink className="mr-2 h-3.5 w-3.5" />
          Abrir arquivo
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {selectedAttachment
              ? selectedAttachment.originalName
              : "Anexos e comprovantes"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : selectedAttachment ? (
          <div className="space-y-4">
            {attachments.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAttachment(null)}
              >
                ← Ver todos os anexos ({attachments.length})
              </Button>
            )}
            {renderAttachmentPreview(selectedAttachment)}
            {selectedAttachment.description && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">
                  {selectedAttachment.description}
                </p>
              </div>
            )}
          </div>
        ) : attachments.length > 0 ? (
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <button
                  key={attachment.id}
                  onClick={() => setSelectedAttachment(attachment)}
                  className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                >
                  {attachment.type === "pdf" ? (
                    <FileText className="h-8 w-8 text-red-500" />
                  ) : attachment.type === "image" ? (
                    <ImageIcon className="h-8 w-8 text-blue-500" />
                  ) : (
                    <FileText className="h-8 w-8 text-gray-500" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{attachment.originalName}</p>
                    <p className="text-xs text-muted-foreground">
                      {(attachment.fileSize / 1024).toFixed(2)} KB •{" "}
                      {attachment.type.toUpperCase()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <FileText className="mb-2 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhum anexo encontrado para esta transação
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
