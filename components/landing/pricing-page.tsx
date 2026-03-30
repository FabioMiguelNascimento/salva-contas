"use client"

import { PlansGrid } from "@/components/landing/plans-grid"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/hooks/use-subscription"
import { BillingCycle, COMPARISON_FEATURES, PlanTier, SUBSCRIPTION_PLANS } from "@/lib/subscriptions/config"
import { Check, ChevronDown, Lock } from "lucide-react"
import { useEffect, useState } from "react"

const faqs = [
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim! Você pode cancelar sua assinatura a qualquer momento. Seu acesso continua até o fim do período já pago."
  },
  {
    question: "Como funciona o período de teste?",
    answer: "Todos os planos pagos incluem 7 dias de teste grátis. Você pode cancelar antes do fim do teste sem ser cobrado."
  },
  {
    question: "Posso mudar de plano depois?",
    answer: "Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. A cobrança será ajustada proporcionalmente."
  },
]

export function PricingPage() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const queryPlan = searchParams.get("plan") as PlanTier | null
  const queryCycle = searchParams.get("cycle") as BillingCycle | null

  const { isAuthenticated, user } = useAuth()
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    queryCycle === "yearly" ? "yearly" : "monthly",
  )
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(queryPlan as PlanTier | null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const { handleSubscribe, isLoading } = useSubscription()

  const plansList = Object.values(SUBSCRIPTION_PLANS)

  useEffect(() => {
    if (!isAuthenticated) return
    if (queryPlan === "PRO" || queryPlan === "FAMILY") {
      setSelectedPlan(queryPlan)
      setBillingCycle(queryCycle === "yearly" ? "yearly" : "monthly")
    }
  }, [queryPlan, queryCycle, isAuthenticated])

  const isCurrentPlan = (planId: string) => {
    if (!isAuthenticated || !user) return false;
    const userTier = user.planTier || 'FREE';
    const userCycle = user.billingCycle || 'monthly';

    if (userTier === 'FREE' && planId === 'FREE') return true;

    return userTier === planId && userCycle === billingCycle;
  };

  const renderComparisonValue = (value: string) => {
    const normalized = value.toLowerCase()

    if (normalized.includes('bloqueado')) {
      return (
        <span className="inline-flex items-center justify-center gap-1 text-muted-foreground">
          <Lock className="h-4 w-4" />
          {value.replace(/bloqueado/i, 'Bloqueado')}
        </span>
      )
    }

    if (normalized.includes('liberado')) {
      return (
        <span className="inline-flex items-center justify-center gap-1 text-emerald-500 font-medium">
          <Check className="h-4 w-4" />
          {value.replace(/liberado/i, 'Liberado')}
        </span>
      )
    }

    return <span className="inline-flex items-center justify-center gap-1">{value}</span>
  }

  return (
    <div className="min-h-screen pt-24">
      <section className="relative py-20 overflow-hidden text-center">
        <div className="container relative mx-auto px-4">
          <span className="inline-block text-primary font-medium text-sm uppercase tracking-wider mb-4">
            Preços
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground text-balance leading-tight">
            Planos que cabem no seu <span className="font-serif italic">bolso</span>
          </h1>
          
          <div className="mt-10 inline-flex items-center gap-3 p-1.5 bg-secondary rounded-full">
            <Button
              variant={billingCycle === "monthly" ? "default" : "ghost"}
              onClick={() => setBillingCycle("monthly")}
              className="px-6 py-2.5 rounded-full"
            >
              Mensal
            </Button>
            <Button
              variant={billingCycle === "yearly" ? "default" : "ghost"}
              onClick={() => setBillingCycle("yearly")}
              className="px-6 py-2.5 rounded-full flex items-center gap-2"
            >
              Anual <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">-25%</span>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <PlansGrid
            plans={plansList}
            billingCycle={billingCycle}
            onBillingCycleChange={setBillingCycle}
            isCurrentPlan={isCurrentPlan}
            onPlanSelect={(plan) => {
              if (!isAuthenticated) {
                const next = encodeURIComponent(`/precos?plan=${plan.id}&cycle=${billingCycle}`)
                window.location.href = `/cadastro?plan=${plan.id}&cycle=${billingCycle}&next=${next}`
                return
              }

              setSelectedPlan(plan.id)
              handleSubscribe(plan, billingCycle)
            }}
          />
        </div>
      </section>

      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground">Funcionalidade</th>
                  <th className="text-center py-4 px-4 font-semibold">Grátis</th>
                  <th className="text-center py-4 px-4 font-semibold text-primary">Pro</th>
                  <th className="text-center py-4 px-4 font-semibold">Família</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((feature, index) => (
                  <tr key={feature.name} className={index % 2 === 0 ? "bg-card/50" : ""}>
                    <td className="py-4 px-4 text-foreground font-medium">{feature.name}</td>
                    <td className="text-center py-4 px-4">{renderComparisonValue(feature.FREE)}</td>
                    <td className="text-center py-4 px-4">{renderComparisonValue(feature.PRO)}</td>
                    <td className="text-center py-4 px-4">{renderComparisonValue(feature.FAMILY)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-center text-3xl font-medium mb-12">Perguntas frequentes</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-2xl border border-border bg-card overflow-hidden">
                <Button
                  variant="ghost"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="h-auto w-full justify-between p-6 text-left"
                >
                  <span className="font-medium text-foreground">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                </Button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-muted-foreground text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
