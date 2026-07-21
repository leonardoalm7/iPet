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
  PlanoViagemPet,
  TrechoViagem,
  DocumentoSanitario,
  Responsavel,
  Destino,
} from "../domain/types";
import { v4 as uuidv4 } from "uuid";

interface AppState {
  responsavel: Responsavel | null;
  pets: Pet[];
  planosViagem: PlanoViagem[];
  planosViagemPets: PlanoViagemPet[];
  documentos: DocumentoSanitario[];

  // Responsável
  setResponsavel: (r: Responsavel) => void;

  // Pets
  adicionarPet: (pet: Omit<Pet, "id" | "responsavelId" | "criadoEm">) => Pet;
  atualizarPet: (id: string, dados: Partial<Pet>) => void;
  removerPet: (id: string) => void;
  getPet: (id: string) => Pet | undefined;

  // Planos de Viagem
  criarPlanoViagem: (
    plano: Omit<PlanoViagem, "id" | "isPremium" | "criadoEm"> & {
      trechos?: TrechoViagem[];
      petIds: string[]; // mínimo 1 pet
    }
  ) => PlanoViagem;
  atualizarPlanoViagem: (id: string, dados: Partial<PlanoViagem>) => void;
  removerPlanoViagem: (id: string) => void;
  getPlanosPorPet: (petId: string) => PlanoViagem[];
  ativarPremium: (planoId: string, pagamentoId: string) => void;

  // PlanoViagemPet (join entity)
  adicionarPetAoPlano: (
    planoViagemId: string,
    petId: string,
    dados?: Partial<Omit<PlanoViagemPet, "id" | "planoViagemId" | "petId" | "criadoEm">>
  ) => PlanoViagemPet;
  removerPetDoPlano: (id: string) => void;
  atualizarPlanoViagemPet: (id: string, dados: Partial<PlanoViagemPet>) => void;
  getPetsPorPlano: (planoViagemId: string) => PlanoViagemPet[];
  getPrimeiroPetIdDoPlano: (planoViagemId: string) => string | undefined;

  // Documentos
  adicionarDocumento: (doc: DocumentoSanitario) => void;
  removerDocumento: (id: string) => void;
  getDocumentosPorPet: (petId: string) => DocumentoSanitario[];

  // Lead Gen — engajamento com clínicas
  clinicaEngajamento: Record<string, { buscas: number; cliques: number; ligacoes: number; navegacoes: number }>;
  registrarEngajamento: (clinicaId: string, tipo: "busca" | "clique" | "ligacao" | "navegacao") => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      responsavel: null,
      pets: [],
      planosViagem: [],
      planosViagemPets: [],
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
        set((s) => {
          // Remove o pet e todos os PlanoViagemPet onde ele aparece
          const planosViagemPetsRestantes = s.planosViagemPets.filter((pv) => pv.petId !== id);
          // Identifica planos que ficaram sem nenhum pet — cascade remove
          const planosComPet = new Set(planosViagemPetsRestantes.map((pv) => pv.planoViagemId));
          return {
            pets: s.pets.filter((p) => p.id !== id),
            planosViagemPets: planosViagemPetsRestantes,
            planosViagem: s.planosViagem.filter((p) => planosComPet.has(p.id)),
            documentos: s.documentos.filter((d) => d.petId !== id),
          };
        }),

      getPet: (id) => get().pets.find((p) => p.id === id),

      criarPlanoViagem: (dados) => {
        const { petIds, ...resto } = dados;
        if (!petIds || petIds.length === 0) {
          throw new Error("criarPlanoViagem requer ao menos 1 petId");
        }
        const trechos: TrechoViagem[] = resto.trechos && resto.trechos.length > 0
          ? resto.trechos
          : [{ destino: resto.destino, dataEmbarque: resto.dataEmbarque }];

        const planoId = uuidv4();
        const criadoEm = new Date().toISOString();

        const plano: PlanoViagem = {
          ...resto,
          trechos,
          destino: trechos[trechos.length - 1].destino,
          dataEmbarque: trechos[0].dataEmbarque,
          id: planoId,
          isPremium: false,
          criadoEm,
        };

        const novasAssociacoes: PlanoViagemPet[] = petIds.map((petId) => ({
          id: uuidv4(),
          planoViagemId: planoId,
          petId,
          criadoEm,
        }));

        set((s) => ({
          planosViagem: [...s.planosViagem, plano],
          planosViagemPets: [...s.planosViagemPets, ...novasAssociacoes],
        }));
        return plano;
      },

      atualizarPlanoViagem: (id, dados) =>
        set((s) => ({
          planosViagem: s.planosViagem.map((p) =>
            p.id === id ? { ...p, ...dados } : p
          ),
        })),

      removerPlanoViagem: (id) =>
        set((s) => ({
          planosViagem: s.planosViagem.filter((v) => v.id !== id),
          planosViagemPets: s.planosViagemPets.filter((pv) => pv.planoViagemId !== id),
        })),

