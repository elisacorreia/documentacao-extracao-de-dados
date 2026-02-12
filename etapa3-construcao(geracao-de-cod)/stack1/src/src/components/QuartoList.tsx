import { useState, useEffect } from 'react';
import { quartoService } from '../services/quartoService';
import { Quarto } from '../types';

interface QuartoListProps {
  refreshTrigger?: number;
  apenasDisponiveis?: boolean;
}

export const QuartoList = ({ refreshTrigger, apenasDisponiveis = false }: QuartoListProps) => {
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadQuartos = async () => {
    try {
      setLoading(true);
      const data = apenasDisponiveis 
        ? await quartoService.listDisponiveis() 
        : await quartoService.listAll();
      setQuartos(data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar quartos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuartos();
  }, [refreshTrigger, apenasDisponiveis]);

  const getStatusBadge = (disponivel: boolean) => {
    if (disponivel) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          ✓ Disponível
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
        ✗ Ocupado
      </span>
    );
  };

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      'Standard': '🛏️',
      'Standard Duplo': '🛏️🛏️',
      'Standard Triplo': '🛏️🛏️🛏️',
      'Suite Executiva': '🏢',
      'Suite Luxo': '✨',
      'Suite Master': '👑',
      'Cobertura Premium': '🏆',
      'Apartamento Família': '👨‍👩‍👧‍👦'
    };
    return icons[tipo] || '🏨';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-center text-gray-600">Carregando quartos...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {apenasDisponiveis ? 'Quartos Disponíveis' : 'Lista de Quartos'}
      </h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {quartos.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          {apenasDisponiveis ? 'Nenhum quarto disponível no momento' : 'Nenhum quarto cadastrado'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quartos.map((quarto) => (
            <div 
              key={quarto.id} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTipoIcon(quarto.tipo)}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Quarto {quarto.numero}
                    </h3>
                    <p className="text-sm text-gray-600">{quarto.tipo}</p>
                  </div>
                </div>
                {getStatusBadge(quarto.disponivel)}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Preço da Diária</span>
                  <span className="text-xl font-bold text-green-600">
                    R$ {quarto.precoDiaria.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Cadastrado em: {new Date(quarto.criadoEm).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total de Quartos</p>
            <p className="text-2xl font-bold text-gray-800">{quartos.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Disponíveis</p>
            <p className="text-2xl font-bold text-green-600">
              {quartos.filter(q => q.disponivel).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
