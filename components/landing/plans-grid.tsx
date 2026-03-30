"use client"

import { Button } from "@/components/ui/button"
import { BillingCycle, PlanConfig } from "@/lib/subscriptions/config"
import { Check, Lock, Sparkles } from "lucide-react"

type PlansGridProps = {
  plans: PlanConfig[]
  billingCycle: BillingCycle
  onBillingCycleChange: (cycle: BillingCycle) => void
  isCurrentPlan?: (planId: string) => boolean
  onPlanSelect?: (plan: PlanConfig) => void
  onPlanSelectFallbackLink?: string
}

export function PlansGrid({
  plans,
  billingCycle,
  onBillingCycleChange,
  isCurrentPlan,
  onPlanSelect,
  onPlanSelectFallbackLink = "/cadastro",
}: PlansGridProps) {
  const renderButton = (plan: PlanConfig) => {
    const current = isCurrentPlan?.(plan.id) || false

    if (current) {
      return (
        <Button variant="secondary" className="w-full h-12 text-base font-medium rounded-xl" disabled>
          Seu plano atual
        </Button>
      )
    }

    const handleClick = () => {
      if (onPlanSelect) {
        onPlanSelect(plan)
        return
      }

      window.location.href = `${onPlanSelectFallbackLink}?plan=${plan.id}&cycle=${billingCycle}`
    }

    return (
      <Button variant={plan.popular ? "default" : "outline"} className="w-full h-12 text-base font-medium rounded-xl" onClick={handleClick}>
        {plan.cta}
      </Button>
    )
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto items-start mt-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl p-8 transition-all duration-300 ${
              plan.popular
                ? "bg-card border-2 border-primary/40 ring-1 ring-primary/15 scale-[1.03] shadow-2xl lg:-my-4"
                : "bg-card border-2 border-border shadow-sm hover:border-primary/25 hover:shadow-xl"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-full shadow-lg shadow-primary/30">
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
                <span className="text-5xl font-bold tracking-tight text-foreground">{plan.price[billingCycle].toFixed(2).split(".")[0]}</span>
                <span className="text-2xl font-bold text-foreground">,{plan.price[billingCycle].toFixed(2).split(".")[1]}</span>
                <span className="text-sm ml-1 text-muted-foreground">/mês</span>
              </div>
              {billingCycle === "yearly" && plan.price.yearly > 0 && (
                <p className="text-xs mt-2 text-muted-foreground">
                  Cobrado R$ {(plan.price.yearly * 12).toFixed(2).replace(".", ",")} à vista (equiv. a R$ {plan.price.yearly.toFixed(2).replace(".", ",")}/mês)
                </p>
              )}
            </div>

            <ul className="mb-8 space-y-4">
              {plan.features.map((feature) => {
                const isBlocked = feature.toLowerCase().includes("bloqueado") || feature.toLowerCase().includes("bloqueada")
                return (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full p-1 bg-primary/10">
                      {isBlocked ? (
                        <Lock className="h-3.5 w-3.5 text-rose-500" />
                      ) : (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                    </div>
                    <span className={`text-sm ${isBlocked ? "text-muted-foreground" : "text-foreground/80"}`}>{feature}</span>
                  </li>
                )
              })}
            </ul>

            {renderButton(plan)}
          </div>
        ))}
      </div>
    </>
  )
}
