import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Hóspedes
import { HospedeForm } from './components/hospedes/HospedeForm';
import { HospedeList } from './components/hospedes/HospedeList';
import { hospedeService, HospedeDTO } from './services/HospedeService';

// Quartos
import { QuartoForm, QuartoFormData } from './components/quartos/QuartoForm';
import { QuartoList } from './components/quartos/QuartoList';
import { quartoService } from './services/ServiceFactory';
import { QuartoData, Disponibilidade } from './types';

// Reservas
import { ReservaForm } from './components/reservas/ReservaForm';
import { ReservaList } from './components/reservas/ReservaList';
import { reservaService, ReservaDTO } from './services/ReservaService';

export default function App() {
  const [activeTab, setActiveTab] = useState('hospedes');

  // Estados Hóspedes
  const [hospedes, setHospedes] = useState<HospedeDTO[]>([]);
  const [showHospedeForm, setShowHospedeForm] = useState(false);
  const [hospedeEmEdicao, setHospedeEmEdicao] = useState<HospedeDTO | undefined>();
  const [isLoadingHospedes, setIsLoadingHospedes] = useState(true);

  // Estados Quartos
  const [quartos, setQuartos] = useState<QuartoData[]>([]);
  const [showQuartoForm, setShowQuartoForm] = useState(false);
  const [quartoEmEdicao, setQuartoEmEdicao] = useState<QuartoData | undefined>();
  const [isLoadingQuartos, setIsLoadingQuartos] = useState(true);

  // Estados Reservas
  const [reservas, setReservas] = useState<ReservaDTO[]>([]);
  const [showReservaForm, setShowReservaForm] = useState(false);
  const [reservaEmEdicao, setReservaEmEdicao] = useState<ReservaDTO | undefined>();
  const [isLoadingReservas, setIsLoadingReservas] = useState(true);

  useEffect(() => {
    carregarHospedes();
    carregarQuartos();
    carregarReservas();
  }, []);

  // ===== HÓSPEDES =====
  const carregarHospedes = async () => {
    try {
      const dados = await hospedeService.listarTodos();
      setHospedes(dados);
    } catch (error) {
      console.error('Erro ao carregar hóspedes:', error);
      toast.error('Erro ao carregar hóspedes');
    } finally {
      setIsLoadingHospedes(false);
    }
  };

  const handleHospedeSubmit = async (data: Omit<HospedeDTO, 'id' | 'criadoEm'>) => {
    try {
      await hospedeService.criar(data);
      toast.success('Hóspede cadastrado com sucesso!');
      await carregarHospedes();
      setShowHospedeForm(false);
      setHospedeEmEdicao(undefined);
    } catch (error) {
      throw error;
    }
  };

  const handleHospedeEdit = (hospede: HospedeDTO) => {
    setHospedeEmEdicao(hospede);
    setShowHospedeForm(true);
  };

  const handleHospedeCancel = () => {
    setShowHospedeForm(false);
    setHospedeEmEdicao(undefined);
  };

  const handleNovoHospede = () => {
    setHospedeEmEdicao(undefined);
    setShowHospedeForm(true);
  };

  // ===== QUARTOS =====
  const carregarQuartos = async () => {
    try {
      const dados = await quartoService.listarQuartos();
      setQuartos(dados);
    } catch (error) {
      console.error('Erro ao carregar quartos:', error);
      toast.error('Erro ao carregar quartos');
    } finally {
      setIsLoadingQuartos(false);
    }
  };

  const handleQuartoSubmit = async (data: QuartoFormData) => {
    try {
      if (quartoEmEdicao) {
        await quartoService.atualizarQuarto(quartoEmEdicao.id, data);
        toast.success('Quarto atualizado com sucesso!');
      } else {
        await quartoService.criarQuarto(data);
        toast.success('Quarto cadastrado com sucesso!');
      }

      await carregarQuartos();
      setShowQuartoForm(false);
      setQuartoEmEdicao(undefined);
    } catch (error) {
      toast.error('Erro ao salvar quarto');
      throw error;
    }
  };

  const handleQuartoEdit = (quarto: QuartoData) => {
    setQuartoEmEdicao(quarto);
    setShowQuartoForm(true);
  };

  const handleQuartoCancel = () => {
    setShowQuartoForm(false);
    setQuartoEmEdicao(undefined);
  };

  const handleNovoQuarto = () => {
    setQuartoEmEdicao(undefined);
    setShowQuartoForm(true);
  };

  const handleDisponibilidadeChange = async (id: string, disponibilidade: Disponibilidade) => {
    try {
      await quartoService.alterarDisponibilidade(id, disponibilidade);
      toast.success('Disponibilidade alterada com sucesso!');
      await carregarQuartos();
    } catch (error) {
      console.error('Erro ao alterar disponibilidade:', error);
      toast.error('Erro ao alterar disponibilidade do quarto');
    }
  };

  // ===== RESERVAS =====
  const carregarReservas = async () => {
    try {
      const dados = await reservaService.listarTodas();
      setReservas(dados);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
      toast.error('Erro ao carregar reservas');
    } finally {
      setIsLoadingReservas(false);
    }
  };

  const handleReservaSubmit = async (data: Omit<ReservaDTO, 'id' | 'valorTotal' | 'status' | 'criadoEm' | 'atualizadoEm' | 'hospedeNome' | 'quartoNumero'>) => {
    try {
      if (reservaEmEdicao) {
        await reservaService.atualizar(reservaEmEdicao.id!, data);
        toast.success('Reserva atualizada com sucesso!');
      } else {
        await reservaService.criar(data);
        toast.success('Reserva criada com sucesso!');
      }

      await carregarReservas();
      await carregarQuartos(); // Atualiza lista de quartos
      setShowReservaForm(false);
      setReservaEmEdicao(undefined);
    } catch (error) {
      throw error;
    }
  };

  const handleReservaEdit = (reserva: ReservaDTO) => {
    setReservaEmEdicao(reserva);
    setShowReservaForm(true);
  };

  const handleReservaCancel = () => {
    setShowReservaForm(false);
    setReservaEmEdicao(undefined);
  };

  const handleNovaReserva = () => {
    setReservaEmEdicao(undefined);
    setShowReservaForm(true);
  };

  const handleReservaCancelar = async (id: string) => {
    try {
      await reservaService.cancelar(id);
      toast.success('Reserva cancelada com sucesso!');
      await carregarReservas();
      await carregarQuartos(); // Atualiza lista de quartos
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      toast.error('Erro ao cancelar reserva');
    }
  };

  // Quartos disponíveis para reserva (LIVRE apenas)
  const quartosDisponiveis = quartos
    .filter(q => q.disponibilidade === Disponibilidade.LIVRE)
    .map(q => ({
      id: q.id,
      numero: q.numero,
      tipo: q.tipo,
      precoDiaria: q.precoPorDiaria
    }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hospedes">Hóspedes</TabsTrigger>
            <TabsTrigger value="quartos">Quartos</TabsTrigger>
            <TabsTrigger value="reservas">Reservas</TabsTrigger>
          </TabsList>

          {/* TAB HÓSPEDES */}
          <TabsContent value="hospedes" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Gestão de Hóspedes</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Cadastre e gerencie os hóspedes do hotel
                </p>
              </div>

              {!showHospedeForm && (
                <button
                  onClick={handleNovoHospede}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  Novo Hóspede
                </button>
              )}
            </div>

            {isLoadingHospedes ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">Carregando...</p>
              </div>
            ) : showHospedeForm ? (
              <HospedeForm
                hospede={hospedeEmEdicao}
                onSubmit={handleHospedeSubmit}
                onCancel={handleHospedeCancel}
              />
            ) : (
              <HospedeList hospedes={hospedes} onEdit={handleHospedeEdit} />
            )}
          </TabsContent>

          {/* TAB QUARTOS */}
          <TabsContent value="quartos" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Gestão de Quartos</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Cadastre e gerencie os quartos do hotel
                </p>
              </div>

              {!showQuartoForm && (
                <button
                  onClick={handleNovoQuarto}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  Novo Quarto
                </button>
              )}
            </div>

            {isLoadingQuartos ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">Carregando...</p>
              </div>
            ) : showQuartoForm ? (
              <QuartoForm
                quarto={quartoEmEdicao}
                onSubmit={handleQuartoSubmit}
                onCancel={handleQuartoCancel}
              />
            ) : (
              <>
                <QuartoList
                  quartos={quartos}
                  onEdit={handleQuartoEdit}
                  onDisponibilidadeChange={handleDisponibilidadeChange}
                />

                {quartos.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-4">
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
              </>
            )}
          </TabsContent>

          {/* TAB RESERVAS */}
          <TabsContent value="reservas" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Gestão de Reservas</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Crie e gerencie as reservas do hotel
                </p>
              </div>

              {!showReservaForm && (
                <button
                  onClick={handleNovaReserva}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
                  disabled={hospedes.length === 0 || quartosDisponiveis.length === 0}
                >
                  <Plus className="w-5 h-5" />
                  Nova Reserva
                </button>
              )}
            </div>

            {hospedes.length === 0 || quartosDisponiveis.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  {hospedes.length === 0 && 'Cadastre pelo menos um hóspede '}
                  {hospedes.length === 0 && quartosDisponiveis.length === 0 && 'e '}
                  {quartosDisponiveis.length === 0 && 'um quarto disponível '}
                  para criar reservas.
                </p>
              </div>
            ) : null}

            {isLoadingReservas ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">Carregando...</p>
              </div>
            ) : showReservaForm ? (
              <ReservaForm
                reserva={reservaEmEdicao}
                hospedes={hospedes}
                quartos={quartosDisponiveis}
                onSubmit={handleReservaSubmit}
                onCancel={handleReservaCancel}
              />
            ) : (
              <ReservaList
                reservas={reservas}
                onEdit={handleReservaEdit}
                onCancelar={handleReservaCancelar}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}