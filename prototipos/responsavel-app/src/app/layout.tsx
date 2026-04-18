import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "iPet — Pet Pass",
  description: "Seu passaporte pet digital. Viaje com segurança.",
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
  themeColor: "#0ea5e9",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.className} bg-gray-950 text-white antialiased`}>
        <AuthProvider>
          <div className="mx-auto max-w-[430px] min-h-screen relative overflow-x-hidden">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
