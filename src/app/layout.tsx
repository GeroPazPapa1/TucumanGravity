import type { Metadata, Viewport } from "next";
import { Anton, Barlow_Condensed } from "next/font/google";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import { AuthProvider } from "@/components/AuthProvider";
import { PlataformaConfigProvider } from "@/components/PlataformaConfigProvider";
import OnboardingGate from "@/components/OnboardingGate";
import AppShell from "@/components/AppShell";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Downhill App",
  description:
    "Ranking, resultados y perfil de corredor para todos los torneos de descenso (downhill MTB), en un solo lugar.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${anton.variable} ${barlow.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <PlataformaConfigProvider>
          <AuthProvider>
            <OnboardingGate />
            <AppShell>
              <Header />
              <main className="flex-1 w-full max-w-3xl mx-auto px-4 pb-28 pt-4">
                <PageTransition>{children}</PageTransition>
              </main>
              <BottomNav />
            </AppShell>
          </AuthProvider>
        </PlataformaConfigProvider>
      </body>
    </html>
  );
}
