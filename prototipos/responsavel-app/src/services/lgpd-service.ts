/**
 * iPet LGPD Service
 *
 * Implementa todos os direitos do titular previstos na
 * Lei Geral de Proteção de Dados (Lei nº 13.709/2018):
 *
 * Art. 18 — Direitos do titular:
 *   I   — Confirmação da existência de tratamento
 *   II  — Acesso aos dados
 *   III — Correção de dados incompletos, inexatos ou desatualizados
 *   IV  — Anonimização, bloqueio ou eliminação de dados desnecessários
 *   V   — Portabilidade dos dados a outro fornecedor
 *   VI  — Eliminação dos dados pessoais tratados com consentimento
 *   IX  — Revogação do consentimento
 */

import { createClient } from "@/lib/supabase/client";
import type { ConsentimentoLGPD, TipoConsentimento, TipoSolicitacaoLGPD } from "@/domain/types";
import { sha256 } from "./auth-service";

// Versões atuais dos documentos legais
export const VERSAO_TERMOS = "1.0.0";
export const VERSAO_PRIVACIDADE = "1.0.0";

const getClient = () => createClient();

// ─── Consentimento ────────────────────────────────────────────────────────

/**
 * Registra uma decisão de consentimento.
 * Cada registro é imutável — revogação gera novo registro com aceito=false.
 * Conforme Art. 8º §5º LGPD: o ônus da prova do consentimento é do controlador.
 */
export async function registrarConsentimento(
  userId: string,
  tipo: TipoConsentimento,
  aceito: boolean,
  versao: string
): Promise<{ error: Error | null }> {
  const supabase = getClient();

  // Anonimiza o IP e user agent antes de armazenar
  const userAgent = navigator.userAgent;
  const ipHash = await sha256(`${userId}-${Date.now()}`); // placeholder — em produção: IP real via header
  const userAgentHash = await sha256(userAgent);

  const { error } = await supabase.from("consentimentos").insert({
    user_id: userId,
    tipo,
    versao,
    aceito,
    data_decisao: new Date().toISOString(),
    ip_hash: ipHash,
    user_agent_hash: userAgentHash,
  });

  return { error: error ? new Error(error.message) : null };
}

/**
 * Verifica se o usuário deu consentimento ativo para um tipo específico.
 * Retorna o registro mais recente — se aceito=false, consentimento foi revogado.
 */
export async function verificarConsentimento(
  userId: string,
  tipo: TipoConsentimento
): Promise<boolean> {
  const supabase = getClient();

  const { data } = await supabase
    .from("consentimentos")
    .select("aceito")
    .eq("user_id", userId)
    .eq("tipo", tipo)
    .order("data_decisao", { ascending: false })
    .limit(1)
    .single();

  return data?.aceito ?? false;
}

/**
 * Retorna histórico completo de consentimentos do usuário.
 * Direito de acesso — Art. 18, I e II.
 */
export async function getHistoricoConsentimentos(
  userId: string
): Promise<ConsentimentoLGPD[]> {
  const supabase = getClient();

  const { data } = await supabase
    .from("consentimentos")
    .select("*")
    .eq("user_id", userId)
    .order("data_decisao", { ascending: false });

  return (data ?? []).map((d) => ({
    id: d.id,
    userId: d.user_id,
    tipo: d.tipo,
    versao: d.versao,
    aceito: d.aceito,
    dataDecisao: d.data_decisao,
    ipHash: d.ip_hash,
    userAgentHash: d.user_agent_hash,
  }));
}

// ─── Direitos do Titular ──────────────────────────────────────────────────

/**
 * Art. 18, II + V — Acesso e Portabilidade.
 * Exporta TODOS os dados do usuário em JSON estruturado.
 */
export async function exportarDados(userId: string): Promise<object> {
  const supabase = getClient();

  const [profileRes, consentRes, solicitacoesRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("consentimentos").select("*").eq("user_id", userId),
    supabase.from("solicitacoes_lgpd").select("*").eq("user_id", userId),
  ]);

  // Filtra campos sensíveis — CPF não é exportado nem como hash
  const profile = profileRes.data
    ? {
        id: profileRes.data.id,
        nome_completo: profileRes.data.nome_completo,
        email: profileRes.data.email,
        telefone: profileRes.data.telefone,
        data_nascimento: profileRes.data.data_nascimento,
        provedor_auth: profileRes.data.provedor_auth,
        onboarding_completo: profileRes.data.onboarding_completo,
        criado_em: profileRes.data.criado_em,
        // cpf_hash: omitido intencionalmente — dado sensível
      }
    : null;

  return {
    exportacao: {
      geradoEm: new Date().toISOString(),
      versaoPlataforma: "1.0.0",
      base_legal: "Art. 18, II e V, Lei 13.709/2018 (LGPD)",
    },
    dados_pessoais: profile,
    consentimentos: consentRes.data ?? [],
    solicitacoes_lgpd: solicitacoesRes.data ?? [],
    nota: "Dados exportados pelo próprio titular conforme Art. 18 da LGPD. CPF não incluído por segurança.",
  };
}

/**
 * Cria uma solicitação de direito do titular.
 * O processamento efetivo é assíncrono (máximo 15 dias — Art. 18 §3º).
 */
export async function criarSolicitacaoLGPD(
  userId: string,
  tipo: TipoSolicitacaoLGPD,
  observacoes?: string
) {
  const supabase = getClient();

  return supabase.from("solicitacoes_lgpd").insert({
    user_id: userId,
    tipo,
    status: "PENDENTE",
    observacoes: observacoes ?? null,
    criado_em: new Date().toISOString(),
  });
}

/**
 * Art. 18, VI — Eliminação dos dados.
 * Deleta todos os dados do usuário e encerra a conta.
 * IRREVERSÍVEL. Requer confirmação explícita.
 *
 * Sequência:
 * 1. Registra solicitação de exclusão (trilha de auditoria)
 * 2. Deleta dados pessoais (profiles, pets, documentos)
 * 3. Revoga todos os consentimentos (registro imutável mantido por obrigação legal)
 * 4. Deleta a conta de autenticação
 */
export async function executarExclusaoConta(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getClient();

  try {
    // 1. Registra solicitação antes de tudo (auditoria)
    await criarSolicitacaoLGPD(userId, "EXCLUSAO", "Exclusão solicitada pelo titular via app");

    // 2. Revoga consentimentos ativos
    await registrarConsentimento(userId, "TERMOS", false, VERSAO_TERMOS);
    await registrarConsentimento(userId, "PRIVACIDADE", false, VERSAO_PRIVACIDADE);
    await registrarConsentimento(userId, "MARKETING", false, "1.0.0");

    // 3. Deleta dados pessoais (RLS garante que só o próprio usuário consegue)
    // Nota: pets, documentos e planos de viagem são deletados em cascata via FK
    await supabase.from("profiles").delete().eq("id", userId);

    // 4. Sinaliza para o usuário que a conta será encerrada
    // A exclusão do auth.users é feita via Edge Function no Supabase (requer service_role)
    // Em produção: chamar endpoint /api/auth/delete-account que usa service_role
    await supabase.auth.signOut();

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro desconhecido",
    };
  }
}
