import { Reserva } from '../domain/entities/Reserva';
import { StatusReserva } from '../types';

export interface IReservaRepository {
  criar(reserva: Reserva): Promise<Reserva>;
  buscarPorId(id: string): Promise<Reserva | null>;
  buscarPorQuarto(quartoId: string): Promise<Reserva[]>;
  buscarPorHospede(hospedeId: string): Promise<Reserva[]>;
  buscarAtivas(): Promise<Reserva[]>;
  buscarTodas(): Promise<Reserva[]>;
  atualizar(id: string, reserva: Reserva): Promise<Reserva>;
  deletar(id: string): Promise<void>;
  existeReservaAtivaQuarto(quartoId: string): Promise<boolean>;
}

export class ReservaRepositoryInMemory implements IReservaRepository {
  private reservas: Map<string, Reserva> = new Map();

  async criar(reserva: Reserva): Promise<Reserva> {
    this.reservas.set(reserva.id, reserva);
    return reserva;
  }

  async buscarPorId(id: string): Promise<Reserva | null> {
    return this.reservas.get(id) || null;
  }

  async buscarPorQuarto(quartoId: string): Promise<Reserva[]> {
    return Array.from(this.reservas.values()).filter(
      r => r.quartoId === quartoId
    );
  }

  async buscarPorHospede(hospedeId: string): Promise<Reserva[]> {
    return Array.from(this.reservas.values()).filter(
      r => r.hospedeId === hospedeId
    );
  }

  async buscarAtivas(): Promise<Reserva[]> {
    return Array.from(this.reservas.values()).filter(
      r => r.status === StatusReserva.CONFIRMADA || r.status === StatusReserva.EM_ANDAMENTO
    );
  }

  async buscarTodas(): Promise<Reserva[]> {
    return Array.from(this.reservas.values());
  }

  async atualizar(id: string, reserva: Reserva): Promise<Reserva> {
    this.reservas.set(id, reserva);
    return reserva;
  }

  async deletar(id: string): Promise<void> {
    this.reservas.delete(id);
  }

  async existeReservaAtivaQuarto(quartoId: string): Promise<boolean> {
    const reservasQuarto = await this.buscarPorQuarto(quartoId);
    return reservasQuarto.some(
      r => r.status === StatusReserva.CONFIRMADA || r.status === StatusReserva.EM_ANDAMENTO
    );
  }

  limpar(): void {
    this.reservas.clear();
  }
}
