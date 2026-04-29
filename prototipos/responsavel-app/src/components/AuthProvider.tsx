"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useAppStore } from "@/store/app-store";
import { createClient } from "@/lib/supabase/client";
import { getPerfil } from "@/services/auth-service";
import { loadFromSupabase, migrateLocalToSupabase, startSync, stopSync } from "@/services/sync";

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
    let stopSyncFn: (() => void) | null = null;

    async function hidratar(userId: string) {
      const { vazio } = await loadFromSupabase(userId, supabase);
      // Primeira vez no Supabase mas tem dados locais → upload one-shot
      if (vazio) {
        const tem = useAppStore.getState();
        if (tem.pets.length > 0 || tem.planosViagem.length > 0 || tem.documentos.length > 0) {
          await migrateLocalToSupabase(userId, supabase);
        }
      }
      stopSyncFn?.();
      stopSyncFn = startSync(userId, supabase);
    }

    // Inicializa sessão existente
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
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
        await hidratar(session.user.id);
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
        await hidratar(session.user.id);
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        stopSyncFn?.();
        stopSyncFn = null;
        stopSync();
        clearAuth();
      }
    });

    return () => {
      subscription.unsubscribe();
      stopSyncFn?.();
      stopSync();
    };
  }, [setUser, setSession, setPerfil, setLoading, setInitialized, clearAuth, setResponsavel]);

  return <>{children}</>;
}
