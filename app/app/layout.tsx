import { AuthGuard } from "@/components/auth-guard";
import { InstallPrompt } from "@/components/install-prompt";
import { Providers } from "@/components/providers";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Salva Contas",
  description: "Dashboard inteligente para organizar recibos, contas e transacoes com IA",
};

export const viewport: Viewport = {
  userScalable: false,
  initialScale: 1,
};

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased overflow-x-hidden", fontSans.className)}>
        <Providers>
          <AuthGuard>{children}</AuthGuard>
        </Providers>
        <InstallPrompt />
        <ServiceWorkerRegister />
        <Toaster />
      </body>
    </html>
  );
}
