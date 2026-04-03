"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserInitials from '@/components/ui/user-initials';
import { useFamilyInvite } from '@/context/family-invite-context';
import { Link2, Lock, RefreshCw, Sparkles, Trash2, Users } from 'lucide-react';


export default function FamilyShareCard() {
  const {
    family,
    inviteTokens,
    inviteUrl,
    isFamilyPlan,
    isLoadingMembers,
    isLoadingTokens,
    isGenerating,
    refresh,
    loadMembers,
    loadInviteTokens,
    generateInvite,
    clearInviteUrl,
    removeFamilyMember,
  } = useFamilyInvite();

  const handleGenerateInvite = async () => {
    const result = await generateInvite();
    if (!result) return;
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      const { toast } = await import('sonner');
      toast.success('Link copiado para a área de transferência.');
    } catch {
      const { toast } = await import('sonner');
      toast.error('Não foi possível copiar o link.');
    }
  };

  const header = (
    <div className="mb-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Users className="h-5 w-5 text-emerald-600" />
        Partilha Familiar
      </h3>
      <p className="text-sm text-slate-500">Convide membros para compartilhar seu caderno financeiro.</p>
    </div>
  );

  if (!isFamilyPlan) {
    return (
      <div className="space-y-6">
        {header}
        <div className="relative overflow-hidden border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-6 text-center">
            <div className="p-3 rounded-full bg-emerald-100 mb-4 ring-8 ring-emerald-50">
              <Lock className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-900">Plano Família Necessário</h3>
            <p className="text-sm text-slate-500 max-w-[320px] mb-6 leading-relaxed">
              A partilha familiar permite que você convide um parceiro para gerenciar as finanças em conjunto no mesmo caderno.
            </p>
            <Button className="rounded-full shadow-lg shadow-emerald-200 gap-2 bg-emerald-600 hover:bg-emerald-700" asChild>
              <a href="/precos">
                <Sparkles className="h-4 w-4" />
                Fazer Upgrade agora
              </a>
            </Button>
          </div>
          
          <div className="opacity-20 grayscale pointer-events-none space-y-4">
            <div className="flex gap-2 justify-center">
              <Button disabled>Gerar link de convite</Button>
              <Button variant="outline" disabled>Atualizar membros</Button>
            </div>
            <div className="h-32 rounded-lg border border-dashed flex items-center justify-center">
               <p className="text-xs">Conteúdo bloqueado</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {header}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleGenerateInvite} disabled={isGenerating} className="bg-emerald-600 hover:bg-emerald-700">
          {isGenerating ? 'Gerando...' : 'Gerar link de convite'}
        </Button>
        <Button variant="outline" onClick={async () => { await Promise.all([loadMembers(), loadInviteTokens()]); }} disabled={isLoadingMembers || isLoadingTokens} className="border-slate-200">
          <RefreshCw className="mr-2 h-4 w-4 text-slate-500" />
          Atualizar membros
        </Button>
      </div>

      {inviteUrl ? (
        <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
          <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Link de convite ativo
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input readOnly value={inviteUrl} className="bg-white border-emerald-200 focus-visible:ring-emerald-500" />
            <Button variant="outline" onClick={handleCopy} className="border-emerald-200 text-emerald-700 hover:bg-emerald-100">
              Copiar Link
            </Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-6 pt-4 border-t border-slate-100">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Convites Pendentes</h4>
            {isLoadingTokens ? (
              <p className="text-sm text-slate-500">Carregando tokens...</p>
            ) : (
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 min-h-[100px] flex flex-col">
                {!inviteTokens || !inviteTokens.activeInvites.length ? (
                  <p className="text-sm text-slate-400 m-auto text-center italic">Nenhum convite ativo no momento.</p>
                ) : (
                  <div className="space-y-3">
                    {inviteTokens.activeInvites.map((invite) => (
                      <div key={invite.id} className="flex flex-col gap-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                        <span className="text-xs font-mono bg-white border rounded px-1.5 py-0.5 self-start break-all">{invite.token}</span>
                        <span className="text-[10px] text-slate-400">
                          Expira: {new Date(invite.expiresAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Convites Aceitos</h4>
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 min-h-[100px] flex flex-col">
              {!inviteTokens || !inviteTokens.acceptedInvites.length ? (
                <p className="text-sm text-slate-400 m-auto text-center italic">Nenhum convite aceito ainda.</p>
              ) : (
                <div className="space-y-3">
                  {inviteTokens.acceptedInvites.map((invite) => (
                    <div key={invite.id} className="flex flex-col gap-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                      <p className="text-xs font-medium text-slate-700">{invite.token}</p>
                      <span className="text-[10px] text-slate-500">
                        Por: {invite.acceptedBy?.name || invite.acceptedBy?.email || 'Usuário desconhecido'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Membros com Acesso</h4>

          <div className="grid gap-3">
            {family?.owner ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white">
                <div className="flex items-center gap-3">
                  <UserInitials name={family.owner.name} email={family.owner.email} className="h-10 w-10 ring-2 ring-emerald-50" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{family.owner.name || 'Sem nome'}</p>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold uppercase">Dono</span>
                    </div>
                    <p className="text-xs text-slate-500">{family.owner.email || 'Sem email'}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {family?.members?.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-3">
                  <UserInitials name={member.name} email={member.email} className="h-10 w-10" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{member.name || 'Sem nome'}</p>
                    <p className="text-xs text-slate-500">{member.email || 'Sem email'}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8"
                  onClick={() => removeFamilyMember(member.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            {(!family?.members || family.members.length === 0) && (
               <div className="p-8 text-center border border-dashed rounded-xl bg-slate-50/30">
                 <p className="text-sm text-slate-400 italic">Nenhum membro vinculado além do dono.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
