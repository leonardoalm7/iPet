/**
 * iPet Auth Service
 *
 * Abstração sobre o Supabase Auth.
 * Se precisar trocar de provider no futuro, apenas este arquivo muda.
 *
 * Provedores suportados: Google, Apple, Email/Senha
 */

import { createClient } from "@/lib/supabase/client";
import type { PerfilUsuario } from "@/domain/types";

const getClient = () => createClient();

// ─── Autenticação Social ───────────────────────────────────────────────────

export async function signInWithGoogle() {
  const supabase = getClient();
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: {
        // Solicita acesso ao perfil básico — não solicitamos drive, calendar, etc.
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
}

export async function signInWithApple() {
  const supabase = getClient();
  return supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
}

// ─── Email / Senha ─────────────────────────────────────────────────────────

export async function signInWithEmail(email: string, senha: string) {
  const supabase = getClient();
  return supabase.auth.signInWithPassword({ email, password: senha });
}

export async function signUpWithEmail(
  email: string,
  senha: string,
  nomeCompleto: string
) {
  const supabase = getClient();
  return supabase.auth.signUp({
    email,
    password: senha,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        nome_completo: nomeCompleto,
        provedor_auth: "EMAIL",
      },
    },
  });
}

export async function solicitarRedefinicaoSenha(email: string) {
  const supabase = getClient();
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/redefinir-senha`,
  });
}

export async function redefinirSenha(novaSenha: string) {
  const supabase = getClient();
  return supabase.auth.updateUser({ password: novaSenha });
}

// ─── Sessão ────────────────────────────────────────────────────────────────

export async function getSession() {
  const supabase = getClient();
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

export async function getUser() {
  const supabase = getClient();
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}

export async function signOut() {
  const supabase = getClient();
  return supabase.auth.signOut();
}

export function onAuthStateChange(
  callback: (event: string, session: unknown) => void
) {
  const supabase = getClient();
  return supabase.auth.onAuthStateChange(callback);
}

// ─── Perfil do Usuário ────────────────────────────────────────────────────

export async function getPerfil(userId: string): Promise<PerfilUsuario | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    nomeCompleto: data.nome_completo,
    email: data.email ?? "",
    telefone: data.telefone ?? undefined,
    dataNascimento: data.data_nascimento ?? undefined,
    fotoPerfil: data.foto_url ?? undefined,
    cpfHash: data.cpf_hash ?? undefined,
    onboardingCompleto: data.onboarding_completo,
    provedorAuth: data.provedor_auth ?? "EMAIL",
    criadoEm: data.criado_em,
    atualizadoEm: data.atualizado_em,
  };
}

export async function salvarPerfil(
  userId: string,
  dados: Partial<{
    nomeCompleto: string;
    telefone: string;
    dataNascimento: string;
    fotoPerfil: string;
    cpfHash: string;
    onboardingCompleto: boolean;
  }>
) {
  const supabase = getClient();

  const payload: Record<string, unknown> = {
    id: userId,
    atualizado_em: new Date().toISOString(),
  };

  if (dados.nomeCompleto !== undefined) payload.nome_completo = dados.nomeCompleto;
  if (dados.telefone !== undefined) payload.telefone = dados.telefone;
  if (dados.dataNascimento !== undefined) payload.data_nascimento = dados.dataNascimento;
  if (dados.fotoPerfil !== undefined) payload.foto_url = dados.fotoPerfil;
  if (dados.cpfHash !== undefined) payload.cpf_hash = dados.cpfHash;
  if (dados.onboardingCompleto !== undefined) payload.onboarding_completo = dados.onboardingCompleto;

  return supabase.from("profiles").upsert(payload);
}

// ─── Hash utilitário ──────────────────────────────────────────────────────

/**
 * Gera SHA-256 de uma string (para CPF, IP, user agent).
 * Dados sensíveis nunca ficam em texto claro no banco.
 */
export async function sha256(texto: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
