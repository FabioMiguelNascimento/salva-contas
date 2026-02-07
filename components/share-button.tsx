'use client';

import { Button } from '@/components/ui/button';
import { downloadAttachment } from '@/services/attachments';
import { Check, Loader2, Share2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  text: string;
  fileUrl?: string;
  fileName?: string;
}

export function ShareButton({ title, text, fileUrl, fileName = "arquivo" }: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleShare = async () => {
    setIsLoading(true);

    try {
      const shareData: ShareData = {
        title,
        text,
      };

      if (fileUrl) {
        try {
          const blob = await downloadAttachment(fileUrl);
          
          const type = blob.type; 
          const extension = type.split('/')[1] || 'bin';
          const finalName = fileName.includes('.') ? fileName : `${fileName}.${extension}`;

          const file = new File([blob], finalName, { type });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          } else {
            shareData.url = fileUrl;
            toast.warning("Seu navegador não suporta envio de arquivos. Enviando link.");
          }
        } catch (error) {
          console.error("Erro ao preparar arquivo:", error);
          toast.error("Erro ao baixar o arquivo para compartilhar.");
          shareData.url = fileUrl;
        }
      }

      await navigator.share(shareData);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);

    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Erro no share:', error);
        toast.error("Erro ao compartilhar.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      disabled={isLoading}
      onClick={handleShare}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSuccess ? (
        <Check className="h-4 w-4" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
      {isLoading ? "Baixando..." : isSuccess ? "Enviado!" : "Compartilhar"}
    </Button>
  );
}