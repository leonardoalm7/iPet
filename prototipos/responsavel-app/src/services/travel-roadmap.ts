import {
  Pet,
  Destino,
  TarefaRoadmap,
  RoadmapCompliance,
  StatusCompliance,
  StatusTarefa,
} from "@/domain/types";
import { REGRAS_DESTINO } from "@/data/destinations";
import {
  differenceInDays,
  addDays,
  format,
  parse,
  isAfter,
  isBefore,
  isValid,
} from "date-fns";
import { ptBR } from "date-fns/locale";

// ============================================================
// Helpers de data
// ============================================================

export function parseBR(dateStr: string): Date {
  return parse(dateStr, "dd/MM/yyyy", new Date());
}

export function formatBR(date: Date): string {
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}

function statusPorPrazo(prazo: Date, hoje: Date): StatusTarefa {
  const dias = differenceInDays(prazo, hoje);
  if (dias < 0) return "VENCIDA";
  if (dias <= 2) return "CRITICO";
  if (dias <= 7) return "URGENTE";
  return "PENDENTE";
}

// ============================================================
// Motor do Roadmap
// Dado um pet + destino + data de embarque,
// retorna a lista ordenada de tarefas com status, prazos e notas.
// ============================================================

export interface OpcoesRoadmap {
  isPremium?: boolean;
}

