/**
 * Catálogo curado de raças para o autocomplete de cadastro.
 *
 * Source-of-truth de UI apenas. Compliance continua usando
 * `RACAS_BRAQUICEFALICAS` (braquicefalicos.ts) e `RACAS_PERIGOSAS`
 * (racas-perigosas.ts) — manter sincronizado: todo item dessas listas
 * deve aparecer aqui com a flag correspondente true.
 *
 * Critério de inclusão: top raças BR (CBKC) + todas as raças com regra
 * de compliance (braquicefálicos e perigosas).
 */

import type { Especie } from "@/domain/types";

export interface RacaCatalogada {
  nome: string; // nome canônico salvo em pet.raca
  especie: Extract<Especie, "CAO" | "GATO">;
  braquicefalico?: boolean;
  perigosa?: boolean;
  aliases?: string[];
}

export const RACA_SRD = "SRD (Sem Raça Definida)";
export const RACA_OUTRO = "Outro";

export const RACAS_CATALOGADAS: RacaCatalogada[] = [
  // ─── Cães — Top BR (CBKC) ─────────────────────────────────
  { nome: "Affenpinscher", especie: "CAO", braquicefalico: true },
  { nome: "Akita", especie: "CAO" },
  { nome: "American Bulldog", especie: "CAO", perigosa: true },
  { nome: "American Bully", especie: "CAO", braquicefalico: true },
  { nome: "American Pit Bull Terrier", especie: "CAO", perigosa: true, aliases: ["american pit bull", "apbt"] },
  { nome: "American Staffordshire Terrier", especie: "CAO", perigosa: true, aliases: ["amstaff", "staffie", "american staffordshire"] },
  { nome: "Basset Hound", especie: "CAO" },
  { nome: "Beagle", especie: "CAO" },
  { nome: "Bernese Mountain Dog", especie: "CAO", aliases: ["boiadeiro bernês"] },
  { nome: "Bichon Frisé", especie: "CAO", aliases: ["bichon"] },
  { nome: "Boerboel", especie: "CAO", perigosa: true },
  { nome: "Border Collie", especie: "CAO" },
  { nome: "Borzoi", especie: "CAO" },
  { nome: "Boston Terrier", especie: "CAO", braquicefalico: true },
  { nome: "Boxer", especie: "CAO", braquicefalico: true },
  { nome: "Buldogue Americano", especie: "CAO", perigosa: true, aliases: ["american bulldog"] },
  { nome: "Buldogue Campeiro", especie: "CAO" },
  { nome: "Bull Terrier", especie: "CAO", braquicefalico: true },
  { nome: "Bulldog Francês", especie: "CAO", braquicefalico: true, aliases: ["frenchie", "buldogue francês"] },
  { nome: "Bulldog Inglês", especie: "CAO", braquicefalico: true, aliases: ["english bulldog", "buldogue inglês"] },
  { nome: "Cane Corso", especie: "CAO", braquicefalico: true },
  { nome: "Cavalier King Charles Spaniel", especie: "CAO", braquicefalico: true, aliases: ["cavalier", "king charles"] },
  { nome: "Caucasian Shepherd", especie: "CAO", perigosa: true, aliases: ["pastor do cáucaso", "ovcharka"] },
  { nome: "Chihuahua", especie: "CAO" },
  { nome: "Chihuahua Apple Head", especie: "CAO", braquicefalico: true, aliases: ["chihuahua cabeça de maçã"] },
  { nome: "Chow Chow", especie: "CAO", braquicefalico: true },
  { nome: "Cocker Spaniel Americano", especie: "CAO", aliases: ["american cocker spaniel"] },
  { nome: "Cocker Spaniel Inglês", especie: "CAO", aliases: ["english cocker spaniel"] },
  { nome: "Collie", especie: "CAO" },
  { nome: "Dachshund", especie: "CAO", aliases: ["salsicha", "teckel"] },
  { nome: "Dálmata", especie: "CAO", aliases: ["dalmatian"] },
  { nome: "Doberman", especie: "CAO", aliases: ["dobermann"] },
  { nome: "Dogo Argentino", especie: "CAO", perigosa: true },
  { nome: "Dogue Alemão", especie: "CAO", aliases: ["great dane", "grande dinamarquês"] },
  { nome: "Dogue de Bordeaux", especie: "CAO", braquicefalico: true, aliases: ["dogue de bordeaux", "french mastiff"] },
  { nome: "Fila Brasileiro", especie: "CAO", perigosa: true, aliases: ["fila"] },
  { nome: "Fox Paulistinha", especie: "CAO", aliases: ["terrier brasileiro"] },
  { nome: "Galgo", especie: "CAO", aliases: ["greyhound"] },
  { nome: "Golden Retriever", especie: "CAO", aliases: ["golden"] },
  { nome: "Griffon de Bruxelas", especie: "CAO", braquicefalico: true, aliases: ["brussels griffon"] },
  { nome: "Husky Siberiano", especie: "CAO", aliases: ["siberian husky", "husky"] },
  { nome: "Japanese Chin", especie: "CAO", braquicefalico: true, aliases: ["chin japonês"] },
  { nome: "Jack Russell Terrier", especie: "CAO", aliases: ["jack russell"] },
  { nome: "Labrador Retriever", especie: "CAO", aliases: ["labrador", "lab"] },
  { nome: "Lhasa Apso", especie: "CAO", braquicefalico: true },
  { nome: "Malamute do Alasca", especie: "CAO", aliases: ["alaskan malamute"] },
  { nome: "Maltês", especie: "CAO", aliases: ["maltese"] },
  { nome: "Mastiff Inglês", especie: "CAO", braquicefalico: true, aliases: ["english mastiff"] },
  { nome: "Mastim Napolitano", especie: "CAO", braquicefalico: true, perigosa: true, aliases: ["neapolitan mastiff", "mastino", "mastino napoletano"] },
  { nome: "Papillon", especie: "CAO" },
  { nome: "Pastor Alemão", especie: "CAO", aliases: ["german shepherd", "ovelheiro alemão"] },
  { nome: "Pastor Australiano", especie: "CAO", aliases: ["australian shepherd"] },
  { nome: "Pastor Belga", especie: "CAO", aliases: ["belgian shepherd", "malinois"] },
  { nome: "Pastor de Shetland", especie: "CAO", aliases: ["sheltie", "shetland sheepdog"] },
  { nome: "Pequinês", especie: "CAO", braquicefalico: true, aliases: ["pekingese"] },
  { nome: "Pinscher Miniatura", especie: "CAO", aliases: ["pinscher", "min pin"] },
  { nome: "Pit Bull", especie: "CAO", braquicefalico: true, perigosa: true, aliases: ["pitbull", "pit-bull"] },
  { nome: "Poodle", especie: "CAO", aliases: ["caniche"] },
  { nome: "Pug", especie: "CAO", braquicefalico: true, aliases: ["carlino"] },
  { nome: "Rottweiler", especie: "CAO", perigosa: true, aliases: ["rottie", "rotweiller"] },
  { nome: "Samoieda", especie: "CAO", aliases: ["samoyed"] },
  { nome: "São Bernardo", especie: "CAO", aliases: ["saint bernard", "são-bernardo"] },
  { nome: "Schnauzer", especie: "CAO" },
  { nome: "Setter Inglês", especie: "CAO", aliases: ["english setter"] },
  { nome: "Setter Irlandês", especie: "CAO", aliases: ["irish setter"] },
  { nome: "Shar Pei", especie: "CAO", braquicefalico: true },
  { nome: "Shiba Inu", especie: "CAO" },
  { nome: "Shih Tzu", especie: "CAO", braquicefalico: true },
  { nome: "Spitz Alemão", especie: "CAO", aliases: ["lulu da pomerânia", "pomeranian"] },
  { nome: "Staffordshire Bull Terrier", especie: "CAO", braquicefalico: true, aliases: ["staffy"] },
  { nome: "Tosa Inu", especie: "CAO", perigosa: true, aliases: ["tosa japonês"] },
  { nome: "Vira-lata Caramelo", especie: "CAO", aliases: ["caramelo", "srd caramelo"] },
  { nome: "Weimaraner", especie: "CAO" },
  { nome: "Welsh Corgi", especie: "CAO", aliases: ["corgi", "pembroke welsh corgi"] },
  { nome: "West Highland White Terrier", especie: "CAO", aliases: ["westie"] },
  { nome: "Whippet", especie: "CAO" },
  { nome: "Yorkshire Terrier", especie: "CAO", aliases: ["yorkshire", "yorkie"] },

  // ─── Gatos — Top BR ───────────────────────────────────────
  { nome: "Abissínio", especie: "GATO", aliases: ["abyssinian"] },
  { nome: "American Curl", especie: "GATO" },
  { nome: "American Shorthair", especie: "GATO" },
  { nome: "Angorá", especie: "GATO", aliases: ["turkish angora"] },
  { nome: "Bengal", especie: "GATO", aliases: ["bengala"] },
  { nome: "Birmanês", especie: "GATO", aliases: ["birman", "sagrado da birmânia"] },
  { nome: "Bombaim", especie: "GATO", aliases: ["bombay"] },
  { nome: "British Shorthair", especie: "GATO", braquicefalico: true },
  { nome: "Burmês", especie: "GATO", braquicefalico: true, aliases: ["burmese"] },
  { nome: "Cornish Rex", especie: "GATO" },
  { nome: "Devon Rex", especie: "GATO" },
  { nome: "Exotic Shorthair", especie: "GATO", braquicefalico: true },
  { nome: "Himalaia", especie: "GATO", braquicefalico: true, aliases: ["himalayan"] },
  { nome: "Maine Coon", especie: "GATO" },
  { nome: "Manx", especie: "GATO" },
  { nome: "Munchkin", especie: "GATO" },
  { nome: "Norueguês da Floresta", especie: "GATO", aliases: ["norwegian forest cat"] },
  { nome: "Oriental Shorthair", especie: "GATO" },
  { nome: "Persa", especie: "GATO", braquicefalico: true, aliases: ["persian"] },
  { nome: "Ragdoll", especie: "GATO" },
  { nome: "Russian Blue", especie: "GATO", aliases: ["azul russo"] },
  { nome: "Sagrado da Birmânia", especie: "GATO" },
  { nome: "Savannah", especie: "GATO" },
  { nome: "Scottish Fold", especie: "GATO", braquicefalico: true },
  { nome: "Selkirk Rex", especie: "GATO" },
  { nome: "Siamês", especie: "GATO", aliases: ["siamese"] },
  { nome: "Siberiano", especie: "GATO", aliases: ["siberian"] },
  { nome: "Singapura", especie: "GATO" },
  { nome: "Somali", especie: "GATO" },
  { nome: "Sphynx", especie: "GATO", aliases: ["esfinge"] },
  { nome: "Tonquinês", especie: "GATO", aliases: ["tonkinese"] },
  { nome: "Vira-lata", especie: "GATO", aliases: ["srd", "sem raça"] },
];

