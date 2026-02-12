// Tipos e Interfaces do Frontend

export interface Hospede {
  id: string;
  nome: string;
  sobrenome: string;
  cpf: string;
  email: string;
  criadoEm: string;
}

export interface Quarto {
  id: string;
  numero: number;
  tipo: string;
  precoDiaria: number;
  disponivel: boolean;
  criadoEm: string;
}

export interface Reserva {
  id: string;
  hospedeId: string;
  quartoId: string;
  dataCheckIn: string;
  dataCheckOut: string;
  valorTotal: number;
  status: 'ativa' | 'cancelada' | 'concluida';
  criadoEm: string;
  atualizadoEm: string;
  hospede?: Hospede;
  quarto?: Quarto;
}

export interface CreateHospedeDTO {
  nome: string;
  sobrenome: string;
  cpf: string;
  email: string;
}

export interface CreateQuartoDTO {
  numero: number;
  tipo: string;
  precoDiaria: number;
}

export interface CreateReservaDTO {
  hospedeId: string;
  quartoId: string;
  dataCheckIn: string;
  dataCheckOut: string;
}

export interface UpdateReservaDTO {
  dataCheckIn?: string;
  dataCheckOut?: string;
  status?: 'ativa' | 'cancelada' | 'concluida';
}
