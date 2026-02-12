import { QuartoRepository } from '../repositories/QuartoRepository';
import { CreateQuartoDTO, Quarto, AppError } from '../types';
import { createQuartoSchema } from '../validators/schemas';

export class QuartoService {
  private quartoRepository: QuartoRepository;

  constructor() {
    this.quartoRepository = new QuartoRepository();
  }

  // Criar novo quarto
  async create(data: CreateQuartoDTO): Promise<Quarto> {
    // Validar dados com Zod
    const validatedData = createQuartoSchema.parse(data);

    // Verificar se número do quarto já existe
    const quartoExiste = await this.quartoRepository.findByNumero(validatedData.numero);
    if (quartoExiste) {
      throw new AppError('Número de quarto já cadastrado', 409);
    }

    // Criar quarto
    return await this.quartoRepository.create(validatedData);
  }

  // Listar todos os quartos
  async listAll(): Promise<Quarto[]> {
    return await this.quartoRepository.findAll();
  }

  // Listar quartos disponíveis
  async listDisponiveis(): Promise<Quarto[]> {
    return await this.quartoRepository.findDisponiveis();
  }

  // Buscar quarto por ID
  async findById(id: string): Promise<Quarto> {
    const quarto = await this.quartoRepository.findById(id);
    
    if (!quarto) {
      throw new AppError('Quarto não encontrado', 404);
    }

    return quarto;
  }

  // Atualizar disponibilidade
  async updateDisponibilidade(id: string, disponivel: boolean): Promise<Quarto> {
    // Verificar se quarto existe
    await this.findById(id);

    return await this.quartoRepository.updateDisponibilidade(id, disponivel);
  }
}
