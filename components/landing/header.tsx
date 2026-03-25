"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/use-auth"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

const navLinks = [
  { href: "/#recursos", label: "Recursos" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/precos", label: "PreÃ§os" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const userInitials = user?.name
    ? user.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "US"

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 flex items-center justify-center">
              <img src="/app-icon.svg" alt="Salva Contas" className="h-8 w-8" />
            </div>
            <span className="font-semibold text-lg text-foreground">Salva Contas</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" className="px-5" asChild>
                <Link href="/app/dashboard">
                  <Avatar>
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="text-sm font-medium text-foreground">
                      {user?.name || user?.email || "usuário"}
                    </div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="px-5" onClick={logout}>
                Sair
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                className=" px-5"
                asChild
              >
                <Link href="/entrar">Entrar</Link>
              </Button>
              <Button
                className=" px-5"
                asChild
              >
                <Link href="/cadastro">Começar gratis</Link>
              </Button>
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent
            side="bottom"
            className="md:hidden rounded-t-2xl border border-border bg-background/95 backdrop-blur-xl p-4 pt-5 shadow-[0_-12px_30px_rgba(15,23,42,0.35)]"
          >
            {isAuthenticated && (
              <div className="mb-3 rounded-xl border border-border bg-muted/10 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">
                      Olá, {user?.name || user?.email || "usuário"}
                    </div>
                    <div className="text-xs text-muted-foreground">Logado</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="mt-2 text-xs font-semibold text-primary underline"
                  type="button"
                >
                  Sair
                </button>
              </div>
            )}
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-xl px-4 py-3 text-base font-medium text-foreground hover:bg-secondary/80 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 border-t border-border pt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-center rounded-xl py-3 text-base font-semibold"
                  asChild
                >
                  <Link href="/entrar">Entrar</Link>
                </Button>
                <Button
                  className="mt-2 w-full rounded-xl py-3 text-base font-semibold"
                  asChild
                >
                  <Link href="/cadastro">ComeÃ§ar gratis</Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}


