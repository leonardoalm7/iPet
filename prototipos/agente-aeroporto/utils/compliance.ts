import { Pet } from "@/MockPets";
import { ComplianceResult, Destino } from "@/types/compliance";

const DATA_SISTEMA = new Date("2026-01-20");

function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/");
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function diasEntre(data1: Date, data2: Date): number {
  const diffTime = Math.abs(data2.getTime() - data1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function verificarCompliance(
  pet: Pet,
  destino: Destino
): ComplianceResult {
  const dataVacina = parseDate(pet.vacina.data);
  const diasDesdeVacina = diasEntre(dataVacina, DATA_SISTEMA);

  // BRASIL: Ignora Sorologia. Valida apenas Vacina > 21 dias.
  if (destino === "BRASIL") {
    if (diasDesdeVacina < 21) {
      return {
        apto: false,
        motivo: `Vacina recente (${pet.vacina.data}). Aguardar carência de 21 dias.`,
      };
    }
    return { apto: true };
  }

  // UNIÃO EUROPEIA: Exige Vacina + Sorologia + 90 dias de carência
  if (destino === "UNIAO_EUROPEIA") {
    if (!pet.sorologia || pet.sorologia.status === "Pendente") {
      return {
        apto: false,
        motivo: "Falta Sorologia + Quarentena 90 dias",
      };
    }

    const dataSorologia = parseDate(pet.sorologia.data);
    const diasDesdeSorologia = diasEntre(dataSorologia, DATA_SISTEMA);

    if (diasDesdeSorologia < 90) {
      const dataLiberacao = new Date(dataSorologia);
      dataLiberacao.setDate(dataLiberacao.getDate() + 90);
      return {
        apto: false,
        motivo: `Quarentena de 90 dias incompleta. Liberado apenas em ${formatDate(dataLiberacao)}`,
      };
    }

    if (diasDesdeVacina < 21) {
      return {
        apto: false,
        motivo: `Vacina recente (${pet.vacina.data}). Aguardar carência de 21 dias.`,
      };
    }

    return { apto: true };
  }

  // JAPÃO: Exige Vacina + Sorologia + 180 dias
  if (destino === "JAPAO") {
    if (!pet.sorologia || pet.sorologia.status === "Pendente") {
      return {
        apto: false,
        motivo: "Falta Sorologia + Quarentena 180 dias",
      };
    }

    const dataSorologia = parseDate(pet.sorologia.data);
    const diasDesdeSorologia = diasEntre(dataSorologia, DATA_SISTEMA);

    if (diasDesdeSorologia < 180) {
      const dataLiberacao = new Date(dataSorologia);
      dataLiberacao.setDate(dataLiberacao.getDate() + 180);
      return {
        apto: false,
        motivo: `Regra Japão: Quarentena de 180 dias incompleta. Liberado apenas em ${formatDate(dataLiberacao)}`,
        dataLiberacao: formatDate(dataLiberacao),
      };
    }

    if (diasDesdeVacina < 21) {
      return {
        apto: false,
        motivo: `Vacina recente (${pet.vacina.data}). Aguardar carência de 21 dias.`,
      };
    }

    return { apto: true };
  }

  return { apto: false, motivo: "Destino não reconhecido" };
}
