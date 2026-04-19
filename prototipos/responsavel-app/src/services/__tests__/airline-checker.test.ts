import { describe, it, expect } from "vitest";
import {
  verificarCompanhia,
  verificarTodasCompanhias,
} from "../airline-checker";
import { Pet, RegrasCompanhiaAerea } from "@/domain/types";

function criarPet(overrides: Partial<Pet> = {}): Pet {
  return {
    id: "pet-1",
    nome: "Rex",
    especie: "CAO",
    raca: "Labrador",
    dataNascimento: "01/01/2020",
    peso: 5,
    tipoPet: "ESTIMACAO",
    responsavelId: "user-1",
    criadoEm: new Date().toISOString(),
    ...overrides,
  };
}

function criarCia(overrides: Partial<RegrasCompanhiaAerea> = {}): RegrasCompanhiaAerea {
  return {
    id: "cia-1",
    nome: "TestAir",
    codigo: "TA",
    pesoMaxCabine: 10,
    pesoMaxPorао: 45,
    dimensoesMaxCabine: { comprimento: 43, largura: 31, altura: 21 },
    idadeMinimaAnimal: 12,
    braquicefalicoCabine: true,
    braquicefalicoPorao: true,
    racasPerigosasBanidas: false,
    anotacoes: "",
    ...overrides,
  };
}

describe("verificarCompanhia", () => {
  it("allows small pet in cabin", () => {
    const pet = criarPet({ peso: 5 });
    const cia = criarCia({ pesoMaxCabine: 10 });
    const result = verificarCompanhia(pet, cia);
    expect(result.veredicto).toBe("PODE_CABINE");
    expect(result.cabine).toBe(true);
  });

  it("rejects pet exceeding cabin weight but allows cargo", () => {
    const pet = criarPet({ peso: 15 });
    const cia = criarCia({ pesoMaxCabine: 10, pesoMaxPorао: 45 });
    const result = verificarCompanhia(pet, cia);
    expect(result.cabine).toBe(false);
    expect(result.porao).toBe(true);
  });

  it("rejects pet exceeding all weight limits", () => {
    const pet = criarPet({ peso: 50 });
    const cia = criarCia({ pesoMaxCabine: 10, pesoMaxPorао: 45 });
    const result = verificarCompanhia(pet, cia);
    expect(result.veredicto).toBe("NAO_ACEITO");
    expect(result.cabine).toBe(false);
    expect(result.porao).toBe(false);
  });

  it("guide dog always boards in cabin", () => {
    const pet = criarPet({ peso: 30, tipoPet: "CAO_GUIA" });
    const cia = criarCia({ pesoMaxCabine: 10 });
    const result = verificarCompanhia(pet, cia);
    expect(result.veredicto).toBe("PODE_CABINE");
    expect(result.caoGuia).toBe(true);
  });

  it("bans dangerous breeds when airline prohibits", () => {
    const pet = criarPet({ raca: "Pit Bull" });
    const cia = criarCia({ racasPerigosasBanidas: true });
    const result = verificarCompanhia(pet, cia);
    expect(result.veredicto).toBe("NAO_ACEITO");
  });

  it("warns about weight close to cabin limit", () => {
    const pet = criarPet({ peso: 9 });
    const cia = criarCia({ pesoMaxCabine: 10 });
    const result = verificarCompanhia(pet, cia);
    expect(result.alertas.some((a) => a.includes("Peso próximo"))).toBe(true);
  });
});

describe("verificarTodasCompanhias", () => {
  it("sorts results with PODE_CABINE first", () => {
    const pet = criarPet({ peso: 5 });
    const cias = [
      criarCia({ id: "1", pesoMaxCabine: 0, pesoMaxPorао: 45 }),
      criarCia({ id: "2", pesoMaxCabine: 10 }),
    ];
    const results = verificarTodasCompanhias(pet, cias);
    expect(results[0].companhia.id).toBe("2");
  });
});
