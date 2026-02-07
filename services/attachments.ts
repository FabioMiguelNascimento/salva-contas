import { apiClient } from "@/lib/api-client";


export async function downloadAttachment(fileUrl: string): Promise<Blob> {
  const response = await fetch(fileUrl);
  
  if (!response.ok) {
    throw new Error("Falha ao baixar arquivo");
  }
  
  return await response.blob();
}