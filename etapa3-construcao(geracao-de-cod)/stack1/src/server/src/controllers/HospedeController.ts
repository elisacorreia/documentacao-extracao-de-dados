import { Request, Response } from 'express';
import { HospedeService } from '../services/HospedeService';
import { AppError } from '../types';

export class HospedeController {
  private hospedeService: HospedeService;

  constructor() {
    this.hospedeService = new HospedeService();
  }

  // Criar hóspede
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const hospede = await this.hospedeService.create(req.body);
      res.status(201).json({
        success: true,
        data: hospede,
        message: 'Hóspede cadastrado com sucesso'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Erro interno do servidor'
        });
      }
    }
  };

  // Listar todos os hóspedes
  listAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const hospedes = await this.hospedeService.listAll();
      res.status(200).json({
        success: true,
        data: hospedes,
        count: hospedes.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao listar hóspedes'
      });
    }
  };

  // Buscar hóspede por ID
  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const hospede = await this.hospedeService.findById(id);
      res.status(200).json({
        success: true,
        data: hospede
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Erro ao buscar hóspede'
        });
      }
    }
  };
}
