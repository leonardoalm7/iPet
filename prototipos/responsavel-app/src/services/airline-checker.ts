import { Pet, RegrasCompanhiaAerea } from "@/domain/types";
import { isBraquicefalico } from "@/data/braquicefalicos";

export type VeredictoCia =
  | "PODE_CABINE"
  | "PODE_PORAO"
  | "RESTRICAO"
  | "NAO_ACEITO";

export interface ResultadoVerificacao {
  companhia: RegrasCompanhiaAerea;
  veredicto: VeredictoCia;
  cabine: boolean;
  porao: boolean;
  alertas: string[];
  motivos: string[];
}

export function verificarCompanhia(
  pet: Pet,
  cia: RegrasCompanhiaAerea
): ResultadoVerificacao {
  const alertas: string[] = [];
  const motivos: string[] = [];
  let cabine = false;
  let porao = false;

  const braqui = isBraquicefalico(pet.raca);

  // Braquicefálico + cia não aceita
  if (braqui && !cia.racasBraquisefálicasPermitidas) {
    motivos.push(
      `${pet.raca} é considerada raça braquicefálica e não é aceita pela ${cia.nome}`
    );
  }

  // Cabine
  if (cia.pesoMaxCabine > 0) {
    if (pet.peso <= cia.pesoMaxCabine) {
      if (!braqui || cia.racasBraquisefálicasPermitidas) {
        cabine = true;
      }
    } else {
      motivos.push(
        `Peso do pet (${pet.peso}kg) excede o limite de cabine (${cia.pesoMaxCabine}kg)`
      );
    }
  } else {
    motivos.push(`${cia.nome} não aceita pets na cabine`);
  }

  // Porão
  if (cia.pesoMaxPorао > 0) {
    if (pet.peso <= cia.pesoMaxPorао) {
      if (!braqui || cia.racasBraquisefálicasPermitidas) {
        porao = true;
      }
    } else {
      motivos.push(
        `Peso do pet (${pet.peso}kg) excede o limite de porão (${cia.pesoMaxPorао}kg)`
      );
    }
  } else {
    motivos.push(`${cia.nome} não aceita pets no porão`);
  }

  // Alertas informativos
  if (braqui && cia.racasBraquisefálicasPermitidas) {
    alertas.push(
      "Raça braquicefálica aceita por esta companhia — confirme na reserva"
    );
  }

  if (cabine && pet.peso > cia.pesoMaxCabine * 0.8) {
    alertas.push(
      `Peso próximo do limite de cabine (${cia.pesoMaxCabine}kg) — considere pesar com a caixa`
    );
  }

  if (cia.anotacoes) {
    alertas.push(cia.anotacoes.replace(/^⚠️\s*/, ""));
  }

  // Veredicto final
  let veredicto: VeredictoCia;
  if (cabine) {
    veredicto = "PODE_CABINE";
  } else if (porao) {
    veredicto = alertas.length > 0 ? "RESTRICAO" : "PODE_PORAO";
  } else {
    veredicto = "NAO_ACEITO";
  }

  return { companhia: cia, veredicto, cabine, porao, alertas, motivos };
}

export function verificarTodasCompanhias(
  pet: Pet,
  companhias: RegrasCompanhiaAerea[]
): ResultadoVerificacao[] {
  return companhias
    .map((cia) => verificarCompanhia(pet, cia))
    .sort((a, b) => {
      const ordem: Record<VeredictoCia, number> = {
        PODE_CABINE: 0,
        PODE_PORAO: 1,
        RESTRICAO: 2,
        NAO_ACEITO: 3,
      };
      return ordem[a.veredicto] - ordem[b.veredicto];
    });
}
