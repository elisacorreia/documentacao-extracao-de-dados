import { HospedeDTO } from '../../services/HospedeService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Edit, Mail, User, IdCard } from 'lucide-react';

interface HospedeListProps {
  hospedes: HospedeDTO[];
  onEdit: (hospede: HospedeDTO) => void;
}

export function HospedeList({ hospedes, onEdit }: HospedeListProps) {
  const formatCPF = (cpf: string): string => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (hospedes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum hóspede cadastrado</h3>
            <p className="text-gray-500">Comece cadastrando o primeiro hóspede</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Lista de Hóspedes ({hospedes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {hospedes.map((hospede) => (
              <div
                key={hospede.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-lg">
                      {hospede.nome} {hospede.sobrenome}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <IdCard className="w-4 h-4" />
                      <span>CPF: {formatCPF(hospede.cpf)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{hospede.email}</span>
                    </div>
                  </div>

                  {hospede.criadoEm && (
                    <p className="text-xs text-gray-400">
                      Cadastrado em: {formatDate(hospede.criadoEm)}
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(hospede)}
                  className="ml-4"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
