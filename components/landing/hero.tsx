"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 grid-pattern" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      <div className="absolute top-32 left-[10%] w-72 h-72 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-32 right-[10%] w-96 h-96 rounded-full bg-gradient-to-br from-chart-5/20 to-chart-5/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
      
      <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container relative mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur-sm px-4 py-2 text-sm mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-muted-foreground">Agora com assistente de IA</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight text-foreground text-balance leading-[1.03]">
            Salva Contas: suas finanças,{" "}
            <span className="font-serif italic text-primary">simplificadas</span>
          </h1>
          
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            Controle gastos, crie metas com cofrinhos e envie extratos PDF ou fotos.
            O Boletinho registra transações e contas a pagar automaticamente para você.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="h-14 px-8 text-base"
              asChild
            >
              <Link href="/cadastro">
                Começar gratuitamente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-8 text-base"
            >
              <Play className="mr-2 h-4 w-4 fill-current" />
              Ver demonstração
            </Button>
          </div>
          
          
        </div>
        
        <div className="mt-20 relative max-w-6xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
          
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl shadow-accent/10">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent" />
            <div className="w-full h-[450px] bg-muted/30 flex items-center justify-center text-muted-foreground">
              Imagem do dashboard (placeholder)
            </div>
          </div>
          
          <div className="absolute -left-4 md:-left-8 top-1/4 glass rounded-2xl p-4 shadow-xl animate-float hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Guardado este mes</p>
                <p className="text-lg font-semibold text-foreground">R$ 1.250,00</p>
              </div>
            </div>
          </div>
          
          <div className="absolute -right-4 md:-right-8 top-1/3 glass rounded-2xl p-4 shadow-xl animate-float-delayed hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-chart-1 to-chart-1/80 flex items-center justify-center">
                <svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Meta atingida!</p>
                <p className="text-lg font-semibold text-foreground">Viagem de ferias</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


