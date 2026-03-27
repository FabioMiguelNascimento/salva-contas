"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useSubscription } from "@/hooks/use-subscription"
import { CreditCard, ExternalLink, Loader2, Sparkles } from "lucide-react"

export function MercadoPagoSettings() {
  const { currentPlan, handleManageBilling, isLoading } = useSubscription()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Plano e Faturamento</CardTitle>
            <CardDescription>
              Gerencie sua assinatura no Mercado Pago.
            </CardDescription>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
            currentPlan.id === 'FREE' ? 'bg-secondary text-secondary-foreground' : 'bg-primary/10 text-primary'
          }`}>
            {currentPlan.id !== 'FREE' && <Sparkles className="h-3 w-3" />}
            Plano {currentPlan.name}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-background border shadow-xs">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Portal do Mercado Pago</p>
              <p className="text-xs text-muted-foreground">
                Acesse o gerenciamento de assinatura e faturamento direto no Mercado Pago.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={isLoading || currentPlan.id === 'FREE'}
            onClick={handleManageBilling}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ExternalLink className="h-4 w-4 mr-2" />
            )}
            Gerenciar no Mercado Pago
          </Button>
        </div>

        {currentPlan.id === 'FREE' && (
          <div className="text-center p-6 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
            <h4 className="text-sm font-semibold mb-1">Evolua seu controle</h4>
            <p className="text-xs text-muted-foreground mb-4 max-w-60 mx-auto">
              Libere cofrinhos ilimitados, IA avançada e histórico completo.
            </p>
            <Button size="sm" className="rounded-full" asChild>
              <a href="/precos">Ver planos Pro</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
