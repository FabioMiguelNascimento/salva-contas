import { apiClient } from "@/lib/api-client";


export interface Attachment {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  type: 'pdf' | 'image' | 'document';
  storageUrl: string;
  description?: string;
  transactionId?: string;
  subscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadAttachmentData {
  file: File;
  transactionId?: string;
  subscriptionId?: string;
  description?: string;
}

export interface GetAttachmentsParams {
  transactionId?: string;
  subscriptionId?: string;
  type?: 'pdf' | 'image' | 'document';
}

export const attachmentsService = {
  async upload(data: UploadAttachmentData): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', data.file);
    
    if (data.transactionId) {
      formData.append('transactionId', data.transactionId);
    }
    if (data.subscriptionId) {
      formData.append('subscriptionId', data.subscriptionId);
    }
    if (data.description) {
      formData.append('description', data.description);
    }

    const response = await apiClient.post('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  async getAttachments(params: GetAttachmentsParams): Promise<Attachment[]> {
    const response = await apiClient.get('/attachments', { params });
    return response.data.data;
  },

  async updateAttachment(id: string, description: string): Promise<Attachment> {
    const response = await apiClient.patch(`/attachments/${id}`, { description });
    return response.data.data;
  },

  async deleteAttachment(id: string): Promise<void> {
    await apiClient.delete(`/attachments/${id}`);
  },

  getFileUrl(storageUrl: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL!;
    return `${baseUrl}${storageUrl}`;
  },
};
