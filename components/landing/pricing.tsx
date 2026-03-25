"use client"

import { Button } from "@/components/ui/button"
import { Check, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const plans = [
  {
    name: "Grátis",
    description: "A isca de hábito para começar",
    price: { monthly: 0, yearly: 0 },
    features: [
      { label: "Cadastro manual de despesas e receitas", included: true },
      { label: "Acesso apenas ao mês atual + últimos 3 meses", included: true },
      { label: "Até 3 Cofrinhos", included: true },
      { label: "Apenas 1 usuário (sem partilha)", included: true },
      { label: "Boletinho Básico (suporte de uso; sem dados do banco)", included: true },
      { label: "Leitura de recibos com IA", included: false },
      { label: "Consultor Boletinho IA avançado", included: false },
      { label: "Histórico completo", included: false },
      { label: "Cofrinhos ilimitados", included: false },
    ],
    cta: "Começar grátis",
    popular: false,
  },
  {
    name: "Pro",
    description: "Foco em automação para quem odeia planilha",
    price: { monthly: 19.90, yearly: 14.90 },
    features: [
      { label: "Leitura de recibos com IA (até 100/mês)", included: true },
      { label: "Consultor Boletinho IA avançado com dados do Prisma", included: true },
      { label: "Histórico de transações liberado desde o início", included: true },
      { label: "Cofrinhos ilimitados", included: true },
      { label: "Até 5 usuários (sem partilha)", included: false },
      { label: "Contas vinculadas e convites por ID", included: false },
      { label: "Auditoria de gastos (Blame)", included: false },
    ],
    cta: "Assinar Pro",
    popular: true,
  },
  {
    name: "Família",
    description: "Diferencial matador para casais",
    price: { monthly: 39.90, yearly: 29.90 },
    features: [
      { label: "Tudo do plano Pro", included: true },
      { label: "Até 5 usuários (contas vinculadas)", included: true },
      { label: "Auditoria de gastos (Blame)", included: true },
      { label: "Leitura de recibos com IA ampliada (250/mês)", included: true },
      { label: "Cofrinhos compartilhados", included: true },
      { label: "Dashboard familiar e metas conjuntas", included: true },
    ],
    cta: "Assinar Família",
    popular: false,
  },
]

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

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

        {/* Plans */}
        <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 transition-all duration-300 ${
                plan.popular
                  ? "bg-card border-2 border-primary/40 ring-1 ring-primary/15 scale-[1.03] shadow-2xl lg:-my-4"
                  : "bg-card border-2 border-border shadow-sm hover:border-primary/25 hover:shadow-xl"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-full shadow-lg shadow-primary/30">
                    <Sparkles className="h-3.5 w-3.5" />
                    Mais popular
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-muted-foreground">
                    R$
                  </span>
                  <span className="text-5xl font-bold tracking-tight text-foreground">
                    {plan.price[billingCycle].toFixed(2).split(".")[0]}
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    ,{plan.price[billingCycle].toFixed(2).split(".")[1]}
                  </span>
                  <span className="text-sm ml-1 text-muted-foreground">
                    /mes
                  </span>
                </div>
                {billingCycle === "yearly" && plan.price.yearly > 0 && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    Cobrado R$ {(plan.price.yearly * 12).toFixed(2).replace(".", ",")} à vista (equiv. a R$ {plan.price.yearly.toFixed(2).replace(".", ",")}/mês)
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="mb-8 space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature.label}
                    className="flex items-start gap-3"
                  >
                    <div
                      className={`mt-0.5 rounded-full p-1 ${
                        feature.included
                          ? "bg-primary/10"
                          : "bg-muted-foreground/10"
                      }`}
                    >
                      <Check
                        className={`h-3.5 w-3.5 ${
                          feature.included
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm leading-relaxed ${
                        feature.included
                          ? "text-foreground/80"
                          : "text-muted-foreground line-through"
                      }`}
                    >
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={plan.popular ? "default" : "outline"}
                className="w-full h-12 text-base font-medium rounded-xl"
                asChild
              >
                <Link href="/cadastro">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

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