import { Footer } from "@/components/landing/footer"
import { Header } from "@/components/landing/header"
import { PricingPage } from "@/components/landing/pricing-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Preços - Salva Contas",
  description: "Escolha o plano ideal para organizar suas financas. Comece gratis e evolua conforme suas necessidades.",
}

export default function Preços() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <PricingPage />
      </main>
      <Footer />
    </div>
  )
}
