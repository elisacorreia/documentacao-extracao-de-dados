import { useState, useEffect } from 'react';
import { TipoQuarto, TipoCama, QuartoData } from '../../types';
import { Plus, X } from 'lucide-react';

interface QuartoFormProps {
  quarto?: QuartoData;
  onSubmit: (data: QuartoFormData) => Promise<void>;
  onCancel: () => void;
}

export interface QuartoFormData {
  numero: number;
  capacidade: number;
  tipo: TipoQuarto;
  precoPorDiaria: number;
  temFrigobar: boolean;
  temCafeDaManha: boolean;
  temArCondicionado: boolean;
  temTV: boolean;
  camas: TipoCama[];
}

export function QuartoForm({ quarto, onSubmit, onCancel }: QuartoFormProps) {
  const [formData, setFormData] = useState<QuartoFormData>({
    numero: quarto?.numero || 0,
    capacidade: quarto?.capacidade || 1,
    tipo: quarto?.tipo || TipoQuarto.BASICO,
    precoPorDiaria: quarto?.precoPorDiaria || 0,
    temFrigobar: quarto?.temFrigobar || false,
    temCafeDaManha: quarto?.temCafeDaManha || false,
    temArCondicionado: quarto?.temArCondicionado || false,
    temTV: quarto?.temTV || false,
    camas: quarto?.camas.map(c => c.tipo) || []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (formData.camas.length === 0) {
      setError('Adicione pelo menos uma cama');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar quarto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const adicionarCama = (tipo: TipoCama) => {
    setFormData(prev => ({
      ...prev,
      camas: [...prev.camas, tipo]
    }));
  };

  const removerCama = (index: number) => {
    setFormData(prev => ({
      ...prev,
      camas: prev.camas.filter((_, i) => i !== index)
    }));
  };

  const tiposCamaDisponiveis = [
    { value: TipoCama.SOLTEIRO, label: 'Solteiro' },
    { value: TipoCama.CASAL_KING, label: 'Casal King' },
    { value: TipoCama.CASAL_QUEEN, label: 'Casal Queen' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="mb-6">{quarto ? 'Editar Quarto' : 'Cadastrar Quarto'}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número do Quarto *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.numero || ''}
              onChange={e => setFormData(prev => ({ ...prev, numero: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidade *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.capacidade || ''}
              onChange={e => setFormData(prev => ({ ...prev, capacidade: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo do Quarto *
            </label>
            <select
              required
              value={formData.tipo}
              onChange={e => setFormData(prev => ({ ...prev, tipo: e.target.value as TipoQuarto }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value={TipoQuarto.BASICO}>Básico</option>
              <option value={TipoQuarto.MODERNO}>Moderno</option>
              <option value={TipoQuarto.LUXO}>Luxo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço por Diária (R$) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.precoPorDiaria || ''}
              onChange={e => setFormData(prev => ({ ...prev, precoPorDiaria: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="mb-3">Amenidades</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.temFrigobar}
                onChange={e => setFormData(prev => ({ ...prev, temFrigobar: e.target.checked }))}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm">Frigobar</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.temCafeDaManha}
                onChange={e => setFormData(prev => ({ ...prev, temCafeDaManha: e.target.checked }))}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm">Café da Manhã</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.temArCondicionado}
                onChange={e => setFormData(prev => ({ ...prev, temArCondicionado: e.target.checked }))}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm">Ar-condicionado</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.temTV}
                onChange={e => setFormData(prev => ({ ...prev, temTV: e.target.checked }))}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm">TV</span>
            </label>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="mb-3">Camas *</h3>
          
          <div className="flex gap-2 mb-3">
            {tiposCamaDisponiveis.map(tipo => (
              <button
                key={tipo.value}
                type="button"
                onClick={() => adicionarCama(tipo.value)}
                className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {tipo.label}
              </button>
            ))}
          </div>

          {formData.camas.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Nenhuma cama adicionada</p>
          ) : (
            <div className="space-y-2">
              {formData.camas.map((cama, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm">
                    {tiposCamaDisponiveis.find(t => t.value === cama)?.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => removerCama(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
