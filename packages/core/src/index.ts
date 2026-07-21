// Domain
export * from "./domain/types";

// Data
export { COMPANHIAS_AEREAS, COMPANHIAS_MAPA } from "./data/airlines";
export { isBraquicefalico, RACAS_BRAQUICEFALICAS } from "./data/braquicefalicos";
export { CLINICAS_CREDENCIADAS } from "./data/clinicas-credenciadas";
export { CUSTOS_DETALHADOS, CATEGORIA_META } from "./data/cost-estimates";
export { slugToDestino, destinoToSlug, getAllSlugs } from "./data/destination-slugs";
export { REGRAS_DESTINO, DESTINOS_LISTA, getDestinosAgrupados } from "./data/destinations";
export { HOTEIS_PET, PETHOTELS, HOTEIS_PETFRIENDLY } from "./data/hotels";
export { isRacaPerigosa, RACAS_PERIGOSAS } from "./data/racas-perigosas";
export { RACAS_CATALOGADAS, buscarRacas } from "./data/racas";
export { SUGESTOES_DESTINO, SUGESTOES_DESTACADAS } from "./data/travel-suggestions";

// Services
export { calcularRoadmap, calcularRoadmapMultiLeg, parseBR, formatBR } from "./services/travel-roadmap";
export { calcularEstimativaCusto } from "./services/cost-estimator";
export { verificarCompanhia, verificarTodasCompanhias } from "./services/airline-checker";
export type { VeredictoCia, ResultadoVerificacao } from "./services/airline-checker";
export { calcularDataIdeal } from "./services/quarantine-calculator";
export { loadDestinationRules, generateFAQs } from "./services/kb-public-loader";

// Stores
export { useAppStore } from "./store/app-store";
export { useAuthStore } from "./store/auth-store";
