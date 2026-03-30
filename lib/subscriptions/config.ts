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
  mpPlanId: {
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
    mpPlanId: { monthly: '', yearly: '' },
    features: [
      '1 usuário',
      'Histórico de 3 meses',
      'Cofrinhos bloqueados (0)',
      'Relatórios simples',
      'Exportação de dados bloqueada',
      'Boletinho IA básico (até 5 mensagens/mês)',
      'Leitura de recibos bloqueada',
      'Auditoria de gastos bloqueada',
      'Suporte por email',
    ],
    cta: 'Começar grátis',
    popular: false,
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    description: 'Controle total das finanças',
    price: { monthly: 14.9, yearly: 10.9 },
    mpPlanId: {
      monthly: process.env.NEXT_PUBLIC_MP_PLAN_PRO_MONTHLY || process.env.NEXT_PUBLIC_MERCADO_PAGO_PRO_MONTHLY || '',
      yearly: process.env.NEXT_PUBLIC_MP_PLAN_PRO_YEARLY || process.env.NEXT_PUBLIC_MERCADO_PAGO_PRO_YEARLY || '',
    },
    features: [
      '1 usuário',
      'Histórico completo',
      'Cofrinhos ilimitados',
      'Relatórios detalhados',
      'Exportação de dados liberada',
      'Boletinho IA avançado (até 50 mensagens/mês)',
      'Leitura de recibos (até 30/mês)',
      'Auditoria de gastos bloqueada',
      'Suporte prioritário',
    ],
    cta: 'Assinar Pro',
    popular: true,
  },
  FAMILY: {
    id: 'FAMILY',
    name: 'Família',
    description: 'Finanças em conjunto',
    price: { monthly: 27.9, yearly: 22.9 },
    mpPlanId: {
      monthly: process.env.NEXT_PUBLIC_MP_PLAN_FAMILY_MONTHLY || process.env.NEXT_PUBLIC_MERCADO_PAGO_FAMILY_MONTHLY || '',
      yearly: process.env.NEXT_PUBLIC_MP_PLAN_FAMILY_YEARLY || process.env.NEXT_PUBLIC_MERCADO_PAGO_FAMILY_YEARLY || '',
    },
    features: [
      'Até 5 usuários',
      'Histórico completo',
      'Cofrinhos ilimitados',
      'Relatórios consolidados',
      'Exportação de dados liberada',
      'Boletinho IA avançado (até 200 mensagens/mês para o grupo)',
      'Leitura de recibos (até 100/mês para o grupo)',
      'Auditoria de gastos liberada',
      'Suporte VIP',
    ],
    cta: 'Assinar Família',
    popular: false,
  },
};

export const COMPARISON_FEATURES = [
  { name: 'Limite de Usuários', FREE: '1 (Individual)', PRO: '1 (Individual)', FAMILY: 'Até 5 pessoas' },
  { name: 'Histórico de Transações', FREE: 'Últimos 3 meses', PRO: 'Completo (Ilimitado)', FAMILY: 'Completo (Ilimitado)' },
  { name: 'Cofrinhos (Metas)', FREE: 'Bloqueado (0)', PRO: 'Ilimitados', FAMILY: 'Ilimitados' },
  { name: 'Relatórios e Dashboards', FREE: 'Simples', PRO: 'Detalhados', FAMILY: 'Consolidados (Visão da Família)' },
  { name: 'Exportação (CSV/PDF)', FREE: 'Bloqueado', PRO: 'Liberado', FAMILY: 'Liberado' },
  { name: 'Consultor Boletinho IA', FREE: 'Básico (Ex: 5 msgs/mês)', PRO: 'Avançado (Ex: 50 msgs/mês)', FAMILY: 'Avançado (Ex: 200 msgs/mês pro grupo)' },
  { name: 'Leitura de Recibos (IA)', FREE: 'Bloqueado', PRO: 'Até 30 recibos/mês', FAMILY: 'Até 100 recibos/mês pro grupo' },
  { name: 'Auditoria de Gastos', FREE: 'Bloqueado', PRO: 'Bloqueado', FAMILY: 'Liberado (Exclusivo Família)' },
  { name: 'Nível de Suporte', FREE: 'Email (Padrão)', PRO: 'Prioritário', FAMILY: 'VIP' },
];
