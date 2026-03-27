import { apiClient } from '@/lib/api-client';

export interface MercadoPagoCheckoutResponse {
  url: string;
}

export const mercadoPagoService = {
  createCheckoutUrl: async (planTier: 'PRO' | 'FAMILY', cycle: 'monthly' | 'yearly') => {
    const response = await apiClient.post<{ data: MercadoPagoCheckoutResponse }>("/mercado-pago/checkout", {
      planTier,
      cycle,
    });

    return response.data.data;
  },

};