function normalizar(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

/**
 * Busca raças por query (substring no nome ou nos aliases),
 * filtradas pela espécie. Espécie "OUTRO" mostra tudo.
 */
export function buscarRacas(query: string, especie: Especie): RacaCatalogada[] {
  const q = normalizar(query);
  const filtradas = RACAS_CATALOGADAS.filter(
    (r) => especie === "OUTRO" || r.especie === especie,
  );
  if (!q) return filtradas;
  return filtradas.filter((r) => {
    if (normalizar(r.nome).includes(q)) return true;
    return (r.aliases ?? []).some((a) => normalizar(a).includes(q));
  });
}

/**
 * Tenta resolver uma string livre (ex: "pittbull") para uma raça
 * catalogada — usa nome + aliases. Retorna `null` se não houver match.
 */
export function resolverRaca(raca: string, especie?: Especie): RacaCatalogada | null {
  const q = normalizar(raca);
  if (!q) return null;
  const candidatas = especie && especie !== "OUTRO"
    ? RACAS_CATALOGADAS.filter((r) => r.especie === especie)
    : RACAS_CATALOGADAS;
  return (
    candidatas.find((r) => normalizar(r.nome) === q) ??
    candidatas.find((r) => (r.aliases ?? []).some((a) => normalizar(a) === q)) ??
    null
  );
}
