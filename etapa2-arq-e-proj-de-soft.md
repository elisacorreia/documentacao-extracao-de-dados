# Arquitetura do Sistema de Reserva de Hotel

## 1. Proposta Arquitetural

**Arquitetura Escolhida:** Monolito Modular em Camadas

### Visão Geral

┌─────────────────────────────────────────────────────────────┐
│                     CAMADA DE APRESENTAÇÃO                   │
│  (React + TypeScript + Tailwind CSS - Frontend Web SPA)     │
└─────────────────────────────────────────────────────────────┘
                              │
                          REST/JSON
                              │
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE API (Backend)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Quartos    │  │  Hóspedes    │  │   Reservas   │      │
│  │  Controller  │  │  Controller  │  │  Controller  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   CAMADA DE APLICAÇÃO                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Quartos    │  │  Hóspedes    │  │   Reservas   │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Serviços Compartilhados & Validações         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE DOMÍNIO                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Quarto    │  │   Hóspede    │  │   Reserva    │      │
│  │   (Entity)   │  │   (Entity)   │  │   (Entity)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      Regras de Negócio & Objetos de Valor           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 CAMADA DE PERSISTÊNCIA                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Quartos    │  │  Hóspedes    │  │   Reservas   │      │
│  │  Repository  │  │  Repository  │  │  Repository  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE DADOS                           │
│              (Banco de Dados Relacional)                     │
│         PostgreSQL / MySQL / SQLite                          │
└─────────────────────────────────────────────────────────────┘

---

## 2. Justificativa da Escolha

### Por que Monolito Modular?

✅ **Vantagens para este Contexto**

* **Escala Apropriada:**
    * Sistema para **um único hotel** (não precisa de distribuição geográfica)
    * Volume de dados e transações relativamente baixo
    * Número de usuários simultâneos limitado (equipe do hotel)
* **Simplicidade Operacional:**
    * Deploy único e simplificado
    * Menos complexidade de infraestrutura
    * Menor custo operacional (um servidor vs. múltiplos serviços)
    * Debugging e troubleshooting mais diretos
* **Desenvolvimento Eficiente:**
    * Compartilhamento direto de código entre módulos
    * Transações ACID nativas (importante para reservas)
    * Refatoração mais fácil
    * Tempo de desenvolvimento reduzido
* **Manutenibilidade:**
    * Modularização clara por contextos de negócio
    * Facilita evolução futura para microserviços se necessário
    * Código coeso e acoplamento controlado

⚠️ **Quando Migrar para Microserviços?**

Considerar microserviços **apenas se**:
* Expandir para múltiplos hotéis (multi-tenancy complexo)
* Necessidade de escala independente de módulos
* Equipes distribuídas trabalhando em contextos diferentes
* Requisitos de disponibilidade 99.99%+
* Integração com sistemas externos complexos

---

## 3. Decisões Arquiteturais (ADRs)

### ADR-001: Adoção de Arquitetura em Camadas
**Status:** Aceito  
**Contexto:** Necessidade de separar responsabilidades e facilitar manutenção  
**Decisão:** Utilizar arquitetura em 5 camadas (Apresentação, API, Aplicação, Domínio, Persistência)  
**Consequências:** ✅ Separação clara de responsabilidades  
✅ Facilita testes unitários e de integração  
✅ Permite substituição de camadas independentemente  
⚠️ Pode adicionar complexidade em operações simples  
⚠️ Requer disciplina para manter limites entre camadas  

### ADR-002: Frontend SPA com React
**Status:** Aceito  
**Contexto:** Necessidade de interface moderna e responsiva  
**Decisão:** Utilizar React com TypeScript e Tailwind CSS  
**Consequências:** ✅ Experiência de usuário fluida (sem recargas de página)  
✅ Componentização facilita reutilização  
✅ TypeScript adiciona segurança de tipos  
✅ Tailwind permite desenvolvimento visual rápido  
⚠️ Requer JavaScript habilitado no navegador  
⚠️ SEO limitado (não relevante para sistema interno)  

