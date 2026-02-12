import { useState } from 'react';
import { HospedeForm } from './src/components/HospedeForm';
import { HospedeList } from './src/components/HospedeList';
import { QuartoForm } from './src/components/QuartoForm';
import { QuartoList } from './src/components/QuartoList';
import { ReservaForm } from './src/components/ReservaForm';
import { ReservaList } from './src/components/ReservaList';

type TabType = 'hospedes' | 'quartos' | 'reservas';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('hospedes');
  const [hospedeRefresh, setHospedeRefresh] = useState(0);
  const [quartoRefresh, setQuartoRefresh] = useState(0);
  const [reservaRefresh, setReservaRefresh] = useState(0);
  const [showAtivasOnly, setShowAtivasOnly] = useState(true);
  const [showDisponiveisOnly, setShowDisponiveisOnly] = useState(false);

  const handleHospedeSuccess = () => {
    setHospedeRefresh(prev => prev + 1);
  };

  const handleQuartoSuccess = () => {
    setQuartoRefresh(prev => prev + 1);
  };

  const handleReservaSuccess = () => {
    setReservaRefresh(prev => prev + 1);
    setQuartoRefresh(prev => prev + 1); // Atualiza quartos também
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">
            🏨 Sistema de Gestão Hoteleira
          </h1>
          <p className="text-gray-600 mt-2">Gerenciamento de Hóspedes e Reservas</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex space-x-1 bg-white rounded-lg shadow p-1">
          <button
            onClick={() => setActiveTab('hospedes')}
            className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors ${
              activeTab === 'hospedes'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            👤 Gestão de Hóspedes
          </button>
          <button
            onClick={() => setActiveTab('quartos')}
            className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors ${
              activeTab === 'quartos'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            🛋️ Gestão de Quartos
          </button>
          <button
            onClick={() => setActiveTab('reservas')}
            className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors ${
              activeTab === 'reservas'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            📅 Gestão de Reservas
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'hospedes' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <HospedeForm onSuccess={handleHospedeSuccess} />
            </div>
            <div>
              <HospedeList refreshTrigger={hospedeRefresh} />
            </div>
          </div>
        ) : activeTab === 'quartos' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <QuartoForm onSuccess={handleQuartoSuccess} />
            </div>
            <div>
              <QuartoList refreshTrigger={quartoRefresh} />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <ReservaForm onSuccess={handleReservaSuccess} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Informações</h2>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600">ℹ️</span>
                    <p>
                      <strong>Validações Implementadas:</strong>
                      <br />• CPF deve ser único no sistema
                      <br />• E-mail deve ter formato válido
                      <br />• Quartos ocupados não podem ser reservados
                      <br />• Data de check-out deve ser posterior ao check-in
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <p>
                      <strong>Funcionalidades:</strong>
                      <br />• Cadastro e listagem de hóspedes
                      <br />• Criação de reservas com validação
                      <br />• Edição de datas de reservas ativas
                      <br />• Cancelamento de reservas
                      <br />• Atualização automática de disponibilidade
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAtivasOnly}
                    onChange={(e) => setShowAtivasOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Mostrar apenas reservas ativas
                  </span>
                </label>
              </div>
              <ReservaList 
                refreshTrigger={reservaRefresh} 
                apenasAtivas={showAtivasOnly}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white mt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>Sistema de Gestão Hoteleira - TypeScript + Node.js + React + Prisma</p>
          <p className="mt-1">Desenvolvido com ❤️ seguindo princípios SOLID e Clean Code</p>
        </div>
      </footer>
    </div>
  );
}

export default App;