export enum TipoQuarto {
  BASICO = "BASICO",
  MODERNO = "MODERNO",
  LUXO = "LUXO",
}

export enum TipoCama {
  SOLTEIRO = "SOLTEIRO",
  CASAL_KING = "CASAL_KING",
  CASAL_QUEEN = "CASAL_QUEEN",
}

export enum Disponibilidade {
  LIVRE = "LIVRE",
  OCUPADO = "OCUPADO",
  MANUTENCAO = "MANUTENCAO",
  LIMPEZA = "LIMPEZA",
}

export enum StatusReserva {
  PENDENTE = "PENDENTE",
  CONFIRMADA = "CONFIRMADA",
  EM_ANDAMENTO = "EM_ANDAMENTO",
  FINALIZADA = "FINALIZADA",
  CANCELADA = "CANCELADA",
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CamaData {
  id: string;
  tipo: TipoCama;
}

export interface QuartoData {
  id: string;
  numero: number;
  capacidade: number;
  tipo: TipoQuarto;
  precoPorDiaria: number;
  temFrigobar: boolean;
  temCafeDaManha: boolean;
  temArCondicionado: boolean;
  temTV: boolean;
  disponibilidade: Disponibilidade;
  camas: CamaData[];
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface HospedeData {
  id: string;
  nome: string;
  sobrenome: string;
  cpf: string;
  email: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface ReservaData {
  id: string;
  quartoId: string;
  hospedeId: string;
  dataCheckIn: Date;
  dataCheckOut: Date;
  status: StatusReserva;
  valorTotal: number;
  criadoEm: Date;
  atualizadoEm: Date;
}