import { RegrasCompanhiaAerea } from "@/domain/types";

export const COMPANHIAS_AEREAS: RegrasCompanhiaAerea[] = [
  {
    id: "latam",
    nome: "LATAM Airlines",
    codigo: "LA",
    pesoMaxCabine: 10,
    pesoMaxPorао: 45,
    dimensoesMaxCabine: { comprimento: 45, largura: 35, altura: 25 },
    idadeMinimaAnimal: 8, // semanas
    racasBraquisefálicasPermitidas: false,
    anotacoes:
      "Caixa deve caber sob o assento. Apenas cães e gatos. Raças braquicefálicas permitidas apenas no porão com restrições. Reserva obrigatória com antecedência.",
  },
  {
    id: "gol",
    nome: "GOL Linhas Aéreas",
    codigo: "G3",
    pesoMaxCabine: 10,
    pesoMaxPorао: 32,
    dimensoesMaxCabine: { comprimento: 45, largura: 35, altura: 25 },
    idadeMinimaAnimal: 8,
    racasBraquisefálicasPermitidas: false,
    anotacoes:
      "Pet+caixa até 10kg na cabine. Máximo 3 animais por voo na cabine. Reserva com no mínimo 24h de antecedência.",
  },
  {
    id: "azul",
    nome: "Azul Linhas Aéreas",
    codigo: "AD",
    pesoMaxCabine: 10,
    pesoMaxPorао: 45,
    dimensoesMaxCabine: { comprimento: 43, largura: 30, altura: 23 },
    idadeMinimaAnimal: 8,
    racasBraquisefálicasPermitidas: true,
    anotacoes:
      "Única grande companhia brasileira a permitir algumas raças braquicefálicas na cabine (Bulldog, Pug). Confirmar com a companhia. Reserva obrigatória.",
  },
];

export const COMPANHIAS_MAPA: Record<string, RegrasCompanhiaAerea> =
  Object.fromEntries(COMPANHIAS_AEREAS.map((c) => [c.id, c]));
