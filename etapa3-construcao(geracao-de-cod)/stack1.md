# Implementação em TypeScript + Node.js + React

A implementação segue uma arquitetura monolítica modular, com separação de camadas (domínio, infraestrutura e apresentação). As classes de domínio (Quarto, Hóspede, Reserva) estão no backend (Node.js com TypeScript), utilizando princípios SOLID (ex.: Single Responsibility para cada classe, Dependency Inversion via interfaces). O módulo de Gestão de Quartos é implementado no frontend (React com TypeScript), consumindo APIs REST do backend. Decisões de clean code incluem: nomes descritivos, validações em métodos, imutabilidade onde possível, e comentários explicando lógica.

## Backend: Classes de Domínio (Node.js + TypeScript)

```typescript
// Interfaces para tipos enumerados e estruturas, promovendo Open-Closed Principle (extensível sem modificar código existente).
export enum TipoQuarto {
  Basico = 'Básico',
  Moderno = 'Moderno',
  Luxo = 'Luxo'
}

export enum TipoCama {
  Solteiro = 'Solteiro',
  King = 'King',
  Queen = 'Queen'
}

export enum Disponibilidade {
  Ocupado = 'Ocupado',
  Livre = 'Livre',
  Manutencao = 'Manutenção',
  Limpeza = 'Limpeza'
}

// Interface para cama, permitindo múltiplas camas por quarto (como solicitado).
export interface ICama {
  tipo: TipoCama;
}

// Classe Quarto: Responsável apenas por representar e validar dados de quarto (Single Responsibility).
export class Quarto {
  constructor(
    public numero: number,
    public capacidade: number,
    public tipo: TipoQuarto,
    public precoDiaria: number, // Mantido como "diária" conforme domínio original; ajuste se necessário.
    public frigobar: boolean,
    public cafeIncluso: boolean,
    public arCondicionado: boolean,
    public tv: boolean,
    public camas: ICama[], // Suporte a múltiplas camas.
    public disponibilidade: Disponibilidade = Disponibilidade.Livre
  ) {}

  // Método para validar dados (Liskov Substitution: extensível para subclasses).
  validar(): boolean {
    return this.numero > 0 && this.capacidade > 0 && this.precoDiaria > 0 && this.camas.length > 0;
  }

  // Método para atualizar disponibilidade, promovendo imutabilidade parcial.
  atualizarDisponibilidade(novaDisponibilidade: Disponibilidade): Quarto {
    return new Quarto(
      this.numero, this.capacidade, this.tipo, this.precoDiaria,
      this.frigobar, this.cafeIncluso, this.arCondicionado, this.tv,
      this.camas, novaDisponibilidade
    );
  }
}

// Classe Hospede: Focada em dados de hóspede, com validação simples.
export class Hospede {
  constructor(
    public nome: string,
    public sobrenome: string,
    public cpf: string,
    public email: string
  ) {}

  validar(): boolean {
    const cpfRegex = /^\d{11}$/; // Validação básica de CPF.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.nome.length > 0 && cpfRegex.test(this.cpf) && emailRegex.test(this.email);
  }
}

// Classe Reserva: Gerencia associação entre Quarto e Hospede, com regras de negócio (ex.: evitar reservas em quartos ocupados).
export class Reserva {
  constructor(
    public id: number,
    public hospede: Hospede,
    public quarto: Quarto,
    public dataInicio: Date,
    public dataFim: Date
  ) {}

  // Regra de negócio: Verifica se o quarto está livre (Dependency Inversion: injeta validação externa se necessário).
  podeReservar(): boolean {
    return this.quarto.disponibilidade === Disponibilidade.Livre;
  }

  // Método para confirmar reserva, atualizando quarto (Single Responsibility: foco em reserva).
  confirmar(): Reserva {
    if (!this.podeReservar()) throw new Error('Quarto não disponível.');
    this.quarto = this.quarto.atualizarDisponibilidade(Disponibilidade.Ocupado);
    return this;
  }
}

```

## Frontend: Módulo de Gestão de Quartos (React + TypeScript)

