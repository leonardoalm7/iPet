import { Especie } from "@/domain/types";

export type TipoClinica =
  | "CLINICA_GERAL"
  | "HABILITADO_MAPA"
  | "LAB_SOROLOGIA"
  | "CLINICA_MICROCHIP";

export type ServicoClinica =
  | "VACINA_ANTIRRABICA"
  | "MICROCHIP"
  | "SOROLOGIA"
  | "CVI"
  | "ATESTADO_SAUDE"
  | "CONSULTA_GERAL";

export interface ClinicaCredenciada {
  id: string;
  nome: string;
  tipo: TipoClinica[];
  servicos: ServicoClinica[];
  endereco: string;
  cidade: string;
  estado: string;
  telefone: string;
  site?: string;
  lat: number;
  lng: number;
  especiesAceitas: Especie[];
  habilitadoMapa: boolean;
  parceira: boolean;
  verificada: boolean;
  observacoes?: string;
}

export const CLINICAS_CREDENCIADAS: ClinicaCredenciada[] = [
  // ── São Paulo ──────────────────────────────────────────
  {
    id: "lab-pasteur-sp",
    nome: "Instituto Pasteur de São Paulo",
    tipo: ["LAB_SOROLOGIA"],
    servicos: ["SOROLOGIA"],
    endereco: "Av. Paulista, 393 — Cerqueira César",
    cidade: "São Paulo",
    estado: "SP",
    telefone: "(11) 3145-3100",
    site: "https://www.saude.sp.gov.br/instituto-pasteur",
    lat: -23.5632,
    lng: -46.6542,
    especiesAceitas: ["CAO", "GATO"],
    habilitadoMapa: false,
    parceira: false,
    verificada: true,
    observacoes: "Lab de referência OIE/WOAH para titulação antirrábica. Único lab aprovado em SP.",
  },
  {
    id: "vet-sp-morumbi",
    nome: "Clínica Veterinária Morumbi",
    tipo: ["CLINICA_GERAL", "HABILITADO_MAPA", "CLINICA_MICROCHIP"],
    servicos: ["VACINA_ANTIRRABICA", "MICROCHIP", "CVI", "ATESTADO_SAUDE", "CONSULTA_GERAL"],
    endereco: "Av. Giovanni Gronchi, 5819 — Morumbi",
    cidade: "São Paulo",
    estado: "SP",
    telefone: "(11) 3742-5555",
    lat: -23.6148,
    lng: -46.7251,
    especiesAceitas: ["CAO", "GATO"],
    habilitadoMapa: true,
    parceira: false,
    verificada: true,
    observacoes: "Veterinário habilitado MAPA para emissão de CVI. Agendar com antecedência.",
  },
  {
    id: "vet-sp-pinheiros",
    nome: "Pet Care Pinheiros",
    tipo: ["CLINICA_GERAL", "CLINICA_MICROCHIP"],
    servicos: ["VACINA_ANTIRRABICA", "MICROCHIP", "ATESTADO_SAUDE", "CONSULTA_GERAL"],
    endereco: "R. dos Pinheiros, 870 — Pinheiros",
    cidade: "São Paulo",
    estado: "SP",
    telefone: "(11) 3064-1234",
    lat: -23.5678,
    lng: -46.6901,
    especiesAceitas: ["CAO", "GATO", "OUTRO"],
    habilitadoMapa: false,
    parceira: false,
    verificada: true,
  },
  {
    id: "vet-sp-tatuape",
    nome: "Hospital Veterinário Tatuapé",
    tipo: ["CLINICA_GERAL", "HABILITADO_MAPA", "CLINICA_MICROCHIP"],
    servicos: ["VACINA_ANTIRRABICA", "MICROCHIP", "CVI", "ATESTADO_SAUDE", "CONSULTA_GERAL"],
    endereco: "R. Serra de Bragança, 1055 — Tatuapé",
    cidade: "São Paulo",
    estado: "SP",
    telefone: "(11) 2092-3344",
    lat: -23.5411,
    lng: -46.5756,
    especiesAceitas: ["CAO", "GATO"],
    habilitadoMapa: true,
    parceira: false,
    verificada: true,
  },

  // ── Rio de Janeiro ─────────────────────────────────────
  {
    id: "vet-rj-botafogo",
    nome: "Clínica Veterinária Botafogo",
    tipo: ["CLINICA_GERAL", "HABILITADO_MAPA", "CLINICA_MICROCHIP"],
    servicos: ["VACINA_ANTIRRABICA", "MICROCHIP", "CVI", "ATESTADO_SAUDE", "CONSULTA_GERAL"],
    endereco: "R. Voluntários da Pátria, 446 — Botafogo",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    telefone: "(21) 2286-5566",
    lat: -22.9519,
    lng: -43.1857,
    especiesAceitas: ["CAO", "GATO"],
    habilitadoMapa: true,
    parceira: false,
    verificada: true,
  },
  {
    id: "vet-rj-barra",
    nome: "VetBarra — Hospital Veterinário",
    tipo: ["CLINICA_GERAL", "CLINICA_MICROCHIP"],
    servicos: ["VACINA_ANTIRRABICA", "MICROCHIP", "ATESTADO_SAUDE", "CONSULTA_GERAL"],
    endereco: "Av. das Américas, 4200 — Barra da Tijuca",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    telefone: "(21) 3325-7788",
    lat: -22.9998,
    lng: -43.3519,
    especiesAceitas: ["CAO", "GATO", "OUTRO"],
    habilitadoMapa: false,
    parceira: false,
    verificada: true,
  },

  // ── Minas Gerais ───────────────────────────────────────
  {
    id: "lab-lanagro-mg",
    nome: "LANAGRO/MG — Laboratório Nacional Agropecuário",
    tipo: ["LAB_SOROLOGIA"],
    servicos: ["SOROLOGIA"],
    endereco: "Av. Rômulo Joviano, s/n — Pedro Leopoldo",
    cidade: "Pedro Leopoldo",
    estado: "MG",
    telefone: "(31) 3660-9700",
    site: "https://www.gov.br/agricultura/pt-br/assuntos/laboratorios/lanagro-mg",
    lat: -19.6176,
    lng: -44.0443,
    especiesAceitas: ["CAO", "GATO"],
    habilitadoMapa: false,
    parceira: false,
    verificada: true,
    observacoes: "Lab de referência MAPA para titulação antirrábica. Segundo lab aprovado OIE no Brasil.",
  },
  {
    id: "vet-mg-savassi",
    nome: "Clínica Pet Savassi",
    tipo: ["CLINICA_GERAL", "HABILITADO_MAPA", "CLINICA_MICROCHIP"],
    servicos: ["VACINA_ANTIRRABICA", "MICROCHIP", "CVI", "ATESTADO_SAUDE", "CONSULTA_GERAL"],
    endereco: "R. Pernambuco, 1000 — Savassi",
    cidade: "Belo Horizonte",
    estado: "MG",
    telefone: "(31) 3261-4455",
    lat: -19.9332,
    lng: -43.9346,
    especiesAceitas: ["CAO", "GATO"],
    habilitadoMapa: true,
    parceira: false,
    verificada: true,
  },

  // ── Paraná ─────────────────────────────────────────────
  {
    id: "vet-pr-batel",
    nome: "Hospital Veterinário Batel",
    tipo: ["CLINICA_GERAL", "HABILITADO_MAPA", "CLINICA_MICROCHIP"],
    servicos: ["VACINA_ANTIRRABICA", "MICROCHIP", "CVI", "ATESTADO_SAUDE", "CONSULTA_GERAL"],
    endereco: "R. Bispo Dom José, 2495 — Batel",
    cidade: "Curitiba",
    estado: "PR",
    telefone: "(41) 3342-6677",
    lat: -25.4399,
    lng: -49.2880,
    especiesAceitas: ["CAO", "GATO"],
    habilitadoMapa: true,
    parceira: false,
    verificada: true,
  },
  {
    id: "vet-pr-centro",
    nome: "VetCenter Curitiba",
    tipo: ["CLINICA_GERAL", "CLINICA_MICROCHIP"],
    servicos: ["VACINA_ANTIRRABICA", "MICROCHIP", "ATESTADO_SAUDE", "CONSULTA_GERAL"],
    endereco: "R. XV de Novembro, 1200 — Centro",
    cidade: "Curitiba",
    estado: "PR",
    telefone: "(41) 3222-5599",
    lat: -25.4284,
    lng: -49.2733,
    especiesAceitas: ["CAO", "GATO", "OUTRO"],
    habilitadoMapa: false,
    parceira: false,
    verificada: true,
  },
];

