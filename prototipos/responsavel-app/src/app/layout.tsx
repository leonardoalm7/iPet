import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "iPet — Pass",
  description: "Seu passaporte pet digital. Viaje com segurança.",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "iPet",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1B3A5C",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-cream text-navy antialiased`}>
        <AuthProvider>
          <div className="mx-auto max-w-[430px] min-h-screen relative overflow-x-hidden bg-surface">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
