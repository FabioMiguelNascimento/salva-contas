"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, type FormEvent } from "react"

interface AuthFormProps {
  mode: "login" | "register"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planFromQuery = searchParams.get("plan")
  const cycleFromQuery = searchParams.get("cycle")
  const nextFromQuery = searchParams.get("next")
  const { login, register, loginWithGoogle } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const preserveQuery = () => {
    const params = new URLSearchParams()
    if (planFromQuery) params.set('plan', planFromQuery)
    if (cycleFromQuery) params.set('cycle', cycleFromQuery)
    if (nextFromQuery) params.set('next', nextFromQuery)
    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }

  const loginHref = `/entrar${preserveQuery()}`
  const registerHref = `/cadastro${preserveQuery()}`

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (!mode || !formData.email || !formData.password) {
      setError("Preencha os campos obrigatorios.")
      return
    }

    if (!isLogin && formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    setIsLoading(true)

    const resolvedCycle = cycleFromQuery === "yearly" ? "yearly" : "monthly"
    const resolvedPlan = planFromQuery ? planFromQuery : undefined
    const fallback = resolvedPlan
      ? `/precos?plan=${resolvedPlan}&cycle=${resolvedCycle}`
      : "/app/dashboard"
    const redirectTo = nextFromQuery || fallback

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password })
        router.push(redirectTo)
      } else {
        const result = await register({
          name: formData.name || undefined,
          email: formData.email,
          password: formData.password,
        })

        if (result.needsEmailConfirmation) {
          setNeedsEmailConfirmation(true)
        } else {
          router.push(redirectTo)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao autenticar. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const isLogin = mode === "login"

  if (!isLogin && needsEmailConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center">
            <Image src="/app-icon.svg" alt="Salva Contas" width={32} height={32} className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Verifique seu email</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enviamos um link de confirmação para:</p>
          <p className="mt-1 font-medium text-foreground">{formData.email}</p>
          <p className="mt-4 text-sm text-muted-foreground">Apos confirmar, faca login para continuar.</p>
          <Button asChild className="mt-6 w-full">
            <Link href="/entrar">Ir para entrar</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-20">
        <div className="w-full max-w-md mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para o inicio
          </Link>

          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-3 mb-10">
              <div className="h-11 w-11 flex items-center justify-center">
                <Image src="/app-icon.svg" alt="Salva Contas" width={28} height={28} className="h-7 w-7" />
              </div>
              <span className="font-semibold text-xl text-foreground">Salva Contas</span>
            </Link>

            <h1 className="text-3xl md:text-4xl font-medium text-foreground tracking-tight">
              {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
            </h1>
            <p className="mt-3 text-muted-foreground text-lg">
              {isLogin 
                ? "Entre para continuar organizando suas finanças" 
                : "Comece a organizar suas finanças gratuitamente"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-medium">
                  Nome completo
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-13 bg-background border-border focus:border-primary rounded-xl text-base"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-13 bg-background border-border focus:border-primary rounded-xl text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Senha
                </Label>
                {isLogin && (
                  <Link 
                    href="/recuperar-senha" 
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isLogin ? "Sua senha" : "Crie uma senha forte"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-13 bg-background border-border focus:border-primary pr-12 rounded-xl text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Minimo de 8 caracteres com letras e numeros
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-13 bg-accent text-accent-foreground hover:bg-accent/90 text-base font-medium rounded-xl shadow-lg shadow-accent/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {isLogin ? "Entrando..." : "Criando conta..."}
                </>
              ) : (
                isLogin ? "Entrar" : "Criar conta gratuita"
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted-foreground">
                  ou continue com
                </span>
              </div>
            </div>

            <div className="mt-6 grid">
              <Button
                variant="outline"
                className="h-13 border-border hover:bg-secondary rounded-xl"
                type="button"
                onClick={loginWithGoogle}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
            <Link
              href={isLogin ? registerHref : loginHref}
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {isLogin ? "Criar conta gratuita" : "Entrar"}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-accent items-center justify-center p-12 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "40px 40px"
          }} />
        </div>
        
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-chart-5/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
        
        <div className="relative z-10 max-w-lg text-center">
          {/* App preview */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-accent-foreground/10 mb-12">
            <div className="w-full h-[260px] bg-muted/20 flex items-center justify-center text-muted-foreground">
              Imagem de preview (placeholder)
            </div>
            {/*
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-O1xYQ0vjvkYGedo8fJgKK9Hv7qpupq.png"
              alt="Dashboard do Salva Contas"
              width={600}
              height={400}
              className="w-full h-auto"
            />
            */}
          </div>
          <h2 className="text-3xl font-medium text-accent-foreground mb-4 text-balance">
            Suas finanças organizadas em um só lugar
          </h2>
          <p className="text-accent-foreground/60 text-lg leading-relaxed">
            Mais de 10.000 pessoas já usam o Salva Contas para guardar dinheiro 
            e tomar decisões financeiras melhores.
          </p>
        </div>
      </div>
    </div>
  )
}