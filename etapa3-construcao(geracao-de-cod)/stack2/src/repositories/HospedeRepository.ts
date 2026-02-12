import { Hospede } from '../domain/entities/Hospede';
import { CPF } from '../domain/value-objects/CPF';

export interface IHospedeRepository {
  criar(hospede: Hospede): Promise<Hospede>;
  buscarPorId(id: string): Promise<Hospede | null>;
  buscarPorCPF(cpf: CPF): Promise<Hospede | null>;
  buscarTodos(): Promise<Hospede[]>;
  atualizar(id: string, hospede: Hospede): Promise<Hospede>;
  deletar(id: string): Promise<void>;
  existeCPF(cpf: CPF, idExcluir?: string): Promise<boolean>;
}

export class HospedeRepositoryInMemory implements IHospedeRepository {
  private hospedes: Map<string, Hospede> = new Map();

  async criar(hospede: Hospede): Promise<Hospede> {
    this.hospedes.set(hospede.id, hospede);
    return hospede;
  }

  async buscarPorId(id: string): Promise<Hospede | null> {
    return this.hospedes.get(id) || null;
  }

  async buscarPorCPF(cpf: CPF): Promise<Hospede | null> {
    for (const hospede of this.hospedes.values()) {
      if (hospede.cpf.equals(cpf)) {
        return hospede;
      }
    }
    return null;
  }

  async buscarTodos(): Promise<Hospede[]> {
    return Array.from(this.hospedes.values());
  }

  async atualizar(id: string, hospede: Hospede): Promise<Hospede> {
    this.hospedes.set(id, hospede);
    return hospede;
  }

  async deletar(id: string): Promise<void> {
    this.hospedes.delete(id);
  }

  async existeCPF(cpf: CPF, idExcluir?: string): Promise<boolean> {
    for (const hospede of this.hospedes.values()) {
      if (hospede.cpf.equals(cpf) && hospede.id !== idExcluir) {
        return true;
      }
    }
    return false;
  }

  limpar(): void {
    this.hospedes.clear();
  }
}