export const TIPO_CLINICA_LABEL: Record<TipoClinica, string> = {
  CLINICA_GERAL: "Clínica Geral",
  HABILITADO_MAPA: "Habilitado MAPA",
  LAB_SOROLOGIA: "Lab Sorologia",
  CLINICA_MICROCHIP: "Microchip",
};

export const TIPO_CLINICA_COLOR: Record<TipoClinica, string> = {
  CLINICA_GERAL: "bg-teal text-white",
  HABILITADO_MAPA: "bg-emerald-600 text-white",
  LAB_SOROLOGIA: "bg-purple-600 text-white",
  CLINICA_MICROCHIP: "bg-blue-600 text-white",
};

export const SERVICO_LABEL: Record<ServicoClinica, string> = {
  VACINA_ANTIRRABICA: "Vacina Antirrábica",
  MICROCHIP: "Microchip ISO",
  SOROLOGIA: "Sorologia (Titulação)",
  CVI: "Emissão de CVI",
  ATESTADO_SAUDE: "Atestado de Saúde",
  CONSULTA_GERAL: "Consulta Geral",
};

export const SERVICO_EMOJI: Record<ServicoClinica, string> = {
  VACINA_ANTIRRABICA: "💉",
  MICROCHIP: "📡",
  SOROLOGIA: "🧪",
  CVI: "📋",
  ATESTADO_SAUDE: "🩺",
  CONSULTA_GERAL: "🐾",
};
