import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  track,
  getAll,
  getByEvento,
  getContagemPorEvento,
  getSessoes,
  getFunil,
  limparEventos,
} from "../analytics";

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);

  vi.stubGlobal("localStorage", {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, val: string) => {
      mockStorage[key] = val;
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
  });

  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => mockStorage[`__session_${key}`] ?? null,
    setItem: (key: string, val: string) => {
      mockStorage[`__session_${key}`] = val;
    },
  });

  limparEventos();
});

describe("track", () => {
  it("registra um evento e persiste em localStorage", () => {
    track("pet_cadastrado", { especie: "CAO", temMicrochip: true });
    const todos = getAll();
    expect(todos).toHaveLength(1);
    expect(todos[0].evento).toBe("pet_cadastrado");
    expect(todos[0].props).toEqual({ especie: "CAO", temMicrochip: true });
  });

  it("gera id, timestamp e sessionId automaticamente", () => {
    track("destino_selecionado", { destino: "JAPAO" });
    const [evt] = getAll();
    expect(evt.id).toBeTruthy();
    expect(evt.timestamp).toBeTruthy();
    expect(evt.sessionId).toBeTruthy();
  });

  it("acumula múltiplos eventos", () => {
    track("pet_cadastrado", { especie: "CAO", temMicrochip: false });
    track("destino_selecionado", { destino: "EUA" });
    track("roadmap_gerado", { destino: "EUA", qtdTarefas: 5 });
    expect(getAll()).toHaveLength(3);
  });
});

describe("getByEvento", () => {
  it("filtra por tipo de evento", () => {
    track("pet_cadastrado", { especie: "CAO", temMicrochip: true });
    track("destino_selecionado", { destino: "JAPAO" });
    track("pet_cadastrado", { especie: "GATO", temMicrochip: false });

    const pets = getByEvento("pet_cadastrado");
    expect(pets).toHaveLength(2);
    expect(pets[0].props.especie).toBe("CAO");
    expect(pets[1].props.especie).toBe("GATO");
  });
});

describe("getContagemPorEvento", () => {
  it("conta eventos por tipo", () => {
    track("pet_cadastrado", { especie: "CAO", temMicrochip: true });
    track("pet_cadastrado", { especie: "GATO", temMicrochip: false });
    track("destino_selecionado", { destino: "JAPAO" });

    const contagem = getContagemPorEvento();
    expect(contagem.pet_cadastrado).toBe(2);
    expect(contagem.destino_selecionado).toBe(1);
  });
});

describe("getSessoes", () => {
  it("retorna sessões únicas", () => {
    track("pet_cadastrado", { especie: "CAO", temMicrochip: true });
    track("destino_selecionado", { destino: "EUA" });
    const sessoes = getSessoes();
    expect(sessoes).toHaveLength(1);
  });
});

describe("getFunil", () => {
  it("retorna etapas do funil com contagem", () => {
    track("pet_cadastrado", { especie: "CAO", temMicrochip: true });
    track("destino_selecionado", { destino: "EUA" });
    track("roadmap_gerado", { destino: "EUA", qtdTarefas: 4 });

    const funil = getFunil();
    expect(funil[0]).toEqual({ etapa: "pet_cadastrado", total: 1 });
    expect(funil[1]).toEqual({ etapa: "destino_selecionado", total: 1 });
    expect(funil[2]).toEqual({ etapa: "roadmap_gerado", total: 1 });
    expect(funil[3]).toEqual({ etapa: "companhia_verificada", total: 0 });
  });
});

describe("limparEventos", () => {
  it("remove todos os eventos", () => {
    track("pet_cadastrado", { especie: "CAO", temMicrochip: true });
    expect(getAll()).toHaveLength(1);
    limparEventos();
    expect(getAll()).toHaveLength(0);
  });
});
