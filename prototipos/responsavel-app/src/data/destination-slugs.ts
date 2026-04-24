import type { Destino } from "@/domain/types";

const SLUG_TO_DESTINO: Record<string, Destino> = {
  "brasil": "BRASIL",
  "argentina": "ARGENTINA",
  "chile": "CHILE",
  "uruguai": "URUGUAI",
  "mexico": "MEXICO",
  "eua": "EUA",
  "canada": "CANADA",
  "portugal": "PORTUGAL",
  "espanha": "ESPANHA",
  "franca": "FRANCA",
  "alemanha": "ALEMANHA",
  "italia": "ITALIA",
  "holanda": "HOLANDA",
  "reino-unido": "REINO_UNIDO",
  "japao": "JAPAO",
  "australia": "AUSTRALIA",
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
