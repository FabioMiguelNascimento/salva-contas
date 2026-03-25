import { Github, Linkedin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="relative bg-accent text-accent-foreground overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "40px 40px"
        }} />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="py-16 text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <span className="sr-only">Salva Contas</span>
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Image src="/app-icon.svg" alt="Salva Contas" width="40" height="40" className="text-primary-foreground font-bold text-lg"/>
            </div>
            <span className="font-semibold text-lg">Salva Contas</span>
          </Link>

          <p className="mx-auto max-w-xl text-accent-foreground/65 text-sm leading-relaxed">
            Projeto pessoal para organizar finanças com ajuda de IA.
            Feito para simplificar metas, gastos e contas do dia a dia.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="https://linkedin.com/in/fab-nascimento"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-accent-foreground/5 hover:bg-accent-foreground/10 flex items-center justify-center transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4 text-accent-foreground/70" />
            </Link>
            <Link
              href="https://github.com/FabioMiguelNascimento"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-accent-foreground/5 hover:bg-accent-foreground/10 flex items-center justify-center transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4 text-accent-foreground/70" />
            </Link>
          </div>

          <div className="mt-10 pt-6 border-t border-accent-foreground/10">
            <p className="text-sm text-accent-foreground/50">
              © 2026 Salva Contas. Projeto pessoal.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}


