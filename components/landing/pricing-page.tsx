"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/hooks/use-subscription"
import { BillingCycle, COMPARISON_FEATURES, PlanTier, SUBSCRIPTION_PLANS } from "@/lib/subscriptions/config"
import { Check, ChevronDown, Loader2, Sparkles } from "lucide-react"
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
          <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto items-start">
            {plansList.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 transition-all ${
                  plan.popular
                    ? "bg-card border-2 border-primary/40 ring-1 ring-primary/15 scale-[1.03] shadow-2xl lg:-my-4"
                    : "bg-card border-2 border-border shadow-sm hover:border-primary/25"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                      <Sparkles className="h-3.5 w-3.5" />
                      Mais popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <span className="text-5xl font-bold tracking-tight text-foreground">
                      {plan.price[billingCycle].toFixed(2).split(".")[0]}
                    </span>
                    <span className="text-2xl font-bold text-foreground">
                      ,{plan.price[billingCycle].toFixed(2).split(".")[1]}
                    </span>
                    <span className="text-sm ml-1 text-muted-foreground">/mês</span>
                  </div>
                </div>

                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full p-1 bg-primary/10">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isCurrentPlan(plan.id) ? "secondary" : (plan.popular ? "default" : "outline")}
                  className="relative w-full h-12 text-base font-medium rounded-xl overflow-hidden"
                  disabled={isLoading || isCurrentPlan(plan.id)}
                  onClick={() => {
                    if (!isAuthenticated) {
                      const next = encodeURIComponent(`/precos?plan=${plan.id}&cycle=${billingCycle}`)
                      window.location.href = `/cadastro?plan=${plan.id}&cycle=${billingCycle}&next=${next}`
                      return
                    }

                    setSelectedPlan(plan.id)
                    handleSubscribe(plan, billingCycle)
                  }}
                >
                  <span className="relative z-10">
                    {isCurrentPlan(plan.id) ? (
                      "Seu plano atual"
                    ) : isLoading || (selectedPlan === plan.id) ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2 inline-block" />
                        {plan.cta}
                      </>
                    ) : (
                      plan.cta
                    )}
                  </span>
                </Button>
              </div>
            ))}
          </div>
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
                    <td className="text-center py-4 px-4 text-muted-foreground">{feature.FREE}</td>
                    <td className="text-center py-4 px-4 text-foreground font-medium">{feature.PRO}</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">{feature.FAMILY}</td>
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
