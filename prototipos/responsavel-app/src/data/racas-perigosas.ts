export const RACAS_PERIGOSAS: string[] = [
  "Pit Bull",
  "American Pit Bull Terrier",
  "Rottweiler",
  "Dogo Argentino",
  "Fila Brasileiro",
  "American Staffordshire Terrier",
  "Tosa Inu",
];

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function isRacaPerigosa(raca: string): boolean {
  const normalizada = normalizar(raca);
  return RACAS_PERIGOSAS.some((r) => normalizada === normalizar(r));
}