### ADR-003: API RESTful
**Status:** Aceito  
**Contexto:** Necessidade de comunicação entre frontend e backend  
**Decisão:** Implementar API REST com JSON  
**Razões:** * Simplicidade e padrão bem estabelecido
* Compatibilidade universal
* Ferramentas maduras de desenvolvimento e teste
* Suficiente para o volume de dados esperado  
**Alternativas Rejeitadas:** * GraphQL: Complexidade desnecessária para este escopo
* gRPC: Overhead técnico não justificado  

### ADR-004: Banco de Dados Relacional
**Status:** Aceito  
**Contexto:** Armazenamento de dados estruturados com relacionamentos  
**Decisão:** Utilizar banco de dados relacional (PostgreSQL recomendado)  
**Razões:** * Dados altamente estruturados e relacionados
* ACID necessário para reservas (evitar double booking)
* Consultas complexas com JOINs
* Integridade referencial importante
* Transações essenciais  
**Consequências:** ✅ Consistência garantida  
✅ Queries complexas nativas  
✅ Ferramentas maduras  
⚠️ Menos flexível para mudanças de schema  

### ADR-005: Repository Pattern
**Status:** Aceito  
**Contexto:** Necessidade de abstrair acesso a dados  
**Decisão:** Implementar padrão Repository para todas as entidades  
**Razões:** * Desacopla lógica de negócio da persistência
* Facilita testes (mock de repositories)
* Permite trocar tecnologia de persistência
* Centraliza queries  

### ADR-006: Validação em Múltiplas Camadas
**Status:** Aceito  
**Contexto:** Garantir integridade e qualidade dos dados  
**Decisão:** Implementar validação em frontend, API e domínio  
**Camadas de Validação:** * **Frontend:** Validação de UX (feedback imediato)
* **API:** Validação de contrato (segurança)
* **Domínio:** Validação de regras de negócio (integridade)  

### ADR-007: Estado da Aplicação no Cliente
**Status:** Aceito  
**Contexto:** Gerenciamento de estado no frontend  
**Decisão:** Utilizar React Context API ou Zustand para estado global  
**Razões:** * Escopo limitado não justifica Redux
* Context API suficiente para compartilhar estado
* Zustand como alternativa leve se necessário
* Evita prop drilling  

---

## 4. Diagrama de Componentes

┌────────────────────────────────────────────────────────────────┐
│                      FRONTEND (SPA React)                       │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Quartos    │  │  Hóspedes    │  │   Reservas   │         │
│  │     UI       │  │      UI      │  │      UI      │         │
│  │  Components  │  │  Components  │  │  Components  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │              State Management (Context)               │     │
│  └──────────────────────────────────────────────────────┘     │
│         │                  │                  │                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │             API Client (Axios/Fetch)                  │     │
│  └──────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────┘
                              │
                          HTTP/REST
                              │
┌────────────────────────────────────────────────────────────────┐
│                      BACKEND API LAYER                          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Quartos    │  │  Hóspedes    │  │   Reservas   │         │
│  │  Controller  │  │  Controller  │  │  Controller  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │        Middleware (Auth, Validation, Logging)         │     │
│  └──────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────┘
                              │
┌────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │QuartoService │  │HospedeService│  │ReservaService│         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │              Shared Services                          │     │
│  │  • ValidationService                                  │     │
│  │  • NotificationService                                │     │
│  │  • DisponibilidadeService                            │     │
│  └──────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────┘
                              │
┌────────────────────────────────────────────────────────────────┐
│                       DOMAIN LAYER                              │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Quarto    │  │   Hóspede    │  │   Reserva    │         │
│  │   (Entity)   │  │   (Entity)   │  │   (Entity)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐     │
│  │            Value Objects                              │     │
│  │  • CPF        • Email       • Disponibilidade        │     │
│  │  • TipoQuarto • TipoCama    • Preco                  │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐     │
│  │          Business Rules & Domain Services             │     │
│  │  • RegraDisponibilidade                              │     │
│  │  • RegraReserva                                       │     │
│  └──────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────┘
                              │
