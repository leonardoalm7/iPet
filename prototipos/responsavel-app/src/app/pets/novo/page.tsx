"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { Especie, Pet } from "@/domain/types";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --------------------------------------------------------
// Tipos do formulário
// --------------------------------------------------------
interface FormData {
  // Step 1: Identificação
  nome: string;
  especie: Especie;
  raca: string;
  dataNascimento: string;
  peso: string;
  microchip: string;
  // Step 2: Saúde — Vacina
  temVacina: boolean;
  vacinaData: string;
  vacinaNome: string;
  // Step 3: Saúde — Sorologia
  temSorologia: boolean;
  sorologiaData: string;
  sorologiaValor: string;
}

const STEPS = [
  { id: 1, label: "Identificação" },
  { id: 2, label: "Vacina" },
  { id: 3, label: "Sorologia" },
];

const ESPECIES: { value: Especie; label: string; emoji: string }[] = [
  { value: "CAO", label: "Cão", emoji: "🐕" },
  { value: "GATO", label: "Gato", emoji: "🐈" },
  { value: "OUTRO", label: "Outro", emoji: "🐾" },
];

// --------------------------------------------------------
// Componente principal
// --------------------------------------------------------
export default function NovoPetPage() {
  const router = useRouter();
  const adicionarPet = useAppStore((s) => s.adicionarPet);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [form, setForm] = useState<FormData>({
    nome: "",
    especie: "CAO",
    raca: "",
    dataNascimento: "",
    peso: "",
    microchip: "",
    temVacina: false,
    vacinaData: "",
    vacinaNome: "",
    temSorologia: false,
    sorologiaData: "",
    sorologiaValor: "",
  });

  function update(field: keyof FormData, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function avancar() {
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function voltar() {
    if (step === 1) { router.back(); return; }
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  function salvar() {
    const novoPet = adicionarPet({
      nome: form.nome.trim(),
      especie: form.especie,
      raca: form.raca.trim(),
      dataNascimento: form.dataNascimento,
      peso: parseFloat(form.peso) || 0,
      microchip: form.microchip.trim() || undefined,
      vacina: form.temVacina
        ? { data: form.vacinaData, valida: true, nomeComercial: form.vacinaNome }
        : undefined,
      sorologia:
        form.temSorologia && form.sorologiaData
          ? { data: form.sorologiaData, valor: form.sorologiaValor || "≥0,5 UI/mL", status: "OK" }
          : undefined,
    });
    router.replace(`/passaporte/${novoPet.id}`);
  }

  const stepValid: Record<number, boolean> = {
    1: !!(form.nome.trim() && form.raca.trim() && form.dataNascimento && form.peso),
    2: true, // vacina opcional
    3: true, // sorologia opcional
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-14 pb-4">
        <button onClick={voltar} className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Cadastrar Pet</h1>
          <p className="text-xs text-gray-400">Passo {step} de {STEPS.length}</p>
        </div>
      </header>

      {/* Progress bar */}
      <div className="px-5 mb-6">
        <div className="flex gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                s.id <= step ? "bg-sky-500" : "bg-gray-800"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {STEPS.map((s) => (
            <span key={s.id} className={`text-[10px] ${s.id === step ? "text-sky-400" : "text-gray-600"}`}>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ x: direction * 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -50, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && <StepIdentificacao form={form} update={update} />}
            {step === 2 && <StepVacina form={form} update={update} />}
            {step === 3 && <StepSorologia form={form} update={update} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <div className="px-5 pt-4 pb-10">
        {step < STEPS.length ? (
          <button
            onClick={avancar}
            disabled={!stepValid[step]}
            className="flex items-center justify-center gap-2 w-full bg-sky-500 hover:bg-sky-400 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-4 rounded-2xl transition-colors"
          >
            Continuar
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={salvar}
            className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-4 rounded-2xl transition-colors"
          >
            <Check className="w-5 h-5" />
            Salvar e ver passaporte
          </button>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------------
// Step 1 — Identificação
// --------------------------------------------------------
function StepIdentificacao({ form, update }: { form: FormData; update: (k: keyof FormData, v: string | boolean) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold mb-1">Identificação</h2>
        <p className="text-sm text-gray-400">Dados básicos do seu pet</p>
      </div>

      {/* Espécie */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Espécie *</label>
        <div className="grid grid-cols-3 gap-2">
          {ESPECIES.map((e) => (
            <button
              key={e.value}
              onClick={() => update("especie", e.value)}
              className={`py-3 rounded-xl border text-center transition-colors ${
                form.especie === e.value
                  ? "border-sky-500 bg-sky-500/10 text-sky-400"
                  : "border-gray-700 text-gray-400"
              }`}
            >
              <div className="text-2xl mb-1">{e.emoji}</div>
              <div className="text-xs font-medium">{e.label}</div>
            </button>
          ))}
        </div>
      </div>

      <Field label="Nome *" value={form.nome} onChange={(v) => update("nome", v)} placeholder="Ex: José Manuel" />
      <Field label="Raça *" value={form.raca} onChange={(v) => update("raca", v)} placeholder="Ex: Chihuahua" />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Data de nascimento *" value={form.dataNascimento} onChange={(v) => update("dataNascimento", v)} placeholder="DD/MM/AAAA" type="text" inputMode="numeric" />
        <Field label="Peso (kg) *" value={form.peso} onChange={(v) => update("peso", v)} placeholder="Ex: 3,5" type="text" inputMode="decimal" />
      </div>

      <div>
        <Field
          label="Microchip ISO (15 dígitos)"
          value={form.microchip}
          onChange={(v) => update("microchip", v)}
          placeholder="963003100418164"
          type="text"
          inputMode="numeric"
        />
        <p className="text-xs text-gray-500 mt-1">
          Obrigatório para viagens internacionais. Deixe vazio se ainda não implantou.
        </p>
      </div>
    </div>
  );
}

// --------------------------------------------------------
// Step 2 — Vacina
// --------------------------------------------------------
function StepVacina({ form, update }: { form: FormData; update: (k: keyof FormData, v: string | boolean) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold mb-1">Vacina Antirrábica</h2>
        <p className="text-sm text-gray-400">Obrigatória para todos os destinos</p>
      </div>

      <Toggle
        label="Seu pet já está vacinado?"
        value={form.temVacina}
        onChange={(v) => update("temVacina", v)}
      />

      {form.temVacina && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Field label="Data da vacinação *" value={form.vacinaData} onChange={(v) => update("vacinaData", v)} placeholder="DD/MM/AAAA" />
          <Field label="Nome comercial (opcional)" value={form.vacinaNome} onChange={(v) => update("vacinaNome", v)} placeholder="Ex: Rabisin, Defensor" />
          <InfoBox>
            A carência mínima da vacina é <strong>21 dias</strong> antes do embarque para qualquer destino.
          </InfoBox>
        </motion.div>
      )}

      {!form.temVacina && (
        <InfoBox warning>
          Sem vacina antirrábica, o pet não poderá embarcar em nenhum voo. Procure uma clínica veterinária o quanto antes.
        </InfoBox>
      )}
    </div>
  );
}

// --------------------------------------------------------
// Step 3 — Sorologia
// --------------------------------------------------------
function StepSorologia({ form, update }: { form: FormData; update: (k: keyof FormData, v: string | boolean) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold mb-1">Sorologia Antirrábica</h2>
        <p className="text-sm text-gray-400">Obrigatória para Europa e Japão</p>
      </div>

      <InfoBox>
        A sorologia é o exame de titulação antirrábica. Deve ser feita em laboratório credenciado pelo MAPA.
        <br />
        <strong>Europa:</strong> carência de 90 dias · <strong>Japão:</strong> carência de 180 dias
      </InfoBox>

      <Toggle
        label="Seu pet já tem sorologia?"
        value={form.temSorologia}
        onChange={(v) => update("temSorologia", v)}
      />

      {form.temSorologia && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Field label="Data da coleta *" value={form.sorologiaData} onChange={(v) => update("sorologiaData", v)} placeholder="DD/MM/AAAA" />
          <Field label="Resultado (opcional)" value={form.sorologiaValor} onChange={(v) => update("sorologiaValor", v)} placeholder="Ex: 1,0 UI/mL" />
        </motion.div>
      )}
    </div>
  );
}

// --------------------------------------------------------
// Componentes auxiliares
// --------------------------------------------------------
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1.5">{label}</label>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
      />
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between bg-gray-800/60 rounded-xl px-4 py-3.5 border border-gray-700">
      <span className="text-sm text-gray-200">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors relative ${value ? "bg-sky-500" : "bg-gray-600"}`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-7" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}

function InfoBox({ children, warning }: { children: React.ReactNode; warning?: boolean }) {
  return (
    <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${warning ? "bg-amber-900/20 border border-amber-800/40 text-amber-300" : "bg-sky-900/20 border border-sky-800/40 text-sky-300"}`}>
      {children}
    </div>
  );
}
