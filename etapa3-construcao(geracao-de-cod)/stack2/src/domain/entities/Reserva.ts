import { ReservaData, StatusReserva, ValidationResult } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export class Reserva {
  readonly id: string;
  private _quartoId: string;
  private _hospedeId: string;
  private _dataCheckIn: Date;
  private _dataCheckOut: Date;
  private _status: StatusReserva;
  private _valorTotal: number;
  readonly criadoEm: Date;
  private _atualizadoEm: Date;

  constructor(params: {
    quartoId: string;
    hospedeId: string;
    dataCheckIn: Date;
    dataCheckOut: Date;
    valorTotal: number;
    status?: StatusReserva;
    id?: string;
    criadoEm?: Date;
    atualizadoEm?: Date;
  }) {
    this.id = params.id || uuidv4();
    this._quartoId = params.quartoId;
    this._hospedeId = params.hospedeId;
    this._dataCheckIn = params.dataCheckIn;
    this._dataCheckOut = params.dataCheckOut;
    this._status = params.status || StatusReserva.PENDENTE;
    this._valorTotal = params.valorTotal;
    this.criadoEm = params.criadoEm || new Date();
    this._atualizadoEm = params.atualizadoEm || new Date();
  }

  get quartoId(): string {
    return this._quartoId;
  }

  get hospedeId(): string {
    return this._hospedeId;
  }

  get dataCheckIn(): Date {
    return this._dataCheckIn;
  }

  get dataCheckOut(): Date {
    return this._dataCheckOut;
  }

  get status(): StatusReserva {
    return this._status;
  }

  get valorTotal(): number {
    return this._valorTotal;
  }

  get atualizadoEm(): Date {
    return this._atualizadoEm;
  }

  calcularNumeroDiarias(): number {
    const diffTime = Math.abs(this._dataCheckOut.getTime() - this._dataCheckIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  confirmar(): void {
    if (this._status !== StatusReserva.PENDENTE) {
      throw new Error('Apenas reservas pendentes podem ser confirmadas');
    }
    this._status = StatusReserva.CONFIRMADA;
    this._atualizadoEm = new Date();
  }

  cancelar(): void {
    if (this._status === StatusReserva.FINALIZADA || this._status === StatusReserva.CANCELADA) {
      throw new Error('Não é possível cancelar esta reserva');
    }
    this._status = StatusReserva.CANCELADA;
    this._atualizadoEm = new Date();
  }

  checkIn(): void {
    if (this._status !== StatusReserva.CONFIRMADA) {
      throw new Error('Apenas reservas confirmadas podem fazer check-in');
    }
    this._status = StatusReserva.EM_ANDAMENTO;
    this._atualizadoEm = new Date();
  }

  checkOut(): void {
    if (this._status !== StatusReserva.EM_ANDAMENTO) {
      throw new Error('Apenas reservas em andamento podem fazer check-out');
    }
    this._status = StatusReserva.FINALIZADA;
    this._atualizadoEm = new Date();
  }

  podeSerAlterada(): boolean {
    return this._status === StatusReserva.PENDENTE || this._status === StatusReserva.CONFIRMADA;
  }

  atualizarDados(params: {
    quartoId?: string;
    hospedeId?: string;
    dataCheckIn?: Date;
    dataCheckOut?: Date;
    valorTotal?: number;
  }): void {
    if (!this.podeSerAlterada()) {
      throw new Error('Esta reserva não pode ser alterada');
    }

    if (params.quartoId !== undefined) this._quartoId = params.quartoId;
    if (params.hospedeId !== undefined) this._hospedeId = params.hospedeId;
    if (params.dataCheckIn !== undefined) this._dataCheckIn = params.dataCheckIn;
    if (params.dataCheckOut !== undefined) this._dataCheckOut = params.dataCheckOut;
    if (params.valorTotal !== undefined) this._valorTotal = params.valorTotal;
    
    this._atualizadoEm = new Date();
  }

  validar(): ValidationResult {
    const errors: string[] = [];

    if (!this._quartoId) {
      errors.push('Quarto é obrigatório');
    }

    if (!this._hospedeId) {
      errors.push('Hóspede é obrigatório');
    }

    if (this._dataCheckOut <= this._dataCheckIn) {
      errors.push('Data de check-out deve ser posterior à data de check-in');
    }

    if (this._valorTotal <= 0) {
      errors.push('Valor total deve ser maior que zero');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toData(): ReservaData {
    return {
      id: this.id,
      quartoId: this._quartoId,
      hospedeId: this._hospedeId,
      dataCheckIn: this._dataCheckIn,
      dataCheckOut: this._dataCheckOut,
      status: this._status,
      valorTotal: this._valorTotal,
      criadoEm: this.criadoEm,
      atualizadoEm: this._atualizadoEm
    };
  }

  static fromData(data: ReservaData): Reserva {
    return new Reserva({
      quartoId: data.quartoId,
      hospedeId: data.hospedeId,
      dataCheckIn: data.dataCheckIn,
      dataCheckOut: data.dataCheckOut,
      valorTotal: data.valorTotal,
      status: data.status,
      id: data.id,
      criadoEm: data.criadoEm,
      atualizadoEm: data.atualizadoEm
    });
  }
}
