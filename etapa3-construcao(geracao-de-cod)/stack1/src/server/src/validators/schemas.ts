import { z } from 'zod';

// Validador de CPF
function validarCPF(cpf: string): boolean {
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  if (cpfLimpo.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let digito1 = 11 - (soma % 11);
  if (digito1 >= 10) digito1 = 0;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  let digito2 = 11 - (soma % 11);
  if (digito2 >= 10) digito2 = 0;

  return cpfLimpo.charAt(9) === String(digito1) && cpfLimpo.charAt(10) === String(digito2);
}

// Schema de validação para Hóspede
export const createHospedeSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo'),
  sobrenome: z.string()
    .min(2, 'Sobrenome deve ter no mínimo 2 caracteres')
    .max(100, 'Sobrenome muito longo'),
  cpf: z.string()
    .refine(validarCPF, 'CPF inválido'),
  email: z.string()
    .email('E-mail inválido')
    .toLowerCase()
});

// Schema de validação para Quarto
export const createQuartoSchema = z.object({
  numero: z.number()
    .int('Número do quarto deve ser um inteiro')
    .positive('Número do quarto deve ser positivo'),
  tipo: z.string()
    .min(3, 'Tipo do quarto deve ter no mínimo 3 caracteres'),
  precoDiaria: z.number()
    .positive('Preço da diária deve ser positivo')
});

// Schema de validação para Reserva
export const createReservaSchema = z.object({
  hospedeId: z.string().uuid('ID do hóspede inválido'),
  quartoId: z.string().uuid('ID do quarto inválido'),
  dataCheckIn: z.string()
    .datetime('Data de check-in inválida')
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)')),
  dataCheckOut: z.string()
    .datetime('Data de check-out inválida')
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)'))
});

// Schema de validação para atualização de Reserva
export const updateReservaSchema = z.object({
  dataCheckIn: z.string()
    .datetime('Data de check-in inválida')
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido'))
    .optional(),
  dataCheckOut: z.string()
    .datetime('Data de check-out inválida')
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido'))
    .optional(),
  status: z.enum(['ativa', 'cancelada', 'concluida']).optional()
});
