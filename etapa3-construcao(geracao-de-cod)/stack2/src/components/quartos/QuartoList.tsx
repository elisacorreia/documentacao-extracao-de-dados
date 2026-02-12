import { QuartoData, Disponibilidade } from '../../types';
import { Pencil } from 'lucide-react';

interface QuartoListProps {
  quartos: QuartoData[];
  onEdit: (quarto: QuartoData) => void;
  onDisponibilidadeChange: (id: string, disponibilidade: Disponibilidade) => void;
}

export function QuartoList({ quartos, onEdit, onDisponibilidadeChange }: QuartoListProps) {
  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarTipo = (tipo: string) => {
    const tipos: Record<string, string> = {
      BASICO: 'Básico',
      MODERNO: 'Moderno',
      LUXO: 'Luxo'
    };
    return tipos[tipo] || tipo;
  };

  const formatarDisponibilidade = (disp: string) => {
    const disponiblidades: Record<string, string> = {
      LIVRE: 'Livre',
      OCUPADO: 'Ocupado',
      MANUTENCAO: 'Manutenção',
      LIMPEZA: 'Limpeza'
    };
    return disponiblidades[disp] || disp;
  };

  const getDisponibilidadeColor = (disp: Disponibilidade) => {
    const colors: Record<Disponibilidade, string> = {
      [Disponibilidade.LIVRE]: 'bg-green-100 text-green-800 border-green-200',
      [Disponibilidade.OCUPADO]: 'bg-red-100 text-red-800 border-red-200',
      [Disponibilidade.MANUTENCAO]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [Disponibilidade.LIMPEZA]: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[disp];
  };

  if (quartos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">Nenhum quarto cadastrado</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Número</th>
              <th className="px-6 py-3 text-left font-semibold">Tipo</th>
              <th className="px-6 py-3 text-left font-semibold">Preço/Diária</th>
              <th className="px-6 py-3 text-left font-semibold">Disponibilidade</th>
              <th className="px-6 py-3 text-center font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {quartos.map((quarto) => (
              <tr key={quarto.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">{quarto.numero}</span>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {formatarTipo(quarto.tipo)}
                </td>
                <td className="px-6 py-4 text-gray-900">
                  {formatarPreco(quarto.precoPorDiaria)}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={quarto.disponibilidade}
                    onChange={(e) => onDisponibilidadeChange(quarto.id, e.target.value as Disponibilidade)}
                    className={`px-3 py-1 rounded-full border text-sm font-medium ${getDisponibilidadeColor(quarto.disponibilidade)}`}
                  >
                    <option value={Disponibilidade.LIVRE}>Livre</option>
                    <option value={Disponibilidade.OCUPADO}>Ocupado</option>
                    <option value={Disponibilidade.MANUTENCAO}>Manutenção</option>
                    <option value={Disponibilidade.LIMPEZA}>Limpeza</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onEdit(quarto)}
                    className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar quarto"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
