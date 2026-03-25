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
    <section
      id="como-funciona"
      role="region"
      aria-labelledby="how-it-works-heading"
      className="relative py-16 md:py-24 lg:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 grid-pattern opacity-50" />

      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <span className="inline-block text-primary font-medium text-xs md:text-sm uppercase tracking-wider mb-3 md:mb-4">
            Como funciona
          </span>
          <h2
            id="how-it-works-heading"
            className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground text-balance leading-tight"
          >
            Comece em <span className="font-serif italic">4 passos</span>
          </h2>
          <p id="how-it-works-desc" className="mt-4 md:mt-6 text-base md:text-lg text-muted-foreground leading-relaxed text-pretty max-w-2xl mx-auto">
            Em poucos minutos você começa a ter controle total das suas finanças.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[80%] h-px bg-linear-to-r from-transparent via-border to-transparent hidden lg:block" />

          <div className="absolute left-[2.25rem] top-8 bottom-8 w-px bg-border md:hidden" />

          <ol
            className="relative space-y-10 md:space-y-0 md:grid md:gap-12 md:grid-cols-2 lg:grid-cols-4"
            aria-describedby="how-it-works-desc"
          >
            {steps.map((step) => (
              <li
                key={step.number}
                className="relative group flex flex-row items-start gap-6 md:flex-col md:gap-0 md:items-start"
                aria-label={`Passo ${step.number}: ${step.title}`}
              >
                <div className="relative z-10 md:mb-8 shrink-0">
                  <div className="inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-linear-to-br from-card to-secondary border border-border shadow-lg group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-300">
                    <step.icon className="h-6 w-6 md:h-8 md:w-8 text-primary" aria-hidden="true" focusable="false" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-accent text-accent-foreground text-xs md:text-sm font-bold flex items-center justify-center shadow-md">
                    <span className="sr-only">Passo</span>
                    {step.number}
                  </div>
                </div>

                <div className="pt-2 md:pt-0">
                  <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}