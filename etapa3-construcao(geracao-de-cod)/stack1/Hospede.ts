import { HospedeData, ValidationResult } from '../../types';
import { CPF } from '../value-objects/CPF';
import { Email } from '../value-objects/Email';
import { v4 as uuidv4 } from 'uuid';

export class Hospede {
  readonly id: string;
  private _nome: string;
  private _sobrenome: string;
  private _cpf: CPF;
  private _email: Email;
  readonly criadoEm: Date;
  private _atualizadoEm: Date;

  constructor(params: {
    nome: string;
    sobrenome: string;
    cpf: CPF;
    email: Email;
    id?: string;
    criadoEm?: Date;
    atualizadoEm?: Date;
  }) {
    this.id = params.id || uuidv4();
    this._nome = params.nome;
    this._sobrenome = params.sobrenome;
    this._cpf = params.cpf;
    this._email = params.email;
    this.criadoEm = params.criadoEm || new Date();
    this._atualizadoEm = params.atualizadoEm || new Date();
  }

  get nome(): string {
    return this._nome;
  }

  get sobrenome(): string {
    return this._sobrenome;
  }

  get cpf(): CPF {
    return this._cpf;
  }

  get email(): Email {
    return this._email;
  }

  get atualizadoEm(): Date {
    return this._atualizadoEm;
  }

  nomeCompleto(): string {
    return `${this._nome} ${this._sobrenome}`;
  }

  atualizarEmail(email: Email): void {
    this._email = email;
    this._atualizadoEm = new Date();
  }

  atualizarDados(params: {
    nome?: string;
    sobrenome?: string;
    email?: Email;
  }): void {
    if (params.nome !== undefined) this._nome = params.nome;
    if (params.sobrenome !== undefined) this._sobrenome = params.sobrenome;
    if (params.email !== undefined) this._email = params.email;
    
    this._atualizadoEm = new Date();
  }

  validar(): ValidationResult {
    const errors: string[] = [];

    if (!this._nome || this._nome.trim().length === 0) {
      errors.push('Nome é obrigatório');
    }

    if (!this._sobrenome || this._sobrenome.trim().length === 0) {
      errors.push('Sobrenome é obrigatório');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toData(): HospedeData {
    return {
      id: this.id,
      nome: this._nome,
      sobrenome: this._sobrenome,
      cpf: this._cpf.valorSemFormatacao(),
      email: this._email.getValor(),
      criadoEm: this.criadoEm,
      atualizadoEm: this._atualizadoEm
    };
  }

  static fromData(data: HospedeData): Hospede {
    return new Hospede({
      nome: data.nome,
      sobrenome: data.sobrenome,
      cpf: CPF.criar(data.cpf),
      email: Email.criar(data.email),
      id: data.id,
      criadoEm: data.criadoEm,
      atualizadoEm: data.atualizadoEm
    });
  }
}
