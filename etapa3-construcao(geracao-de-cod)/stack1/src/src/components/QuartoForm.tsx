import { useState } from 'react';
import { quartoService } from '../services/quartoService';
import { CreateQuartoDTO } from '../types';

interface QuartoFormProps {
  onSuccess?: () => void;
}

export const QuartoForm = ({ onSuccess }: QuartoFormProps) => {
  const [formData, setFormData] = useState<CreateQuartoDTO>({
    numero: 0,
    tipo: '',
    precoDiaria: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'numero') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else if (name === 'precoDiaria') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await quartoService.create(formData);
      setSuccess('Quarto cadastrado com sucesso!');
      setFormData({ numero: 0, tipo: '', precoDiaria: 0 });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar quarto');
    } finally {
      setLoading(false);
    }
  };

  const tiposQuarto = [
    'Standard',
    'Standard Duplo',
    'Standard Triplo',
    'Suite Executiva',
    'Suite Luxo',
    'Suite Master',
    'Cobertura Premium',
    'Apartamento Família'
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Cadastrar Quarto</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número do Quarto
          </label>
          <input
            type="number"
            name="numero"
            value={formData.numero || ''}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 101"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo do Quarto
          </label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione o tipo</option>
            {tiposQuarto.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preço da Diária (R$)
          </label>
          <input
            type="number"
            name="precoDiaria"
            value={formData.precoDiaria || ''}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 150.00"
          />
        </div>

        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Informação:</strong> O quarto será criado como <strong>disponível</strong> automaticamente.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar Quarto'}
        </button>
      </form>
    </div>
  );
};
