"use client";

import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isPublicRoute) {
      router.push("/login");
    }

    if (isAuthenticated && isPublicRoute) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, isPublicRoute, router]);

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
  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  // Se está autenticado e é rota pública, não renderiza nada (vai redirecionar)
  if (isAuthenticated && isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
