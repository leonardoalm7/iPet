"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@ipet/core";
import type { Especie, TipoPet } from "@ipet/core";
import { ArrowLeft, ArrowRight, Check, Lock, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DateInput } from "@/components/shared/DateInput";
import { RacaCombobox } from "@/components/shared/RacaCombobox";
import { UploadCarteiraVacina } from "@/components/shared/UploadCarteiraVacina";
import { UploadCertificadoMicrochip } from "@/components/shared/UploadCertificadoMicrochip";

interface FormData {
  nome: string; especie: Especie; raca: string;
  dataNascimento: string; peso: string; microchip: string; tipoPet: TipoPet;
  temVacina: boolean; vacinaData: string; vacinaNome: string;
  temSorologia: boolean; sorologiaData: string; sorologiaValor: string;
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
    nome: "", especie: "CAO", raca: "", dataNascimento: "", peso: "",
    microchip: "", tipoPet: "ESTIMACAO", temVacina: false, vacinaData: "",
    vacinaNome: "", temSorologia: false, sorologiaData: "", sorologiaValor: "",
  });

  function update(field: keyof FormData, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  function avancar() { setDirection(1); setStep((s) => Math.min(s + 1, STEPS.length)); }
  function voltar() { if (step === 1) { router.back(); return; } setDirection(-1); setStep((s) => s - 1); }
  function salvar() {
    const novoPet = adicionarPet({
      nome: form.nome.trim(), especie: form.especie, raca: form.raca.trim(),
      dataNascimento: form.dataNascimento, peso: parseFloat(form.peso.replace(",", ".")) || 0,
      tipoPet: form.tipoPet, microchip: form.microchip.trim() || undefined,
      vacina: form.temVacina ? { data: form.vacinaData, valida: true, nomeComercial: form.vacinaNome } : undefined,
      sorologia: form.temSorologia && form.sorologiaData
        ? { data: form.sorologiaData, valor: form.sorologiaValor || "≥0,5 UI/mL", status: "OK" } : undefined,
    });
    router.replace(`/passaporte/${novoPet.id}`);
  }

  const stepValid: Record<number, boolean> = {
    1: !!(form.nome.trim() && form.raca.trim() && form.dataNascimento && form.peso),
    2: true, 3: true,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={voltar} className="p-2 rounded-lg hover:bg-surface text-navy/60 hover:text-navy transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-navy">Novo Pet</h2>
          <p className="text-sm text-navy/50">Passo {step} de {STEPS.length}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                s.id < step ? "bg-teal text-white" : s.id === step ? "bg-navy text-white" : "bg-surface text-navy/30"
              }`}>
                {s.id < step ? <Check size={13} /> : s.id}
              </div>
              <span className={`text-xs font-medium ${s.id === step ? "text-navy" : "text-navy/40"}`}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${s.id < step ? "bg-teal" : "bg-border"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl border border-border p-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={step} custom={direction}
            initial={{ x: direction * 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -40, opacity: 0 }}
            transition={{ duration: 0.2 }}>
            {step === 1 && <StepIdentificacao form={form} update={update} />}
            {step === 2 && <StepVacina form={form} update={update} setForm={setForm} />}
            {step === 3 && <StepSorologia form={form} update={update} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button onClick={voltar}
          className="px-5 py-2.5 rounded-lg border border-border text-navy/70 hover:bg-surface text-sm font-medium transition-colors">
          Voltar
        </button>
        {step < STEPS.length ? (
          <button onClick={avancar} disabled={!stepValid[step]}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy-light disabled:opacity-40 transition-colors">
            Continuar <ArrowRight size={16} />
          </button>
        ) : (
          <button onClick={salvar}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal text-white text-sm font-semibold hover:bg-teal-dark transition-colors">
            <Check size={16} /> Salvar pet
          </button>
        )}
      </div>
    </div>
  );
}

function StepIdentificacao({ form, update }: { form: FormData; update: (k: keyof FormData, v: string | boolean) => void }) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-navy">Identificação</h3>
      <div>
        <label className="text-sm font-medium text-navy/60 block mb-2">Espécie *</label>
        <div className="grid grid-cols-3 gap-2">
          {ESPECIES.map((e) => (
            <button key={e.value} onClick={() => update("especie", e.value)}
              className={`py-3 rounded-xl border text-center transition-all ${
                form.especie === e.value ? "border-navy bg-navy/5 text-navy shadow-sm" : "border-border bg-white text-navy/50 hover:border-navy/40"
              }`}>
              <div className="text-2xl mb-1">{e.emoji}</div>
              <div className="text-xs font-medium">{e.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nome *" value={form.nome} onChange={(v) => update("nome", v)} placeholder="Ex: José Manuel" />
        <RacaCombobox valor={form.raca} onChange={(v) => update("raca", v)} especie={form.especie} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <DateInput label="Data de nascimento *" value={form.dataNascimento} onChange={(v) => update("dataNascimento", v)} />
        <Field label="Peso (kg) *" value={form.peso} onChange={(v) => update("peso", v)} placeholder="3.5" type="number" />
      </div>
      <div className="space-y-2">
        <Field label="Microchip ISO (15 dígitos)" value={form.microchip} onChange={(v) => update("microchip", v)} placeholder="963003100418164" />
        <UploadCertificadoMicrochip onAplicar={(n) => update("microchip", n)} />
      </div>
      {form.especie === "CAO" && (
        <Toggle label="É cão-guia / animal de serviço?" value={form.tipoPet === "CAO_GUIA"} onChange={(v) => update("tipoPet", v ? "CAO_GUIA" : "ESTIMACAO")} />
      )}
    </div>
  );
}

function StepVacina({ form, update, setForm }: {
  form: FormData; update: (k: keyof FormData, v: string | boolean) => void;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-navy">Vacina Antirrábica</h3>
      <Toggle label="Seu pet já está vacinado?" value={form.temVacina} onChange={(v) => update("temVacina", v)} />
      {form.temVacina && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <UploadCarteiraVacina onAplicar={({ dataAplicacao, nomeComercial }) =>
            setForm((f) => ({ ...f, temVacina: true, vacinaData: dataAplicacao || f.vacinaData, vacinaNome: nomeComercial || f.vacinaNome }))} />
          <div className="grid grid-cols-2 gap-4">
            <DateInput label="Data da vacinação *" value={form.vacinaData} onChange={(v) => update("vacinaData", v)} />
            <Field label="Nome comercial (opcional)" value={form.vacinaNome} onChange={(v) => update("vacinaNome", v)} placeholder="Ex: Rabisin" />
          </div>
          <InfoBox>Carência mínima: <strong>21 dias</strong> antes do embarque.</InfoBox>
        </motion.div>
      )}
      {!form.temVacina && <InfoBox warning>Sem vacina, o pet não poderá embarcar. Procure uma clínica veterinária.</InfoBox>}
    </div>
  );
}

function StepSorologia({ form, update }: { form: FormData; update: (k: keyof FormData, v: string | boolean) => void }) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-navy">Sorologia Antirrábica</h3>
      <InfoBox>Obrigatória para <strong>Europa</strong> (carência 90 dias) e <strong>Japão</strong> (carência 180 dias). Deve ser realizada após a vacinação.</InfoBox>
      {!form.temVacina ? (
        <div className="flex items-start gap-3 bg-surface border border-border rounded-xl px-4 py-4">
          <Lock size={18} className="text-navy/30 mt-0.5 shrink-0" />
          <p className="text-sm text-navy/50">Registre a vacina primeiro para liberar esta etapa.</p>
        </div>
      ) : (
        <>
          <Toggle label="Seu pet já tem sorologia?" value={form.temSorologia} onChange={(v) => update("temSorologia", v)} />
          {form.temSorologia && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4">
              <DateInput label="Data da coleta *" value={form.sorologiaData} onChange={(v) => update("sorologiaData", v)} />
              <Field label="Resultado (opcional)" value={form.sorologiaValor} onChange={(v) => update("sorologiaValor", v)} placeholder="1.0 UI/mL" />
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-navy/60 block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy" />
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between bg-surface rounded-xl px-4 py-3.5 border border-border">
      <span className="text-sm text-navy">{label}</span>
      <button onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${value ? "bg-teal" : "bg-navy/20"}`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

function InfoBox({ children, warning }: { children: React.ReactNode; warning?: boolean }) {
  return (
    <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
      warning ? "bg-orange-light border border-ipet-orange/20 text-ipet-orange" : "bg-teal-light border border-teal/20 text-teal-darker"
    }`}>{children}</div>
  );
}
