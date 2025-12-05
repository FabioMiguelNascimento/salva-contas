import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { InstallPrompt } from "@/components/install-prompt";
import { Providers } from "@/components/providers";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Salva Contas",
  description: "Dashboard inteligente para organizar recibos, contas e transações com IA",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Salva Contas",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Salva Contas",
    title: "Salva Contas",
    description: "Dashboard inteligente para organizar recibos, contas e transações com IA",
  },
  twitter: {
    card: "summary",
    title: "Salva Contas",
    description: "Dashboard inteligente para organizar recibos, contas e transações com IA",
  },
};

export const viewport: Viewport = {
  userScalable: false,
  initialScale: 1
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#10b981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Salva Contas" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased overflow-x-hidden", fontSans.className)}>
        <Providers>
          <AuthGuard>
            <AppShell>{children}</AppShell>
          </AuthGuard>
        </Providers>
        <InstallPrompt />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
