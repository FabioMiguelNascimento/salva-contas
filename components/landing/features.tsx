"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, MessageSquareText, PiggyBank, Shield, Sparkles, Wallet } from "lucide-react"
import Link from "next/link"

export function Features() {
  return (
    <section className="relative py-32 overflow-hidden bg-foreground">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      <div className="container relative mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-flex items-center gap-2 text-primary font-medium text-sm uppercase tracking-wider mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4" />
            Recursos
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-background text-balance leading-[1.08]">
            Ferramentas que{" "}
            <span className="font-serif italic text-primary">transformam</span>{" "}
            sua relação com dinheiro
          </h2>
          <p className="mt-6 text-lg text-background/60 leading-relaxed text-pretty max-w-2xl mx-auto">
            Uma suite completa de recursos pensados para simplificar suas finanças 
            e ajudar você a construir um futuro mais seguro.
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          
          <div className="lg:col-span-2 lg:row-span-2 group relative rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 lg:p-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -translate-x-1/4 translate-y-1/4" />
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-white/40 bg-background/95 text-primary shadow-lg backdrop-blur-sm">
                  <PiggyBank className="h-7 w-7" />
                </div>
                <span className="text-white/40 font-mono text-sm">01</span>
              </div>
              
              <h3 className="text-3xl lg:text-4xl font-semibold text-white mb-4 text-balance leading-snug">
                Cofrinhos para suas metas
              </h3>
              <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-md">
                Separe dinheiro para cada objetivo. Acompanhe o progresso em tempo real 
                e veja seus sonhos se tornando realidade.
              </p>
              
              <div className="mt-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                      <span role="img" aria-label="viagem">&#9992;</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">Viagem dos sonhos</div>
                      <div className="text-white/60 text-sm">Meta: R$ 15.000,00</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">68%</div>
                    </div>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-[68%] bg-white rounded-full transition-all duration-1000" />
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-white/60">
                    <span>R$ 10.200,00</span>
                    <span>Faltam R$ 4.800,00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="group relative rounded-3xl bg-card border border-border p-8 overflow-hidden hover:border-primary/30 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="inline-flex size-12 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-primary shadow-sm backdrop-blur-sm">
                  <MessageSquareText className="h-6 w-6" />
                </div>
                <span className="text-muted-foreground/40 font-mono text-sm">02</span>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Assistente Boletinho
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Converse naturalmente sobre suas finanças. Pergunte, analise e tome decisões inteligentes.
              </p>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] text-white font-bold">B</span>
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2 text-sm text-foreground">
                    Quanto gastei com delivery esse mes?
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <div className="bg-primary/10 rounded-2xl rounded-tr-sm px-4 py-2 text-sm text-foreground">
                    Você gastou R$ 347,50 em delivery. 23% a mais que o mes passado.
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="group relative rounded-3xl bg-card border border-border p-8 overflow-hidden hover:border-primary/30 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-3/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:bg-chart-3/10 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="inline-flex size-12 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-primary shadow-sm backdrop-blur-sm">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <span className="text-muted-foreground/40 font-mono text-sm">03</span>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Cadastro por PDF e Foto
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Envie extrato em PDF, foto ou anexo e a IA transforma tudo em transações e contas a pagar automaticamente.
              </p>
              
              <div className="flex items-end gap-1 h-16">
                {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                  <div key={i} className="flex-1 bg-chart-3/20 rounded-t-sm overflow-hidden">
                    <div 
                      className="w-full bg-chart-3 rounded-t-sm transition-all duration-500 group-hover:bg-primary"
                      style={{ height: `${height}%`, transitionDelay: `${i * 50}ms` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="group relative rounded-3xl bg-card border border-border p-8 overflow-hidden hover:border-primary/30 transition-colors duration-300">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="inline-flex size-12 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-primary shadow-sm backdrop-blur-sm">
                  <Shield className="h-6 w-6" />
                </div>
                <span className="text-muted-foreground/40 font-mono text-sm">05</span>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Seguranca Total
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Criptografia de ponta a ponta. Seus dados protegidos com os mais altos padroes de seguranca.
              </p>
              
              <div className="mt-6 flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-chart-1 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">Criptografado</span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 group relative rounded-3xl bg-card border border-border p-8 overflow-hidden hover:border-primary/30 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-48 h-48 bg-chart-2/5 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div className="inline-flex size-12 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-primary shadow-sm backdrop-blur-sm">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <span className="text-muted-foreground/40 font-mono text-sm md:hidden">06</span>
                </div>
                
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  Saldo em Tempo Real
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-md">
                  Dashboard completo com visao geral das suas finanças. Saldo, 
                  dinheiro guardado e saude financeira em um só lugar.
                </p>
              </div>
              
              <div className="flex-shrink-0 grid grid-cols-2 gap-3">
                <div className="bg-muted rounded-xl p-4">
                  <div className="text-xs text-muted-foreground mb-1">Saldo disponível</div>
                  <div className="text-xl font-semibold text-foreground">R$ 4.250,00</div>
                </div>
                <div className="bg-primary/10 rounded-xl p-4">
                  <div className="text-xs text-primary mb-1">Guardado</div>
                  <div className="text-xl font-semibold text-primary">R$ 12.800,00</div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
        <div className="mt-16 text-center">
          <Button 
            size="lg" 
            className="px-8 h-14 text-base font-medium group"
            asChild
          >
            <Link href="/cadastro">
              Explorar todos os recursos
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}



