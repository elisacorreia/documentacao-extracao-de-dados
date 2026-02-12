import { useState, useEffect } from 'react';
import { reservaService } from '../services/reservaService';
import { hospedeService } from '../services/hospedeService';
import { quartoService } from '../services/quartoService';
import { CreateReservaDTO, Hospede, Quarto } from '../types';

interface ReservaFormProps {
  onSuccess?: () => void;
}

export const ReservaForm = ({ onSuccess }: ReservaFormProps) => {
  const [hospedes, setHospedes] = useState<Hospede[]>([]);
  const [quartosDisponiveis, setQuartosDisponiveis] = useState<Quarto[]>([]);
  const [formData, setFormData] = useState<CreateReservaDTO>({
    hospedeId: '',
    quartoId: '',
    dataCheckIn: '',
    dataCheckOut: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [hospedesData, quartosData] = await Promise.all([
        hospedeService.listAll(),
        quartoService.listDisponiveis()
      ]);
      setHospedes(hospedesData);
      setQuartosDisponiveis(quartosData);
    } catch (err) {
      setError('Erro ao carregar dados');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await reservaService.create(formData);
      setSuccess('Reserva criada com sucesso!');
      setFormData({
        hospedeId: '',
        quartoId: '',
        dataCheckIn: '',
        dataCheckOut: ''
      });
      loadData(); // Recarregar quartos disponíveis
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Nova Reserva</h2>
      
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
            Hóspede
          </label>
          <select
            name="hospedeId"
            value={formData.hospedeId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione um hóspede</option>
            {hospedes.map((hospede) => (
              <option key={hospede.id} value={hospede.id}>
                {hospede.nome} {hospede.sobrenome} - CPF: {hospede.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quarto Disponível
          </label>
          <select
            name="quartoId"
            value={formData.quartoId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione um quarto</option>
            {quartosDisponiveis.map((quarto) => (
              <option key={quarto.id} value={quarto.id}>
                Quarto {quarto.numero} - {quarto.tipo} - R$ {quarto.precoDiaria.toFixed(2)}/diária
              </option>
            ))}
          </select>
          {quartosDisponiveis.length === 0 && (
            <p className="text-sm text-red-600 mt-1">Não há quartos disponíveis no momento</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data de Check-in
          </label>
          <input
            type="date"
            name="dataCheckIn"
            value={formData.dataCheckIn}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data de Check-out
          </label>
          <input
            type="date"
            name="dataCheckOut"
            value={formData.dataCheckOut}
            onChange={handleChange}
            required
            min={formData.dataCheckIn || new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || quartosDisponiveis.length === 0}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Criando reserva...' : 'Criar Reserva'}
        </button>
      </form>
    </div>
  );
};
