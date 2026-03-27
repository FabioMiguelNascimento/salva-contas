"use client"

import { BillingCycle, PlanConfig, SUBSCRIPTION_PLANS } from "@/lib/subscriptions/config"
import { mercadoPagoService } from "@/services/mercado-pago"
import { useState } from "react"
import { toast } from "sonner"
import { useAuth } from "./use-auth"

export function useSubscription() {
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const currentPlan = SUBSCRIPTION_PLANS[user?.planTier || 'FREE']

  const handleSubscribe = async (plan: PlanConfig, cycle: BillingCycle) => {
    if (!isAuthenticated) {
      const next = encodeURIComponent(`/precos?plan=${plan.id}&cycle=${cycle}`)
      window.location.href = `/cadastro?plan=${plan.id}&cycle=${cycle}&next=${next}`
      return
    }

    if (plan.id === "FREE") {
      window.location.href = "/app/dashboard"
      return
    }

    const mpPlanId = plan.mpPlanId[cycle]
    if (!mpPlanId) {
      toast.error("Este plano ainda não está configurado para cobrança do Mercado Pago.")
      return
    }

    try {
      setIsLoading(true)
      const { url } = await mercadoPagoService.createCheckoutUrl(plan.id, cycle)
      window.location.href = url
    } catch (error: any) {
      console.error("Mercado Pago Checkout Error:", error)
      toast.error(error?.message || "Erro ao iniciar processo de pagamento.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageBilling = async () => {
    if (!user?.mpCustomerId) {
      toast.error("Você ainda não possui uma assinatura ativa para gerenciar.")
      return
    }

    // Portal do Mercado Pago não é suportado diretamente ainda;
    // redirecione o usuário para o painel oficial manualmente.
    window.location.href = "https://www.mercadopago.com.br/";
  }

  return {
    currentPlan,
    isLoading,
    handleSubscribe,
    handleManageBilling,
    isAuthenticated,
  }
}
