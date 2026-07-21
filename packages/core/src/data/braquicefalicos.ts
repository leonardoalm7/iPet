export const RACAS_BRAQUICEFALICAS: string[] = [
  // Cães
  "Pug",
  "Bulldog Francês",
  "Bulldog Inglês",
  "Boston Terrier",
  "Boxer",
  "Shih Tzu",
  "Lhasa Apso",
  "Pequinês",
  "Cavalier King Charles Spaniel",
  "Dogue de Bordeaux",
  "Mastiff Inglês",
  "Mastim Napolitano",
  "Cane Corso",
  "Staffordshire Bull Terrier",
  "American Bully",
  "Pit Bull",
  "Bull Terrier",
  "Chow Chow",
  "Shar Pei",
  "Griffon de Bruxelas",
  "Affenpinscher",
  "Japanese Chin",
  "Chihuahua Apple Head",
  // Gatos
  "Persa",
  "Himalaia",
  "Exotic Shorthair",
  "Scottish Fold",
  "British Shorthair",
  "Burmês",
];

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function isBraquicefalico(raca: string): boolean {
  const normalizada = normalizar(raca);

  return RACAS_BRAQUICEFALICAS.some((r) => {
    const rNorm = normalizar(r);
    return normalizada === rNorm;
  });
}
