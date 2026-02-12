import { QuartoRepositoryInMemory } from '../repositories/QuartoRepository';
import { HospedeRepositoryInMemory } from '../repositories/HospedeRepository';
import { ReservaRepositoryInMemory } from '../repositories/ReservaRepository';
import { QuartoService } from './QuartoService';

const quartoRepository = new QuartoRepositoryInMemory();
const hospedeRepository = new HospedeRepositoryInMemory();
const reservaRepository = new ReservaRepositoryInMemory();

export const quartoService = new QuartoService(quartoRepository);

export { quartoRepository, hospedeRepository, reservaRepository };
