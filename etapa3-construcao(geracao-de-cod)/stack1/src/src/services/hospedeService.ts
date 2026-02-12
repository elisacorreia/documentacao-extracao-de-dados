import api from './api';
import { Hospede, CreateHospedeDTO } from '../types';

export const hospedeService = {
  // Criar novo hóspede
  async create(data: CreateHospedeDTO): Promise<Hospede> {
    const response = await api.post<{ data: Hospede }>('/hospedes', data);
    return response.data.data;
  },

  // Listar todos os hóspedes
  async listAll(): Promise<Hospede[]> {
    const response = await api.get<{ data: Hospede[] }>('/hospedes');
    return response.data.data;
  },

  // Buscar hóspede por ID
  async findById(id: string): Promise<Hospede> {
    const response = await api.get<{ data: Hospede }>(`/hospedes/${id}`);
    return response.data.data;
  }
};
