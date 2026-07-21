import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware de sessão iPet
 *
 * Responsabilidades:
 * 1. Renovar o access token em cada requisição (Supabase SSR)
 * 2. Páginas: redireciona não-autenticados para /auth/entrar
 * 3. /api/*: retorna 401 JSON (sem redirect) e 503 quando Supabase não configurado
 * 4. Onboarding incompleto: força /onboarding em páginas (não em /api/*)
 * 5. Usuários logados não voltam pra páginas de auth
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
  const { pathname: pathnameInicial } = request.nextUrl;
  const isApiPath = pathnameInicial.startsWith("/api/");

  // ── Modo dev sem Supabase configurado ─────────────────────────
  // Páginas: passam direto sem auth (DX local).
  // Rotas /api/*: bloqueadas com 503 — endpoints chamam APIs pagas
  // (Anthropic, Mercado Pago) e não podem ficar abertos por descuido.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    if (isApiPath) {
      return Response.json(
        { ok: false, erro: "Auth não configurada — API indisponível." },
        { status: 503 },
      );
    }
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

  // 0. Rota /api/* sem sessão: 401 JSON (não redireciona — não é navegação).
  // Bloqueia abuso de quota das APIs pagas (Anthropic, MP).
  if (isApiPath && !user) {
    return Response.json(
      { ok: false, erro: "Não autenticado." },
      { status: 401 },
    );
  }

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
  // (pula /api/* — onboarding incompleto não deve redirecionar chamadas JSON)
  if (user && !isPublicPath && !isApiPath && pathname !== "/onboarding") {
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
