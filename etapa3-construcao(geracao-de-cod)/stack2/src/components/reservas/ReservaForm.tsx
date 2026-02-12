import { useState, useEffect } from 'react';
import { ReservaDTO } from '../../services/ReservaService';
import { HospedeDTO } from '../../services/HospedeService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertCircle } from 'lucide-react';

interface QuartoDisponivel {
  id: string;
  numero: number;
  tipo: string;
  precoDiaria: number;
}

interface ReservaFormProps {
  reserva?: ReservaDTO;
  hospedes: HospedeDTO[];
  quartos: QuartoDisponivel[];
  onSubmit: (data: Omit<ReservaDTO, 'id' | 'valorTotal' | 'status' | 'criadoEm' | 'atualizadoEm' | 'hospedeNome' | 'quartoNumero'>) => Promise<void>;
  onCancel: () => void;
}

export function ReservaForm({ reserva, hospedes, quartos, onSubmit, onCancel }: ReservaFormProps) {
  const [formData, setFormData] = useState({
    hospedeId: reserva?.hospedeId || '',
    quartoId: reserva?.quartoId || '',
    dataCheckIn: reserva?.dataCheckIn ? reserva.dataCheckIn.split('T')[0] : '',
    dataCheckOut: reserva?.dataCheckOut ? reserva.dataCheckOut.split('T')[0] : '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [valorEstimado, setValorEstimado] = useState<number | null>(null);

  useEffect(() => {
    calcularValorEstimado();
  }, [formData.quartoId, formData.dataCheckIn, formData.dataCheckOut]);

  const calcularValorEstimado = () => {
    if (!formData.quartoId || !formData.dataCheckIn || !formData.dataCheckOut) {
      setValorEstimado(null);
      return;
    }

    const quarto = quartos.find(q => q.id === formData.quartoId);
    if (!quarto) {
      setValorEstimado(null);
      return;
    }

    const checkIn = new Date(formData.dataCheckIn);
    const checkOut = new Date(formData.dataCheckOut);
    const dias = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (dias > 0) {
      setValorEstimado(dias * quarto.precoDiaria);
    } else {
      setValorEstimado(null);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.hospedeId) {
      newErrors.hospedeId = 'Selecione um hóspede';
    }

    if (!formData.quartoId) {
      newErrors.quartoId = 'Selecione um quarto';
    }

    if (!formData.dataCheckIn) {
      newErrors.dataCheckIn = 'Data de check-in é obrigatória';
    }

    if (!formData.dataCheckOut) {
      newErrors.dataCheckOut = 'Data de check-out é obrigatória';
    }

    if (formData.dataCheckIn && formData.dataCheckOut) {
      const checkIn = new Date(formData.dataCheckIn);
      const checkOut = new Date(formData.dataCheckOut);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (checkIn < hoje && !reserva) {
        newErrors.dataCheckIn = 'Data de check-in não pode ser no passado';
      }

      if (checkOut <= checkIn) {
        newErrors.dataCheckOut = 'Data de check-out deve ser posterior ao check-in';
      }
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
      await onSubmit(formData);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Erro ao salvar reserva');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{reserva ? 'Editar Reserva' : 'Nova Reserva'}</CardTitle>
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
              <Label htmlFor="hospedeId">Hóspede *</Label>
              <Select
                value={formData.hospedeId}
                onValueChange={(value) => handleChange('hospedeId', value)}
                disabled={isSubmitting || !!reserva}
              >
                <SelectTrigger className={errors.hospedeId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o hóspede" />
                </SelectTrigger>
                <SelectContent>
                  {hospedes.map((hospede) => (
                    <SelectItem key={hospede.id} value={hospede.id!}>
                      {hospede.nome} {hospede.sobrenome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.hospedeId && <p className="text-sm text-red-500">{errors.hospedeId}</p>}
              {reserva && <p className="text-xs text-gray-500">Hóspede não pode ser alterado</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quartoId">Quarto *</Label>
              <Select
                value={formData.quartoId}
                onValueChange={(value) => handleChange('quartoId', value)}
                disabled={isSubmitting || !!reserva}
              >
                <SelectTrigger className={errors.quartoId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o quarto" />
                </SelectTrigger>
                <SelectContent>
                  {quartos.map((quarto) => (
                    <SelectItem key={quarto.id} value={quarto.id}>
                      Quarto {quarto.numero} - {quarto.tipo} (R$ {quarto.precoDiaria.toFixed(2)}/dia)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.quartoId && <p className="text-sm text-red-500">{errors.quartoId}</p>}
              {reserva && <p className="text-xs text-gray-500">Quarto não pode ser alterado</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataCheckIn">Data de Check-in *</Label>
              <Input
                id="dataCheckIn"
                type="date"
                value={formData.dataCheckIn}
                onChange={(e) => handleChange('dataCheckIn', e.target.value)}
                className={errors.dataCheckIn ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.dataCheckIn && <p className="text-sm text-red-500">{errors.dataCheckIn}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataCheckOut">Data de Check-out *</Label>
              <Input
                id="dataCheckOut"
                type="date"
                value={formData.dataCheckOut}
                onChange={(e) => handleChange('dataCheckOut', e.target.value)}
                className={errors.dataCheckOut ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.dataCheckOut && <p className="text-sm text-red-500">{errors.dataCheckOut}</p>}
            </div>
          </div>

          {valorEstimado !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Valor estimado:</strong> R$ {valorEstimado.toFixed(2)}
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : reserva ? 'Atualizar' : 'Criar Reserva'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
