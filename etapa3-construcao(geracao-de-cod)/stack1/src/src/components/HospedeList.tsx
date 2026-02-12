import { useState, useEffect } from 'react';
import { hospedeService } from '../services/hospedeService';
import { Hospede } from '../types';

interface HospedeListProps {
  refreshTrigger?: number;
}

export const HospedeList = ({ refreshTrigger }: HospedeListProps) => {
  const [hospedes, setHospedes] = useState<Hospede[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadHospedes = async () => {
    try {
      setLoading(true);
      const data = await hospedeService.listAll();
      setHospedes(data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar hóspedes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospedes();
  }, [refreshTrigger]);

  const formatCPF = (cpf: string): string => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-center text-gray-600">Carregando hóspedes...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Lista de Hóspedes</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {hospedes.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Nenhum hóspede cadastrado</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome Completo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-mail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Cadastro
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hospedes.map((hospede) => (
                <tr key={hospede.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {hospede.nome} {hospede.sobrenome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCPF(hospede.cpf)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{hospede.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(hospede.criadoEm).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        Total: {hospedes.length} hóspede{hospedes.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};
