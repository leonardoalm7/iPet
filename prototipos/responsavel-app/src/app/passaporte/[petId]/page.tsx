"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { DocumentoSanitario, TipoDocumento } from "@/domain/types";
import {
  ArrowLeft,
  Plane,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  ShieldCheck,
  Link2,
  Camera,
  PlusCircle,
  ChevronRight,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import {
  calcularHashDocumento,
  criarDocumento,
  obterSignedUrlDocumento,
  TIPO_DOCUMENTO_LABELS,
  TIPO_DOCUMENTO_ICONES,
} from "@/services/document-service";
import { formatBR } from "@/services/travel-roadmap";
import { differenceInYears, differenceInMonths } from "date-fns";
import { parseBR } from "@/services/travel-roadmap";
import { PassaporteQRMini } from "@/components/PassaporteQR";
import { track } from "@/services/analytics";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";

const AUTH_BADGE: Record<
  DocumentoSanitario["statusAutenticacao"],
  { label: string; classes: string; icon: React.ElementType }
> = {
  PENDENTE: {
    label: "Pendente",
    classes: "bg-orange-light text-ipet-orange border-ipet-orange/20",
    icon: AlertCircle,
  },
  VERIFICADO: {
    label: "Verificado",
    classes: "bg-teal-light text-teal border-teal/20",
    icon: CheckCircle2,
  },
  BLOCKCHAIN: {
    label: "Blockchain",
    classes: "bg-navy/5 text-navy border-navy/20",
    icon: Link2,
  },
  REJEITADO: {
    label: "Rejeitado",
    classes: "bg-red-50 text-red-500 border-red-200",
    icon: XCircle,
  },
};

export default function PassaportePage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = use(params);
  const router = useRouter();
  const pet = useAppStore((s) => s.pets.find((p) => p.id === petId));
  const todosDocumentos = useAppStore((s) => s.documentos);
  const documentos = todosDocumentos.filter((d) => d.petId === petId);
  const adicionarDocumento = useAppStore((s) => s.adicionarDocumento);
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadTipo, setUploadTipo] = useState<TipoDocumento>("VACINA_ANTIRRABICA");
  const [uploadData, setUploadData] = useState("");
  const [uploadTitulo, setUploadTitulo] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!pet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5 text-center">
        <p className="text-gray-400">Pet não encontrado.</p>
        <Link href="/" className="text-teal mt-4 text-sm font-medium">
          Voltar ao início
        </Link>
      </div>
    );
  }

  const idadePet = (() => {
    const nascimento = parseBR(pet.dataNascimento);
    const anos = differenceInYears(new Date(), nascimento);
    if (anos > 0) return `${anos} ano${anos > 1 ? "s" : ""}`;
    const meses = differenceInMonths(new Date(), nascimento);
    return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  })();

  async function handleFileUpload(file: File) {
    if (!uploadData || !uploadTitulo) {
      setUploadError("Preencha o título e a data do documento.");
      return;
    }
    if (!userId) {
      setUploadError("Sessão expirada. Faça login novamente.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const supabase = createClient();
      const hash = await calcularHashDocumento(file);
      const doc = await criarDocumento({
        petId: pet!.id,
        ownerId: userId,
        tipo: uploadTipo,
        titulo: uploadTitulo,
        dataDocumento: uploadData,
        file,
        hash,
        supabase,
      });
      adicionarDocumento(doc);
      track("documento_uploaded", { tipo: uploadTipo });
      setShowUploadForm(false);
      setUploadTitulo("");
      setUploadData("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao processar o arquivo.";
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  }

  async function abrirDocumento(doc: DocumentoSanitario) {
    const supabase = createClient();
    const url = await obterSignedUrlDocumento(doc, supabase);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      setUploadError("Não foi possível abrir o documento. Tente reenviar.");
    }
  }

  const temVacina = !!pet.vacina?.valida;
  const temSorologia = pet.sorologia?.status === "OK";
  const temMicrochip = !!(pet.microchip && pet.microchip.length === 15);
  const docVacina = documentos.find((d) => d.tipo === "VACINA_ANTIRRABICA");
  const docSorologia = documentos.find((d) => d.tipo === "SOROLOGIA_ANTIRRABICA");

  return (
    <div className="flex flex-col min-h-screen pb-8 bg-white">
      <header className="flex items-center gap-3 px-5 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-surface flex items-center justify-center flex-shrink-0 border border-border"
        >
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <h1 className="text-lg font-semibold flex-1 text-navy">Passaporte Digital do Pet</h1>
      </header>

      <main className="px-5 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden bg-white border border-border rounded-2xl p-5 shadow-sm"
        >
          <div className="flex gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface border border-border flex-shrink-0">
                {pet.foto ? (
                  <img
                    src={pet.foto}
                    alt={pet.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {pet.especie === "CAO" ? "🐕" : pet.especie === "GATO" ? "🐈" : "🐾"}
                  </div>
                )}
              </div>
              <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-navy rounded-full flex items-center justify-center shadow">
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-navy leading-tight mb-0.5">
                {pet.nome}
              </h2>
              <p className="text-sm text-teal font-medium">
                iPet Pass
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {pet.raca} · {idadePet} · {pet.peso} kg
              </p>
              {pet.microchip && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Cpu className="w-3 h-3 text-navy/40" />
                  <span className="font-mono text-[10px] text-navy/60 tracking-wide">
                    {pet.microchip.match(/.{1,3}/g)?.join(" ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-end justify-between">
            <div className="grid grid-cols-2 gap-3 text-xs flex-1">
              <div>
                <p className="text-gray-400 uppercase tracking-wider text-[9px] font-medium mb-0.5">Nascimento</p>
                <p className="text-navy font-medium">{pet.dataNascimento}</p>
              </div>
              <div>
                <p className="text-gray-400 uppercase tracking-wider text-[9px] font-medium mb-0.5">Espécie</p>
                <p className="text-navy font-medium">
                  {pet.especie === "CAO" ? "Cão" : pet.especie === "GATO" ? "Gato" : "Outro"}
                </p>
              </div>
            </div>
            <PassaporteQRMini
              pet={pet}
              temVacina={temVacina}
              temSorologia={temSorologia}
              temMicrochip={temMicrochip}
            />
          </div>
        </motion.div>

        <section>
          <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            Perfil Completo
          </h3>
          <div className="bg-white border border-border rounded-2xl divide-y divide-border">
            <div className="px-4 py-3 flex justify-between">
              <span className="text-sm text-gray-400">Raça</span>
              <span className="text-sm text-navy font-medium">{pet.raca}</span>
            </div>
            <div className="px-4 py-3 flex justify-between">
              <span className="text-sm text-gray-400">Idade</span>
              <span className="text-sm text-navy font-medium">{idadePet}</span>
            </div>
            <div className="px-4 py-3 flex justify-between">
              <span className="text-sm text-gray-400">Peso</span>
              <span className="text-sm text-navy font-medium">{pet.peso} kg</span>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            Documentos Sanitários
          </h3>
          <div className="space-y-2">
            <HealthRow
              label="Vacina Antirrábica"
              ok={temVacina}
              value={temVacina ? pet.vacina?.data : undefined}
              doc={docVacina}
              missing={!temVacina ? "Não registrada" : undefined}
            />
            <HealthRow
              label="Sorologia Antirrábica"
              ok={temSorologia}
              value={temSorologia ? `${pet.sorologia?.data} · ${pet.sorologia?.valor}` : undefined}
              doc={docSorologia}
              missing={!temSorologia ? "Pendente" : undefined}
            />
            <HealthRow
              label="Microchip ISO"
              ok={temMicrochip}
              value={temMicrochip ? pet.microchip : undefined}
              missing={!temMicrochip ? "Não implantado" : undefined}
            />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Documentos
            </h3>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="flex items-center gap-1 text-xs text-teal font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          {showUploadForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-white border border-border rounded-2xl p-4 mb-3 space-y-3 shadow-sm"
            >
              <p className="text-sm font-medium text-navy">Enviar documento</p>

              <select
                value={uploadTipo}
                onChange={(e) => setUploadTipo(e.target.value as TipoDocumento)}
                className="w-full bg-surface border border-border text-navy rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              >
                {(Object.keys(TIPO_DOCUMENTO_LABELS) as TipoDocumento[]).map((t) => (
                  <option key={t} value={t}>
                    {TIPO_DOCUMENTO_ICONES[t]} {TIPO_DOCUMENTO_LABELS[t]}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Título do documento"
                value={uploadTitulo}
                onChange={(e) => setUploadTitulo(e.target.value)}
                className="w-full bg-surface border border-border text-navy rounded-xl px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />

              <input
                type="text"
                placeholder="Data do documento (DD/MM/AAAA)"
                value={uploadData}
                onChange={(e) => setUploadData(e.target.value)}
                inputMode="numeric"
                className="w-full bg-surface border border-border text-navy rounded-xl px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />

              {uploadError && (
                <p className="text-xs text-red-500">{uploadError}</p>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                }}
              />

              <div className="bg-navy/5 border border-navy/10 rounded-xl p-3 text-xs text-navy/60 flex items-start gap-2">
                <Link2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  Um hash SHA-256 será gerado para este documento. Em breve,
                  os documentos serão registrados na rede Polygon para
                  autenticidade imutável.
                </span>
              </div>

              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center justify-center gap-2 w-full bg-navy hover:bg-navy-light disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Processando..." : "Selecionar arquivo (PDF ou imagem)"}
              </button>
            </motion.div>
          )}

          {documentos.length === 0 && !showUploadForm && (
            <div className="bg-surface border border-dashed border-border rounded-2xl p-6 text-center">
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                Nenhum documento enviado ainda
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Envie a carteira de vacinação, resultados de exames e o CVI
              </p>
            </div>
          )}

          {documentos.length > 0 && (
            <div className="space-y-2">
              {documentos.map((doc) => (
                <DocumentoRow key={doc.id} doc={doc} onAbrir={abrirDocumento} />
              ))}
            </div>
          )}
        </section>

        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center justify-center gap-2 w-full bg-teal hover:bg-teal-dark text-white font-semibold py-3.5 rounded-2xl transition-colors text-sm"
        >
          <Upload className="w-4 h-4" />
          Adicionar Documento
        </button>

        <Link
          href={`/viagem/${pet.id}`}
          className="flex items-center gap-3 bg-navy hover:bg-navy-light rounded-2xl p-4 transition-all"
        >
          <Plane className="w-6 h-6 text-white" />
          <div className="flex-1">
            <p className="font-semibold text-white text-sm">Planejar viagem</p>
            <p className="text-xs text-white/60">
              Veja o que {pet.nome.split(" ")[0]} precisa para embarcar
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/60" />
        </Link>
      </main>
    </div>
  );
}

function HealthRow({
  label,
  ok,
  value,
  doc,
  missing,
}: {
  label: string;
  ok: boolean;
  value?: string;
  doc?: DocumentoSanitario;
  missing?: string;
}) {
  const badge = doc ? AUTH_BADGE[doc.statusAutenticacao] : null;
  const BadgeIcon = badge?.icon;

  return (
    <div className="flex items-center gap-3 bg-white border border-border rounded-xl px-4 py-3">
      {ok ? (
        <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-ipet-orange flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-navy font-medium">{label}</p>
        {value && <p className="text-xs text-gray-400 truncate">{value}</p>}
        {missing && <p className="text-xs text-ipet-orange">{missing}</p>}
      </div>
      {badge && BadgeIcon && (
        <span
          className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.classes}`}
        >
          <BadgeIcon className="w-3 h-3" />
          {badge.label}
        </span>
      )}
      {!badge && (
        <ChevronRight className="w-4 h-4 text-gray-300" />
      )}
    </div>
  );
}

function DocumentoRow({
  doc,
  onAbrir,
}: {
  doc: DocumentoSanitario;
  onAbrir: (doc: DocumentoSanitario) => void;
}) {
  const badge = AUTH_BADGE[doc.statusAutenticacao];
  const BadgeIcon = badge.icon;
  const podeAbrir = !!doc.storagePath;

  return (
    <button
      type="button"
      onClick={() => podeAbrir && onAbrir(doc)}
      disabled={!podeAbrir}
      className="flex items-center gap-3 bg-white border border-border rounded-xl px-4 py-3 w-full text-left hover:bg-surface disabled:cursor-not-allowed transition-colors"
    >
      <span className="text-2xl">{TIPO_DOCUMENTO_ICONES[doc.tipo]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-navy font-medium truncate">{doc.titulo}</p>
        <p className="text-xs text-gray-400">{doc.dataDocumento}</p>
        {doc.hashDocumento && (
          <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5">
            SHA: {doc.hashDocumento.slice(0, 16)}…
          </p>
        )}
      </div>
      <span
        className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${badge.classes}`}
      >
        <BadgeIcon className="w-3 h-3" />
        {badge.label}
      </span>
    </button>
  );
}
