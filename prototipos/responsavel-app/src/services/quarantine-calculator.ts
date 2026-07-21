import { loadDestinationRules, type RegrasPublicas } from "./kb-public-loader";
import { differenceInDays, subDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface ResultadoCalculadora {
  destino: string;
  nome: string;
  bandeira: string;
  dataEmbarque: Date;
  dataEmbarqueFormatada: string;
  dataIdeal: Date;
  dataIdealFormatada: string;
  diasAteEmbarque: number;
  diasNecessarios: number;
  temTempo: boolean;
  janelaRisco: string | null;
  etapas: EtapaCalculadora[];
}

export interface EtapaCalculadora {
  nome: string;
  obrigatoria: boolean;
  diasAntes: number;
  dataLimite: string;
  descricao: string;
}

export function calcularDataIdeal(
  slug: string,
  dataEmbarque: Date
): ResultadoCalculadora | null {
  const regras = loadDestinationRules(slug);
  if (!regras) return null;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const etapas: EtapaCalculadora[] = [];
  let maiorAntes = 0;

  if (regras.rules.exigeMicrochip) {
    const dias = (regras.rules.exigeSorologia
      ? regras.rules.diasCarenciaSorologia
      : regras.rules.diasCarenciaVacina) + 7;
    maiorAntes = Math.max(maiorAntes, dias);
    etapas.push({
      nome: "Microchip ISO",
      obrigatoria: true,
      diasAntes: dias,
      dataLimite: formatPtBR(subDays(dataEmbarque, dias)),
      descricao: "Implantar ANTES da vacina antirrábica",
    });
  }

  if (regras.rules.exigeVacina) {
    const dias = regras.rules.exigeSorologia
      ? regras.rules.diasCarenciaSorologia + 7
      : regras.rules.diasCarenciaVacina;
    maiorAntes = Math.max(maiorAntes, dias);
    etapas.push({
      nome: "Vacina antirrábica",
      obrigatoria: true,
      diasAntes: dias,
      dataLimite: formatPtBR(subDays(dataEmbarque, dias)),
      descricao: `Carência de ${regras.rules.diasCarenciaVacina} dias${regras.rules.validadeVacinaAnos ? ` · Validade: ${regras.rules.validadeVacinaAnos} ano${regras.rules.validadeVacinaAnos > 1 ? "s" : ""}` : ""}`,
    });
  }

  if (regras.rules.exigeSorologia) {
    const dias = regras.rules.diasCarenciaSorologia;
    maiorAntes = Math.max(maiorAntes, dias);
    etapas.push({
      nome: "Sorologia antirrábica",
      obrigatoria: true,
      diasAntes: dias,
      dataLimite: formatPtBR(subDays(dataEmbarque, dias)),
      descricao: `Carência de ${dias} dias · Resultado ${regras.rules.valorMinimoSorologia ?? "≥0,5 UI/mL"}`,
    });
  }

  if (regras.rules.exigeCVI) {
    etapas.push({
      nome: "CVI",
      obrigatoria: true,
      diasAntes: regras.rules.diasAntesCVI,
      dataLimite: `${formatPtBR(subDays(dataEmbarque, regras.rules.diasAntesCVI))} a ${formatPtBR(subDays(dataEmbarque, 2))}`,
      descricao: "Emitir com veterinário credenciado pelo MAPA",
    });
  }

  if (regras.rules.exigePermissaoImportacao) {
    const dias = 180;
    maiorAntes = Math.max(maiorAntes, dias);
    etapas.push({
      nome: "Permissão de importação",
      obrigatoria: true,
      diasAntes: dias,
      dataLimite: formatPtBR(subDays(dataEmbarque, dias)),
      descricao: "Solicitar ao órgão de controle animal do destino",
    });
  }

  etapas.sort((a, b) => b.diasAntes - a.diasAntes);

  const dataIdeal = subDays(dataEmbarque, maiorAntes);
  const diasAteEmbarque = differenceInDays(dataEmbarque, hoje);
  const temTempo = diasAteEmbarque >= maiorAntes;

  let janelaRisco: string | null = null;
  if (!temTempo) {
    const etapaCritica = etapas[0];
    janelaRisco = `Atenção: faltam ${diasAteEmbarque} dias para o embarque, mas ${etapaCritica.nome.toLowerCase()} exige ${etapaCritica.diasAntes} dias de antecedência. Considere adiar a viagem.`;
  } else if (diasAteEmbarque - maiorAntes <= 14) {
    janelaRisco = `Você está na janela limite. Comece os trâmites imediatamente para não perder os prazos.`;
  }

  return {
    destino: slug,
    nome: regras.nome,
    bandeira: regras.bandeira,
    dataEmbarque,
    dataEmbarqueFormatada: formatPtBR(dataEmbarque),
    dataIdeal,
    dataIdealFormatada: formatPtBR(dataIdeal),
    diasAteEmbarque,
    diasNecessarios: maiorAntes,
    temTempo,
    janelaRisco,
    etapas,
  };
}

function formatPtBR(date: Date): string {
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}
