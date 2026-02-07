"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ExternalLink, FileText, Image as ImageIcon, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const [isCopied, setIsCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isImage = attachmentMimeType?.startsWith("image/");
  const isPdf = attachmentMimeType === "application/pdf";

  useEffect(() => {
    setImageLoaded(false);
  }, [attachmentUrl]);

  const handleShare = async () => {
    if (!attachmentUrl) return;

    if (navigator.share) {
      try {
        const shareData: ShareData = {
          title: attachmentOriginalName || "Anexo",
          text: "Confira este anexo",
          url: attachmentUrl,
        };

        if (isImage || isPdf) {
          try {
            const response = await fetch(attachmentUrl);
            const blob = await response.blob();
            const file = new File([blob], attachmentOriginalName || "anexo", { type: attachmentMimeType || "" });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
          } catch (err) {
            console.warn("Não foi possível anexar o arquivo ao compartilhamento:", err);
          }
        }

        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Erro ao compartilhar:", error);
          toast.error("Erro ao abrir menu de compartilhamento.");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(attachmentUrl);
        setIsCopied(true);
        toast.success("Link copiado para a área de transferência!");
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        toast.error("Não foi possível compartilhar.");
      }
    }
  };

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
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                title={isCopied ? "Copiado!" : "Compartilhar"}
              >
                {isCopied ? <Check /> : <Share2 />}
                <span>{isCopied ? "Copiado!" : "Compartilhar"}</span>
              </Button>

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
