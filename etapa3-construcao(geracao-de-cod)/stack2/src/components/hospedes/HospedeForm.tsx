import { useState } from 'react';
import { HospedeDTO } from '../../services/HospedeService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle } from 'lucide-react';

interface HospedeFormProps {
  hospede?: HospedeDTO;
  onSubmit: (data: Omit<HospedeDTO, 'id' | 'criadoEm'>) => Promise<void>;
  onCancel: () => void;
}

export function HospedeForm({ hospede, onSubmit, onCancel }: HospedeFormProps) {
  const [formData, setFormData] = useState({
    nome: hospede?.nome || '',
    sobrenome: hospede?.sobrenome || '',
    cpf: hospede?.cpf || '',
    email: hospede?.email || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  const validateCPF = (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false;
    return true;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatCPF = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 11);
    
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 3)}.${limited.slice(3)}`;
    if (limited.length <= 9) return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.sobrenome.trim()) {
      newErrors.sobrenome = 'Sobrenome é obrigatório';
    } else if (formData.sobrenome.trim().length < 2) {
      newErrors.sobrenome = 'Sobrenome deve ter pelo menos 2 caracteres';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Remove formatação do CPF antes de enviar
      const cpfLimpo = formData.cpf.replace(/\D/g, '');
      await onSubmit({ ...formData, cpf: cpfLimpo });
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Erro ao salvar hóspede');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    if (field === 'cpf') {
      setFormData({ ...formData, [field]: formatCPF(value) });
    } else {
      setFormData({ ...formData, [field]: value });
    }
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{hospede ? 'Editar Hóspede' : 'Novo Hóspede'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                className={errors.nome ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sobrenome">Sobrenome *</Label>
              <Input
                id="sobrenome"
                value={formData.sobrenome}
                onChange={(e) => handleChange('sobrenome', e.target.value)}
                className={errors.sobrenome ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.sobrenome && <p className="text-sm text-red-500">{errors.sobrenome}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
                className={errors.cpf ? 'border-red-500' : ''}
                disabled={isSubmitting || !!hospede}
              />
              {errors.cpf && <p className="text-sm text-red-500">{errors.cpf}</p>}
              {hospede && <p className="text-xs text-gray-500">CPF não pode ser alterado</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="exemplo@email.com"
                className={errors.email ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : hospede ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