export function calcularRoadmap(
  pet: Pet,
  destino: Destino,
  dataEmbarqueStr: string,
  planoViagemId: string,
  opcoes: OpcoesRoadmap = {}
): RoadmapCompliance {
  const { isPremium = true } = opcoes;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataEmbarque = parseBR(dataEmbarqueStr);
  const regras = REGRAS_DESTINO[destino];
  const tarefas: TarefaRoadmap[] = [];

  // ----------------------------------------------------------------
  // TAREFA 1: Microchip
  // ----------------------------------------------------------------
  if (regras.exigeMicrochip) {
    const temMicrochip = !!(pet.microchip && pet.microchip.length === 15);
    tarefas.push({
      id: "microchip",
      titulo: "Microchip ISO 11784/11785",
      descricao:
        "Implante de microchip com 15 dígitos padrão ISO. Deve ser feito ANTES da vacinação antirrábica para validade internacional.",
      status: temMicrochip ? "CONCLUIDA" : "PENDENTE",
      prazo: null,
      diasParaPrazo: null,
      nota: temMicrochip
        ? `Microchip: ${pet.microchip}`
        : "Necessário antes de qualquer vacina. Procure uma clínica veterinária credenciada.",
      precisaClinica: !temMicrochip,
      bloqueadaPor: [],
      concluida: temMicrochip,
    });
  }

  // ----------------------------------------------------------------
  // TAREFA 2: Vacina Antirrábica
  // ----------------------------------------------------------------
  const ultimoDiaParaVacinar = addDays(dataEmbarque, -regras.diasCarenciaVacina);
  const temVacina = !!(pet.vacina?.valida);

  if (temVacina) {
    const dataVacina = parseBR(pet.vacina!.data);
    const diasDesdeVacina = differenceInDays(dataEmbarque, dataVacina);
    const carenciaOk = diasDesdeVacina >= regras.diasCarenciaVacina;

    tarefas.push({
      id: "vacina",
      titulo: "Vacina Antirrábica",
      descricao: `Vacina antirrábica válida com carência mínima de ${regras.diasCarenciaVacina} dias antes do embarque.`,
      status: carenciaOk ? "CONCLUIDA" : "CRITICO",
      prazo: carenciaOk ? null : formatBR(ultimoDiaParaVacinar),
      diasParaPrazo: carenciaOk
        ? null
        : differenceInDays(ultimoDiaParaVacinar, hoje),
      nota: carenciaOk
        ? `Aplicada em ${pet.vacina!.data}. Carência cumprida.`
        : `Aplicada em ${pet.vacina!.data}, mas a carência de ${regras.diasCarenciaVacina} dias não estará completa até a data de embarque.`,
      precisaClinica: false,
      bloqueadaPor: regras.exigeMicrochip && !pet.microchip ? ["microchip"] : [],
      concluida: carenciaOk,
    });
  } else {
    const diasParaPrazo = differenceInDays(ultimoDiaParaVacinar, hoje);
    tarefas.push({
      id: "vacina",
      titulo: "Vacina Antirrábica",
      descricao: `Vacina antirrábica com carência mínima de ${regras.diasCarenciaVacina} dias antes do embarque.`,
      status: statusPorPrazo(ultimoDiaParaVacinar, hoje),
      prazo: formatBR(ultimoDiaParaVacinar),
      diasParaPrazo,
      nota:
        diasParaPrazo >= 0
          ? `Vacinar até ${formatBR(ultimoDiaParaVacinar)} para embarcar em ${dataEmbarqueStr}.`
          : `Prazo para vacinar passou. Não é possível embarcar em ${dataEmbarqueStr} sem a carência completa.`,
      precisaClinica: true,
      bloqueadaPor: regras.exigeMicrochip && !pet.microchip ? ["microchip"] : [],
      concluida: false,
    });
  }

  // ----------------------------------------------------------------
  // TAREFA 3: Sorologia Antirrábica (apenas UE e Japão)
  // ----------------------------------------------------------------
  if (regras.exigeSorologia) {
    const diasCarencia = regras.diasCarenciaSorologia;
    const ultimoDiaParaColeta = addDays(dataEmbarque, -diasCarencia);
    const temSorologia = !!(
      pet.sorologia && pet.sorologia.status === "OK"
    );

    if (temSorologia) {
      const dataSorologia = parseBR(pet.sorologia!.data);
      const diasDesdeSorologia = differenceInDays(dataEmbarque, dataSorologia);
      const carenciaOk = diasDesdeSorologia >= diasCarencia;
      const dataLiberacaoSorologia = addDays(dataSorologia, diasCarencia);

      tarefas.push({
        id: "sorologia",
        titulo: "Sorologia Antirrábica",
        descricao: `Titulação antirrábica ≥0,5 UI/mL em laboratório credenciado pelo MAPA. Carência de ${diasCarencia} dias da data da coleta.`,
        status: carenciaOk ? "CONCLUIDA" : "CRITICO",
        prazo: carenciaOk ? null : formatBR(dataLiberacaoSorologia),
        diasParaPrazo: carenciaOk
          ? null
          : differenceInDays(dataLiberacaoSorologia, hoje),
        nota: carenciaOk
          ? `Coletada em ${pet.sorologia!.data} (${pet.sorologia!.valor}). Carência cumprida.`
          : `Sorologia ok (${pet.sorologia!.data}), mas a carência de ${diasCarencia} dias só termina em ${formatBR(dataLiberacaoSorologia)}. Considere alterar a data de embarque.`,
        precisaClinica: false,
        bloqueadaPor: [],
        concluida: carenciaOk,
      });
    } else {
      const diasParaPrazo = differenceInDays(ultimoDiaParaColeta, hoje);
      const dataDisponivel = addDays(hoje, diasCarencia);

      tarefas.push({
        id: "sorologia",
        titulo: "Sorologia Antirrábica",
        descricao: `Titulação antirrábica ≥0,5 UI/mL em laboratório credenciado pelo MAPA. Carência de ${diasCarencia} dias da coleta.`,
        status: statusPorPrazo(ultimoDiaParaColeta, hoje),
        prazo: formatBR(ultimoDiaParaColeta),
        diasParaPrazo,
        nota:
          diasParaPrazo >= 0
            ? `Coletar até ${formatBR(ultimoDiaParaColeta)} para cumprir ${diasCarencia} dias antes de ${dataEmbarqueStr}. Se coletar hoje, sorologia ficará pronta para embarque em ${formatBR(dataDisponivel)}.`
            : `Prazo encerrado para esta data de embarque. Se coletar hoje, só poderá embarcar a partir de ${formatBR(dataDisponivel)}.`,
        precisaClinica: true,
        bloqueadaPor: temVacina ? [] : ["vacina"],
        concluida: false,
      });
    }
  }

  // ----------------------------------------------------------------
  // TAREFA 4: Permissão de Importação (ex: Japão)
  // ----------------------------------------------------------------
  if (regras.exigePermissaoImportacao) {
    tarefas.push({
      id: "permissao_importacao",
      titulo: "Permissão de Importação",
      descricao:
        "Solicitação junto ao órgão de controle animal do país de destino. Para o Japão: Animal Quarantine Service (AQS). Iniciar com antecedência mínima de 6 meses.",
      status: "PENDENTE",
      prazo: formatBR(addDays(dataEmbarque, -180)),
      diasParaPrazo: differenceInDays(addDays(dataEmbarque, -180), hoje),
      nota: "Recomendado iniciar o processo com pelo menos 6 meses de antecedência. Formulário disponível no site do AQS.",
      precisaClinica: false,
      bloqueadaPor: [],
      concluida: false,
    });
  }

  // ----------------------------------------------------------------
  // TAREFA 5: Certificado Veterinário Internacional (CVI)
  // ----------------------------------------------------------------
  if (regras.exigeCVI) {
    const dataEmissaoCVI = addDays(dataEmbarque, -regras.diasAntesCVI);
    const diasParaCVI = differenceInDays(dataEmissaoCVI, hoje);

    // CVI é bloqueado se sorologia ainda está pendente
    const srologiaPendente =
      regras.exigeSorologia &&
      (!pet.sorologia || pet.sorologia.status !== "OK");

    tarefas.push({
      id: "cvi",
      titulo: "Certificado Veterinário Internacional (CVI)",
      descricao: `Emitido por médico veterinário credenciado pelo MAPA, em até ${regras.diasAntesCVI} dias antes do embarque. Inclui todos os documentos sanitários.`,
      status: srologiaPendente
        ? "BLOQUEADA"
        : diasParaCVI > 14
        ? "PENDENTE"
        : statusPorPrazo(dataEmissaoCVI, hoje),
      prazo: formatBR(dataEmissaoCVI),
      diasParaPrazo: diasParaCVI,
      nota: srologiaPendente
        ? "Aguardando aprovação da sorologia antirrábica para emissão."
        : `Emitir entre ${formatBR(addDays(dataEmbarque, -regras.diasAntesCVI))} e ${formatBR(addDays(dataEmbarque, -2))}. Procure um veterinário credenciado pelo MAPA.`,
      precisaClinica: true,
      bloqueadaPor: srologiaPendente ? ["sorologia"] : [],
      concluida: false,
    });
  }

  // ----------------------------------------------------------------
  // Cálculo do status geral e data de liberação
  // ----------------------------------------------------------------
  const { statusGeral, dataLiberacao } = calcularStatusGeral(
    tarefas,
    pet,
    destino,
    dataEmbarque,
    hoje
  );

  if (!isPremium) {
    const tarefasTeaser = tarefas.map((t) => ({
      ...t,
      prazo: null,
      diasParaPrazo: null,
      status: t.concluida ? t.status : ("PENDENTE" as const),
      nota: t.concluida ? t.nota : null,
    }));

    return {
      petId: pet.id,
      planoViagemId,
      destino,
      dataEmbarque: dataEmbarqueStr,
      statusGeral: "PENDENTE" as const,
      dataLiberacao: null,
      tarefas: tarefasTeaser,
      geradoEm: new Date().toISOString(),
    };
  }

  return {
    petId: pet.id,
    planoViagemId,
    destino,
    dataEmbarque: dataEmbarqueStr,
    statusGeral,
    dataLiberacao,
    tarefas,
    geradoEm: new Date().toISOString(),
  };
}

