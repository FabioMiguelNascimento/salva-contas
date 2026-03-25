"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare, PiggyBank, Receipt } from "lucide-react"
import { useState } from "react"

const tabs = [
  {
    id: "cofrinhos",
    label: "Cofrinhos",
    icon: PiggyBank,
    title: "Crie metas e guarde dinheiro",
    description: "Separe dinheiro para seus sonhos com cofrinhos personalizados. Acompanhe o progresso e comemore cada conquista.",
    image: "https:"
  },
  {
    id: "boletinho",
    label: "Boletinho IA",
    icon: MessageSquare,
    title: "Converse com seu assistente",
    description: "O Boletinho entende suas finanças e te ajuda a tomar decisões. Pergunte sobre gastos, metas ou peça sugestões.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-dvbFRUY7VgEt550lk94wNjo97vFQkK.png",
  },
  {
    id: "extrato",
    label: "PDF e Foto",
    icon: Receipt,
    title: "Cadastre por extrato PDF ou foto",
    description:
      "Envie PDF, foto ou anexo e o Boletinho registra transações e contas a pagar automaticamente. Menos digitação, mais controle.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-V8Mt2dymS39aiG97BWJqKRWOCglh1P.png",
  },
]

export function Showcase() {
  const [activeTab, setActiveTab] = useState("cofrinhos")
  const activeContent = tabs.find((tab) => tab.id === activeTab)

  return (
    <section className="relative py-32 bg-accent overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "40px 40px"
        }} />
      </div>
      
      <div className="container relative mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-primary font-medium text-sm uppercase tracking-wider mb-4">
            Produto
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-accent-foreground text-balance leading-[1.06]">
            Veja o Salva Contas{" "}
            <span className="font-serif italic">em ação</span>
          </h2>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <Button
              type="button"
              variant={activeTab === tab.id ? "default" : "ghost"}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="order-2 lg:order-1">
            <h3 className="text-3xl md:text-4xl font-semibold text-accent-foreground mb-6">
              {activeContent?.title}
            </h3>
            <p className="text-lg text-accent-foreground/70 leading-relaxed mb-8">
              {activeContent?.description}
            </p>
            
          </div>
          
          <div className="order-1 lg:order-2 relative">
            <div className="absolute -inset-4 bg-linear-to-r from-primary/20 to-chart-5/20 rounded-3xl blur-2xl opacity-50" />
            <div className="relative rounded-2xl overflow-hidden border border-accent-foreground/10 shadow-2xl">
              <div className="w-full h-[420px] bg-muted/20 flex items-center justify-center text-muted-foreground">
                Imagem de showcase (placeholder)
              </div>
              {/*
              <Image
                src={activeContent?.image || ""}
                alt={activeContent?.title || ""}
                width={800}
                height={600}
                className="w-full h-auto transition-all duration-500"
              />
              */}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}