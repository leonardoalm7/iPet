import Link from "next/link";
import { ArrowLeft, PawPrint } from "lucide-react";

export default function LgpdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-bone">
      <header className="sticky top-0 z-10 bg-bone/85 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft size={13} strokeWidth={1.5} /> Voltar ao iPet
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-ink flex items-center justify-center">
              <PawPrint size={13} strokeWidth={1.75} className="text-bone" />
            </div>
            <span className="font-display text-[15px] text-ink tracking-tight">
              iPet
            </span>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-14">{children}</main>
      <footer className="border-t border-border bg-paper">
        <div className="max-w-3xl mx-auto px-6 py-8 text-[11px] text-muted flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
          <span className="font-mono">iPet Tecnologia LTDA · São Paulo, SP</span>
          <div className="flex gap-4">
            <Link href="/lgpd/privacidade" className="hover:text-ink transition-colors">
              Privacidade
            </Link>
            <Link href="/lgpd/termos" className="hover:text-ink transition-colors">
              Termos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
