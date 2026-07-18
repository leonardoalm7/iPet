import type { Destino } from "../domain/types";

const SLUG_TO_DESTINO: Record<string, Destino> = {
  "brasil": "BRASIL",
  "argentina": "ARGENTINA",
  "chile": "CHILE",
  "uruguai": "URUGUAI",
  "colombia": "COLOMBIA",
  "peru": "PERU",
  "paraguai": "PARAGUAI",
  "bolivia": "BOLIVIA",
  "equador": "EQUADOR",
  "venezuela": "VENEZUELA",
  "mexico": "MEXICO",
  "eua": "EUA",
  "canada": "CANADA",
  "portugal": "PORTUGAL",
  "espanha": "ESPANHA",
  "franca": "FRANCA",
  "alemanha": "ALEMANHA",
  "italia": "ITALIA",
  "holanda": "HOLANDA",
  "austria": "AUSTRIA",
  "belgica": "BELGICA",
  "bulgaria": "BULGARIA",
  "chipre": "CHIPRE",
  "croacia": "CROACIA",
  "dinamarca": "DINAMARCA",
  "eslovaquia": "ESLOVAQUIA",
  "eslovenia": "ESLOVENIA",
  "estonia": "ESTONIA",
  "finlandia": "FINLANDIA",
  "grecia": "GRECIA",
  "hungria": "HUNGRIA",
  "irlanda": "IRLANDA",
  "letonia": "LETONIA",
  "lituania": "LITUANIA",
  "luxemburgo": "LUXEMBURGO",
  "malta": "MALTA",
  "polonia": "POLONIA",
  "republica-tcheca": "REPUBLICA_TCHECA",
  "romenia": "ROMENIA",
  "suecia": "SUECIA",
  "reino-unido": "REINO_UNIDO",
  "japao": "JAPAO",
  "china": "CHINA",
  "hong-kong": "HONG_KONG",
  "taiwan": "TAIWAN",
  "tailandia": "TAILANDIA",
  "indonesia": "INDONESIA",
  "malasia": "MALASIA",
  "filipinas": "FILIPINAS",
  "india": "INDIA",
  "catar": "CATAR",
  "arabia-saudita": "ARABIA_SAUDITA",
  "australia": "AUSTRALIA",
  "suica": "SUICA",
  "noruega": "NORUEGA",
  "turquia": "TURQUIA",
  "coreia-do-sul": "COREIA_DO_SUL",
  "singapura": "SINGAPURA",
  "emirados-arabes": "EMIRADOS_ARABES",
  "israel": "ISRAEL",
  "nova-zelandia": "NOVA_ZELANDIA",
};

const DESTINO_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(SLUG_TO_DESTINO).map(([slug, destino]) => [destino, slug])
);

export function slugToDestino(slug: string): Destino | undefined {
  return SLUG_TO_DESTINO[slug];
}

export function destinoToSlug(destino: Destino): string {
  return DESTINO_TO_SLUG[destino] ?? destino.toLowerCase();
}

export function getAllSlugs(): string[] {
  return Object.keys(SLUG_TO_DESTINO);
}
