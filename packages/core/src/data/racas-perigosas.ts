export const RACAS_PERIGOSAS: string[] = [
  "Pit Bull",
  "American Pit Bull Terrier",
  "Rottweiler",
  "Dogo Argentino",
  "Fila Brasileiro",
  "American Staffordshire Terrier",
  "Tosa Inu",
  "Boerboel",
  "American Bulldog",
  "Neapolitan Mastiff",
  "Caucasian Shepherd",
];

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const ALIASES: Record<string, string[]> = {
  "pit bull": ["pitbull", "pit bull terrier", "american pit bull"],
  "fila brasileiro": ["fila"],
  "rottweiler": ["rottie"],
  "american staffordshire terrier": ["american staffordshire", "staffie"],
};

export function isRacaPerigosa(raca: string): boolean {
  const norm = normalizar(raca);
  return RACAS_PERIGOSAS.some((r) => {
    const rNorm = normalizar(r);
    // Exact match or substring match
    if (norm === rNorm || norm.includes(rNorm) || rNorm.includes(norm)) return true;
    // Alias matching
    const aliases = ALIASES[rNorm] ?? [];
    return aliases.some((a) => norm.includes(normalizar(a)));
  });
}
