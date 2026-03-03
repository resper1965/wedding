import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import '@fontsource/great-vibes';
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { PWAInstallPrompt } from "@/components/ui-custom/PWAInstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d97706",
};

export const metadata: Metadata = {
  title: "WeddingApp — O Seu Casamento Perfeito",
  description: "A plataforma definitiva que une cerimonialistas e noivos. Inteligência Artificial para responder dúvidas de convidados, RSVP automatizado e gestão multi-eventos sem estresse.",
  keywords: ["organização de casamento", "wedding planner", "cerimonialista", "RSVP digital", "site dos noivos", "inteligência artificial para casamento"],
  authors: [{ name: "Ness.br" }],
  creator: "WeddingApp",
  metadataBase: new URL('https://wedding.louise.com.br'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://wedding.louise.com.br/",
    title: "WeddingApp — O Seu Casamento Perfeito",
    description: "A plataforma definitiva que une cerimonialistas e noivos com IA e agendamentos.",
    siteName: "WeddingApp",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WeddingApp",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen font-sans`}
      >
        <SessionProvider>
          {children}
          <Toaster />
          <PWAInstallPrompt />
        </SessionProvider>
      </body>
    </html>
  );
}
