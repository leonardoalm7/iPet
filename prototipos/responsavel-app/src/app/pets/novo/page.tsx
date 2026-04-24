"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { Especie, TipoPet } from "@/domain/types";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DateInput } from "@/components/DateInput";
import { track } from "@/services/analytics";

interface FormData {
  nome: string;
  especie: Especie;
  raca: string;
  dataNascimento: string;
  peso: string;
  microchip: string;
  tipoPet: TipoPet;
  temVacina: boolean;
  vacinaData: string;
  vacinaNome: string;
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
    tipoPet: "ESTIMACAO",
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
    const pesoNormalizado = form.peso.replace(",", ".");
    const novoPet = adicionarPet({
      nome: form.nome.trim(),
      especie: form.especie,
      raca: form.raca.trim(),
      dataNascimento: form.dataNascimento,
      peso: parseFloat(pesoNormalizado) || 0,
      tipoPet: form.tipoPet,
      microchip: form.microchip.trim() || undefined,
      vacina: form.temVacina
        ? { data: form.vacinaData, valida: true, nomeComercial: form.vacinaNome }
        : undefined,
      sorologia:
        form.temSorologia && form.sorologiaData
          ? { data: form.sorologiaData, valor: form.sorologiaValor || "≥0,5 UI/mL", status: "OK" }
          : undefined,
    });
    track("pet_cadastrado", { especie: novoPet.especie, temMicrochip: !!novoPet.microchip });
    router.replace(`/passaporte/${novoPet.id}`);
  }

  const stepValid: Record<number, boolean> = {
    1: !!(form.nome.trim() && form.raca.trim() && form.dataNascimento && form.peso),
    2: true,
    3: true,
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="flex items-center gap-3 px-5 pt-14 pb-4">
        <button onClick={voltar} className="w-10 h-10 rounded-full bg-surface flex items-center justify-center flex-shrink-0 border border-border">
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-navy">Cadastro de Pet</h1>
          <p className="text-xs text-gray-400">Identificação {step}/{STEPS.length}</p>
        </div>
      </header>

      <div className="px-5 mb-6">
        <div className="flex gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                s.id <= step ? "bg-navy" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {STEPS.map((s) => (
            <span key={s.id} className={`text-[10px] font-medium ${s.id === step ? "text-navy" : "text-gray-400"}`}>
              {s.label}
            </span>
          ))}
        </div>
      </div>

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

      <div className="px-5 pt-4 pb-10">
        {step < STEPS.length ? (
          <button
            onClick={avancar}
            disabled={!stepValid[step]}
            className="flex items-center justify-center gap-2 w-full bg-navy hover:bg-navy-light disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-4 rounded-2xl transition-colors"
          >
            Continuar
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={salvar}
            className="flex items-center justify-center gap-2 w-full bg-navy hover:bg-navy-light text-white font-semibold py-4 rounded-2xl transition-colors"
          >
            <Check className="w-5 h-5" />
            Salvar e ver passaporte
          </button>
        )}
      </div>
    </div>
  );
}

function StepIdentificacao({ form, update }: { form: FormData; update: (k: keyof FormData, v: string | boolean) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-navy mb-1">Identificação</h2>
        <p className="text-sm text-gray-400">Dados básicos do seu pet</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">Espécie *</label>
        <div className="grid grid-cols-3 gap-2">
          {ESPECIES.map((e) => (
            <button
              key={e.value}
              onClick={() => update("especie", e.value)}
              className={`py-3 rounded-xl border text-center transition-all ${
                form.especie === e.value
                  ? "border-navy bg-navy/5 text-navy shadow-sm"
                  : "border-border bg-white text-gray-500 hover:border-gray-300"
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
        <DateInput label="Data de nascimento *" value={form.dataNascimento} onChange={(v) => update("dataNascimento", v)} />
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1.5">Peso (kg) *</label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.1"
            value={form.peso}
            onChange={(e) => update("peso", e.target.value)}
            placeholder="3.5"
            className="w-full bg-surface border border-border text-navy rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
          />
        </div>
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
        <p className="text-xs text-gray-400 mt-1">
          Obrigatório para viagens internacionais. Deixe vazio se ainda não implantou.
        </p>
      </div>

      {form.especie === "CAO" && (
        <div>
          <Toggle
            label="É cão-guia / animal de serviço?"
            value={form.tipoPet === "CAO_GUIA"}
            onChange={(v) => update("tipoPet", v ? "CAO_GUIA" : "ESTIMACAO")}
          />
          {form.tipoPet === "CAO_GUIA" && (
            <p className="text-xs text-teal mt-1.5 ml-1">
              Cão-guia embarca obrigatoriamente em cabine, gratuito (Lei 11.126/2005)
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StepVacina({ form, update }: { form: FormData; update: (k: keyof FormData, v: string | boolean) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-navy mb-1">Vacina Antirrábica</h2>
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
          <DateInput label="Data da vacinação *" value={form.vacinaData} onChange={(v) => update("vacinaData", v)} />
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

function StepSorologia({ form, update }: { form: FormData; update: (k: keyof FormData, v: string | boolean) => void }) {
  const vacinaPreRequisito = !form.temVacina;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-navy mb-1">Sorologia Antirrábica</h2>
        <p className="text-sm text-gray-400">Obrigatória para Europa e Japão</p>
      </div>

      <InfoBox>
        A sorologia é o exame de titulação antirrábica. Deve ser feita em laboratório credenciado pelo MAPA, <strong>após a vacinação</strong>.
        <br />
        <strong>Europa:</strong> carência de 90 dias · <strong>Japão:</strong> carência de 180 dias
      </InfoBox>

      {vacinaPreRequisito ? (
        <div className="flex items-start gap-3 bg-surface border border-border rounded-xl px-4 py-4">
          <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-400">Sorologia bloqueada</p>
            <p className="text-xs text-gray-400 mt-0.5">
              A sorologia antirrábica só pode ser realizada após a vacinação. Volte ao passo anterior e registre a vacina primeiro.
            </p>
          </div>
        </div>
      ) : (
        <>
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
              <DateInput label="Data da coleta *" value={form.sorologiaData} onChange={(v) => update("sorologiaData", v)} />
              <Field label="Resultado (opcional)" value={form.sorologiaValor} onChange={(v) => update("sorologiaValor", v)} placeholder="Ex: 1.0 UI/mL" />
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

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
      <label className="block text-sm font-medium text-gray-500 mb-1.5">{label}</label>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface border border-border text-navy rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
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
    <div className="flex items-center justify-between bg-surface rounded-xl px-4 py-3.5 border border-border">
      <span className="text-sm text-navy">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 overflow-hidden ${value ? "bg-teal" : "bg-gray-300"}`}
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
    <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${warning ? "bg-orange-light border border-ipet-orange/20 text-ipet-orange" : "bg-teal-light border border-teal/20 text-teal"}`}>
      {children}
    </div>
  );
}
