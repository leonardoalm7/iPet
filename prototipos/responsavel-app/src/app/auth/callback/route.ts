import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Route Handler para o callback OAuth (Google/Apple).
 * Troca o code pelo session token e redireciona para o destino correto.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Verifica se o usuário precisa completar o onboarding
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completo")
          .eq("id", user.id)
          .single();

        if (!profile || !profile.onboarding_completo) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Erro no OAuth — redireciona para login com mensagem
  return NextResponse.redirect(`${origin}/auth/entrar?error=oauth`);
}
