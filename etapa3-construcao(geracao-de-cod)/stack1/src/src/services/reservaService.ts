import api from './api';
import { Reserva, CreateReservaDTO, UpdateReservaDTO } from '../types';

export const reservaService = {
  // Criar nova reserva
  async create(data: CreateReservaDTO): Promise<Reserva> {
    const response = await api.post<{ data: Reserva }>('/reservas', data);
    return response.data.data;
  },

  // Listar todas as reservas
  async listAll(): Promise<Reserva[]> {
    const response = await api.get<{ data: Reserva[] }>('/reservas');
    return response.data.data;
  },

  // Listar reservas ativas
  async listAtivas(): Promise<Reserva[]> {
    const response = await api.get<{ data: Reserva[] }>('/reservas/ativas');
    return response.data.data;
  },

  // Buscar reserva por ID
  async findById(id: string): Promise<Reserva> {
    const response = await api.get<{ data: Reserva }>(`/reservas/${id}`);
    return response.data.data;
  },

  // Atualizar reserva
  async update(id: string, data: UpdateReservaDTO): Promise<Reserva> {
    const response = await api.put<{ data: Reserva }>(`/reservas/${id}`, data);
    return response.data.data;
  },

  // Cancelar reserva
  async cancel(id: string): Promise<Reserva> {
    const response = await api.patch<{ data: Reserva }>(`/reservas/${id}/cancelar`);
    return response.data.data;
  }
};
