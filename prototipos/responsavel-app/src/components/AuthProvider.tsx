"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useAppStore } from "@/store/app-store";
import { createClient } from "@/lib/supabase/client";
import { getPerfil } from "@/services/auth-service";

/**
 * AuthProvider — monta no layout raiz.
 *
 * Responsabilidades:
 * 1. Inicializa a sessão no carregamento da página
 * 2. Escuta mudanças de auth (login, logout, refresh de token)
 * 3. Sincroniza perfil do usuário com o app-store (responsavel)
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession, setPerfil, setLoading, setInitialized, clearAuth } =
    useAuthStore();
  const setResponsavel = useAppStore((s) => s.setResponsavel);

  useEffect(() => {
    const supabase = createClient();

    // Inicializa sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        getPerfil(session.user.id).then((perfil) => {
          setPerfil(perfil);
          // Sincroniza com o app-store para compatibilidade com código existente
          if (perfil) {
            setResponsavel({
              id: perfil.id,
              nome: perfil.nomeCompleto,
              email: perfil.email,
              criadoEm: perfil.criadoEm,
            });
          }
        });
      }

      setLoading(false);
      setInitialized(true);
    });

    // Listener para mudanças de estado de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setLoading(true);
        const perfil = await getPerfil(session.user.id);
        setPerfil(perfil);

        if (perfil) {
          setResponsavel({
            id: perfil.id,
            nome: perfil.nomeCompleto,
            email: perfil.email,
            criadoEm: perfil.criadoEm,
          });
        }
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        clearAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setPerfil, setLoading, setInitialized, clearAuth, setResponsavel]);

  return <>{children}</>;
}
