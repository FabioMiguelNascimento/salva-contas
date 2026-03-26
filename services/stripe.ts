import { apiClient } from '../lib/api-client';

export interface CheckoutSessionResponse {
  url: string;
}

export const stripeService = {
  createCheckoutSession: async (priceId: string) => {
    const { data } = await apiClient.post<CheckoutSessionResponse>('/stripe/checkout', {
      priceId,
    });
    return data;
  },

  createPortalSession: async () => {
    const { data } = await apiClient.post<CheckoutSessionResponse>('/stripe/portal');
    return data;
  },
};
