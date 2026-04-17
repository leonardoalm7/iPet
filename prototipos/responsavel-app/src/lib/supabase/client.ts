import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso em componentes Client ("use client").
 * Cria uma instância singleton por carregamento de página.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-key";
  return createBrowserClient(url, key);
}
