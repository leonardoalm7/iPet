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
  "Chihuahua Cabeça de Maçã",
  // Gatos
  "Persa",
  "Himalaia",
  "Exotic Shorthair",
  "Scottish Fold",
  "British Shorthair",
  "Burmês",
];

export function isBraquicefalico(raca: string): boolean {
  const normalizada = raca
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return RACAS_BRAQUICEFALICAS.some((r) => {
    const rNorm = r
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return normalizada.includes(rNorm) || rNorm.includes(normalizada);
  });
}
