import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { QuartoForm, QuartoFormData } from './components/quartos/QuartoForm';
import { QuartoList } from './components/quartos/QuartoList';
import { quartoService } from './services/ServiceFactory';
import { QuartoData, Disponibilidade } from './types';
import { Plus } from 'lucide-react';

export default function App() {
  const [quartos, setQuartos] = useState<QuartoData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [quartoEmEdicao, setQuartoEmEdicao] = useState<QuartoData | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarQuartos();
  }, []);

  const carregarQuartos = async () => {
    try {
      const dados = await quartoService.listarQuartos();
      setQuartos(dados);
    } catch (error) {
      console.error('Erro ao carregar quartos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: QuartoFormData) => {
    if (quartoEmEdicao) {
      await quartoService.atualizarQuarto(quartoEmEdicao.id, data);
    } else {
      await quartoService.criarQuarto(data);
    }
    
    await carregarQuartos();
    setShowForm(false);
    setQuartoEmEdicao(undefined);
  };

  const handleEdit = (quarto: QuartoData) => {
    setQuartoEmEdicao(quarto);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setQuartoEmEdicao(undefined);
  };

  const handleNovoQuarto = () => {
    setQuartoEmEdicao(undefined);
    setShowForm(true);
  };

  const handleDisponibilidadeChange = async (id: string, disponibilidade: Disponibilidade) => {
    try {
      await quartoService.alterarDisponibilidade(id, disponibilidade);
      await carregarQuartos();
    } catch (error) {
      console.error('Erro ao alterar disponibilidade:', error);
      alert('Erro ao alterar disponibilidade do quarto');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2>Gestão de Quartos</h2>
            <p className="text-sm text-gray-600 mt-1">
              Cadastre e gerencie os quartos do hotel
            </p>
          </div>

          {!showForm && (
            <button
              onClick={handleNovoQuarto}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              Novo Quarto
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : showForm ? (
          <QuartoForm
            quarto={quartoEmEdicao}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        ) : (
          <QuartoList
            quartos={quartos}
            onEdit={handleEdit}
            onDisponibilidadeChange={handleDisponibilidadeChange}
          />
        )}

        {!showForm && quartos.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {quartos.filter(q => q.disponibilidade === Disponibilidade.LIVRE).length}
                </p>
                <p className="text-sm text-gray-600">Quartos Livres</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {quartos.filter(q => q.disponibilidade === Disponibilidade.OCUPADO).length}
                </p>
                <p className="text-sm text-gray-600">Quartos Ocupados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {quartos.filter(q => q.disponibilidade === Disponibilidade.MANUTENCAO).length}
                </p>
                <p className="text-sm text-gray-600">Em Manutenção</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {quartos.filter(q => q.disponibilidade === Disponibilidade.LIMPEZA).length}
                </p>
                <p className="text-sm text-gray-600">Em Limpeza</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
