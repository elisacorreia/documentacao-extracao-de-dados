import { Request, Response } from 'express';
import { ReservaService } from '../services/ReservaService';
import { AppError } from '../types';

export class ReservaController {
  private reservaService: ReservaService;

  constructor() {
    this.reservaService = new ReservaService();
  }

  // Criar reserva
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const reserva = await this.reservaService.create(req.body);
      res.status(201).json({
        success: true,
        data: reserva,
        message: 'Reserva criada com sucesso'
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

  // Listar todas as reservas
  listAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const reservas = await this.reservaService.listAll();
      res.status(200).json({
        success: true,
        data: reservas,
        count: reservas.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao listar reservas'
      });
    }
  };

  // Listar reservas ativas
  listAtivas = async (req: Request, res: Response): Promise<void> => {
    try {
      const reservas = await this.reservaService.listAtivas();
      res.status(200).json({
        success: true,
        data: reservas,
        count: reservas.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao listar reservas ativas'
      });
    }
  };

  // Buscar reserva por ID
  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const reserva = await this.reservaService.findById(id);
      res.status(200).json({
        success: true,
        data: reserva
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
          error: 'Erro ao buscar reserva'
        });
      }
    }
  };

  // Atualizar reserva
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const reserva = await this.reservaService.update(id, req.body);
      res.status(200).json({
        success: true,
        data: reserva,
        message: 'Reserva atualizada com sucesso'
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
          error: 'Erro ao atualizar reserva'
        });
      }
    }
  };

  // Cancelar reserva
  cancel = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const reserva = await this.reservaService.cancel(id);
      res.status(200).json({
        success: true,
        data: reserva,
        message: 'Reserva cancelada com sucesso'
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
          error: 'Erro ao cancelar reserva'
        });
      }
    }
  };
}
