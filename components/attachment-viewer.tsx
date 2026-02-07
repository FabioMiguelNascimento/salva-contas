"use client";

import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, FileText, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface AttachmentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachmentUrl?: string | null;
  attachmentOriginalName?: string | null;
  attachmentMimeType?: string | null;
}

export function AttachmentViewer({
  open,
  onOpenChange,
  attachmentUrl,
  attachmentOriginalName,
  attachmentMimeType,
}: AttachmentViewerProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isImage = attachmentMimeType?.startsWith("image/");
  const isPdf = attachmentMimeType === "application/pdf";

  useEffect(() => {
    setImageLoaded(false);
  }, [attachmentUrl]);

  const handleOpenInNewTab = () => {
    if (attachmentUrl) {
      window.open(attachmentUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (!attachmentUrl) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Anexo não disponível</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <FileText className="mr-2 h-5 w-5" />
            Nenhum anexo encontrado
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full! h-full flex flex-col">
        <DialogHeader className="pb-4 flex flex-row justify-between pr-6 flex-wrap">
            <DialogTitle className="flex gap-2 items-center ">
              {isImage && <ImageIcon className="h-4 w-4 shrink-0" />}
              {isPdf && <FileText className="h-4 w-4 shrink-0" />}
              <span className="text-sm break-words">
                {(attachmentOriginalName || "Anexo").length > 10
                  ? (attachmentOriginalName || "Anexo").slice(0, 20) + "..."
                  : attachmentOriginalName || "Anexo"}
              </span>
            </DialogTitle>

            <div className="flex gap-2 ml-auto">
              <ShareButton
                title={attachmentOriginalName || "Anexo"}
                text="Confira este anexo"
                fileUrl={attachmentUrl}
                fileName={attachmentOriginalName ? attachmentOriginalName : undefined}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                title="Abrir em nova aba"
              >
                <ExternalLink />
                <span>Nova aba</span>
              </Button>
            </div>
        </DialogHeader>
        
        <div className="flex-1">
          {isImage && (
            <div className="w-full h-full flex items-start justify-center relative">
              {!imageLoaded && <Skeleton className="absolute inset-0 w-full h-full" />}
              <img
                src={attachmentUrl}
                alt={attachmentOriginalName || "Anexo"}
                className="max-w-full max-h-full object-contain"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
            </div>
          )}
          
          {isPdf && (
            <div className="w-full h-full">
              <iframe
                src={attachmentUrl}
                title={attachmentOriginalName || "PDF"}
                className="w-full h-full"
              />
            </div>
          )}
          
          {!isImage && !isPdf && (
            <div className="w-full h-full flex items-center justify-center flex-col">
              <FileText />
              <p>Visualização não disponível para este tipo de arquivo</p>
              <a
                href={attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Baixar arquivo
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
