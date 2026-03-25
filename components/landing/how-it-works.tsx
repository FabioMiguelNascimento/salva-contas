"use client"

import { MessageCircle, PiggyBank, TrendingUp, UserPlus } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Crie sua conta",
    description: "Cadastre-se em segundos e comece a organizar suas finanças imediatamente.",
  },  
  {
    icon: MessageCircle,
    number: "02",
    title: "Adicione transações",
    description: "Registre seus gastos por texto ou voz. A IA categoriza automaticamente.",
  },
  {
    icon: PiggyBank,
    number: "03",
    title: "Defina metas",
    description: "Crie cofrinhos para seus objetivos e separe dinheiro para cada meta.",
  },
  {
    icon: TrendingUp,
    number: "04",
    title: "Acompanhe e conquiste",
    description: "Visualize seu progresso, converse com o Boletinho e alcance seus objetivos.",
  }
]

export function HowItWorks() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-50" />

      <div className="container relative mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block text-primary font-medium text-sm uppercase tracking-wider mb-4">
            Como funciona
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground text-balance leading-tight">
            Comece em{" "}
            <span className="font-serif italic">4 passos</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty max-w-2xl mx-auto">
            Em poucos minutos você começa a ter controle total das suas finanças.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-border to-transparent hidden lg:block" />

          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="relative group">
                <div className="relative z-10 mb-8 inline-block">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-card to-secondary border border-border shadow-lg group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-300">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center shadow-md">
                    {step.number}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


