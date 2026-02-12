// Types e Interfaces do Sistema

export interface Hospede {
  id: string;
  nome: string;
  sobrenome: string;
  cpf: string;
  email: string;
  criadoEm: Date;
}

export interface Quarto {
  id: string;
  numero: number;
  tipo: string;
  precoDiaria: number;
  disponivel: boolean;
  criadoEm: Date;
}

export interface Reserva {
  id: string;
  hospedeId: string;
  quartoId: string;
  dataCheckIn: Date;
  dataCheckOut: Date;
  valorTotal: number;
  status: string;
  criadoEm: Date;
  atualizadoEm: Date;
  hospede?: Hospede;
  quarto?: Quarto;
}

export interface CreateHospedeDTO {
  nome: string;
  sobrenome: string;
  cpf: string;
  email: string;
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
  status?: string;
}

export interface CreateQuartoDTO {
  numero: number;
  tipo: string;
  precoDiaria: number;
}

export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 400) {
    super(message);
    this.name = 'AppError';
  }
}
