"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Calendar,
  Mail,
  ChevronLeft,
  Shield,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  LogOut,
  Camera,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth-store";
import { salvarPerfil, signOut } from "@/services/auth-service";
import {
  exportarDados,
  criarSolicitacaoLGPD,
  executarExclusaoConta,
  getHistoricoConsentimentos,
  registrarConsentimento,
  verificarConsentimento,
  VERSAO_TERMOS,
  VERSAO_PRIVACIDADE,
} from "@/services/lgpd-service";

type Tab = "dados" | "privacidade";

export default function PerfilPage() {
  const router = useRouter();
  const { user, perfil, setPerfil, clearAuth } = useAuthStore();
  const [tab, setTab] = useState<Tab>("dados");

  if (!user || !perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-24">
      {/* Cabeçalho */}
      <div className="px-5 pt-12 pb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-600 text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Início
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center border-2 border-teal/20 relative">
            {perfil.fotoPerfil ? (
              <img src={perfil.fotoPerfil} alt="Foto de perfil" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-teal" />
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold text-navy">{perfil.nomeCompleto}</h1>
            <p className="text-gray-500 text-sm">{perfil.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-5 mb-6">
        {(["dados", "privacidade"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 pr-6 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? "text-teal border-teal"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            {t === "dados" ? "Meus Dados" : "Privacidade"}
          </button>
        ))}
      </div>

      <div className="px-5 flex-1">
        {tab === "dados" ? (
          <TabDados user={user} perfil={perfil} setPerfil={setPerfil} clearAuth={clearAuth} router={router} />
        ) : (
          <TabPrivacidade userId={user.id} clearAuth={clearAuth} router={router} />
        )}
      </div>
    </div>
  );
}

// ─── Tab: Meus Dados ───────────────────────────────────────────────────────

function TabDados({
  user,
  perfil,
  setPerfil,
  clearAuth,
  router,
}: {
  user: { id: string };
  perfil: { nomeCompleto: string; email: string; telefone?: string; dataNascimento?: string };
  setPerfil: (p: import("@/domain/types").PerfilUsuario | null) => void;
  clearAuth: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(perfil.nomeCompleto);
  const [telefone, setTelefone] = useState(perfil.telefone ?? "");
  const [dataNascimento, setDataNascimento] = useState(perfil.dataNascimento ?? "");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: "sucesso" | "erro"; msg: string } | null>(null);

  async function salvar() {
    setLoading(true);
    setFeedback(null);
    const { error, data } = await salvarPerfil(user.id, {
      nomeCompleto: nome,
      telefone: telefone || undefined,
      dataNascimento: dataNascimento || undefined,
    });
    setLoading(false);
    if (error) {
      setFeedback({ tipo: "erro", msg: "Não foi possível salvar. Tente novamente." });
    } else {
      if (data) setPerfil(data);
      setFeedback({ tipo: "sucesso", msg: "Dados atualizados com sucesso." });
      setEditando(false);
    }
  }

  async function handleLogout() {
    await signOut();
    clearAuth();
    router.push("/auth/entrar");
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`flex items-start gap-2.5 rounded-xl p-3 ${
            feedback.tipo === "sucesso"
              ? "bg-emerald-900/30 border border-emerald-700/50"
              : "bg-red-900/30 border border-red-700/50"
          }`}
        >
          {feedback.tipo === "sucesso" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${feedback.tipo === "sucesso" ? "text-emerald-300" : "text-red-500"}`}>
            {feedback.msg}
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl divide-y divide-gray-200">
        <CampoTexto
          icon={<User className="w-4 h-4" />}
          label="Nome completo"
          value={nome}
          editando={editando}
          onChange={setNome}
          placeholder="Nome completo"
        />
        <CampoTexto
          icon={<Mail className="w-4 h-4" />}
          label="E-mail"
          value={perfil.email}
          editando={false}
          onChange={() => {}}
          placeholder=""
          somenteLeitura
        />
        <CampoTexto
          icon={<Phone className="w-4 h-4" />}
          label="Telefone"
          value={telefone}
          editando={editando}
          onChange={setTelefone}
          placeholder="(11) 99999-9999"
          type="tel"
        />
        <CampoTexto
          icon={<Calendar className="w-4 h-4" />}
          label="Data de nascimento"
          value={dataNascimento}
          editando={editando}
          onChange={setDataNascimento}
          placeholder=""
          type="date"
        />
      </div>

      {editando ? (
        <div className="flex gap-3">
          <button
            onClick={() => { setEditando(false); setFeedback(null); }}
            className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-2xl text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={loading}
            className="flex-1 bg-teal hover:bg-teal-dark disabled:bg-gray-300 disabled:text-gray-400 text-white font-semibold py-3 rounded-2xl text-sm transition-colors"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditando(true)}
          className="w-full border border-gray-200 text-gray-600 hover:text-navy py-3 rounded-2xl text-sm transition-colors"
        >
          Editar dados
        </button>
      )}

      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 w-full text-red-500 hover:text-red-500 py-3 text-sm"
      >
        <LogOut className="w-4 h-4" />
        Sair da conta
      </button>
    </div>
  );
}

function CampoTexto({
  icon,
  label,
  value,
  editando,
  onChange,
  placeholder,
  type = "text",
  somenteLeitura = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editando: boolean;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  somenteLeitura?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="text-gray-400 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-400 text-xs mb-0.5">{label}</p>
        {editando && !somenteLeitura ? (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-navy text-sm focus:outline-none placeholder-gray-600"
          />
        ) : (
          <p className={`text-sm truncate ${value ? "text-navy" : "text-gray-400"}`}>
            {value || (somenteLeitura ? "—" : "Não informado")}
          </p>
        )}
      </div>
      {somenteLeitura && <span className="text-gray-400 text-xs">fixo</span>}
    </div>
  );
}

// ─── Tab: Privacidade ─────────────────────────────────────────────────────

function TabPrivacidade({
  userId,
  clearAuth,
  router,
}: {
  userId: string;
  clearAuth: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const [consentMarketing, setConsentMarketing] = useState<boolean | null>(null);
  const [loadingMarketing, setLoadingMarketing] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingExcluir, setLoadingExcluir] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    verificarConsentimento(userId, "MARKETING").then(setConsentMarketing);
  }, [userId]);

  async function toggleMarketing() {
    if (consentMarketing === null) return;
    setLoadingMarketing(true);
    await registrarConsentimento(userId, "MARKETING", !consentMarketing, "1.0.0");
    setConsentMarketing(!consentMarketing);
    setLoadingMarketing(false);
  }

  async function exportar() {
    setLoadingExport(true);
    setFeedback(null);
    const dados = await exportarDados(userId);
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ipet-meus-dados-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setLoadingExport(false);
    setFeedback("Seus dados foram exportados com sucesso.");
  }

  async function solicitarRetificacao() {
    await criarSolicitacaoLGPD(userId, "RETIFICACAO", "Solicitação via app");
    setFeedback("Solicitação de retificação enviada. Responderemos em até 15 dias.");
  }

  async function excluirConta() {
    setLoadingExcluir(true);
    const { success, error } = await executarExclusaoConta(userId);
    if (success) {
      clearAuth();
      router.push("/auth/entrar");
    } else {
      setFeedback(`Erro: ${error ?? "Não foi possível excluir a conta. Contate privacidade@ipet.app"}`);
      setLoadingExcluir(false);
      setConfirmarExclusao(false);
    }
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="bg-teal/5 border border-teal/20 rounded-xl p-3">
          <p className="text-teal text-sm">{feedback}</p>
        </div>
      )}

      {/* Consentimentos */}
      <div>
        <h2 className="text-navy font-semibold mb-3">Consentimentos</h2>
        <div className="bg-white rounded-2xl divide-y divide-gray-200">
          <ItemConsent
            label="Termos de Uso"
            descricao="Obrigatório para uso da plataforma"
            ativo={true}
            readonly
          />
          <ItemConsent
            label="Política de Privacidade"
            descricao="Obrigatório para uso da plataforma"
            ativo={true}
            readonly
          />
          <ItemConsent
            label="Comunicações de marketing"
            descricao="Novidades, dicas e promoções"
            ativo={consentMarketing ?? false}
            loading={loadingMarketing || consentMarketing === null}
            onChange={toggleMarketing}
          />
        </div>
      </div>

      {/* Direitos LGPD */}
      <div>
        <h2 className="text-navy font-semibold mb-1">Seus direitos (Art. 18 LGPD)</h2>
        <p className="text-gray-400 text-xs mb-3">
          Respondemos em até 15 dias corridos.
        </p>
        <div className="space-y-3">
          <AcaoLGPD
            icon={<Download className="w-4 h-4" />}
            titulo="Exportar meus dados"
            descricao="Baixe todos os seus dados em JSON (Art. 18, II e V)"
            loading={loadingExport}
            onClick={exportar}
            cor="teal"
          />
          <AcaoLGPD
            icon={<RefreshCw className="w-4 h-4" />}
            titulo="Solicitar retificação"
            descricao="Corrija dados incompletos ou inexatos (Art. 18, III)"
            onClick={solicitarRetificacao}
            cor="amber"
          />
          <Link href="/lgpd/privacidade">
            <div className="flex items-center gap-3 bg-white rounded-2xl p-4 hover:bg-gray-100 transition-colors">
              <Shield className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-navy text-sm">Ver Política de Privacidade</p>
                <p className="text-gray-400 text-xs">Como tratamos seus dados</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </Link>
        </div>
      </div>

      {/* Zona de perigo */}
      <div>
        <h2 className="text-red-500 font-semibold mb-3">Zona de perigo</h2>

        {!confirmarExclusao ? (
          <button
            onClick={() => setConfirmarExclusao(true)}
            className="flex items-center gap-2 w-full border border-red-200 bg-red-900/20 hover:bg-red-900/30 text-red-500 rounded-2xl p-4 text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Excluir minha conta e dados (Art. 18, VI)
          </button>
        ) : (
          <div className="bg-red-900/20 border border-red-200 rounded-2xl p-4 space-y-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-500 text-sm font-medium">Ação irreversível</p>
                <p className="text-red-500/80 text-xs mt-1 leading-relaxed">
                  Todos os seus dados (perfil, pets, documentos, viagens) serão excluídos permanentemente.
                  Registros de consentimento são mantidos por 5 anos por obrigação legal (Art. 16, I LGPD).
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmarExclusao(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={excluirConta}
                disabled={loadingExcluir}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                {loadingExcluir ? "Excluindo..." : "Confirmar exclusão"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemConsent({
  label,
  descricao,
  ativo,
  readonly = false,
  loading = false,
  onChange,
}: {
  label: string;
  descricao: string;
  ativo: boolean;
  readonly?: boolean;
  loading?: boolean;
  onChange?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex-1">
        <p className="text-navy text-sm">{label}</p>
        <p className="text-gray-400 text-xs">{descricao}</p>
      </div>
      {readonly ? (
        <span className="text-emerald-600 text-xs">Aceito</span>
      ) : loading ? (
        <div className="w-4 h-4 border-2 border-gray-600 border-t-teal rounded-full animate-spin" />
      ) : (
        <button
          onClick={onChange}
          className={`w-11 h-6 rounded-full transition-colors relative ${
            ativo ? "bg-teal" : "bg-gray-200"
          }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
              ativo ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      )}
    </div>
  );
}

function AcaoLGPD({
  icon,
  titulo,
  descricao,
  loading = false,
  onClick,
  cor = "teal",
}: {
  icon: React.ReactNode;
  titulo: string;
  descricao: string;
  loading?: boolean;
  onClick: () => void;
  cor?: "teal" | "amber";
}) {
  const corClass = cor === "teal" ? "text-teal" : "text-amber-600";

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-3 w-full bg-white hover:bg-gray-100 disabled:opacity-60 rounded-2xl p-4 text-left transition-colors"
    >
      <span className={corClass}>
        {loading ? (
          <div className="w-4 h-4 border-2 border-gray-600 border-t-teal rounded-full animate-spin" />
        ) : (
          icon
        )}
      </span>
      <div className="flex-1">
        <p className={`text-sm font-medium ${corClass}`}>{titulo}</p>
        <p className="text-gray-400 text-xs mt-0.5">{descricao}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
  );
}
