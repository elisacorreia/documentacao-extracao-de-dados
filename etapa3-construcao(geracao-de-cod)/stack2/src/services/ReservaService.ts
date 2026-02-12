import { api } from './api';

export interface ReservaDTO {
  id?: string;
  hospedeId: string;
  quartoId: string;
  dataCheckIn: string;
  dataCheckOut: string;
  valorTotal?: number;
  status?: 'ATIVA' | 'CANCELADA' | 'FINALIZADA';
  criadoEm?: string;
  atualizadoEm?: string;
  hospedeNome?: string;
  quartoNumero?: number;
}

export class ReservaService {
  private basePath = '/reservas';

  async criar(data: Omit<ReservaDTO, 'id' | 'valorTotal' | 'status' | 'criadoEm' | 'atualizadoEm' | 'hospedeNome' | 'quartoNumero'>): Promise<ReservaDTO> {
    const response = await api.post<ReservaDTO>(this.basePath, data);
    return response.data;
  }

  async listarTodas(): Promise<ReservaDTO[]> {
    const response = await api.get<ReservaDTO[]>(this.basePath);
    return response.data;
  }

  async listarAtivas(): Promise<ReservaDTO[]> {
    const response = await api.get<ReservaDTO[]>(`${this.basePath}/ativas`);
    return response.data;
  }

  async buscarPorId(id: string): Promise<ReservaDTO> {
    const response = await api.get<ReservaDTO>(`${this.basePath}/${id}`);
    return response.data;
  }

  async atualizar(id: string, data: Omit<ReservaDTO, 'id' | 'valorTotal' | 'status' | 'criadoEm' | 'atualizadoEm' | 'hospedeNome' | 'quartoNumero'>): Promise<ReservaDTO> {
    const response = await api.put<ReservaDTO>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async cancelar(id: string): Promise<void> {
    await api.patch(`${this.basePath}/${id}/cancelar`);
  }
}

export const reservaService = new ReservaService();
