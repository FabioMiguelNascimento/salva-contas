"use client"

import { Button } from "@/components/ui/button"
import { Check, ChevronDown, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const plans = [
  {
    name: "Gratis",
    description: "Para começar a organizar",
    price: { monthly: 0, yearly: 0 },
    features: [
      "Até 3 cofrinhos",
      "Histórico de 3 meses",
      "Boletinho básico",
      "Categorias automaticas",
      "Suporte por email",
    ],
    cta: "Começar gratis",
    popular: false,
  },
  {
    name: "Pro",
    description: "Controle total das finanças",
    price: { monthly: 19.90, yearly: 14.90 },
    features: [
      "Cofrinhos ilimitados",
      "Histórico completo",
      "Boletinho avançado com IA",
      "Relatórios detalhados",
      "Metas personalizadas",
      "Exportação de dados",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    popular: true,
  },
  {
    name: "Familia",
    description: "Finanças em conjunto",
    price: { monthly: 39.90, yearly: 29.90 },
    features: [
      "Tudo do Pro",
      "Até 5 usuários",
      "Cofrinhos compartilhados",
      "Dashboard familiar",
      "Controle de mesada",
      "Relatórios consolidados",
      "Suporte VIP",
    ],
    cta: "Assinar Familia",
    popular: false,
  },
]

const faqs = [
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim! Você pode cancelar sua assinatura a qualquer momento. Seu acesso continua até o fim do período já pago."
  },
  {
    question: "Como funciona o período de teste?",
    answer: "Todos os planos pagos incluem 7 dias de teste gratis. Você pode cancelar antes do fim do teste sem ser cobrado."
  },
  {
    question: "Posso mudar de plano depois?",
    answer: "Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. A cobrança será ajustada proporcionalmente."
  },
  {
    question: "Os dados são seguros?",
    answer: "Absolutamente. Usamos criptografia de ponta a ponta e seguimos as melhores praticas de seguranca do mercado."
  },
  {
    question: "O que acontece se eu atingir o limite do plano gratis?",
    answer: "Você será notificado quando estiver próximo do limite. Pode fazer upgrade a qualquer momento para continuar usando."
  },
  {
    question: "Aceita quais formas de pagamento?",
    answer: "Aceitamos cartão de crédito, débito e PIX. Para planos anuais, também oferecemos boleto bancário."
  },
]

const comparisonFeatures = [
  { name: "Cofrinhos", free: "3", pro: "Ilimitados", family: "Ilimitados" },
  { name: "Histórico", free: "3 meses", pro: "Completo", family: "Completo" },
  { name: "Boletinho IA", free: "Básico", pro: "Avançado", family: "Avançado" },
  { name: "Relatórios", free: "Simples", pro: "Detalhados", family: "Consolidados" },
  { name: "Exportação", free: "-", pro: "CSV, PDF", family: "CSV, PDF" },
  { name: "Usuários", free: "1", pro: "1", family: "5" },
  { name: "Suporte", free: "Email", pro: "Prioritário", family: "VIP" },
]

export function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-linear-to-r from-primary/10 to-chart-5/10 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block text-primary font-medium text-sm uppercase tracking-wider mb-4">
              Preços
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground text-balance leading-tight">
              Planos que cabem no seu{" "}
              <span className="font-serif italic">bolso</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
              Comece gratis e evolua conforme suas necessidades. 
              Sem surpresas, sem taxas escondidas.
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
                className="px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2"
              >
                Anual
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                  -25%
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-12">
        <div className="container mx-auto px-4">
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
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-full shadow-lg shadow-primary/30">
                      <Sparkles className="h-3.5 w-3.5" />
                      Mais popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-foreground">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

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
                      Cobrado R$ {(plan.price.yearly * 12).toFixed(2).replace(".", ",")} anualmente
                    </p>
                  )}
                </div>

                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full p-1 bg-primary/10">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm leading-relaxed text-foreground/80">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

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
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium text-foreground">
              Compare os <span className="font-serif italic">planos</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Veja todas as funcionalidades de cada plano
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground">Funcionalidade</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">Gratis</th>
                  <th className="text-center py-4 px-4 font-semibold text-primary">Pro</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">Familia</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr key={feature.name} className={index % 2 === 0 ? "bg-card/50" : ""}>
                    <td className="py-4 px-4 text-foreground font-medium">{feature.name}</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">{feature.free}</td>
                    <td className="text-center py-4 px-4 text-foreground font-medium">{feature.pro}</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">{feature.family}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium text-foreground">
              Perguntas <span className="font-serif italic">frequentes</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Tire suas duvidas sobre nossos planos
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/30"
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="h-auto w-full justify-between rounded-none p-6 text-left"
                >
                  <span className="font-medium text-foreground pr-4">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 ${openFaq === index ? "rotate-180" : ""}`} />
                </Button>
                <div className={`overflow-hidden transition-all duration-200 ${openFaq === index ? "max-h-40" : "max-h-0"}`}>
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-accent relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "40px 40px"
          }} />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-accent-foreground mb-6 text-balance">
            Pronto para <span className="font-serif italic">começar</span>?
          </h2>
          <p className="text-accent-foreground/70 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Junte-se a milhares de pessoas que já organizam suas finanças com o Salva Contas.
          </p>
          <Button 
            size="lg" 
            className="h-14 px-8 text-base rounded-full"
            asChild
          >
            <Link href="/cadastro">Começar gratis</Link>
          </Button>
          <p className="mt-6 text-sm text-accent-foreground/50">
            7 dias gratis. Sem cartão de crédito.
          </p>
        </div>
      </section>
    </div>
  )
}




