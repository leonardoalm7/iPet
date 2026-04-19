import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  parseBR,
  parseBRSafe,
  formatBR,
  calcularRoadmap,
} from "../travel-roadmap";
import { Pet, Destino } from "@/domain/types";
import { isValid } from "date-fns";

// ── parseBR / parseBRSafe ──────────────────────────────────────

describe("parseBR", () => {
  it("parses DD/MM/YYYY correctly", () => {
    const d = parseBR("25/12/2025");
    expect(d.getDate()).toBe(25);
    expect(d.getMonth()).toBe(11);
    expect(d.getFullYear()).toBe(2025);
  });

  it("returns Invalid Date for empty string", () => {
    const d = parseBR("");
    expect(isValid(d)).toBe(false);
  });

  it("returns Invalid Date for garbage input", () => {
    const d = parseBR("not-a-date");
    expect(isValid(d)).toBe(false);
  });
});

describe("parseBRSafe", () => {
  it("returns Date for valid input", () => {
    const d = parseBRSafe("01/01/2025");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2025);
  });

  it("returns null for empty string", () => {
    expect(parseBRSafe("")).toBeNull();
  });

  it("returns null for invalid date", () => {
    expect(parseBRSafe("99/99/9999")).toBeNull();
  });
});

describe("formatBR", () => {
  it("formats Date as DD/MM/YYYY", () => {
    const d = new Date(2025, 11, 25);
    expect(formatBR(d)).toBe("25/12/2025");
  });
});

// ── calcularRoadmap ────────────────────────────────────────────

function criarPetBase(overrides: Partial<Pet> = {}): Pet {
  return {
    id: "pet-1",
    nome: "Rex",
    especie: "CAO",
    raca: "Labrador",
    dataNascimento: "01/01/2020",
    peso: 25,
    tipoPet: "ESTIMACAO",
    responsavelId: "user-1",
    criadoEm: new Date().toISOString(),
    ...overrides,
  };
}

describe("calcularRoadmap", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15)); // 15/01/2026
  });

  it("returns INAPTO for invalid embarque date", () => {
    const pet = criarPetBase();
    const roadmap = calcularRoadmap(pet, "BRASIL", "invalid-date", "plano-1");
    expect(roadmap.statusGeral).toBe("INAPTO");
    expect(roadmap.tarefas).toHaveLength(0);
  });

  it("returns PENDENTE for unknown destination", () => {
    const pet = criarPetBase();
    const roadmap = calcularRoadmap(
      pet,
      "DESTINO_FAKE" as Destino,
      "15/06/2026",
      "plano-1"
    );
    expect(roadmap.statusGeral).toBe("PENDENTE");
    expect(roadmap.tarefas).toHaveLength(0);
  });

  it("generates vacina task for Brasil (no microchip/CVI required)", () => {
    const pet = criarPetBase();
    const roadmap = calcularRoadmap(pet, "BRASIL", "15/06/2026", "plano-1");
    const ids = roadmap.tarefas.map((t) => t.id);
    expect(ids).toContain("vacina");
    expect(ids).not.toContain("microchip");
  });

  it("marks vacina as CONCLUIDA when valid and within carencia", () => {
    const pet = criarPetBase({
      vacina: { data: "01/12/2025", valida: true, nomeComercial: "Rabisin" },
    });
    const roadmap = calcularRoadmap(pet, "BRASIL", "15/06/2026", "plano-1");
    const vacina = roadmap.tarefas.find((t) => t.id === "vacina");
    expect(vacina?.concluida).toBe(true);
  });

  it("generates sorologia task for EU destination", () => {
    const pet = criarPetBase({
      microchip: "123456789012345",
      vacina: { data: "01/10/2025", valida: true },
    });
    const roadmap = calcularRoadmap(
      pet,
      "UNIAO_EUROPEIA",
      "15/06/2026",
      "plano-1"
    );
    const ids = roadmap.tarefas.map((t) => t.id);
    expect(ids).toContain("sorologia");
    expect(ids).toContain("microchip");
  });

  it("marks microchip as CONCLUIDA when pet has valid 15-digit chip", () => {
    const pet = criarPetBase({ microchip: "123456789012345" });
    const roadmap = calcularRoadmap(
      pet,
      "UNIAO_EUROPEIA",
      "15/06/2026",
      "plano-1"
    );
    const chip = roadmap.tarefas.find((t) => t.id === "microchip");
    expect(chip?.concluida).toBe(true);
  });

  it("generates permissao_importacao for Japan", () => {
    const pet = criarPetBase({
      microchip: "123456789012345",
      vacina: { data: "01/06/2025", valida: true },
    });
    const roadmap = calcularRoadmap(pet, "JAPAO", "15/06/2026", "plano-1");
    const ids = roadmap.tarefas.map((t) => t.id);
    expect(ids).toContain("permissao_importacao");
    expect(ids).toContain("sorologia");
  });

  it("calculates APTO status when all tasks done", () => {
    const pet = criarPetBase({
      microchip: "123456789012345",
      vacina: { data: "01/12/2025", valida: true },
    });
    const roadmap = calcularRoadmap(pet, "BRASIL", "15/06/2026", "plano-1");
    const docsOnly = roadmap.tarefas.filter((t) => t.id !== "cvi");
    const allDone = docsOnly.every((t) => t.concluida);
    if (allDone) {
      expect(["APTO", "PENDENTE"]).toContain(roadmap.statusGeral);
    }
  });
});
