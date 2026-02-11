import { Quarto } from '../domain/entities/Quarto';
import { Disponibilidade } from '../types';

export interface IQuartoRepository {
  criar(quarto: Quarto): Promise<Quarto>;
  buscarPorId(id: string): Promise<Quarto | null>;
  buscarPorNumero(numero: number): Promise<Quarto | null>;
  buscarTodos(): Promise<Quarto[]>;
  buscarPorDisponibilidade(disponibilidade: Disponibilidade): Promise<Quarto[]>;
  atualizar(id: string, quarto: Quarto): Promise<Quarto>;
  deletar(id: string): Promise<void>;
  existeNumero(numero: number, idExcluir?: string): Promise<boolean>;
}

export class QuartoRepositoryInMemory implements IQuartoRepository {
  private quartos: Map<string, Quarto> = new Map();

  async criar(quarto: Quarto): Promise<Quarto> {
    this.quartos.set(quarto.id, quarto);
    return quarto;
  }

  async buscarPorId(id: string): Promise<Quarto | null> {
    return this.quartos.get(id) || null;
  }

  async buscarPorNumero(numero: number): Promise<Quarto | null> {
    for (const quarto of this.quartos.values()) {
      if (quarto.numero === numero) {
        return quarto;
      }
    }
    return null;
  }

  async buscarTodos(): Promise<Quarto[]> {
    return Array.from(this.quartos.values());
  }

  async buscarPorDisponibilidade(disponibilidade: Disponibilidade): Promise<Quarto[]> {
    return Array.from(this.quartos.values()).filter(
      q => q.disponibilidade === disponibilidade
    );
  }

  async atualizar(id: string, quarto: Quarto): Promise<Quarto> {
    this.quartos.set(id, quarto);
    return quarto;
  }

  async deletar(id: string): Promise<void> {
    this.quartos.delete(id);
  }

  async existeNumero(numero: number, idExcluir?: string): Promise<boolean> {
    for (const quarto of this.quartos.values()) {
      if (quarto.numero === numero && quarto.id !== idExcluir) {
        return true;
      }
    }
    return false;
  }

  limpar(): void {
    this.quartos.clear();
  }
}
