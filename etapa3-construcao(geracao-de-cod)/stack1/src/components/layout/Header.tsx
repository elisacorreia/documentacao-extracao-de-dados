import { Hotel } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <Hotel className="w-8 h-8" />
          <div>
            <h1 className="text-white">Sistema de Reservas</h1>
            <p className="text-sm text-green-100">Gestão Hoteleira Completa</p>
          </div>
        </div>
      </div>
    </header>
  );
}
