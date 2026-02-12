# 🏨 Sistema de Gestão Hoteleira

Sistema completo de gestão hoteleira desenvolvido com **TypeScript**, **Node.js** (backend) e **React** (frontend), focado em **Gestão de Hóspedes e Reservas**.

## 🎯 Funcionalidades Principais

### Gestão de Hóspedes
- ✅ Cadastro de hóspedes com validação completa
- ✅ Validação de CPF (formato e algoritmo)
- ✅ Validação de e-mail
- ✅ CPF único no sistema (impede duplicação)
- ✅ Listagem de todos os hóspedes cadastrados
- ✅ Formatação automática de CPF

### Gestão de Quartos
- ✅ Cadastro de quartos com número único
- ✅ Múltiplos tipos de quarto (Standard, Suite, Cobertura, etc.)
- ✅ Definição de preço por diária
- ✅ Listagem de todos os quartos
- ✅ Filtro por quartos disponíveis
- ✅ Visualização de status (Disponível/Ocupado)
- ✅ Estatísticas de disponibilidade

### Gestão de Reservas
- ✅ Criação de reservas associando hóspede a quarto
- ✅ Validação de disponibilidade do quarto
- ✅ Impede reserva de quarto ocupado
- ✅ Listagem de todas as reservas
- ✅ Filtro por reservas ativas
- ✅ Edição de datas de reservas
- ✅ Cancelamento de reservas
- ✅ Atualização automática do status do quarto
- ✅ Cálculo automático do valor total (diárias × preço)
- ✅ Exibição clara do status de disponibilidade

## 🏗️ Arquitetura

### Backend (Node.js + Express + Prisma)

```
┌─────────────────────────────────────┐
│         CONTROLLERS                 │  ← HTTP Requests/Responses
├─────────────────────────────────────┤
│         SERVICES                    │  ← Lógica de Negócio + Validações
├─────────────────────────────────────┤
│         REPOSITORIES                │  ← Acesso ao Banco de Dados
├─────────────────────────────────────┤
│         PRISMA ORM                  │  ← Abstração do Banco
└─────────────────────────────────────┘
```

**Tecnologias:**
- TypeScript
- Express (servidor HTTP)
- Prisma (ORM)
- Zod (validação de schemas)
- SQLite (banco de dados)

### Frontend (React + TypeScript)

```
┌─────────────────────────────────────┐
│         COMPONENTS                  │  ← UI Components (React)
├─────────────────────────────────────┤
│         SERVICES                    │  ← API Calls (Axios)
├─────────────────────────────────────┤
│         TYPES                       │  ← TypeScript Interfaces
└─────────────────────────────────────┘
```

**Tecnologias:**
- React (Hooks)
- TypeScript
- Axios (requisições HTTP)
- Tailwind CSS (estilização)

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### 1. Backend (Servidor)

```bash
# Entrar na pasta do servidor
cd server

# Instalar dependências
npm install

# Gerar cliente Prisma
npm run prisma:generate

# Executar migrations do banco de dados
npm run prisma:migrate

# Iniciar servidor
npm run dev
```

O servidor estará rodando em: **http://localhost:3001**

### 2. Frontend (Interface)

```bash
# Voltar para a raiz do projeto
cd ..

# Instalar dependências (se necessário)
npm install

# Iniciar aplicação React
npm run dev
```

A interface estará rodando em: **http://localhost:5173**

## 📡 API Endpoints

### Hóspedes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/hospedes` | Criar novo hóspede |
| GET | `/api/hospedes` | Listar todos os hóspedes |
| GET | `/api/hospedes/:id` | Buscar hóspede por ID |

**Exemplo de requisição (POST /api/hospedes):**
```json
{
  "nome": "João",
  "sobrenome": "Silva",
  "cpf": "123.456.789-00",
  "email": "joao@email.com"
}
```

### Quartos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/quartos` | Criar novo quarto |
| GET | `/api/quartos` | Listar todos os quartos |
| GET | `/api/quartos/disponiveis` | Listar quartos disponíveis |
| GET | `/api/quartos/:id` | Buscar quarto por ID |

**Exemplo de requisição (POST /api/quartos):**
```json
{
  "numero": 101,
  "tipo": "Suite Luxo",
  "precoDiaria": 350.00
}
```

### Reservas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/reservas` | Criar nova reserva |
| GET | `/api/reservas` | Listar todas as reservas |
| GET | `/api/reservas/ativas` | Listar reservas ativas |
| GET | `/api/reservas/:id` | Buscar reserva por ID |
| PUT | `/api/reservas/:id` | Atualizar reserva |
| PATCH | `/api/reservas/:id/cancelar` | Cancelar reserva |

