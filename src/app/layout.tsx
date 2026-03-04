import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Figtree, Montserrat, Dancing_Script } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PWAInstallPrompt } from "@/components/ui-custom/PWAInstallPrompt";
import { CookieConsent } from "@/components/ui-custom/CookieConsent";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-accent",
  subsets: ["latin"],
});

const dancing = Dancing_Script({
  variable: "--font-script",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "MarryFlow — O Seu Casamento Perfeito",
  description: "A plataforma definitiva que une cerimonialistas e noivos. Gabi, a sua Inteligência Artificial, responde dúvidas de convidados, automatiza o RSVP e faz a gestão multi-eventos sem estresse.",
  keywords: ["organização de casamento", "wedding planner", "cerimonialista", "RSVP digital", "site dos noivos", "Gabi IA", "inteligência artificial para casamento"],
  authors: [{ name: "esper systems" }],
  creator: "Marryflow",
  metadataBase: new URL('https://wedding.louise.com.br'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://wedding.louise.com.br/",
    title: "MarryFlow",
    description: "A plataforma definitiva que une cerimonialistas e noivos com Gabi, sua IA.",
    siteName: "MarryFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "MarryFlow",
    description: "A plataforma definitiva que une cerimonialistas e noivos com Gabi, sua IA.",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MarryFlow",
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
        className={`${figtree.variable} ${playfair.variable} ${montserrat.variable} ${dancing.variable} ${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          Pular para o conteúdo principal
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
            <Toaster />
            <PWAInstallPrompt />
            <CookieConsent />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
