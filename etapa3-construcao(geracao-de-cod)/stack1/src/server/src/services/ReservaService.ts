import { ReservaRepository } from '../repositories/ReservaRepository';
import { QuartoRepository } from '../repositories/QuartoRepository';
import { HospedeRepository } from '../repositories/HospedeRepository';
import { CreateReservaDTO, Reserva, UpdateReservaDTO, AppError } from '../types';
import { createReservaSchema, updateReservaSchema } from '../validators/schemas';

export class ReservaService {
  private reservaRepository: ReservaRepository;
  private quartoRepository: QuartoRepository;
  private hospedeRepository: HospedeRepository;

  constructor() {
    this.reservaRepository = new ReservaRepository();
    this.quartoRepository = new QuartoRepository();
    this.hospedeRepository = new HospedeRepository();
  }

  // Criar nova reserva
  async create(data: CreateReservaDTO): Promise<Reserva> {
    // Validar dados com Zod
    const validatedData = createReservaSchema.parse(data);

    // Verificar se hóspede existe
    const hospede = await this.hospedeRepository.findById(validatedData.hospedeId);
    if (!hospede) {
      throw new AppError('Hóspede não encontrado', 404);
    }

    // Verificar se quarto existe
    const quarto = await this.quartoRepository.findById(validatedData.quartoId);
    if (!quarto) {
      throw new AppError('Quarto não encontrado', 404);
    }

    // Verificar se quarto está disponível
    if (!quarto.disponivel) {
      throw new AppError('Quarto não está disponível para reserva', 400);
    }

    // Verificar se quarto já tem reserva ativa
    const hasReservaAtiva = await this.reservaRepository.hasReservaAtiva(validatedData.quartoId);
    if (hasReservaAtiva) {
      throw new AppError('Quarto já possui uma reserva ativa', 400);
    }

    // Calcular número de diárias
    const checkIn = new Date(validatedData.dataCheckIn);
    const checkOut = new Date(validatedData.dataCheckOut);

    // Validar datas
    if (checkOut <= checkIn) {
      throw new AppError('Data de check-out deve ser posterior à data de check-in', 400);
    }

    const diarias = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const valorTotal = diarias * quarto.precoDiaria;

    // Criar reserva
    const reserva = await this.reservaRepository.create({
      hospedeId: validatedData.hospedeId,
      quartoId: validatedData.quartoId,
      dataCheckIn: checkIn,
      dataCheckOut: checkOut,
      valorTotal
    });

    // Atualizar disponibilidade do quarto
    await this.quartoRepository.updateDisponibilidade(validatedData.quartoId, false);

    return reserva;
  }

  // Listar todas as reservas
  async listAll(): Promise<Reserva[]> {
    return await this.reservaRepository.findAll();
  }

  // Listar reservas ativas
  async listAtivas(): Promise<Reserva[]> {
    return await this.reservaRepository.findAtivas();
  }

  // Buscar reserva por ID
  async findById(id: string): Promise<Reserva> {
    const reserva = await this.reservaRepository.findById(id);
    
    if (!reserva) {
      throw new AppError('Reserva não encontrada', 404);
    }

    return reserva;
  }

  // Atualizar reserva
  async update(id: string, data: UpdateReservaDTO): Promise<Reserva> {
    // Validar dados com Zod
    const validatedData = updateReservaSchema.parse(data);

    // Verificar se reserva existe
    const reservaExistente = await this.findById(id);

    let valorTotal = reservaExistente.valorTotal;

    // Se alterar as datas, recalcular valor
    if (validatedData.dataCheckIn || validatedData.dataCheckOut) {
      const checkIn = validatedData.dataCheckIn 
        ? new Date(validatedData.dataCheckIn) 
        : reservaExistente.dataCheckIn;
      
      const checkOut = validatedData.dataCheckOut 
        ? new Date(validatedData.dataCheckOut) 
        : reservaExistente.dataCheckOut;

      if (checkOut <= checkIn) {
        throw new AppError('Data de check-out deve ser posterior à data de check-in', 400);
      }

      const quarto = await this.quartoRepository.findById(reservaExistente.quartoId);
      const diarias = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      valorTotal = diarias * quarto!.precoDiaria;
    }

    const updateData: any = {
      valorTotal
    };

    if (validatedData.dataCheckIn) {
      updateData.dataCheckIn = new Date(validatedData.dataCheckIn);
    }
    if (validatedData.dataCheckOut) {
      updateData.dataCheckOut = new Date(validatedData.dataCheckOut);
    }
    if (validatedData.status) {
      updateData.status = validatedData.status;

      // Se cancelar ou concluir reserva, liberar quarto
      if (validatedData.status === 'cancelada' || validatedData.status === 'concluida') {
        await this.quartoRepository.updateDisponibilidade(reservaExistente.quartoId, true);
      }
    }

    return await this.reservaRepository.update(id, updateData);
  }

  // Cancelar reserva
  async cancel(id: string): Promise<Reserva> {
    return await this.update(id, { status: 'cancelada' });
  }
}
