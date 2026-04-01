"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { acceptInvite, previewInvite } from '@/services/family-invites';
import { CheckCircle2, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const token = params?.token;

  const [ownerName, setOwnerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    const loadPreview = async () => {
      if (!token) return;
      try {
        const data = await previewInvite(token);
        setOwnerName(data.ownerName || 'Conta principal');
      } catch (error: any) {
        const { toast } = await import('sonner');
        toast.error(error?.message || 'Convite inválido ou expirado.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    if (!isAuthenticated) {
      router.push('/entrar');
      return;
    }

    try {
      setIsAccepting(true);
      await acceptInvite(token);
      const { toast } = await import('sonner');
      toast.success('Contas associadas com sucesso.');
      router.push('/');
    } catch (error: any) {
      const { toast } = await import('sonner');
      toast.error(error?.message || 'Não foi possível aceitar o convite.');
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center justify-center p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Convite de Partilha Familiar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Validando convite...</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Foi convidado a partilhar a gestão financeira com{' '}
                <span className="font-semibold text-foreground">{ownerName || 'Conta principal'}</span>.
              </p>

              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Ao aceitar, você passa a visualizar e operar na conta principal compartilhada.
                </p>
              </div>

              <Button onClick={handleAccept} disabled={isAccepting}>
                {isAccepting ? 'Associando...' : 'Aceitar e associar contas'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
