import { Attachment, attachmentsService } from "@/services/attachments.service";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useTransactionAttachments() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAttachments = useCallback(async (transactionId: string) => {
    setIsLoading(true);
    try {
      const data = await attachmentsService.getAttachments({ transactionId });
      setAttachments(data);
    } catch (error) {
      console.error("Erro ao carregar anexos:", error);
      toast.error("Não foi possível carregar os anexos");
      setAttachments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAttachments([]);
  }, []);

  return {
    attachments,
    isLoading,
    loadAttachments,
    reset,
  };
}
