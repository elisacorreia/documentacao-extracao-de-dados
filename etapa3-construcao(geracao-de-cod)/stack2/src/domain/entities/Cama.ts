import { TipoCama, CamaData } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export class Cama {
  readonly id: string;
  readonly tipo: TipoCama;

  constructor(tipo: TipoCama, id?: string) {
    this.id = id || uuidv4();
    this.tipo = tipo;
  }

  equals(other: Cama): boolean {
    return this.id === other.id && this.tipo === other.tipo;
  }

  toData(): CamaData {
    return {
      id: this.id,
      tipo: this.tipo
    };
  }

  static fromData(data: CamaData): Cama {
    return new Cama(data.tipo, data.id);
  }
}
