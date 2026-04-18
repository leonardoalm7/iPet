/**
 * Store global do app — Zustand + persistência em localStorage
 *
 * Abstração limpa: quando o backend estiver pronto,
 * substituir as operações localStorage por chamadas de API
 * sem alterar os componentes.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Pet,
  PlanoViagem,
  DocumentoSanitario,
  Responsavel,
} from "@/domain/types";
import { v4 as uuidv4 } from "uuid";

interface AppState {
  responsavel: Responsavel | null;
  pets: Pet[];
  planosViagem: PlanoViagem[];
  documentos: DocumentoSanitario[];

  // Responsável
  setResponsavel: (r: Responsavel) => void;

  // Pets
  adicionarPet: (pet: Omit<Pet, "id" | "responsavelId" | "criadoEm">) => Pet;
  atualizarPet: (id: string, dados: Partial<Pet>) => void;
  removerPet: (id: string) => void;
  getPet: (id: string) => Pet | undefined;

  // Planos de Viagem
  criarPlanoViagem: (plano: Omit<PlanoViagem, "id" | "criadoEm">) => PlanoViagem;
  removerPlanoViagem: (id: string) => void;
  getPlanosPorPet: (petId: string) => PlanoViagem[];

  // Documentos
  adicionarDocumento: (doc: DocumentoSanitario) => void;
  removerDocumento: (id: string) => void;
  getDocumentosPorPet: (petId: string) => DocumentoSanitario[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      responsavel: null,
      pets: [],
      planosViagem: [],
      documentos: [],

      setResponsavel: (r) => set({ responsavel: r }),

      adicionarPet: (dados) => {
        const responsavel = get().responsavel;
        const pet: Pet = {
          ...dados,
          id: uuidv4(),
          responsavelId: responsavel?.id ?? "local-user",
          criadoEm: new Date().toISOString(),
        };
        set((s) => ({ pets: [...s.pets, pet] }));
        return pet;
      },

      atualizarPet: (id, dados) =>
        set((s) => ({
          pets: s.pets.map((p) => (p.id === id ? { ...p, ...dados } : p)),
        })),

      removerPet: (id) =>
        set((s) => ({
          pets: s.pets.filter((p) => p.id !== id),
          planosViagem: s.planosViagem.filter((v) => v.petId !== id),
          documentos: s.documentos.filter((d) => d.petId !== id),
        })),

      getPet: (id) => get().pets.find((p) => p.id === id),

      criarPlanoViagem: (dados) => {
        const plano: PlanoViagem = {
          ...dados,
          id: uuidv4(),
          criadoEm: new Date().toISOString(),
        };
        set((s) => ({ planosViagem: [...s.planosViagem, plano] }));
        return plano;
      },

      removerPlanoViagem: (id) =>
        set((s) => ({
          planosViagem: s.planosViagem.filter((v) => v.id !== id),
        })),

      getPlanosPorPet: (petId) =>
        get().planosViagem.filter((v) => v.petId === petId),

      adicionarDocumento: (doc) =>
        set((s) => ({ documentos: [...s.documentos, doc] })),

      removerDocumento: (id) =>
        set((s) => ({
          documentos: s.documentos.filter((d) => d.id !== id),
        })),

      getDocumentosPorPet: (petId) =>
        get().documentos.filter((d) => d.petId === petId),
    }),
    {
      name: "ipet-storage",
      version: 1,
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as Storage)
      ),
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version === 0) {
          const pets = (state.pets as Pet[]) ?? [];
          state.pets = pets.map((p) => ({
            ...p,
            tipoPet: p.tipoPet ?? "ESTIMACAO",
          }));
        }
        return state as unknown as AppState;
      },
    }
  )
);
