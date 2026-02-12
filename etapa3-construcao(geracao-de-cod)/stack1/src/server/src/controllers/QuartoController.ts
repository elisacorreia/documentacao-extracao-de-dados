import { Request, Response } from 'express';
import { QuartoService } from '../services/QuartoService';
import { AppError } from '../types';

export class QuartoController {
  private quartoService: QuartoService;

  constructor() {
    this.quartoService = new QuartoService();
  }

  // Criar quarto
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const quarto = await this.quartoService.create(req.body);
      res.status(201).json({
        success: true,
        data: quarto,
        message: 'Quarto cadastrado com sucesso'
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

  // Listar todos os quartos
  listAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const quartos = await this.quartoService.listAll();
      res.status(200).json({
        success: true,
        data: quartos,
        count: quartos.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao listar quartos'
      });
    }
  };

  // Listar quartos disponíveis
  listDisponiveis = async (req: Request, res: Response): Promise<void> => {
    try {
      const quartos = await this.quartoService.listDisponiveis();
      res.status(200).json({
        success: true,
        data: quartos,
        count: quartos.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao listar quartos disponíveis'
      });
    }
  };

  // Buscar quarto por ID
  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const quarto = await this.quartoService.findById(id);
      res.status(200).json({
        success: true,
        data: quarto
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
          error: 'Erro ao buscar quarto'
        });
      }
    }
  };
}