┌────────────────────────────────────────────────────────────────┐
│                   PERSISTENCE LAYER                             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Quartos    │  │  Hóspedes    │  │   Reservas   │         │
│  │  Repository  │  │  Repository  │  │  Repository  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │           ORM / Query Builder (Prisma/TypeORM)        │     │
│  └──────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────┘
                              │
┌────────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                              │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Quartos    │  │  Hospedes    │  │   Reservas   │         │
│  │    Table     │  │    Table     │  │    Table     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │    Camas     │  │  Amenidades  │                            │
│  │    Table     │  │    Table     │                            │
│  └──────────────┘  └──────────────┘                            │
│                                                                  │
│                    PostgreSQL Database                          │
└────────────────────────────────────────────────────────────────┘

---

## 5. Diagrama de Classes Principal

┌─────────────────────────────────────────────────────────┐
│                        <<Entity>>                        │
│                         Quarto                           │
├─────────────────────────────────────────────────────────┤
│ - id: string                                             │
│ - numero: number                                         │
│ - capacidade: number                                     │
│ - tipo: TipoQuarto                                       │
│ - precoPorDiaria: number                                 │
│ - temFrigobar: boolean                                   │
│ - temCafeDaManha: boolean                                │
│ - temArCondicionado: boolean                             │
│ - temTV: boolean                                         │
│ - disponibilidade: Disponibilidade                       │
│ - camas: Cama[]                                          │
│ - criadoEm: Date                                         │
│ - atualizadoEm: Date                                     │
├─────────────────────────────────────────────────────────┤
│ + alterarDisponibilidade(status: Disponibilidade): void │
│ + podeSerReservado(): boolean                            │
│ + adicionarCama(cama: Cama): void                        │
│ + removerCama(camaId: string): void                      │
│ + calcularValorTotal(numeroDiarias: number): number      │
│ + validar(): ValidationResult                            │
└─────────────────────────────────────────────────────────┘
                          │
                          │ 1
                          │
                          │ *
┌─────────────────────────────────────────────────────────┐
│                   <<Value Object>>                       │
│                          Cama                            │
├─────────────────────────────────────────────────────────┤
│ - id: string                                             │
│ - tipo: TipoCama                                         │
│ - quartoId: string                                       │
├─────────────────────────────────────────────────────────┤
│ + equals(other: Cama): boolean                           │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│                        <<Entity>>                        │
│                        Hospede                           │
├─────────────────────────────────────────────────────────┤
│ - id: string                                             │
│ - nome: string                                           │
│ - sobrenome: string                                      │
│ - cpf: CPF                                               │
│ - email: Email                                           │
│ - criadoEm: Date                                         │
│ - atualizadoEm: Date                                     │
├─────────────────────────────────────────────────────────┤
│ + nomeCompleto(): string                                 │
│ + atualizarEmail(email: Email): void                     │
│ + validar(): ValidationResult                            │
└─────────────────────────────────────────────────────────┘
                          │
                          │ 1
                          │
                          │ *
┌─────────────────────────────────────────────────────────┐
│                        <<Entity>>                        │
│                        Reserva                           │
├─────────────────────────────────────────────────────────┤
│ - id: string                                             │
│ - quartoId: string                                       │
│ - hospedeId: string                                      │
│ - quarto: Quarto                                         │
│ - hospede: Hospede                                       │
│ - dataCheckIn: Date                                      │
│ - dataCheckOut: Date                                     │
│ - status: StatusReserva                                  │
│ - valorTotal: number                                     │
│ - criadoEm: Date                                         │
│ - atualizadoEm: Date                                     │
├─────────────────────────────────────────────────────────┤
│ + calcularNumeroDiarias(): number                        │
│ + calcularValorTotal(): number                           │
│ + confirmar(): void                                      │
│ + cancelar(): void                                       │
│ + checkIn(): void                                        │
│ + checkOut(): void                                       │
│ + podeSerAlterada(): boolean                             │
│ + validar(): ValidationResult                            │
└─────────────────────────────────────────────────────────┘
                          │
                          │ *
                          │
                          │ 1
                          ▼
               ┌──────────────────┐
               │     <<Entity>>   │
               │      Quarto      │
               └──────────────────┘

