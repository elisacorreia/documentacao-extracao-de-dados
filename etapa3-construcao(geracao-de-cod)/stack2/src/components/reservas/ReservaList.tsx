import { ReservaDTO } from '../../services/ReservaService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Edit, X, Calendar, User, DoorOpen, CreditCard } from 'lucide-react';

interface ReservaListProps {
  reservas: ReservaDTO[];
  onEdit: (reserva: ReservaDTO) => void;
  onCancelar: (id: string) => void;
}

export function ReservaList({ reservas, onEdit, onCancelar }: ReservaListProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ATIVA':
        return 'bg-green-100 text-green-800';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800';
      case 'FINALIZADA':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'ATIVA':
        return 'Ativa';
      case 'CANCELADA':
        return 'Cancelada';
      case 'FINALIZADA':
        return 'Finalizada';
      default:
        return status || 'Desconhecido';
    }
  };

  if (reservas.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma reserva encontrada</h3>
            <p className="text-gray-500">Crie a primeira reserva para começar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Lista de Reservas ({reservas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reservas.map((reserva) => (
              <div
                key={reserva.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(reserva.status)}>
                      {getStatusLabel(reserva.status)}
                    </Badge>
                    <h3 className="font-semibold text-lg">
                      Reserva #{reserva.id?.slice(0, 8)}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{reserva.hospedeNome}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DoorOpen className="w-4 h-4" />
                      <span>Quarto {reserva.quartoNumero}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(reserva.dataCheckIn)} - {formatDate(reserva.dataCheckOut)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CreditCard className="w-4 h-4" />
                      <span className="font-semibold">
                        R$ {reserva.valorTotal?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>

                  {reserva.criadoEm && (
                    <p className="text-xs text-gray-400">
                      Criada em: {formatDate(reserva.criadoEm)}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  {reserva.status === 'ATIVA' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(reserva)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm('Deseja realmente cancelar esta reserva?')) {
                            onCancelar(reserva.id!);
                          }
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
