"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@ipet/core";
import type { Especie, TipoPet } from "@ipet/core";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Dog,
  Cat,
  PawPrint,
  Info,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DateInput } from "@/components/shared/DateInput";
import { RacaCombobox } from "@/components/shared/RacaCombobox";
import { UploadCarteiraVacina } from "@/components/shared/UploadCarteiraVacina";
import { UploadCertificadoMicrochip } from "@/components/shared/UploadCertificadoMicrochip";

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

const ESPECIES: { value: Especie; label: string; Icon: typeof Dog }[] = [
  { value: "CAO", label: "Cão", Icon: Dog },
  { value: "GATO", label: "Gato", Icon: Cat },
  { value: "OUTRO", label: "Outro", Icon: PawPrint },
];

export default function EditarPetPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = use(params);
  const router = useRouter();
  const pets = useAppStore((s) => s.pets);
  const atualizarPet = useAppStore((s) => s.atualizarPet);
  const pet = pets.find((p) => p.id === petId);

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

  useEffect(() => {
    if (!pet) {
      router.replace("/");
      return;
    }
    setForm({
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca,
      dataNascimento: pet.dataNascimento,
      peso: String(pet.peso).replace(".", ","),
      microchip: pet.microchip ?? "",
      tipoPet: pet.tipoPet,
      temVacina: !!pet.vacina,
      vacinaData: pet.vacina?.data ?? "",
      vacinaNome: pet.vacina?.nomeComercial ?? "",
      temSorologia: !!pet.sorologia,
      sorologiaData: pet.sorologia?.data ?? "",
      sorologiaValor: pet.sorologia?.valor ?? "",
    });
  }, [pet, router]);

  if (!pet) return null;

  function update(field: keyof FormData, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  function avancar() {
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length));
  }
  function voltar() {
    if (step === 1) {
      router.back();
      return;
    }
    setDirection(-1);
    setStep((s) => s - 1);
  }

  function salvar() {
    atualizarPet(petId, {
      nome: form.nome.trim(),
      especie: form.especie,
      raca: form.raca.trim(),
      dataNascimento: form.dataNascimento,
      peso: parseFloat(form.peso.replace(",", ".")) || 0,
      tipoPet: form.tipoPet,
      microchip: form.microchip.trim() || undefined,
      vacina:
        form.temVacina && form.vacinaData
          ? {
              data: form.vacinaData,
              valida: true,
              nomeComercial: form.vacinaNome,
            }
          : undefined,
      sorologia:
        form.temSorologia && form.sorologiaData
          ? {
              data: form.sorologiaData,
              valor: form.sorologiaValor || "≥0,5 UI/mL",
              status: "OK",
            }
          : undefined,
    });
    router.back();
  }

  const stepValid: Record<number, boolean> = {
    1: !!(
      form.nome.trim() &&
      form.raca.trim() &&
      form.dataNascimento &&
      form.peso
    ),
    2: true,
    3: true,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-2xl mx-auto space-y-8 pb-8"
    >
      <div>
        <button
          onClick={voltar}
          className="inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-ink transition-colors mb-5"
        >
          <ArrowLeft size={13} strokeWidth={1.5} /> Voltar
        </button>
        <p className="kicker text-terracotta">
          Etapa {String(step).padStart(2, "0")} — {STEPS[step - 1].label}
        </p>
        <h1 className="font-display text-[clamp(2rem,3.5vw,2.75rem)] leading-none font-light tracking-tight text-ink mt-3">
          Editar {pet.nome}
        </h1>
        <p className="text-[13px] text-muted mt-2.5">
          Atualize a ficha do seu pet. As informações são usadas no roadmap e
          nas verificações.
        </p>
      </div>

      <div className="editorial-rule" />

      <div className="flex items-center gap-3">
        {STEPS.map((s, i) => {
          const ativo = s.id === step;
          const concluido = s.id < step;
          return (
            <div key={s.id} className="flex items-center gap-3 flex-1 last:flex-none">
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono shrink-0 transition-colors ${
                    concluido
                      ? "bg-sage text-bone"
                      : ativo
                      ? "bg-ink text-bone"
                      : "bg-bone-deep text-faint"
                  }`}
                >
                  {concluido ? (
                    <Check size={12} strokeWidth={2} />
                  ) : (
                    String(s.id).padStart(2, "0")
                  )}
                </div>
                <span
                  className={`text-[11px] uppercase tracking-widest font-mono ${
                    ativo ? "text-ink" : "text-muted"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px transition-colors ${
                    concluido ? "bg-sage" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-paper rounded-2xl border border-border p-6 sm:p-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ x: direction * 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -32, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 1 && <StepIdentificacao form={form} update={update} />}
            {step === 2 && (
              <StepVacina form={form} update={update} setForm={setForm} />
            )}
            {step === 3 && <StepSorologia form={form} update={update} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={voltar}
          className="px-6 py-3 rounded-full border border-border text-[13px] font-medium text-ink hover:bg-bone-deep transition-colors"
        >
          {step === 1 ? "Cancelar" : "Voltar"}
        </button>
        {step < STEPS.length ? (
          <button
            onClick={avancar}
            disabled={!stepValid[step]}
            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-ink text-bone text-[13px] font-semibold hover:bg-sage disabled:opacity-40 transition-colors"
          >
            Continuar
            <ArrowRight
              size={14}
              strokeWidth={1.75}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        ) : (
          <button
            onClick={salvar}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-ink text-bone text-[13px] font-semibold hover:bg-sage transition-colors"
          >
            <Check size={14} strokeWidth={1.75} /> Salvar alterações
          </button>
        )}
      </div>
    </motion.div>
  );
}

function StepIdentificacao({
  form,
  update,
}: {
  form: FormData;
  update: (k: keyof FormData, v: string | boolean) => void;
}) {
  return (
    <div className="space-y-7">
      <div>
        <p className="kicker text-muted mb-3">Espécie</p>
        <div className="grid grid-cols-3 gap-2">
          {ESPECIES.map((e) => {
            const Icon = e.Icon;
            const ativo = form.especie === e.value;
            return (
              <button
                key={e.value}
                onClick={() => update("especie", e.value)}
                className={`py-4 rounded-2xl border text-center transition-all ${
                  ativo
                    ? "border-ink bg-ink text-bone"
                    : "border-border bg-bone-deep text-ink/65 hover:border-ink"
                }`}
              >
                <Icon size={22} strokeWidth={1.5} className="mx-auto" />
                <div className="text-[12px] font-medium mt-1.5">{e.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label="Nome"
          value={form.nome}
          onChange={(v) => update("nome", v)}
          placeholder="Ex: José Manuel"
          required
        />
        <RacaCombobox
          valor={form.raca}
          onChange={(v) => update("raca", v)}
          especie={form.especie}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <DateInput
          label="Data de nascimento *"
          value={form.dataNascimento}
          onChange={(v) => update("dataNascimento", v)}
        />
        <Field
          label="Peso (kg)"
          value={form.peso}
          onChange={(v) => update("peso", v)}
          placeholder="3.5"
          type="number"
          required
        />
      </div>
      <div className="space-y-3">
        <Field
          label="Microchip ISO (15 dígitos)"
          value={form.microchip}
          onChange={(v) => update("microchip", v)}
          placeholder="963003100418164"
          mono
        />
        <UploadCertificadoMicrochip
          onAplicar={(n) => update("microchip", n)}
        />
      </div>
      {form.especie === "CAO" && (
        <Toggle
          label="É cão-guia / animal de serviço?"
          value={form.tipoPet === "CAO_GUIA"}
          onChange={(v) => update("tipoPet", v ? "CAO_GUIA" : "ESTIMACAO")}
        />
      )}
    </div>
  );
}

function StepVacina({
  form,
  update,
  setForm,
}: {
  form: FormData;
  update: (k: keyof FormData, v: string | boolean) => void;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  return (
    <div className="space-y-6">
      <p className="text-[13px] text-muted leading-relaxed">
        A vacina antirrábica é obrigatória para qualquer viagem. Carência
        mínima de <span className="text-ink font-medium">21 dias</span> antes
        do embarque.
      </p>
      <Toggle
        label="Seu pet já está vacinado?"
        value={form.temVacina}
        onChange={(v) => update("temVacina", v)}
      />
      <AnimatePresence>
        {form.temVacina ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <UploadCarteiraVacina
              onAplicar={({ dataAplicacao, nomeComercial }) =>
                setForm((f) => ({
                  ...f,
                  temVacina: true,
                  vacinaData: dataAplicacao || f.vacinaData,
                  vacinaNome: nomeComercial || f.vacinaNome,
                }))
              }
            />
            <div className="grid grid-cols-2 gap-5">
              <DateInput
                label="Data da vacinação *"
                value={form.vacinaData}
                onChange={(v) => update("vacinaData", v)}
              />
              <Field
                label="Nome comercial (opcional)"
                value={form.vacinaNome}
                onChange={(v) => update("vacinaNome", v)}
                placeholder="Ex: Rabisin"
              />
            </div>
          </motion.div>
        ) : (
          <InfoBox warning>
            Sem vacina, o pet não poderá embarcar. Procure uma clínica
            veterinária credenciada.
          </InfoBox>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepSorologia({
  form,
  update,
}: {
  form: FormData;
  update: (k: keyof FormData, v: string | boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <InfoBox>
        Obrigatória para <strong className="text-ink">Europa</strong> (carência
        90 dias) e <strong className="text-ink">Japão</strong> (carência 180
        dias). Deve ser realizada após a vacinação.
      </InfoBox>
      {!form.temVacina ? (
        <div className="flex items-start gap-3 bg-bone-deep border border-border rounded-2xl px-5 py-4">
          <Lock
            size={15}
            strokeWidth={1.5}
            className="text-faint mt-0.5 shrink-0"
          />
          <p className="text-[13px] text-muted">
            Registre a vacina primeiro para liberar esta etapa.
          </p>
        </div>
      ) : (
        <>
          <Toggle
            label="Seu pet já tem sorologia?"
            value={form.temSorologia}
            onChange={(v) => update("temSorologia", v)}
          />
          <AnimatePresence>
            {form.temSorologia && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-5 overflow-hidden"
              >
                <DateInput
                  label="Data da coleta *"
                  value={form.sorologiaData}
                  onChange={(v) => update("sorologiaData", v)}
                />
                <Field
                  label="Resultado (opcional)"
                  value={form.sorologiaValor}
                  onChange={(v) => update("sorologiaValor", v)}
                  placeholder="1.0 UI/mL"
                />
              </motion.div>
            )}
          </AnimatePresence>
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
  required,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="kicker text-muted block mb-2">
        {label}
        {required && " *"}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-transparent border-0 border-b border-border focus:border-ink py-2.5 text-[15px] text-ink placeholder:text-faint focus:outline-none transition-colors ${
          mono ? "font-mono text-[14px]" : ""
        }`}
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
    <div className="flex items-center justify-between bg-bone-deep rounded-2xl px-5 py-4 border border-border">
      <span className="text-[13px] text-ink">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
          value ? "bg-sage" : "bg-ink/15"
        }`}
        aria-pressed={value}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-bone rounded-full shadow transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function InfoBox({
  children,
  warning,
}: {
  children: React.ReactNode;
  warning?: boolean;
}) {
  const Icon = warning ? AlertTriangle : Info;
  return (
    <div
      className={`rounded-2xl px-4 py-3.5 text-[12px] leading-relaxed flex items-start gap-2.5 ${
        warning
          ? "bg-terracotta-soft/40 border border-terracotta-soft text-terracotta-deep"
          : "bg-sage-soft border border-sage/20 text-sage-deep"
      }`}
    >
      <Icon size={13} strokeWidth={1.5} className="mt-0.5 shrink-0" />
      <div className="text-ink/75">{children}</div>
    </div>
  );
}
