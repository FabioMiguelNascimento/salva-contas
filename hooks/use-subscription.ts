"use client"

import { useState } from "react"
import { useAuth } from "./use-auth"
import { stripeService } from "@/services/stripe"
import { toast } from "sonner"
import { BillingCycle, PlanConfig, SUBSCRIPTION_PLANS } from "@/lib/subscriptions/config"

export function useSubscription() {
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null)

  const currentPlan = SUBSCRIPTION_PLANS[user?.planTier || 'FREE']

  const handleSubscribe = async (plan: PlanConfig, cycle: BillingCycle) => {
    if (!isAuthenticated) {
      window.location.href = `/cadastro?plan=${plan.id}&cycle=${cycle}`
      return
    }

    if (plan.id === "FREE") {
      window.location.href = "/app/dashboard"
      return
    }

    const priceId = plan.priceId[cycle]
    if (!priceId) {
      toast.error("Este plano ainda não está configurado para cobrança.")
      return
    }

    try {
      setIsLoading(true)
      setLoadingPriceId(priceId)
      const { url } = await stripeService.createCheckoutSession(priceId)
      window.location.href = url
    } catch (error: any) {
      console.error("Stripe Checkout Error:", error)
      toast.error(error?.message || "Erro ao iniciar processo de pagamento.")
    } finally {
      setIsLoading(false)
      setLoadingPriceId(null)
    }
  }

  const handleManageBilling = async () => {
    if (!user?.stripeCustomerId) {
      toast.error("Você ainda não possui uma assinatura ativa para gerenciar.")
      return
    }

    try {
      setIsLoading(true)
      const { url } = await stripeService.createPortalSession()
      window.location.href = url
    } catch (error: any) {
      console.error("Stripe Portal Error:", error)
      toast.error(error?.message || "Erro ao carregar portal de faturamento.")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    currentPlan,
    isLoading,
    loadingPriceId,
    handleSubscribe,
    handleManageBilling,
    isAuthenticated,
  }
}
