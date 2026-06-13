/**
 * iPet Auth Store — Zustand
 *
 * Estado de autenticação separado do app-store por responsabilidade única.
 * Sincroniza com o Supabase Auth via listener.
 */

"use client";

import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import type { PerfilUsuario } from "../domain/types";

interface AuthState {
  user: User | null;
  session: Session | null;
  perfil: PerfilUsuario | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setPerfil: (perfil: PerfilUsuario | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (v: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  session: null,
  perfil: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setPerfil: (perfil) => set({ perfil }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  clearAuth: () =>
    set({
      user: null,
      session: null,
      perfil: null,
      loading: false,
    }),
}));
