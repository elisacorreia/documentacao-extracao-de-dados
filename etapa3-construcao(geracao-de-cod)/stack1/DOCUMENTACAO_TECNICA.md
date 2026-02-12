# Documentação Técnica - Sistema de Reserva de Hotel

## 1. Arquitetura e Princípios Aplicados

### 1.1 Princípios SOLID

#### **S - Single Responsibility Principle (Princípio da Responsabilidade Única)**
- **Quarto.ts**: Responsável apenas pela lógica de domínio do quarto
- **QuartoRepository.ts**: Responsável apenas pela persistência
- **QuartoService.ts**: Responsável apenas pela lógica de aplicação
- **QuartoForm.tsx**: Responsável apenas pela interface de formulário
- **QuartoList.tsx**: Responsável apenas pela interface de listagem

#### **O - Open/Closed Principle (Princípio Aberto/Fechado)**
- Interfaces `IQuartoRepository`, `IHospedeRepository`, `IReservaRepository` permitem extensão sem modificação
- Value Objects (CPF, Email) são imutáveis e fechados para modificação
- Enums (TipoQuarto, Disponibilidade) podem ser estendidos sem alterar classes existentes

#### **L - Liskov Substitution Principle (Princípio da Substituição de Liskov)**
- `QuartoRepositoryInMemory` pode ser substituído por qualquer implementação de `IQuartoRepository`
- Permite trocar implementação in-memory por PostgreSQL, MongoDB, etc., sem afetar services

#### **I - Interface Segregation Principle (Princípio da Segregação de Interface)**
- Interfaces específicas para cada repositório (não uma interface genérica única)
- DTOs separados: `CriarQuartoDTO`, `AtualizarQuartoDTO` (não um DTO genérico)
- Props específicas para cada componente React

#### **D - Dependency Inversion Principle (Princípio da Inversão de Dependência)**
- `QuartoService` depende da interface `IQuartoRepository`, não da implementação concreta
- Injeção de dependência via construtor
- `ServiceFactory.ts` gerencia a criação e injeção de dependências

---

### 1.2 Clean Code - Decisões de Implementação

#### **Nomenclatura**
```typescript
// ✅ Nomes descritivos e em português (domínio do negócio)
class Quarto { }
class Hospede { }
enum Disponibilidade { LIVRE, OCUPADO, MANUTENCAO, LIMPEZA }

// ✅ Métodos com verbos que expressam intenção
alterarDisponibilidade()
podeSerReservado()
calcularValorTotal()
```

#### **Funções Pequenas e Focadas**
```typescript
// Cada método faz apenas uma coisa
validar(): ValidationResult
toData(): QuartoData
fromData(data: QuartoData): Quarto
```

#### **Imutabilidade**
```typescript
// Value Objects são imutáveis
export class CPF {
  private readonly valor: string; // readonly = imutável
}

// Getters retornam cópias (não referências diretas)
get camas(): Cama[] {
  return [...this._camas]; // cópia do array
}
```

#### **Validação em Múltiplas Camadas**
1. **Frontend**: Validação HTML5 (required, min, max)
2. **Entidade**: Método `validar()` com regras de negócio
3. **Service**: Validação de regras de aplicação (número único)

---

### 1.3 Padrões de Projeto Implementados

#### **Repository Pattern**
```typescript
// Interface define contrato
export interface IQuartoRepository {
  criar(quarto: Quarto): Promise<Quarto>;
  buscarPorId(id: string): Promise<Quarto | null>;
  // ...
}

// Implementação in-memory (facilmente substituível)
export class QuartoRepositoryInMemory implements IQuartoRepository {
  private quartos: Map<string, Quarto> = new Map();
  // implementação...
}
```
**Benefícios**:
- Desacoplamento da camada de domínio da persistência
- Facilita testes unitários (mock de repositories)
- Permite trocar tecnologia de banco de dados

#### **Factory Pattern (Value Objects)**
```typescript
export class CPF {
  private constructor(cpf: string) { } // construtor privado

  static criar(cpf: string): CPF { // factory method
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (!this.validar(cpfLimpo)) {
      throw new Error('CPF inválido');
    }
    return new CPF(cpfLimpo);
  }
}
```
**Benefícios**:
- Garante que objetos são criados válidos
- Encapsula lógica de validação
- Controle centralizado de criação

#### **DTO (Data Transfer Object)**
```typescript
export interface CriarQuartoDTO {
  numero: number;
  capacidade: number;
  tipo: TipoQuarto;
  // ... apenas dados, sem lógica
}
```
**Benefícios**:
- Desacopla camadas (frontend não conhece entidades de domínio)
- Permite evoluir APIs sem quebrar contratos
- Validação de entrada simplificada

#### **Service Layer Pattern**
```typescript
export class QuartoService {
  constructor(private quartoRepository: IQuartoRepository) {}
  
  async criarQuarto(dto: CriarQuartoDTO): Promise<QuartoData> {
    // Orquestra validações, regras de negócio e persistência
  }
}
```
**Benefícios**:
- Centraliza lógica de aplicação
- Facilita transações complexas
- Reutilização de lógica

---

## 2. Estrutura de Classes

### 2.1 Diagrama de Relações
```
┌─────────────┐
│   Quarto    │
├─────────────┤
│ - camas[]   │───────┐
└─────────────┘       │
                      │ 1..*
                 ┌────▼────┐
                 │  Cama   │
                 └─────────┘

┌─────────────┐
│  Hospede    │
├─────────────┤
│ - cpf: CPF  │◄─────── CPF (Value Object)
│ - email: E. │◄─────── Email (Value Object)
└─────────────┘

┌─────────────┐       ┌─────────────┐
│   Reserva   │───────│   Quarto    │
├─────────────┤ 1     └─────────────┘
│ - quartoId  │
│ - hospedeId │───────┌─────────────┐
└─────────────┘ 1     │  Hospede    │
                      └─────────────┘
```

### 2.2 Características das Entidades

**Quarto** (Entity):
- Identidade: `id` (UUID)
- Ciclo de vida: Criação → Atualização → Mudanças de disponibilidade
- Agregado: Contém coleção de Camas
- Encapsulamento: Campos privados com getters

**Hospede** (Entity):
- Identidade: `id` (UUID)
- Value Objects: CPF, Email (validação automática)
- Métodos auxiliares: `nomeCompleto()`

**Reserva** (Entity):
- Identidade: `id` (UUID)
- Máquina de estados: PENDENTE → CONFIRMADA → EM_ANDAMENTO → FINALIZADA
- Validações de negócio: checkIn/checkOut só em estados específicos

**CPF e Email** (Value Objects):
- Imutáveis (readonly)
- Validação no momento da criação
- Comparação por valor (`equals()`)

---


