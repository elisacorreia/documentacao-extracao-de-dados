import { Quarto } from '../domain/entities/Quarto';
import { Cama } from '../domain/entities/Cama';
import { IQuartoRepository } from '../repositories/QuartoRepository';
import { TipoQuarto, TipoCama, Disponibilidade, QuartoData } from '../types';

export interface CriarQuartoDTO {
  numero: number;
  capacidade: number;
  tipo: TipoQuarto;
  precoPorDiaria: number;
  temFrigobar: boolean;
  temCafeDaManha: boolean;
  temArCondicionado: boolean;
  temTV: boolean;
  camas: TipoCama[];
}

export interface AtualizarQuartoDTO {
  numero?: number;
  capacidade?: number;
  tipo?: TipoQuarto;
  precoPorDiaria?: number;
  temFrigobar?: boolean;
  temCafeDaManha?: boolean;
  temArCondicionado?: boolean;
  temTV?: boolean;
  camas?: TipoCama[];
}

export class QuartoService {
  constructor(private quartoRepository: IQuartoRepository) {}

  async criarQuarto(dto: CriarQuartoDTO): Promise<QuartoData> {
    const existeNumero = await this.quartoRepository.existeNumero(dto.numero);
    if (existeNumero) {
      throw new Error('Já existe um quarto com este número');
    }

    const camas = dto.camas.map(tipo => new Cama(tipo));

    const quarto = new Quarto({
      numero: dto.numero,
      capacidade: dto.capacidade,
      tipo: dto.tipo,
      precoPorDiaria: dto.precoPorDiaria,
      temFrigobar: dto.temFrigobar,
      temCafeDaManha: dto.temCafeDaManha,
      temArCondicionado: dto.temArCondicionado,
      temTV: dto.temTV,
      camas
    });

    const validation = quarto.validar();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const quartoCriado = await this.quartoRepository.criar(quarto);
    return quartoCriado.toData();
  }

  async atualizarQuarto(id: string, dto: AtualizarQuartoDTO): Promise<QuartoData> {
    const quarto = await this.quartoRepository.buscarPorId(id);
    if (!quarto) {
      throw new Error('Quarto não encontrado');
    }

    if (dto.numero !== undefined) {
      const existeNumero = await this.quartoRepository.existeNumero(dto.numero, id);
      if (existeNumero) {
        throw new Error('Já existe um quarto com este número');
      }
    }

    const camas = dto.camas ? dto.camas.map(tipo => new Cama(tipo)) : undefined;

    quarto.atualizarDados({
      numero: dto.numero,
      capacidade: dto.capacidade,
      tipo: dto.tipo,
      precoPorDiaria: dto.precoPorDiaria,
      temFrigobar: dto.temFrigobar,
      temCafeDaManha: dto.temCafeDaManha,
      temArCondicionado: dto.temArCondicionado,
      temTV: dto.temTV,
      camas
    });

    const validation = quarto.validar();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const quartoAtualizado = await this.quartoRepository.atualizar(id, quarto);
    return quartoAtualizado.toData();
  }

  async listarQuartos(): Promise<QuartoData[]> {
    const quartos = await this.quartoRepository.buscarTodos();
    return quartos.map(q => q.toData());
  }

  async buscarQuarto(id: string): Promise<QuartoData> {
    const quarto = await this.quartoRepository.buscarPorId(id);
    if (!quarto) {
      throw new Error('Quarto não encontrado');
    }
    return quarto.toData();
  }

  async alterarDisponibilidade(id: string, disponibilidade: Disponibilidade): Promise<QuartoData> {
    const quarto = await this.quartoRepository.buscarPorId(id);
    if (!quarto) {
      throw new Error('Quarto não encontrado');
    }

    quarto.alterarDisponibilidade(disponibilidade);
    const quartoAtualizado = await this.quartoRepository.atualizar(id, quarto);
    return quartoAtualizado.toData();
  }

  async listarPorDisponibilidade(disponibilidade: Disponibilidade): Promise<QuartoData[]> {
    const quartos = await this.quartoRepository.buscarPorDisponibilidade(disponibilidade);
    return quartos.map(q => q.toData());
  }
}
