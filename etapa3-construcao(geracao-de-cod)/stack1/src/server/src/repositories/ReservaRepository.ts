import prisma from '../database/prisma';
import { CreateReservaDTO, Reserva, UpdateReservaDTO } from '../types';

export class ReservaRepository {
  
  // Criar uma nova reserva
  async create(data: {
    hospedeId: string;
    quartoId: string;
    dataCheckIn: Date;
    dataCheckOut: Date;
    valorTotal: number;
  }): Promise<Reserva> {
    return await prisma.reserva.create({
      data,
      include: {
        hospede: true,
        quarto: true
      }
    });
  }

  // Buscar todas as reservas
  async findAll(): Promise<Reserva[]> {
    return await prisma.reserva.findMany({
      include: {
        hospede: true,
        quarto: true
      },
      orderBy: { criadoEm: 'desc' }
    });
  }

  // Buscar reservas ativas
  async findAtivas(): Promise<Reserva[]> {
    return await prisma.reserva.findMany({
      where: { status: 'ativa' },
      include: {
        hospede: true,
        quarto: true
      },
      orderBy: { dataCheckIn: 'asc' }
    });
  }

  // Buscar reserva por ID
  async findById(id: string): Promise<Reserva | null> {
    return await prisma.reserva.findUnique({
      where: { id },
      include: {
        hospede: true,
        quarto: true
      }
    });
  }

  // Atualizar reserva
  async update(id: string, data: {
    dataCheckIn?: Date;
    dataCheckOut?: Date;
    status?: string;
    valorTotal?: number;
  }): Promise<Reserva> {
    return await prisma.reserva.update({
      where: { id },
      data,
      include: {
        hospede: true,
        quarto: true
      }
    });
  }

  // Verificar se quarto tem reserva ativa
  async hasReservaAtiva(quartoId: string): Promise<boolean> {
    const count = await prisma.reserva.count({
      where: {
        quartoId,
        status: 'ativa'
      }
    });
    return count > 0;
  }
}
