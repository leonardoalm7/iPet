import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_PATHS = [
  "/auth/entrar",
  "/auth/cadastro",
  "/auth/verificar-email",
  "/auth/callback",
  "/auth/esqueci-senha",
  "/auth/redefinir-senha",
];
const OPEN_PATHS = [
  "/lgpd",
  "/verificar",
  "/regras",
  "/ferramentas",
  "/firebase-messaging-sw.js",
];
const OPEN_API_PATHS = ["/api/checkout/webhook", "/api/push/cron-prazos"];
const PUBLIC_PATHS = [...AUTH_PATHS, ...OPEN_PATHS];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiPath = pathname.startsWith("/api/");
  const isOpenApiPath = OPEN_API_PATHS.some((p) => pathname.startsWith(p));

  if (isOpenApiPath) {
    return NextResponse.next({ request });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    if (isApiPath) {
      return Response.json({ ok: false, erro: "Auth não configurada." }, { status: 503 });
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isApiPath && !user) {
    return Response.json({ ok: false, erro: "Não autenticado." }, { status: 401 });
  }
  if (isAuthPath && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (!isPublicPath && !user) {
    const loginUrl = new URL("/auth/entrar", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
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
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
