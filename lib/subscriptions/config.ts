export type PlanTier = 'FREE' | 'PRO' | 'FAMILY';
export type BillingCycle = 'monthly' | 'yearly';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  priceId: {
    monthly: string;
    yearly: string;
  };
  features: string[];
  cta: string;
  popular: boolean;
}

export const SUBSCRIPTION_PLANS: Record<PlanTier, PlanConfig> = {
  FREE: {
    id: 'FREE',
    name: 'Grátis',
    description: 'Para começar a organizar',
    price: { monthly: 0, yearly: 0 },
    priceId: { monthly: '', yearly: '' },
    features: [
      'Até 3 cofrinhos',
      'Histórico de 3 meses',
      'Boletinho básico',
      'Categorias automáticas',
      'Suporte por email',
    ],
    cta: 'Começar grátis',
    popular: false,
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    description: 'Controle total das finanças',
    price: { monthly: 19.9, yearly: 14.9 },
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || '',
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || '',
    },
    features: [
      'Cofrinhos ilimitados',
      'Histórico completo',
      'Boletinho avançado com IA',
      'Relatórios detalhados',
      'Metas personalizadas',
      'Exportação de dados',
      'Suporte prioritário',
    ],
    cta: 'Assinar Pro',
    popular: true,
  },
  FAMILY: {
    id: 'FAMILY',
    name: 'Família',
    description: 'Finanças em conjunto',
    price: { monthly: 39.9, yearly: 29.9 },
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_MONTHLY || '',
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_YEARLY || '',
    },
    features: [
      'Tudo do Pro',
      'Até 5 usuários',
      'Cofrinhos compartilhados',
      'Dashboard familiar',
      'Controle de mesada',
      'Relatórios consolidados',
      'Suporte VIP',
    ],
    cta: 'Assinar Família',
    popular: false,
  },
};

export const COMPARISON_FEATURES = [
  { name: 'Cofrinhos', FREE: '3', PRO: 'Ilimitados', FAMILY: 'Ilimitados' },
  { name: 'Histórico', FREE: '3 meses', PRO: 'Completo', FAMILY: 'Completo' },
  { name: 'Boletinho IA', FREE: 'Básico', PRO: 'Avançado', FAMILY: 'Avançado' },
  { name: 'Relatórios', FREE: 'Simples', PRO: 'Detalhados', FAMILY: 'Consolidados' },
  { name: 'Exportação', FREE: '-', PRO: 'CSV, PDF', FAMILY: 'CSV, PDF' },
  { name: 'Usuários', FREE: '1', PRO: '1', FAMILY: '5' },
  { name: 'Suporte', FREE: 'Email', PRO: 'Prioritário', FAMILY: 'VIP' },
];
