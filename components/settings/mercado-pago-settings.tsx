"use client"

import { Button } from "@/components/ui/button"
import { useSubscription } from "@/hooks/use-subscription"
import { CreditCard, ExternalLink, Loader2, Sparkles, Wallet } from "lucide-react"
import { UsageMeter } from "../usage-meter"

export function MercadoPagoSettings() {
  const { currentPlan, handleManageBilling, isLoading } = useSubscription()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-600" />
            Plano e Faturamento
          </h3>
          <p className="text-sm text-slate-500">
            Gerencie sua assinatura e acompanhe seu uso mensal.
          </p>
        </div>
        <div className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
          currentPlan.id === 'FREE' 
            ? 'bg-slate-100 text-slate-600 border border-slate-200' 
            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
        }`}>
          {currentPlan.id !== 'FREE' && <Sparkles className="h-3 w-3" />}
          {currentPlan.name}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm">
              <CreditCard className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Portal do Mercado Pago</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Acesse o gerenciamento de assinatura direto no Mercado Pago.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-slate-200 hover:bg-white hover:text-emerald-600 hover:border-emerald-200 transition-all"
            disabled={isLoading || currentPlan.id === 'FREE'}
            onClick={handleManageBilling}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ExternalLink className="h-4 w-4 mr-2" />
            )}
            Gerenciar Assinatura
          </Button>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Uso do Período</h4>
            <UsageMeter />
        </div>

        {currentPlan.id === 'FREE' && (
          <div className="relative overflow-hidden p-8 rounded-2xl border-2 border-dashed border-emerald-100 bg-emerald-50/30 text-center group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Sparkles className="h-16 w-16 text-emerald-600" />
            </div>
            <Sparkles className="h-8 w-8 text-emerald-600 mx-auto mb-4" />
            <h4 className="text-base font-bold text-slate-900 mb-2">Evolua seu controle</h4>
            <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
              Libere cofrinhos ilimitados, IA avançada e histórico completo para uma gestão impecável.
            </p>
            <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 px-6" asChild>
              <a href="/precos">Ver planos Pro</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
