"use client";

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { generateInvite, getFamilyMembers } from '@/services/family-invites';
import { Link2, Lock, RefreshCw, Sparkles, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

function getInitials(name?: string | null, email?: string | null) {
  const source = (name || email || 'U').trim();
  const parts = source.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

export default function FamilyShareCard() {
  const { user } = useAuth();
  const [inviteUrl, setInviteUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [family, setFamily] = useState<{ owner: any; members: any[]; isOwner: boolean } | null>(null);

  const isFamilyPlan = user?.planTier === 'FAMILY';

  const loadMembers = async () => {
    if (!isFamilyPlan) return;
    try {
      setIsLoadingMembers(true);
      const data = await getFamilyMembers();
      setFamily(data);
    } catch (error: any) {
      const { toast } = await import('sonner');
      toast.error(error?.message || 'Não foi possível carregar os membros vinculados.');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [isFamilyPlan]);

  const handleGenerateInvite = async () => {
    try {
      setIsGenerating(true);
      const { inviteUrl } = await generateInvite();
      setInviteUrl(inviteUrl);
      const { toast } = await import('sonner');
      toast.success('Link de convite gerado.');
    } catch (error: any) {
      const { toast } = await import('sonner');
      toast.error(error?.message || 'Não foi possível gerar o convite.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      const { toast } = await import('sonner');
      toast.success('Link copiado para a area de transferencia.');
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
          <Button variant="outline" onClick={loadMembers} disabled={isLoadingMembers}>
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
                  <div key={member.id} className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback>{getInitials(member.name, member.email)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">{member.name || 'Sem nome'}</p>
                      <p className="text-xs text-muted-foreground">{member.email || 'Sem email'}</p>
                    </div>
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

