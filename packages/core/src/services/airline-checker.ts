import { Pet, RegrasCompanhiaAerea } from "../domain/types";
import { isBraquicefalico } from "../data/braquicefalicos";
import { isRacaPerigosa } from "../data/racas-perigosas";
import { differenceInWeeks, parse, isValid } from "date-fns";

/**
 * Idade do pet em semanas na data de referência (embarque, se conhecida;
 * senão hoje). Retorna null se a data de nascimento for inválida.
 */
function idadeEmSemanas(pet: Pet, referencia: Date): number | null {
  const nascimento = parse(pet.dataNascimento, "dd/MM/yyyy", new Date());
  if (!isValid(nascimento)) return null;
  return differenceInWeeks(referencia, nascimento);
}

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
  caoGuia: boolean;
}

export function verificarCompanhia(
  pet: Pet,
  cia: RegrasCompanhiaAerea,
  dataEmbarqueStr?: string
): ResultadoVerificacao {
  const alertas: string[] = [];
  const motivos: string[] = [];
  let cabine = false;
  let porao = false;
  const caoGuia = pet.tipoPet === "CAO_GUIA";

  // Lei 11.126/2005: cão-guia embarca obrigatoriamente, gratuito, sem restrições
  if (caoGuia) {
    cabine = true;
    alertas.push(
      "Cão-guia: embarque obrigatório em cabine, gratuito, sem caixa (Lei 11.126/2005)"
    );
    return {
      companhia: cia,
      veredicto: "PODE_CABINE",
      cabine,
      porao: true,
      alertas,
      motivos,
      caoGuia,
    };
  }

  const braqui = isBraquicefalico(pet.raca);
  const perigosa = isRacaPerigosa(pet.raca);

  // Idade mínima da cia, avaliada NA DATA DO EMBARQUE (GOL exige 6 meses;
  // LATAM 16 semanas; Azul 4 meses). Sem data de embarque, avalia hoje.
  if (cia.idadeMinimaAnimal > 0) {
    let referencia = new Date();
    if (dataEmbarqueStr) {
      const parsed = parse(dataEmbarqueStr, "dd/MM/yyyy", new Date());
      if (isValid(parsed)) referencia = parsed;
    }
    const idadeSemanas = idadeEmSemanas(pet, referencia);
    if (idadeSemanas !== null && idadeSemanas < cia.idadeMinimaAnimal) {
      const quando = dataEmbarqueStr ? `na data do embarque (${dataEmbarqueStr})` : "hoje";
      motivos.push(
        `${pet.nome} terá ${idadeSemanas} semanas ${quando} — a ${cia.nome} exige idade mínima de ${cia.idadeMinimaAnimal} semanas`
      );
      return {
        companhia: cia,
        veredicto: "NAO_ACEITO",
        cabine: false,
        porao: false,
        alertas,
        motivos,
        caoGuia,
      };
    }
  }

  // Raça perigosa + cia bane completamente
  if (perigosa && cia.racasPerigosasBanidas) {
    motivos.push(
      `${pet.raca} é considerada raça perigosa e é banida pela ${cia.nome} em qualquer modalidade`
    );
    if (cia.anotacoes) {
      alertas.push(cia.anotacoes.replace(/^⚠️\s*/, ""));
    }
    return {
      companhia: cia,
      veredicto: "NAO_ACEITO",
      cabine: false,
      porao: false,
      alertas,
      motivos,
      caoGuia,
    };
  }

  // Cabine
  // Convenção do KB: pesoMaxCabine 0 = cabine indisponível; >=99 = sem limite
  // de peso publicado (LATAM/United) — o critério real é o pet caber em pé na
  // caixa sob o assento, então acima de um porte prático tratamos como porão.
  const SEM_LIMITE_PESO = 99;
  const PESO_PRATICO_CAIXA_CABINE = 12; // kg — acima disso não cabe na caixa sob o assento
  if (cia.pesoMaxCabine > 0) {
    const dentroDoPeso =
      cia.pesoMaxCabine >= SEM_LIMITE_PESO
        ? pet.peso <= PESO_PRATICO_CAIXA_CABINE
        : pet.peso <= cia.pesoMaxCabine;

    if (dentroDoPeso) {
      if (!braqui || cia.braquicefalicoCabine) {
        cabine = true;
        if (cia.pesoMaxCabine >= SEM_LIMITE_PESO) {
          alertas.push(
            `${cia.nome} não publica limite de peso em cabine — o critério é o pet caber em pé na caixa sob o assento (confira as dimensões na reserva)`
          );
        }
      } else {
        motivos.push(
          `${pet.raca} é braquicefálica e não é aceita na cabine pela ${cia.nome}`
        );
      }
    } else if (cia.pesoMaxCabine >= SEM_LIMITE_PESO) {
      motivos.push(
        `${cia.nome} não publica limite de peso em cabine, mas com ${pet.peso}kg o pet dificilmente caberá em pé na caixa sob o assento — modalidade provável: porão`
      );
    } else {
      motivos.push(
        `Peso do pet (${pet.peso}kg) excede o limite de cabine (${cia.pesoMaxCabine}kg)`
      );
    }
  } else {
    motivos.push(`${cia.nome} não aceita pets na cabine`);
  }

  // Porão
  if (cia.pesoMaxPorao > 0) {
    if (pet.peso <= cia.pesoMaxPorao) {
      if (!braqui || cia.braquicefalicoPorao) {
        porao = true;
      } else {
        motivos.push(
          `${pet.raca} é braquicefálica e não é aceita no porão pela ${cia.nome} (risco respiratório)`
        );
      }
    } else {
      motivos.push(
        `Peso do pet (${pet.peso}kg) excede o limite de porão (${cia.pesoMaxPorao}kg)`
      );
    }
  } else {
    motivos.push(`${cia.nome} não aceita pets no porão`);
  }

  // Alertas informativos
  if (braqui && (cia.braquicefalicoCabine || cia.braquicefalicoPorao)) {
    const onde = cia.braquicefalicoCabine && cia.braquicefalicoPorao
      ? "cabine e porão"
      : cia.braquicefalicoCabine
      ? "cabine (porão não)"
      : "porão (cabine não)";
    alertas.push(
      `Raça braquicefálica aceita em ${onde} — confirme na reserva`
    );
  }

  if (perigosa && !cia.racasPerigosasBanidas) {
    alertas.push(
      "Raça classificada como perigosa — confirme aceitação diretamente com a companhia"
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

  return { companhia: cia, veredicto, cabine, porao, alertas, motivos, caoGuia };
}

export function verificarTodasCompanhias(
  pet: Pet,
  companhias: RegrasCompanhiaAerea[],
  dataEmbarqueStr?: string
): ResultadoVerificacao[] {
  return companhias
    .map((cia) => verificarCompanhia(pet, cia, dataEmbarqueStr))
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
