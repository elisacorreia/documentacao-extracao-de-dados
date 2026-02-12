import { api } from './api';

export interface HospedeDTO {
  id?: string;
  nome: string;
  sobrenome: string;
  cpf: string;
  email: string;
  criadoEm?: string;
}

export class HospedeService {
  private basePath = '/hospedes';

  async criar(data: Omit<HospedeDTO, 'id' | 'criadoEm'>): Promise<HospedeDTO> {
    const response = await api.post<HospedeDTO>(this.basePath, data);
    return response.data;
  }

  async listarTodos(): Promise<HospedeDTO[]> {
    const response = await api.get<HospedeDTO[]>(this.basePath);
    return response.data;
  }

  async buscarPorId(id: string): Promise<HospedeDTO> {
    const response = await api.get<HospedeDTO>(`${this.basePath}/${id}`);
    return response.data;
  }

  async buscarPorCpf(cpf: string): Promise<HospedeDTO> {
    const response = await api.get<HospedeDTO>(`${this.basePath}/cpf/${cpf}`);
    return response.data;
  }
}

export const hospedeService = new HospedeService();
