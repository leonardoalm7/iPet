export type Destino = "BRASIL" | "UNIAO_EUROPEIA" | "JAPAO";

export interface ComplianceResult {
  apto: boolean;
  motivo?: string;
  dataLiberacao?: string; // formato DD/MM/YYYY
}

export interface ComplianceRule {
  destino: Destino;
  exigeSorologia: boolean;
  diasCarencia: number;
  exigeVacina: boolean;
}
