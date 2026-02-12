import { HospedeRepository } from '../repositories/HospedeRepository';
import { CreateHospedeDTO, Hospede, AppError } from '../types';
import { createHospedeSchema } from '../validators/schemas';

export class HospedeService {
  private hospedeRepository: HospedeRepository;

  constructor() {
    this.hospedeRepository = new HospedeRepository();
  }

  // Criar novo hóspede
  async create(data: CreateHospedeDTO): Promise<Hospede> {
    // Validar dados com Zod
    const validatedData = createHospedeSchema.parse(data);

    // Verificar se CPF já existe
    const cpfExiste = await this.hospedeRepository.existsByCPF(validatedData.cpf);
    if (cpfExiste) {
      throw new AppError('CPF já cadastrado no sistema', 409);
    }

    // Criar hóspede
    return await this.hospedeRepository.create(validatedData);
  }

  // Listar todos os hóspedes
  async listAll(): Promise<Hospede[]> {
    return await this.hospedeRepository.findAll();
  }

  // Buscar hóspede por ID
  async findById(id: string): Promise<Hospede> {
    const hospede = await this.hospedeRepository.findById(id);
    
    if (!hospede) {
      throw new AppError('Hóspede não encontrado', 404);
    }

    return hospede;
  }

  // Buscar hóspede por CPF
  async findByCPF(cpf: string): Promise<Hospede | null> {
    return await this.hospedeRepository.findByCPF(cpf);
  }
}
