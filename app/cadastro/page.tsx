import { AuthForm } from "@/components/auth/auth-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Criar conta - Salva Contas",
  description: "Crie sua conta gratuita e comece a organizar suas financas com inteligencia artificial.",
}

export default function CadastroPage() {
  return <AuthForm mode="register" />
}