      getPlanosPorPet: (petId) => {
        const planoIds = new Set(
          get().planosViagemPets.filter((pv) => pv.petId === petId).map((pv) => pv.planoViagemId)
        );
        return get().planosViagem.filter((p) => planoIds.has(p.id));
      },

      ativarPremium: (planoId, pagamentoId) =>
        set((s) => ({
          planosViagem: s.planosViagem.map((p) =>
            p.id === planoId ? { ...p, isPremium: true, pagamentoId } : p
          ),
        })),

      adicionarPetAoPlano: (planoViagemId, petId, dados) => {
        const pvp: PlanoViagemPet = {
          ...(dados ?? {}),
          id: uuidv4(),
          planoViagemId,
          petId,
          criadoEm: new Date().toISOString(),
        };
        set((s) => ({ planosViagemPets: [...s.planosViagemPets, pvp] }));
        return pvp;
      },

      removerPetDoPlano: (id) =>
        set((s) => {
          const remover = s.planosViagemPets.find((pv) => pv.id === id);
          if (!remover) return s;
          const restantes = s.planosViagemPets.filter((pv) => pv.id !== id);
          // Cascade: se foi o último pet do plano, remove o plano também
          const aindaTemPet = restantes.some((pv) => pv.planoViagemId === remover.planoViagemId);
          return {
            planosViagemPets: restantes,
            planosViagem: aindaTemPet
              ? s.planosViagem
              : s.planosViagem.filter((p) => p.id !== remover.planoViagemId),
          };
        }),

      atualizarPlanoViagemPet: (id, dados) =>
        set((s) => ({
          planosViagemPets: s.planosViagemPets.map((pv) =>
            pv.id === id ? { ...pv, ...dados } : pv
          ),
        })),

      getPetsPorPlano: (planoViagemId) =>
        get().planosViagemPets.filter((pv) => pv.planoViagemId === planoViagemId),

      getPrimeiroPetIdDoPlano: (planoViagemId) =>
        get().planosViagemPets.find((pv) => pv.planoViagemId === planoViagemId)?.petId,

      adicionarDocumento: (doc) =>
        set((s) => ({ documentos: [...s.documentos, doc] })),

      removerDocumento: (id) =>
        set((s) => ({
          documentos: s.documentos.filter((d) => d.id !== id),
        })),

      getDocumentosPorPet: (petId) =>
        get().documentos.filter((d) => d.petId === petId),

      clinicaEngajamento: {},
      registrarEngajamento: (clinicaId, tipo) =>
        set((s) => {
          const atual = s.clinicaEngajamento[clinicaId] ?? { buscas: 0, cliques: 0, ligacoes: 0, navegacoes: 0 };
          const campo = tipo === "busca" ? "buscas" : tipo === "clique" ? "cliques" : tipo === "ligacao" ? "ligacoes" : "navegacoes";
          return {
            clinicaEngajamento: {
              ...s.clinicaEngajamento,
              [clinicaId]: { ...atual, [campo]: atual[campo] + 1 },
            },
          };
        }),
    }),
    {
      name: "ipet-storage",
      version: 5,
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as Storage)
      ),
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version < 1) {
          const pets = (state.pets as Pet[]) ?? [];
          state.pets = pets.map((p) => ({
            ...p,
            tipoPet: p.tipoPet ?? "ESTIMACAO",
          }));
        }
        if (version < 2) {
          const planos = (state.planosViagem as PlanoViagem[]) ?? [];
          state.planosViagem = planos.map((p) => ({
            ...p,
            isPremium: p.isPremium ?? false,
          }));
        }
        if (version < 3) {
          const planos = (state.planosViagem as PlanoViagem[]) ?? [];
          state.planosViagem = planos.map((p) => ({
            ...p,
            destino: p.destino === ("UNIAO_EUROPEIA" as Destino) ? "PORTUGAL" as Destino : p.destino,
          }));
        }
        if (version < 4) {
          const planos = (state.planosViagem as any[]) ?? [];
          state.planosViagem = planos.map((p) => ({
            ...p,
            trechos: p.trechos ?? [{ destino: p.destino, dataEmbarque: p.dataEmbarque }],
          }));
        }
        if (version < 5) {
          // Migração: cada plano antigo (com petId) gera 1 PlanoViagemPet.
          // Depois remove petId de cada PlanoViagem.
          const planos = (state.planosViagem as any[]) ?? [];
          const planosViagemPets: PlanoViagemPet[] = planos
            .filter((p) => p.petId)
            .map((p) => ({
              id: uuidv4(),
              planoViagemId: p.id,
              petId: p.petId as string,
              criadoEm: (p.criadoEm as string) ?? new Date().toISOString(),
            }));
          state.planosViagemPets = planosViagemPets;
          state.planosViagem = planos.map(({ petId: _petId, ...rest }) => rest);
        }
        return state as unknown as AppState;
      },
    }
  )
);
