import { AuthPageWrapper } from "@/components/auth/auth-page-wrapper"
import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Criar conta - Salva Contas",
  description: "Crie sua conta gratuita e comece a organizar suas financas com inteligencia artificial.",
}

export default function CadastroPage() {
  return (
    <Suspense>
      <AuthPageWrapper mode="register" />
    </Suspense>
  )
}