// ----------------------------------------------------------------
// Calcula o status geral e a data mais cedo possível para embarcar
// ----------------------------------------------------------------
function calcularStatusGeral(
  tarefas: TarefaRoadmap[],
  pet: Pet,
  destino: Destino,
  dataEmbarque: Date,
  hoje: Date
): { statusGeral: StatusCompliance; dataLiberacao: string | null } {
  const regras = REGRAS_DESTINO[destino];

  const temVencida = tarefas.some((t) => t.status === "VENCIDA");
  const temCritico = tarefas.some((t) => t.status === "CRITICO");
  const temUrgente = tarefas.some((t) => t.status === "URGENTE");
  const temPendente = tarefas.some(
    (t) => t.status === "PENDENTE" || t.status === "BLOQUEADA"
  );
  const todasConcluidas = tarefas.every((t) => t.concluida);

  if (todasConcluidas) {
    return { statusGeral: "APTO", dataLiberacao: null };
  }

  // Calcula a data mais cedo que o pet pode embarcar
  let dataLiberacao: Date | null = null;

  // Carência da vacina
  if (pet.vacina?.valida) {
    const dataVacina = parseBR(pet.vacina.data);
    const dataLiberacaoVacina = addDays(dataVacina, regras.diasCarenciaVacina);
    if (!dataLiberacao || isAfter(dataLiberacaoVacina, dataLiberacao)) {
      dataLiberacao = dataLiberacaoVacina;
    }
  } else {
    // Se ainda não vacinou, data de liberação = hoje + carência
    const dataLiberacaoVacina = addDays(hoje, regras.diasCarenciaVacina);
    if (!dataLiberacao || isAfter(dataLiberacaoVacina, dataLiberacao)) {
      dataLiberacao = dataLiberacaoVacina;
    }
  }

  // Carência da sorologia
  if (regras.exigeSorologia) {
    if (pet.sorologia?.status === "OK") {
      const dataSorologia = parseBR(pet.sorologia.data);
      const dataLiberacaoSorologia = addDays(
        dataSorologia,
        regras.diasCarenciaSorologia
      );
      if (!dataLiberacao || isAfter(dataLiberacaoSorologia, dataLiberacao)) {
        dataLiberacao = dataLiberacaoSorologia;
      }
    } else {
      // Sem sorologia: data liberação = hoje + carência da sorologia
      const dataLiberacaoSorologia = addDays(
        hoje,
        regras.diasCarenciaSorologia
      );
      if (!dataLiberacao || isAfter(dataLiberacaoSorologia, dataLiberacao)) {
        dataLiberacao = dataLiberacaoSorologia;
      }
    }
  }

  const statusGeral: StatusCompliance = temVencida
    ? "INAPTO"
    : temCritico
    ? "CRITICO"
    : temUrgente
    ? "URGENTE"
    : "PENDENTE";

  return {
    statusGeral,
    dataLiberacao: dataLiberacao ? formatBR(dataLiberacao) : null,
  };
}