**Exemplo de requisição (POST /api/reservas):**
```json
{
  "hospedeId": "uuid-do-hospede",
  "quartoId": "uuid-do-quarto",
  "dataCheckIn": "2024-02-15",
  "dataCheckOut": "2024-02-18"
}
```

## 🛡️ Validações e Regras de Negócio

### Validações de Hóspede
- ✅ Nome e sobrenome devem ter no mínimo 2 caracteres
- ✅ CPF deve ser válido (algoritmo completo de validação)
- ✅ CPF deve ser único no sistema
- ✅ E-mail deve ter formato válido

### Validações de Reserva
- ✅ Hóspede deve existir
- ✅ Quarto deve existir
- ✅ Quarto deve estar disponível
- ✅ Quarto não pode ter outra reserva ativa
- ✅ Data de check-out deve ser posterior ao check-in
- ✅ Valor total é calculado automaticamente (diárias × preço)

### Tratamento de Erros

Todos os erros retornam JSON com estrutura clara:

**Exemplo - CPF duplicado (409):**
```json
{
  "success": false,
  "error": "CPF já cadastrado no sistema"
}
```

**Exemplo - Quarto ocupado (400):**
```json
{
  "success": false,
  "error": "Quarto não está disponível para reserva"
}
```

## 📂 Estrutura do Projeto

```
hotel-management/
├── server/                    # Backend (Node.js + Express + Prisma)
│   ├── prisma/
│   │   └── schema.prisma      # Schema do banco de dados
│   ├── src/
│   │   ├── controllers/       # Camada de apresentação (HTTP)
│   │   ├── services/          # Camada de lógica de negócio
│   │   ├── repositories/      # Camada de acesso a dados
│   │   ├── validators/        # Schemas Zod
│   │   ├── types/             # Interfaces TypeScript
│   │   ├── routes/            # Definição de rotas
│   │   └── server.ts          # Entrada da aplicação
│   └── package.json
├── src/                       # Frontend (React + TypeScript)
│   ├── components/            # Componentes React
│   │   ├── HospedeForm.tsx
│   │   ├── HospedeList.tsx
│   │   ├── QuartoForm.tsx
│   │   ├── QuartoList.tsx
│   │   ├── ReservaForm.tsx
│   │   └── ReservaList.tsx
│   ├── services/              # Chamadas à API (Axios)
│   │   ├── api.ts
│   │   ├── hospedeService.ts
│   │   ├── quartoService.ts
│   │   └── reservaService.ts
│   └── types/                 # Interfaces TypeScript
│       └── index.ts
├── App.tsx                    # Componente principal
└── README.md
```

## 💡 Decisões Técnicas

### Por que Prisma?
- Type-safe database access
- Migrations automáticas
- Excelente integração com TypeScript
- Query builder intuitivo

### Por que Zod?
- Validação em runtime
- Type inference automático
- Mensagens de erro customizáveis
- Integração perfeita com TypeScript

### Por que Arquitetura em Camadas?
- **Separação de responsabilidades** (SOLID)
- **Testabilidade** (cada camada pode ser testada isoladamente)
- **Manutenibilidade** (mudanças em uma camada não afetam outras)
- **Escalabilidade** (fácil adicionar novas features)

## 🧪 Testando a Aplicação

### 1. Criar alguns quartos

Use o Prisma Studio ou crie via endpoint:
```bash
curl -X POST http://localhost:3001/api/quartos \
  -H "Content-Type: application/json" \
  -d '{"numero": 101, "tipo": "Suite Luxo", "precoDiaria": 350}'
```

### 2. Cadastrar hóspedes

Use a interface ou:
```bash
curl -X POST http://localhost:3001/api/hospedes \
  -H "Content-Type: application/json" \
  -d '{"nome": "João", "sobrenome": "Silva", "cpf": "12345678901", "email": "joao@email.com"}'
```

### 3. Criar reservas

Use a interface React que já lista hóspedes e quartos disponíveis automaticamente.

## 🎨 Interface do Usuário

A interface foi desenvolvida com foco em **usabilidade** e **clareza**:

- 📱 **Responsiva** (funciona em desktop e mobile)
- 🎯 **Intuitiva** (navegação por abas)
- ✅ **Validação em tempo real** (feedback imediato)
- 🎨 **Design moderno** (Tailwind CSS)
- 📊 **Status visuais** (badges de status, cores semânticas)

## 📝 Próximas Melhorias

- [ ] Autenticação e autorização
- [ ] Relatórios de ocupação
- [ ] Histórico de reservas por hóspede
- [ ] Filtros avançados de busca
- [ ] Exportação de dados (PDF, Excel)
- [ ] Dashboard com estatísticas
- [ ] Sistema de notificações
- [ ] Integração com gateway de pagamento

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ usando TypeScript, Node.js e React**