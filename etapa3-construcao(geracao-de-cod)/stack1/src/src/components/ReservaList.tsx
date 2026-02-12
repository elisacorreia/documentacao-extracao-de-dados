import { useState, useEffect } from 'react';
import { reservaService } from '../services/reservaService';
import { Reserva } from '../types';

interface ReservaListProps {
  refreshTrigger?: number;
  apenasAtivas?: boolean;
}

export const ReservaList = ({ refreshTrigger, apenasAtivas = false }: ReservaListProps) => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    dataCheckIn: '',
    dataCheckOut: ''
  });

  const loadReservas = async () => {
    try {
      setLoading(true);
      const data = apenasAtivas 
        ? await reservaService.listAtivas() 
        : await reservaService.listAll();
      setReservas(data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservas();
  }, [refreshTrigger, apenasAtivas]);

  const handleCancelReserva = async (id: string) => {
    if (!window.confirm('Deseja realmente cancelar esta reserva?')) return;

    try {
      await reservaService.cancel(id);
      loadReservas();
      alert('Reserva cancelada com sucesso!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao cancelar reserva');
    }
  };

  const handleEditClick = (reserva: Reserva) => {
    setEditingId(reserva.id);
    setEditData({
      dataCheckIn: reserva.dataCheckIn.split('T')[0],
      dataCheckOut: reserva.dataCheckOut.split('T')[0]
    });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await reservaService.update(id, editData);
      setEditingId(null);
      loadReservas();
      alert('Reserva atualizada com sucesso!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar reserva');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      ativa: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ativa' },
      cancelada: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' },
      concluida: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Concluída' }
    };

    const config = statusMap[status] || statusMap.ativa;

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-center text-gray-600">Carregando reservas...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {apenasAtivas ? 'Reservas Ativas' : 'Todas as Reservas'}
      </h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {reservas.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Nenhuma reserva encontrada</p>
      ) : (
        <div className="space-y-4">
          {reservas.map((reserva) => (
            <div key={reserva.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {reserva.hospede?.nome} {reserva.hospede?.sobrenome}
                  </h3>
                  <p className="text-sm text-gray-600">
                    CPF: {reserva.hospede?.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                  </p>
                </div>
                {getStatusBadge(reserva.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-600">Quarto</p>
                  <p className="font-medium">
                    Nº {reserva.quarto?.numero} - {reserva.quarto?.tipo}
                  </p>
                  <p className="text-sm text-gray-600">
                    {reserva.quarto?.disponivel ? (
                      <span className="text-green-600">✓ Disponível</span>
                    ) : (
                      <span className="text-red-600">✗ Ocupado</span>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="font-medium text-lg text-green-600">
                    R$ {reserva.valorTotal.toFixed(2)}
                  </p>
                </div>
              </div>

              {editingId === reserva.id ? (
                <div className="space-y-2 mb-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600">Check-in</label>
                      <input
                        type="date"
                        value={editData.dataCheckIn}
                        onChange={(e) => setEditData({ ...editData, dataCheckIn: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Check-out</label>
                      <input
                        type="date"
                        value={editData.dataCheckOut}
                        onChange={(e) => setEditData({ ...editData, dataCheckOut: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(reserva.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Check-in</p>
                    <p className="font-medium">
                      {new Date(reserva.dataCheckIn).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Check-out</p>
                    <p className="font-medium">
                      {new Date(reserva.dataCheckOut).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}

              {reserva.status === 'ativa' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEditClick(reserva)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Editar Datas
                  </button>
                  <button
                    onClick={() => handleCancelReserva(reserva.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Cancelar Reserva
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        Total: {reservas.length} reserva{reservas.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};
