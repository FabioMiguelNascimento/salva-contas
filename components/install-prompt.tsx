"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWA } from '@/hooks/use-pwa';
import { Download, Smartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function InstallPrompt() {
  const { isInstallable, isInstalled, install, isIOS } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const dismissedPrompt = localStorage.getItem('pwa-install-dismissed');
    if (dismissedPrompt) {
      const dismissedDate = new Date(dismissedPrompt);
      const now = new Date();
      const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Show prompt after 30 seconds if installable and not installed
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  const handleInstall = () => {
    install();
    setIsVisible(false);
  };

  if (!isVisible || dismissed || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Download className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base">Instalar App</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="mb-3">
            Instale o Salva Contas no seu dispositivo para uma experiência melhor,
            com acesso rápido e sem barra de endereço.
          </CardDescription>

          {isIOS ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <span>Toque em <Badge variant="outline" className="text-xs">Compartilhar</Badge></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Depois <Badge variant="outline" className="text-xs">Adicionar à Tela de Início</Badge></span>
              </div>
            </div>
          ) : (
            <Button onClick={handleInstall} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Instalar Agora
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}