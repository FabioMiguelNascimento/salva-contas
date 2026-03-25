import { AuthForm } from "@/components/auth/auth-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Entrar - Salva Contas",
  description: "Entre na sua conta para acessar suas financas e continuar organizando seu dinheiro.",
}

export default function EntrarPage() {
  return <AuthForm mode="login" />
}
