"use client";

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFamilyInvite } from '@/context/family-invite-context';
import { Link2, Lock, RefreshCw, Sparkles, Trash2, Users } from 'lucide-react';
import { useEffect } from 'react';

function getInitials(name?: string | null, email?: string | null) {
  const source = (name || email || 'U').trim();
  const parts = source.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

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

  useEffect(() => {
    if (!isFamilyPlan) return;

    void refresh();
  }, [isFamilyPlan, refresh]);


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

  if (!isFamilyPlan) {
    return (
      <Card className="relative overflow-hidden border-2 border-dashed border-primary/20">
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-3 rounded-full bg-primary/10 mb-4 ring-8 ring-primary/5">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2">Plano Família Necessário</h3>
          <p className="text-sm text-muted-foreground max-w-[320px] mb-6">
            A partilha familiar permite que você convide um parceiro para gerenciar as finanças em conjunto no mesmo caderno.
          </p>
          <Button className="rounded-full shadow-lg shadow-primary/20 gap-2" asChild>
            <a href="/precos">
              <Sparkles className="h-4 w-4" />
              Fazer Upgrade agora
            </a>
          </Button>
        </div>
        
        <CardHeader className="opacity-40 grayscale-[0.5]">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Partilha Familiar
          </CardTitle>
          <CardDescription>
            Convide membros para compartilhar seu caderno financeiro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 opacity-40 grayscale-[0.5] pointer-events-none">
          <div className="flex gap-2">
            <Button disabled>Gerar link de convite</Button>
            <Button variant="outline" disabled>Atualizar membros</Button>
          </div>
          <div className="h-24 rounded-lg border border-dashed flex items-center justify-center">
             <p className="text-xs text-muted-foreground">Conteúdo bloqueado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          Partilha Familiar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={handleGenerateInvite} disabled={isGenerating}>
            {isGenerating ? 'Gerando...' : 'Gerar link de convite'}
          </Button>
          <Button variant="outline" onClick={async () => { await Promise.all([loadMembers(), loadInviteTokens()]); }} disabled={isLoadingMembers || isLoadingTokens}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar membros
          </Button>
        </div>

        {inviteUrl ? (
          <div className="space-y-2 rounded-lg border p-3">
            <p className="text-sm font-medium">Link de convite</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input readOnly value={inviteUrl} />
              <Button variant="outline" onClick={handleCopy}>
                <Link2 className="mr-2 h-4 w-4" />
                Copiar
              </Button>
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Tokens de convite gerados</h4>
          {isLoadingTokens ? (
            <p className="text-sm text-muted-foreground">Carregando tokens...</p>
          ) : (
            <>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-2">Convites ativos</p>
                {!inviteTokens || !inviteTokens.activeInvites.length ? (
                  <p className="text-sm text-muted-foreground">Nenhum convite ativo no momento.</p>
                ) : (
                  <div className="space-y-2">
                    {inviteTokens.activeInvites.map((invite) => (
                      <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded p-2">
                        <span className="text-xs break-all">{invite.token}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Expira: {new Date(invite.expiresAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-2">Convites aceitos</p>
                {!inviteTokens || !inviteTokens.acceptedInvites.length ? (
                  <p className="text-sm text-muted-foreground">Nenhum convite aceito ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {inviteTokens.acceptedInvites.map((invite) => (
                      <div key={invite.id} className="flex flex-col gap-1 border rounded p-2">
                        <p className="text-xs font-medium">{invite.token}</p>
                        <span className="text-xs text-muted-foreground">
                          Aceito em: {invite.acceptedAt ? new Date(invite.acceptedAt).toLocaleString() : 'N/A'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Por: {invite.acceptedBy?.name || invite.acceptedBy?.email || 'Usuário desconhecido'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Quem tem acesso</p>

          {family?.owner ? (
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-2">Conta principal</p>
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback>{getInitials(family.owner.name, family.owner.email)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{family.owner.name || 'Sem nome'}</p>
                  <p className="text-xs text-muted-foreground">{family.owner.email || 'Sem email'}</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground mb-2">Membros vinculados</p>
            {family?.members?.length ? (
              <div className="space-y-2">
                {family.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback>{getInitials(member.name, member.email)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm">{member.name || 'Sem nome'}</p>
                        <p className="text-xs text-muted-foreground">{member.email || 'Sem email'}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => removeFamilyMember(member.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum membro vinculado ainda.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