... (Continuam as demais definições de Value Objects, Enums, Repositories e Services conforme o texto original) ...

---

## 6. Padrões de Projeto Aplicáveis

### 6.1 Padrões Criacionais

#### Factory Pattern
**Onde Aplicar:** Criação de Value Objects (CPF, Email)  
**Justificativa:** Encapsula lógica de validação e criação; garante estado válido.

#### Builder Pattern
**Onde Aplicar:** Construção de entidades complexas (Quarto)  
**Justificativa:** Melhora legibilidade e permite validação progressiva em objetos com muitos campos opcionais.

### 6.2 Padrões Estruturais

#### Repository Pattern
**Onde Aplicar:** Camada de persistência.  
**Justificativa:** Abstrai detalhes de acesso a dados e facilita testes.

#### Adapter Pattern
**Onde Aplicar:** Integração com APIs externas (ex: Gateway de Email).  
**Justificativa:** Desacopla o sistema de dependências externas.

#### Facade Pattern
**Onde Aplicar:** Services que orquestram múltiplos repositórios.  
**Justificativa:** Simplifica operações complexas para os controllers.

### 6.3 Padrões Comportamentais

#### Strategy Pattern
**Onde Aplicar:** Cálculo de preços.  
**Justificativa:** Permite trocar algoritmos de precificação (descontos, alta temporada) facilmente.

#### Observer Pattern
**Onde Aplicar:** Notificações de mudança de status.  
**Justificativa:** Permite que múltiplos interessados reajam a um evento (ex: enviar email ao confirmar reserva).

#### State Pattern
**Onde Aplicar:** Gerenciamento de estados da Reserva.  
**Justificativa:** Encapsula regras de transição de status (Pendente -> Confirmada).

#### Chain of Responsibility
**Onde Aplicar:** Validações em cadeia.  
**Justificativa:** Desacopla validadores e torna a ordem de verificação explícita.

### 6.4 Padrões de Domínio (DDD)
* **Value Object:** Objetos imutáveis validados por valor (CPF, Email).
* **Entity:** Objetos com identidade única e ciclo de vida (Quarto, Hóspede).
* **Aggregate Root:** A Reserva como raiz que garante a consistência do conjunto.

---

## 7. Resumo das Decisões

| Aspecto | Decisão | Razão Principal |
| :--- | :--- | :--- |
| **Arquitetura Geral** | Monolito Modular | Escala apropriada para um hotel |
| **Organização** | Camadas (5 layers) | Separação de responsabilidades |
| **Frontend** | SPA React + TypeScript | UX moderna e type-safety |
| **Backend** | API REST | Simplicidade e padrão estabelecido |
| **Banco de Dados** | PostgreSQL | ACID para reservas |
| **Persistência** | Repository Pattern | Abstração e testabilidade |
| **Validação** | Múltiplas camadas | Segurança em profundidade |
| **Estado** | React Context/Zustand | Suficiente para escopo atual |

---

## 8. Considerações Futuras

**Quando Reavaliar a Arquitetura:**
1.  **Expansão para múltiplos hotéis:** Considerar multi-tenancy ou microserviços.
2.  **Integrações externas complexas:** Channel managers (Booking.com) ou gateways de pagamento.
3.  **Requisitos de escala:** Mais de 10.000 reservas/mês ou 100 usuários simultâneos.
4.  **Compliance:** Necessidade de auditoria rigorosa (Event Sourcing).

---
Esta arquitetura fornece uma base sólida, manutenível e escalável para o sistema de reserva de hotel, com flexibilidade para evoluir conforme necessário.