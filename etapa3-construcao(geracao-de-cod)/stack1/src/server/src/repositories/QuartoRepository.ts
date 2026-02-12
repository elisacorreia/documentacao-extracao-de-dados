import prisma from '../database/prisma';
import { CreateQuartoDTO, Quarto } from '../types';

export class QuartoRepository {
  
  // Criar um novo quarto
  async create(data: CreateQuartoDTO): Promise<Quarto> {
    return await prisma.quarto.create({
      data
    });
  }

  // Buscar todos os quartos
  async findAll(): Promise<Quarto[]> {
    return await prisma.quarto.findMany({
      orderBy: { numero: 'asc' }
    });
  }

  // Buscar quarto por ID
  async findById(id: string): Promise<Quarto | null> {
    return await prisma.quarto.findUnique({
      where: { id }
    });
  }

  // Buscar quarto por número
  async findByNumero(numero: number): Promise<Quarto | null> {
    return await prisma.quarto.findUnique({
      where: { numero }
    });
  }

  // Atualizar disponibilidade do quarto
  async updateDisponibilidade(id: string, disponivel: boolean): Promise<Quarto> {
    return await prisma.quarto.update({
      where: { id },
      data: { disponivel }
    });
  }

  // Buscar quartos disponíveis
  async findDisponiveis(): Promise<Quarto[]> {
    return await prisma.quarto.findMany({
      where: { disponivel: true },
      orderBy: { numero: 'asc' }
    });
  }
}
