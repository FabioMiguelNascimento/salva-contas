"use client"

import { PlansGrid } from "@/components/landing/plans-grid"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptions/config"
import { Check } from "lucide-react"
import { useState } from "react"

const plans = Object.values(SUBSCRIPTION_PLANS)

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const { isAuthenticated, user } = useAuth()

  const isCurrentPlan = (planId: string) => {
    if (!isAuthenticated || !user) return false;
    const userTier = user.planTier || 'FREE';
    const userCycle = user.billingCycle || 'monthly';

    if (userTier === 'FREE' && planId === 'FREE') return true;

    return userTier === planId && userCycle === billingCycle;
  };

  return (
    <section id="preços" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-r from-primary/10 to-chart-5/10 rounded-full blur-3xl" />
      
      <div className="container relative mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-primary font-medium text-sm uppercase tracking-wider mb-4">
            Preços
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground text-balance leading-[1.05]">
            Escolha o plano{" "}
            <span className="font-serif italic">ideal</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
            Comece gratis e evolua conforme suas necessidades. Cancele quando quiser.
          </p>
          
          {/* Billing toggle */}
          <div className="mt-10 inline-flex items-center gap-3 p-1.5 bg-secondary rounded-full">
            <Button
              type="button"
              variant={billingCycle === "monthly" ? "default" : "ghost"}
              onClick={() => setBillingCycle("monthly")}
              className="px-6 py-2.5 rounded-full text-sm font-medium transition-all"
            >
              Mensal
            </Button>
            <Button
              type="button"
              variant={billingCycle === "yearly" ? "default" : "ghost"}
              onClick={() => setBillingCycle("yearly")}
            >
              Anual
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  billingCycle === "yearly"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                -25%
              </span>
            </Button>
          </div>
        </div>

        <PlansGrid
          plans={plans}
          billingCycle={billingCycle}
          onBillingCycleChange={setBillingCycle}
          isCurrentPlan={isCurrentPlan}
          onPlanSelect={(plan) => {
            if (!isAuthenticated) {
              const next = encodeURIComponent(`/precos?plan=${plan.id}&cycle=${billingCycle}`)
              window.location.href = `/cadastro?plan=${plan.id}&cycle=${billingCycle}&next=${next}`
              return
            }

            window.location.href = `/app/assinaturas?plan=${plan.id}&cycle=${billingCycle}`
          }}
        />

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Todos os planos incluem 7 dias de teste gratis. Sem compromisso.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              Cancele quando quiser
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              Suporte em portugues
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              Dados protegidos
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
