import { TipoQuarto, Disponibilidade, ValidationResult, QuartoData } from '../../types';
import { Cama } from './Cama';
import { v4 as uuidv4 } from 'uuid';

export class Quarto {
  readonly id: string;
  private _numero: number;
  private _capacidade: number;
  private _tipo: TipoQuarto;
  private _precoPorDiaria: number;
  private _temFrigobar: boolean;
  private _temCafeDaManha: boolean;
  private _temArCondicionado: boolean;
  private _temTV: boolean;
  private _disponibilidade: Disponibilidade;
  private _camas: Cama[];
  readonly criadoEm: Date;
  private _atualizadoEm: Date;

  constructor(params: {
    numero: number;
    capacidade: number;
    tipo: TipoQuarto;
    precoPorDiaria: number;
    temFrigobar: boolean;
    temCafeDaManha: boolean;
    temArCondicionado: boolean;
    temTV: boolean;
    disponibilidade?: Disponibilidade;
    camas?: Cama[];
    id?: string;
    criadoEm?: Date;
    atualizadoEm?: Date;
  }) {
    this.id = params.id || uuidv4();
    this._numero = params.numero;
    this._capacidade = params.capacidade;
    this._tipo = params.tipo;
    this._precoPorDiaria = params.precoPorDiaria;
    this._temFrigobar = params.temFrigobar;
    this._temCafeDaManha = params.temCafeDaManha;
    this._temArCondicionado = params.temArCondicionado;
    this._temTV = params.temTV;
    this._disponibilidade = params.disponibilidade || Disponibilidade.LIVRE;
    this._camas = params.camas || [];
    this.criadoEm = params.criadoEm || new Date();
    this._atualizadoEm = params.atualizadoEm || new Date();
  }

  get numero(): number {
    return this._numero;
  }

  get capacidade(): number {
    return this._capacidade;
  }

  get tipo(): TipoQuarto {
    return this._tipo;
  }

  get precoPorDiaria(): number {
    return this._precoPorDiaria;
  }

  get temFrigobar(): boolean {
    return this._temFrigobar;
  }

  get temCafeDaManha(): boolean {
    return this._temCafeDaManha;
  }

  get temArCondicionado(): boolean {
    return this._temArCondicionado;
  }

  get temTV(): boolean {
    return this._temTV;
  }

  get disponibilidade(): Disponibilidade {
    return this._disponibilidade;
  }

  get camas(): Cama[] {
    return [...this._camas];
  }

  get atualizadoEm(): Date {
    return this._atualizadoEm;
  }

  alterarDisponibilidade(status: Disponibilidade): void {
    this._disponibilidade = status;
    this._atualizadoEm = new Date();
  }

  podeSerReservado(): boolean {
    return this._disponibilidade === Disponibilidade.LIVRE;
  }

  adicionarCama(cama: Cama): void {
    this._camas.push(cama);
    this._atualizadoEm = new Date();
  }

  removerCama(camaId: string): void {
    this._camas = this._camas.filter(c => c.id !== camaId);
    this._atualizadoEm = new Date();
  }

  atualizarDados(params: {
    numero?: number;
    capacidade?: number;
    tipo?: TipoQuarto;
    precoPorDiaria?: number;
    temFrigobar?: boolean;
    temCafeDaManha?: boolean;
    temArCondicionado?: boolean;
    temTV?: boolean;
    camas?: Cama[];
  }): void {
    if (params.numero !== undefined) this._numero = params.numero;
    if (params.capacidade !== undefined) this._capacidade = params.capacidade;
    if (params.tipo !== undefined) this._tipo = params.tipo;
    if (params.precoPorDiaria !== undefined) this._precoPorDiaria = params.precoPorDiaria;
    if (params.temFrigobar !== undefined) this._temFrigobar = params.temFrigobar;
    if (params.temCafeDaManha !== undefined) this._temCafeDaManha = params.temCafeDaManha;
    if (params.temArCondicionado !== undefined) this._temArCondicionado = params.temArCondicionado;
    if (params.temTV !== undefined) this._temTV = params.temTV;
    if (params.camas !== undefined) this._camas = params.camas;
    
    this._atualizadoEm = new Date();
  }

  calcularValorTotal(numeroDiarias: number): number {
    return this._precoPorDiaria * numeroDiarias;
  }

  validar(): ValidationResult {
    const errors: string[] = [];

    if (this._numero <= 0) {
      errors.push('Número do quarto deve ser maior que zero');
    }

    if (this._capacidade <= 0) {
      errors.push('Capacidade deve ser maior que zero');
    }

    if (this._precoPorDiaria <= 0) {
      errors.push('Preço por diária deve ser maior que zero');
    }

    if (this._camas.length === 0) {
      errors.push('Quarto deve ter pelo menos uma cama');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toData(): QuartoData {
    return {
      id: this.id,
      numero: this._numero,
      capacidade: this._capacidade,
      tipo: this._tipo,
      precoPorDiaria: this._precoPorDiaria,
      temFrigobar: this._temFrigobar,
      temCafeDaManha: this._temCafeDaManha,
      temArCondicionado: this._temArCondicionado,
      temTV: this._temTV,
      disponibilidade: this._disponibilidade,
      camas: this._camas.map(c => c.toData()),
      criadoEm: this.criadoEm,
      atualizadoEm: this._atualizadoEm
    };
  }

  static fromData(data: QuartoData): Quarto {
    return new Quarto({
      numero: data.numero,
      capacidade: data.capacidade,
      tipo: data.tipo,
      precoPorDiaria: data.precoPorDiaria,
      temFrigobar: data.temFrigobar,
      temCafeDaManha: data.temCafeDaManha,
      temArCondicionado: data.temArCondicionado,
      temTV: data.temTV,
      disponibilidade: data.disponibilidade,
      camas: data.camas.map(c => Cama.fromData(c)),
      id: data.id,
      criadoEm: data.criadoEm,
      atualizadoEm: data.atualizadoEm
    });
  }
}
