import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso em componentes Client ("use client").
 * Cria uma instância singleton por carregamento de página.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
