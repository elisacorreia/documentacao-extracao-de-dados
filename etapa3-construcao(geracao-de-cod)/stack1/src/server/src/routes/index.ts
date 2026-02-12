import { Router } from 'express';
import { HospedeController } from '../controllers/HospedeController';
import { QuartoController } from '../controllers/QuartoController';
import { ReservaController } from '../controllers/ReservaController';

const router = Router();

// Instanciar controllers
const hospedeController = new HospedeController();
const quartoController = new QuartoController();
const reservaController = new ReservaController();

// ========== ROTAS DE HÓSPEDES ==========
router.post('/hospedes', hospedeController.create);
router.get('/hospedes', hospedeController.listAll);
router.get('/hospedes/:id', hospedeController.findById);

// ========== ROTAS DE QUARTOS ==========
router.post('/quartos', quartoController.create);
router.get('/quartos', quartoController.listAll);
router.get('/quartos/disponiveis', quartoController.listDisponiveis);
router.get('/quartos/:id', quartoController.findById);

// ========== ROTAS DE RESERVAS ==========
router.post('/reservas', reservaController.create);
router.get('/reservas', reservaController.listAll);
router.get('/reservas/ativas', reservaController.listAtivas);
router.get('/reservas/:id', reservaController.findById);
router.put('/reservas/:id', reservaController.update);
router.patch('/reservas/:id/cancelar', reservaController.cancel);

export default router;
