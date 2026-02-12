import api from './api';
import { Quarto, CreateQuartoDTO } from '../types';

export const quartoService = {
  // Criar novo quarto
  async create(data: CreateQuartoDTO): Promise<Quarto> {
    const response = await api.post<{ data: Quarto }>('/quartos', data);
    return response.data.data;
  },

  // Listar todos os quartos
  async listAll(): Promise<Quarto[]> {
    const response = await api.get<{ data: Quarto[] }>('/quartos');
    return response.data.data;
  },

  // Listar quartos disponíveis
  async listDisponiveis(): Promise<Quarto[]> {
    const response = await api.get<{ data: Quarto[] }>('/quartos/disponiveis');
    return response.data.data;
  },

  // Buscar quarto por ID
  async findById(id: string): Promise<Quarto> {
    const response = await api.get<{ data: Quarto }>(`/quartos/${id}`);
    return response.data.data;
  }
};
