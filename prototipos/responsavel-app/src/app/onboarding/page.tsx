"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  Calendar,
  Shield,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  PawPrint,
  FileText,
  Lock,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { salvarPerfil, sha256 } from "@/services/auth-service";
import { registrarConsentimento, VERSAO_TERMOS, VERSAO_PRIVACIDADE } from "@/services/lgpd-service";
import Link from "next/link";

const TOTAL_STEPS = 3;

interface DadosKYC {
  nomeCompleto: string;
  telefone: string;
  dataNascimento: string;
  cpf: string;
}

interface DadosConsentimento {
  termos: boolean;
  privacidade: boolean;
  marketing: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setPerfil } = useAuthStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [dados, setDados] = useState<DadosKYC>({
    nomeCompleto: "",
    telefone: "",
    dataNascimento: "",
    cpf: "",
  });

  const [consentimento, setConsentimento] = useState<DadosConsentimento>({
    termos: false,
    privacidade: false,
    marketing: false,
  });

  function avancar() {
    setErro(null);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function voltar() {
    setErro(null);
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleConcluir() {
    if (!consentimento.termos || !consentimento.privacidade) {
      setErro("Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.");
      return;
    }
    if (!user) return;

    setLoading(true);
    setErro(null);

    try {
      // Hash CPF antes de salvar (nunca o valor em texto simples)
      const cpfHash = dados.cpf ? await sha256(dados.cpf.replace(/\D/g, "")) : undefined;

      // Salvar perfil KYC
      const { error: perfilError, data: perfilAtualizado } = await salvarPerfil(user.id, {
        nomeCompleto: dados.nomeCompleto,
        telefone: dados.telefone || undefined,
        dataNascimento: dados.dataNascimento || undefined,
        cpfHash,
        onboardingCompleto: true,
      });

      if (perfilError) throw new Error(perfilError.message);
      if (perfilAtualizado) setPerfil(perfilAtualizado);

      // Registrar consentimentos — imutável, append-only (LGPD Art. 8º §5º)
      await Promise.all([
        registrarConsentimento(user.id, "TERMOS", true, VERSAO_TERMOS),
        registrarConsentimento(user.id, "PRIVACIDADE", true, VERSAO_PRIVACIDADE),
        ...(consentimento.marketing
          ? [registrarConsentimento(user.id, "MARKETING", true, "1.0.0")]
          : []),
      ]);

      router.push("/");
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar seus dados. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream px-5 pt-12 pb-8">
      {/* Cabeçalho */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-teal/10 rounded-2xl flex items-center justify-center border border-teal/20 mb-3">
          <PawPrint className="w-7 h-7 text-teal" />
        </div>
        <h1 className="text-xl font-bold text-navy">Bem-vindo ao iPet</h1>
        <p className="text-gray-500 text-sm mt-1">Complete seu perfil para começar</p>
      </div>

      {/* Indicador de progresso */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition-all ${
              s <= step ? "bg-teal" : "bg-gray-100"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepDadosPessoais
            key="step1"
            dados={dados}
            onChange={setDados}
            onNext={avancar}
          />
        )}
        {step === 2 && (
          <StepDocumento
            key="step2"
            dados={dados}
            onChange={setDados}
            onNext={avancar}
            onBack={voltar}
          />
        )}
        {step === 3 && (
          <StepConsentimento
            key="step3"
            consentimento={consentimento}
            onChange={setConsentimento}
            erro={erro}
            loading={loading}
            onBack={voltar}
            onConcluir={handleConcluir}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Step 1: Dados pessoais básicos ────────────────────────────────────────

function StepDadosPessoais({
  dados,
  onChange,
  onNext,
}: {
  dados: DadosKYC;
  onChange: (d: DadosKYC) => void;
  onNext: () => void;
}) {
  const podeAvancar = dados.nomeCompleto.trim().length >= 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="flex flex-col flex-1 gap-6"
    >
      <div>
        <h2 className="text-lg font-bold text-navy">Seus dados</h2>
        <p className="text-gray-500 text-sm mt-1">Como podemos te chamar?</p>
      </div>

      <div className="space-y-4">
        {/* Nome completo */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Nome completo *</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Ex: Maria das Graças Souza"
              value={dados.nomeCompleto}
              onChange={(e) => onChange({ ...dados, nomeCompleto: e.target.value })}
              autoComplete="name"
              className="w-full bg-gray-100 border border-gray-200 focus:border-teal text-navy rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none transition-colors placeholder-gray-500"
            />
          </div>
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Telefone (opcional)</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              placeholder="(11) 99999-9999"
              value={dados.telefone}
              onChange={(e) => onChange({ ...dados, telefone: e.target.value })}
              autoComplete="tel"
              className="w-full bg-gray-100 border border-gray-200 focus:border-teal text-navy rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none transition-colors placeholder-gray-500"
            />
          </div>
        </div>

        {/* Data de nascimento */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Data de nascimento (opcional)</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dados.dataNascimento}
              onChange={(e) => onChange({ ...dados, dataNascimento: e.target.value })}
              className="w-full bg-gray-100 border border-gray-200 focus:border-teal text-navy rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={onNext}
          disabled={!podeAvancar}
          className="flex items-center justify-center gap-2 w-full bg-teal hover:bg-teal-dark disabled:bg-gray-300 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-2xl transition-colors"
        >
          Continuar
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 2: Documento (CPF) — opcional ────────────────────────────────────

function StepDocumento({
  dados,
  onChange,
  onNext,
  onBack,
}: {
  dados: DadosKYC;
  onChange: (d: DadosKYC) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="flex flex-col flex-1 gap-6"
    >
      <div>
        <h2 className="text-lg font-bold text-navy">Documento</h2>
        <p className="text-gray-500 text-sm mt-1">
          Opcional — usado apenas para verificação de identidade em casos de suporte.
        </p>
      </div>

      <div className="bg-teal/5 border border-teal/20 rounded-2xl p-4 flex gap-3">
        <Shield className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-teal text-sm font-medium">Seus dados estão protegidos</p>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed">
            O CPF é armazenado como um hash criptográfico (SHA-256) e nunca em texto simples.
            Nem a equipe do iPet tem acesso ao valor original. Conforme{" "}
            <span className="text-teal">LGPD Art. 46</span>.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1.5">CPF (opcional)</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="000.000.000-00"
            value={dados.cpf}
            onChange={(e) => onChange({ ...dados, cpf: e.target.value })}
            maxLength={14}
            autoComplete="off"
            className="w-full bg-gray-100 border border-gray-200 focus:border-teal text-navy rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none transition-colors placeholder-gray-500"
          />
        </div>
        <p className="text-gray-400 text-xs mt-1.5 ml-1">
          Será convertido em hash irreversível antes de ser salvo.
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <button
          onClick={onNext}
          className="flex items-center justify-center gap-2 w-full bg-teal hover:bg-teal-dark text-white font-semibold py-3.5 rounded-2xl transition-colors"
        >
          Continuar
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 w-full text-gray-500 hover:text-gray-600 py-2 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 3: Consentimentos LGPD ──────────────────────────────────────────

function StepConsentimento({
  consentimento,
  onChange,
  erro,
  loading,
  onBack,
  onConcluir,
}: {
  consentimento: DadosConsentimento;
  onChange: (c: DadosConsentimento) => void;
  erro: string | null;
  loading: boolean;
  onBack: () => void;
  onConcluir: () => void;
}) {
  const podeAvancar = consentimento.termos && consentimento.privacidade;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="flex flex-col flex-1 gap-6"
    >
      <div>
        <h2 className="text-lg font-bold text-navy">Termos e Privacidade</h2>
        <p className="text-gray-500 text-sm mt-1">
          Para usar o iPet você precisa concordar com os documentos abaixo.
        </p>
      </div>

      {erro && (
        <div className="flex items-start gap-2.5 bg-red-100 border border-red-700/50 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-500 text-sm">{erro}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Termos de Uso — OBRIGATÓRIO */}
        <ConsentCheckbox
          checked={consentimento.termos}
          onChange={(v) => onChange({ ...consentimento, termos: v })}
          obrigatorio
          label={
            <>
              Li e aceito os{" "}
              <Link href="/lgpd/termos" target="_blank" className="text-teal underline">
                Termos de Uso
              </Link>
            </>
          }
          descricao="Regras de uso da plataforma iPet."
          icon={<FileText className="w-4 h-4" />}
        />

        {/* Política de Privacidade — OBRIGATÓRIO */}
        <ConsentCheckbox
          checked={consentimento.privacidade}
          onChange={(v) => onChange({ ...consentimento, privacidade: v })}
          obrigatorio
          label={
            <>
              Li e aceito a{" "}
              <Link href="/lgpd/privacidade" target="_blank" className="text-teal underline">
                Política de Privacidade
              </Link>
            </>
          }
          descricao="Como tratamos seus dados conforme a LGPD (Lei nº 13.709/2018)."
          icon={<Shield className="w-4 h-4" />}
        />

        {/* Marketing — OPCIONAL */}
        <ConsentCheckbox
          checked={consentimento.marketing}
          onChange={(v) => onChange({ ...consentimento, marketing: v })}
          obrigatorio={false}
          label="Quero receber novidades, dicas e promoções por e-mail"
          descricao="Opcional. Você pode revogar a qualquer momento no seu perfil."
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
      </div>

      <p className="text-gray-400 text-[11px] leading-relaxed">
        Ao concluir, registramos sua decisão com data, hora e identificador de sessão para fins de
        comprovação conforme{" "}
        <span className="text-gray-500">LGPD Art. 8º §5º</span>. Você pode consultar e revogar
        seus consentimentos a qualquer momento no seu perfil.
      </p>

      <div className="mt-auto flex flex-col gap-3">
        <button
          onClick={onConcluir}
          disabled={!podeAvancar || loading}
          className="flex items-center justify-center gap-2 w-full bg-teal hover:bg-teal-dark disabled:bg-gray-300 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-2xl transition-colors"
        >
          {loading ? <Spinner /> : "Criar minha conta"}
        </button>
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full text-gray-500 hover:text-gray-600 py-2 text-sm disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </button>
      </div>
    </motion.div>
  );
}

// ─── Componentes auxiliares ────────────────────────────────────────────────

function ConsentCheckbox({
  checked,
  onChange,
  obrigatorio,
  label,
  descricao,
  icon,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  obrigatorio: boolean;
  label: React.ReactNode;
  descricao: string;
  icon: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="flex-shrink-0 mt-0.5">
        <div
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
            checked
              ? "bg-teal border-teal"
              : "border-gray-600 bg-gray-100 group-hover:border-teal"
          }`}
        >
          {checked && (
            <svg className="w-3 h-3 text-navy" fill="none" viewBox="0 0 12 12">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-600 text-sm">{label}</span>
          {obrigatorio && (
            <span className="text-red-500 text-xs font-medium">*</span>
          )}
          {!obrigatorio && (
            <span className="text-gray-400 text-xs">(opcional)</span>
          )}
        </div>
        <p className="text-gray-400 text-xs mt-0.5">{descricao}</p>
      </div>
    </label>
  );
}

function Spinner() {
  return (
    <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
  );
}
