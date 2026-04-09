import { AuthPageWrapper } from "@/components/auth/auth-page-wrapper"
import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Entrar - Salva Contas",
  description: "Entre na sua conta para acessar suas financas e continuar organizando seu dinheiro.",
}

export default function EntrarPage() {
  return (
    <Suspense>
      <AuthPageWrapper mode="login" />
    </Suspense>
  )
}
