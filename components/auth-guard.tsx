"use client";

import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/update-password"];

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isInviteRoute = pathname.startsWith('/invite/');

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isAuthRoute && !isInviteRoute) {
      router.push("/login");
    }

    if (isAuthenticated && isAuthRoute) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, isAuthRoute, isInviteRoute, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado e não é rota pública, não renderiza nada (vai redirecionar)
  if (!isAuthenticated && !isAuthRoute && !isInviteRoute) {
    return null;
  }

  // Se está autenticado e é rota de auth, não renderiza nada (vai redirecionar)
  if (isAuthenticated && isAuthRoute) {
    return null;
  }

  return <>{children}</>;
}