```typescript
import React, { useState, useEffect } from 'react';
import { Quarto, TipoQuarto, TipoCama, Disponibilidade, ICama } from './backend/models'; // Importa do backend.

// Hook customizado para API (Dependency Inversion: abstrai chamadas HTTP).
const useQuartosAPI = () => {
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const fetchQuartos = async () => {
    const response = await fetch('/api/quartos');
    setQuartos(await response.json());
  };
  const salvarQuarto = async (quarto: Quarto) => {
    await fetch('/api/quartos', { method: 'POST', body: JSON.stringify(quarto) });
    fetchQuartos();
  };
  const editarQuarto = async (numero: number, updates: Partial<Quarto>) => {
    await fetch(`/api/quartos/${numero}`, { method: 'PUT', body: JSON.stringify(updates) });
    fetchQuartos();
  };
  useEffect(() => { fetchQuartos(); }, []);
  return { quartos, salvarQuarto, editarQuarto };
};

// Componente para Cadastro de Quarto (Single Responsibility: apenas cadastro).
const CadastroQuarto: React.FC = () => {
  const [numero, setNumero] = useState(0);
  const [capacidade, setCapacidade] = useState(0);
  const [tipo, setTipo] = useState<TipoQuarto>(TipoQuarto.Basico);
  const [precoDiaria, setPrecoDiaria] = useState(0);
  const [frigobar, setFrigobar] = useState(false);
  const [cafeIncluso, setCafeIncluso] = useState(false);
  const [arCondicionado, setArCondicionado] = useState(false);
  const [tv, setTv] = useState(false);
  const [camas, setCamas] = useState<ICama[]>([{ tipo: TipoCama.Solteiro }]);
  const { salvarQuarto } = useQuartosAPI();

  const handleSubmit = () => {
    const novoQuarto = new Quarto(numero, capacidade, tipo, precoDiaria, frigobar, cafeIncluso, arCondicionado, tv, camas);
    if (novoQuarto.validar()) salvarQuarto(novoQuarto);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="number" value={numero} onChange={e => setNumero(+e.target.value)} placeholder="Número" />
      <input type="number" value={capacidade} onChange={e => setCapacidade(+e.target.value)} placeholder="Capacidade" />
      <select value={tipo} onChange={e => setTipo(e.target.value as TipoQuarto)}>
        {Object.values(TipoQuarto).map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <input type="number" value={precoDiaria} onChange={e => setPrecoDiaria(+e.target.value)} placeholder="Preço por diária" />
      <label><input type="checkbox" checked={frigobar} onChange={e => setFrigobar(e.target.checked)} /> Frigobar</label>
      <label><input type="checkbox" checked={cafeIncluso} onChange={e => setCafeIncluso(e.target.checked)} /> Café incluso</label>
      <label><input type="checkbox" checked={arCondicionado} onChange={e => setArCondicionado(e.target.checked)} /> Ar-condicionado</label>
      <label><input type="checkbox" checked={tv} onChange={e => setTv(e.target.checked)} /> TV</label>
      {/* Suporte a múltiplas camas: Adiciona/remover dinamicamente. */}
      {camas.map((cama, i) => (
        <select key={i} value={cama.tipo} onChange={e => {
          const newCamas = [...camas];
          newCamas[i] = { tipo: e.target.value as TipoCama };
          setCamas(newCamas);
        }}>
          {Object.values(TipoCama).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      ))}
      <button type="button" onClick={() => setCamas([...camas, { tipo: TipoCama.Solteiro }])}>Adicionar Cama</button>
      <button type="submit">Salvar</button>
    </form>
  );
};

// Componente para Edição de Quarto (Open-Closed: Extensível para novos campos).
const EdicaoQuarto: React.FC<{ quarto: Quarto }> = ({ quarto }) => {
  const [updates, setUpdates] = useState<Partial<Quarto>>({});
  const { editarQuarto } = useQuartosAPI();
  const handleEdit = () => {
    editarQuarto(quarto.numero, updates);
  };
  return (
    <div>
      <input type="number" placeholder="Novo preço" onChange={e => setUpdates({ ...updates, precoDiaria: +e.target.value })} />
      <select onChange={e => setUpdates({ ...updates, disponibilidade: e.target.value as Disponibilidade })}>
        {Object.values(Disponibilidade).map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <button onClick={handleEdit}>Editar</button>
    </div>
  );
};

// Componente para Listagem de Quartos (Interface Segregation: Apenas métodos necessários expostos).
const ListagemQuartos: React.FC = () => {
  const { quartos } = useQuartosAPI();
  const [editing, setEditing] = useState<number | null>(null);
  return (
    <table>
      <thead>
        <tr>
          <th>Número</th>
          <th>Tipo</th>
          <th>Preço por diária</th>
          <th>Disponibilidade</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {quartos.map(q => (
          <tr key={q.numero}>
            <td>{q.numero}</td>
            <td>{q.tipo}</td>
            <td>{q.precoDiaria}</td>
            <td>{q.disponibilidade}</td>
            <td>
              <button onClick={() => setEditing(q.numero)}>Editar</button>
              {editing === q.numero && <EdicaoQuarto quarto={q} />}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
