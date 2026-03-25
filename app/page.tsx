import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { Showcase } from "@/components/landing/showcase"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Pricing } from "@/components/landing/pricing"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <section id="recursos">
          <Features />
        </section>
        <Showcase />
        <section id="como-funciona">
          <HowItWorks />
        </section>
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
