"use client";

import { attachmentsService, type UploadAttachmentData } from "@/services/attachments.service";
import { useState } from "react";
import { toast } from "sonner";

export function useAttachments(transactionId?: string, subscriptionId?: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const uploadAttachment = async (file: File, description?: string) => {
    setIsUploading(true);
    try {
      const data: UploadAttachmentData = {
        file,
        transactionId,
        subscriptionId,
        description,
      };

      const attachment = await attachmentsService.upload(data);
      setAttachments((prev) => [attachment, ...prev]);
      toast.success("Arquivo enviado com sucesso!");
      return attachment;
    } catch (error) {
      console.error("Error uploading attachment:", error);
      toast.error("Erro ao enviar arquivo");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const loadAttachments = async () => {
    setIsLoading(true);
    try {
      const data = await attachmentsService.getAttachments({
        transactionId,
        subscriptionId,
      });
      setAttachments(data);
    } catch (error) {
      console.error("Error loading attachments:", error);
      toast.error("Erro ao carregar anexos");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAttachment = async (id: string) => {
    try {
      await attachmentsService.deleteAttachment(id);
      setAttachments((prev) => prev.filter((a) => a.id !== id));
      toast.success("Arquivo removido com sucesso!");
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast.error("Erro ao remover arquivo");
      throw error;
    }
  };

  const updateAttachment = async (id: string, description: string) => {
    try {
      const updated = await attachmentsService.updateAttachment(id, description);
      setAttachments((prev) =>
        prev.map((a) => (a.id === id ? updated : a))
      );
      toast.success("Descrição atualizada!");
    } catch (error) {
      console.error("Error updating attachment:", error);
      toast.error("Erro ao atualizar descrição");
      throw error;
    }
  };

  return {
    attachments,
    isUploading,
    isLoading,
    uploadAttachment,
    loadAttachments,
    deleteAttachment,
    updateAttachment,
  };
}
