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
  TIPO_DOCUMENTO_LABELS,
  TIPO_DOCUMENTO_ICONES,
} from "@/services/document-service";
import { formatBR } from "@/services/travel-roadmap";
import { differenceInYears, differenceInMonths } from "date-fns";
import { parseBR } from "@/services/travel-roadmap";

// --------------------------------------------------------
// Cores por status de autenticação
// --------------------------------------------------------
const AUTH_BADGE: Record<
  DocumentoSanitario["statusAutenticacao"],
  { label: string; classes: string; icon: React.ElementType }
> = {
  PENDENTE: {
    label: "Pendente",
    classes: "bg-amber-900/30 text-amber-400 border-amber-800/40",
    icon: AlertCircle,
  },
  VERIFICADO: {
    label: "Verificado",
    classes: "bg-emerald-900/30 text-emerald-400 border-emerald-800/40",
    icon: CheckCircle2,
  },
  BLOCKCHAIN: {
    label: "Blockchain",
    classes: "bg-sky-900/30 text-sky-400 border-sky-800/40",
    icon: Link2,
  },
  REJEITADO: {
    label: "Rejeitado",
    classes: "bg-red-900/30 text-red-400 border-red-800/40",
    icon: XCircle,
  },
};

// --------------------------------------------------------
// Página principal do Passaporte
// --------------------------------------------------------
export default function PassaportePage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = use(params);
  const router = useRouter();
  const pet = useAppStore((s) => s.getPet(petId));
  const documentos = useAppStore((s) => s.getDocumentosPorPet(petId));
  const adicionarDocumento = useAppStore((s) => s.adicionarDocumento);
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
        <Link href="/" className="text-sky-400 mt-4 text-sm">
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
    setUploading(true);
    setUploadError(null);
    try {
      const hash = await calcularHashDocumento(file);
      const doc = criarDocumento({
        petId: pet!.id,
        tipo: uploadTipo,
        titulo: uploadTitulo,
        dataDocumento: uploadData,
        file,
        hash,
      });
      adicionarDocumento(doc);
      setShowUploadForm(false);
      setUploadTitulo("");
      setUploadData("");
    } catch {
      setUploadError("Erro ao processar o arquivo. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  // Checklist de documentos
  const temVacina = !!pet.vacina?.valida;
  const temSorologia = pet.sorologia?.status === "OK";
  const temMicrochip = !!(pet.microchip && pet.microchip.length === 15);
  const docVacina = documentos.find((d) => d.tipo === "VACINA_ANTIRRABICA");
  const docSorologia = documentos.find((d) => d.tipo === "SOROLOGIA_ANTIRRABICA");

  return (
    <div className="flex flex-col min-h-screen pb-8">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold flex-1">Passaporte Pet</h1>
        <ShieldCheck className="w-5 h-5 text-sky-400" />
      </header>

      <main className="px-5 space-y-5">
        {/* Card de identidade — estilo passaporte */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden bg-gradient-to-br from-sky-900/40 to-gray-900 border border-sky-800/30 rounded-3xl p-5"
        >
          {/* Marca d'água */}
          <div className="absolute right-4 top-4 opacity-5 text-[80px] select-none pointer-events-none">
            🐾
          </div>

          <div className="flex gap-4">
            {/* Foto */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-800 border-2 border-sky-700/40 flex-shrink-0">
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
              <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-sky-500 rounded-full flex items-center justify-center shadow">
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            {/* Dados */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white leading-tight mb-0.5">
                {pet.nome}
              </h2>
              <p className="text-sm text-sky-300">
                {pet.especie === "CAO" ? "🐕" : pet.especie === "GATO" ? "🐈" : "🐾"}{" "}
                {pet.raca}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {idadePet} · {pet.peso} kg
              </p>
              {pet.microchip && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Cpu className="w-3 h-3 text-sky-400" />
                  <span className="font-mono text-[10px] text-sky-400 tracking-wide">
                    {pet.microchip.match(/.{1,3}/g)?.join(" ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Linha de separação estilo passaporte */}
          <div className="mt-4 pt-4 border-t border-sky-800/20 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-500 uppercase tracking-wider text-[9px] mb-0.5">Nascimento</p>
              <p className="text-gray-200">{pet.dataNascimento}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase tracking-wider text-[9px] mb-0.5">Espécie</p>
              <p className="text-gray-200">
                {pet.especie === "CAO" ? "Cão" : pet.especie === "GATO" ? "Gato" : "Outro"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Checklist de Saúde */}
        <section>
          <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
            Saúde &amp; Documentos
          </h3>
          <div className="space-y-2">
            <HealthRow
              label="Microchip ISO"
              ok={temMicrochip}
              value={temMicrochip ? pet.microchip : undefined}
              missing={!temMicrochip ? "Não implantado" : undefined}
            />
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
          </div>
        </section>

        {/* Documentos enviados */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Documentos
            </h3>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="flex items-center gap-1 text-xs text-sky-400"
            >
              <PlusCircle className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          {/* Formulário de upload */}
          {showUploadForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-3 space-y-3"
            >
              <p className="text-sm font-medium text-gray-200">Enviar documento</p>

              {/* Tipo */}
              <select
                value={uploadTipo}
                onChange={(e) => setUploadTipo(e.target.value as TipoDocumento)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              <input
                type="text"
                placeholder="Data do documento (DD/MM/AAAA)"
                value={uploadData}
                onChange={(e) => setUploadData(e.target.value)}
                inputMode="numeric"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              {uploadError && (
                <p className="text-xs text-red-400">{uploadError}</p>
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

              {/* Nota blockchain-ready */}
              <div className="bg-sky-900/20 border border-sky-800/30 rounded-xl p-3 text-xs text-sky-300 flex items-start gap-2">
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
                className="flex items-center justify-center gap-2 w-full bg-sky-500 hover:bg-sky-400 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Processando..." : "Selecionar arquivo (PDF ou imagem)"}
              </button>
            </motion.div>
          )}

          {documentos.length === 0 && !showUploadForm && (
            <div className="bg-gray-900/50 border border-dashed border-gray-700 rounded-2xl p-6 text-center">
              <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Nenhum documento enviado ainda
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Envie a carteira de vacinação, resultados de exames e o CVI
              </p>
            </div>
          )}

          {documentos.length > 0 && (
            <div className="space-y-2">
              {documentos.map((doc) => (
                <DocumentoRow key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </section>

        {/* CTA Planejar Viagem */}
        <Link
          href={`/viagem/${pet.id}`}
          className="flex items-center gap-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 rounded-2xl p-4 transition-all"
        >
          <Plane className="w-6 h-6 text-white" />
          <div className="flex-1">
            <p className="font-semibold text-white text-sm">Planejar viagem</p>
            <p className="text-xs text-sky-200">
              Veja o que {pet.nome.split(" ")[0]} precisa para embarcar
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-sky-200" />
        </Link>
      </main>
    </div>
  );
}

// --------------------------------------------------------
// Componentes auxiliares
// --------------------------------------------------------
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
    <div className="flex items-center gap-3 bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-3">
      {ok ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 font-medium">{label}</p>
        {value && <p className="text-xs text-gray-400 truncate">{value}</p>}
        {missing && <p className="text-xs text-red-400">{missing}</p>}
      </div>
      {badge && BadgeIcon && (
        <span
          className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.classes}`}
        >
          <BadgeIcon className="w-3 h-3" />
          {badge.label}
        </span>
      )}
    </div>
  );
}

function DocumentoRow({ doc }: { doc: DocumentoSanitario }) {
  const badge = AUTH_BADGE[doc.statusAutenticacao];
  const BadgeIcon = badge.icon;

  return (
    <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
      <span className="text-2xl">{TIPO_DOCUMENTO_ICONES[doc.tipo]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 font-medium truncate">{doc.titulo}</p>
        <p className="text-xs text-gray-500">{doc.dataDocumento}</p>
        {doc.hashDocumento && (
          <p className="text-[10px] text-gray-600 font-mono truncate mt-0.5">
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
    </div>
  );
}
