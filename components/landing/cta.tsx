"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function CTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-secondary/30" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-chart-5/10 rounded-full blur-3xl" />
      
      <div className="container relative mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Card */}
          <div className="relative rounded-[2rem] bg-accent p-12 md:p-16 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                backgroundSize: "32px 32px"
              }} />
            </div>
            
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
            
            <div className="relative text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-medium text-primary mb-8">
                <Sparkles className="h-4 w-4" />
                Gratis para começar
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-accent-foreground text-balance leading-[1.06]">
                Comece a organizar suas finanças{" "}
                <span className="font-serif italic text-primary">hoje</span>
              </h2>
              
              <p className="mt-6 text-lg text-accent-foreground/70 max-w-2xl mx-auto leading-relaxed text-pretty">
                Junte-se a milhares de pessoas que já organizam a vida financeira
                com upload de PDF/foto e lançamentos automáticos pelo Boletinho.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-base"
                  asChild
                >
                  <Link href="/cadastro">
                    Criar conta gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-8 text-base"
                >
                  Falar com o Boletinho
                </Button>
              </div>
              
              <p className="mt-8 text-sm text-accent-foreground/50">
                Sem cartão de crédito necessario. Cancele quando quiser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


