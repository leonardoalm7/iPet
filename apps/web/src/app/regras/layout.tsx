import Link from "next/link";
import { ArrowRight, PawPrint } from "lucide-react";

export default function RegrasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-bone">
      <header className="sticky top-0 z-10 bg-bone/85 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-ink flex items-center justify-center">
              <PawPrint size={13} strokeWidth={1.75} className="text-bone" />
            </div>
            <span className="font-display text-[15px] text-ink tracking-tight">
              iPet
            </span>
          </Link>
          <Link
            href="/auth/cadastro"
            className="group inline-flex items-center gap-1.5 bg-ink text-bone px-4 py-2 rounded-full text-[12px] font-medium hover:bg-sage transition-colors"
          >
            Criar conta gratuita
            <ArrowRight
              size={12}
              strokeWidth={1.75}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-12">{children}</main>
      <footer className="border-t border-border bg-paper">
        <div className="max-w-6xl mx-auto px-6 py-8 text-[11px] text-muted flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
          <span className="font-mono">iPet Tecnologia LTDA · São Paulo, SP</span>
          <div className="flex gap-4">
            <Link href="/lgpd/privacidade" className="hover:text-ink transition-colors">
              Privacidade
            </Link>
            <Link href="/lgpd/termos" className="hover:text-ink transition-colors">
              Termos
            </Link>
            <Link href="/ferramentas/calculadora-quarentena" className="hover:text-ink transition-colors">
              Calculadora
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
