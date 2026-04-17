import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware de sessão iPet
 *
 * Responsabilidades:
 * 1. Renovar o access token em cada requisição (Supabase SSR)
 * 2. Proteger rotas autenticadas — redireciona para /auth/entrar
 * 3. Redirecionar usuários autenticados sem onboarding para /onboarding
 * 4. Redirecionar usuários já logados para fora das páginas de auth
 */

// Rotas públicas — acessíveis sem autenticação
const PUBLIC_PATHS = [
  "/auth/entrar",
  "/auth/cadastro",
  "/auth/verificar-email",
  "/auth/callback",
  "/auth/esqueci-senha",
  "/auth/redefinir-senha",
];

export async function middleware(request: NextRequest) {
  // ── Modo dev sem Supabase configurado ─────────────────────────
  // Se as env vars não estiverem presentes, passa tudo direto sem auth.
  // Remove este bloco quando ativar o Supabase em produção.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANTE: não chamar supabase.auth.getUser() entre getAll/setAll
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // 1. Rota pública: se já logado, redireciona para home
  if (isPublicPath && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Rota protegida sem sessão: vai para login
  if (!isPublicPath && !user) {
    const loginUrl = new URL("/auth/entrar", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Usuário autenticado — verificar se completou onboarding
  if (user && !isPublicPath && pathname !== "/onboarding") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completo")
      .eq("id", user.id)
      .single();

    if (profile && !profile.onboarding_completo) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico
     * - Arquivos públicos com extensão conhecida
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
