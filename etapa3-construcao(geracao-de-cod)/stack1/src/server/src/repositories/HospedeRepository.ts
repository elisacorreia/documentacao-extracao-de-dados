import prisma from '../database/prisma';
import { CreateHospedeDTO, Hospede } from '../types';

export class HospedeRepository {
  
  // Criar um novo hóspede
  async create(data: CreateHospedeDTO): Promise<Hospede> {
    return await prisma.hospede.create({
      data: {
        nome: data.nome,
        sobrenome: data.sobrenome,
        cpf: data.cpf.replace(/\D/g, ''), // Remove formatação
        email: data.email.toLowerCase()
      }
    });
  }

  // Buscar todos os hóspedes
  async findAll(): Promise<Hospede[]> {
    return await prisma.hospede.findMany({
      orderBy: { criadoEm: 'desc' }
    });
  }

  // Buscar hóspede por ID
  async findById(id: string): Promise<Hospede | null> {
    return await prisma.hospede.findUnique({
      where: { id }
    });
  }

  // Buscar hóspede por CPF
  async findByCPF(cpf: string): Promise<Hospede | null> {
    return await prisma.hospede.findUnique({
      where: { cpf: cpf.replace(/\D/g, '') }
    });
  }

  // Verificar se CPF já existe
  async existsByCPF(cpf: string): Promise<boolean> {
    const hospede = await this.findByCPF(cpf);
    return hospede !== null;
  }
}
