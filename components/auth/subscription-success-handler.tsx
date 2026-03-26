"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

export function SubscriptionSuccessHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { refreshUser } = useAuth()

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    
    if (sessionId) {
      toast.success("Assinatura confirmada!", {
        description: "Bem-vindo ao time PRO. Seus recursos foram liberados.",
        duration: 5000,
      })

      // Atualiza o estado do usuário (planTier, etc)
      refreshUser?.()

      // Limpa a URL de forma elegante
      const params = new URLSearchParams(searchParams.toString())
      params.delete("session_id")
      
      const queryString = params.toString()
      const newPath = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`
      
      router.replace(newPath)
    }
  }, [searchParams, router, refreshUser])

  return null
}
