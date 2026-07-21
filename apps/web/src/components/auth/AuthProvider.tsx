"use client";

import { useEffect } from "react";
import { useAuthStore, useAppStore } from "@ipet/core";
import { createClient } from "@/lib/supabase/client";
import { getPerfil } from "@ipet/core/services/auth-service";
import { loadFromSupabase, migrateLocalToSupabase, startSync, stopSync } from "@ipet/core/services/sync";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession, setPerfil, setLoading, setInitialized, clearAuth } = useAuthStore();
  const setResponsavel = useAppStore((s) => s.setResponsavel);

  useEffect(() => {
    const supabase = createClient();
    let stopSyncFn: (() => void) | null = null;

    async function hidratar(userId: string) {
      const { vazio } = await loadFromSupabase(userId, supabase);
      if (vazio) {
        const tem = useAppStore.getState();
        if (tem.pets.length > 0 || tem.planosViagem.length > 0 || tem.documentos.length > 0) {
          await migrateLocalToSupabase(userId, supabase);
        }
      }
      stopSyncFn?.();
      stopSyncFn = startSync(userId, supabase);
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const perfil = await getPerfil(session.user.id);
        setPerfil(perfil);
        if (perfil) setResponsavel({ id: perfil.id, nome: perfil.nomeCompleto, email: perfil.email, criadoEm: perfil.criadoEm });
        await hidratar(session.user.id);
      }
      setLoading(false);
      setInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoading(true);
        const perfil = await getPerfil(session.user.id);
        setPerfil(perfil);
        if (perfil) setResponsavel({ id: perfil.id, nome: perfil.nomeCompleto, email: perfil.email, criadoEm: perfil.criadoEm });
        await hidratar(session.user.id);
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        stopSyncFn?.(); stopSyncFn = null; stopSync(); clearAuth();
      }
    });

    return () => { subscription.unsubscribe(); stopSyncFn?.(); stopSync(); };
  }, [setUser, setSession, setPerfil, setLoading, setInitialized, clearAuth, setResponsavel]);

  return <>{children}</>;
}
