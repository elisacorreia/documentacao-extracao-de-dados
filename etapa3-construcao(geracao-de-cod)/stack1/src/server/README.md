# Backend - Sistema de Gestão Hoteleira

## 🏗️ Arquitetura

Este backend foi desenvolvido seguindo uma **arquitetura em camadas**:

```
┌─────────────────────────────────────┐
│         CONTROLLERS                 │  ← Camada de Apresentação (HTTP)
├─────────────────────────────────────┤
│         SERVICES                    │  ← Camada de Lógica de Negócio
├─────────────────────────────────────┤
│         REPOSITORIES                │  ← Camada de Acesso a Dados
├─────────────────────────────────────┤
│         DATABASE (Prisma)           │  ← Camada de Persistência
└─────────────────────────────────────┘
```

## 📦 Tecnologias

- **Node.js** + **TypeScript**: Runtime e linguagem
- **Express**: Framework web
- **Prisma**: ORM para gerenciamento de banco de dados
- **Zod**: Validação de schemas
- **SQLite**: Banco de dados (desenvolvimento)

## 🚀 Instalação

```bash
# 1. Entrar na pasta do servidor
cd server

# 2. Instalar dependências
npm install

# 3. Gerar cliente Prisma
npm run prisma:generate

# 4. Executar migrations
npm run prisma:migrate

# 5. Iniciar servidor em modo desenvolvimento
npm run dev
```

O servidor estará rodando em: `http://localhost:3001`

## 📁 Estrutura de Pastas

```
server/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── src/
│   ├── controllers/           # Controladores HTTP
│   │   ├── HospedeController.ts
│   │   ├── QuartoController.ts
│   │   └── ReservaController.ts
│   ├── services/              # Lógica de negócio
│   │   ├── HospedeService.ts
│   │   ├── QuartoService.ts
│   │   └── ReservaService.ts
│   ├── repositories/          # Acesso a dados
│   │   ├── HospedeRepository.ts
│   │   ├── QuartoRepository.ts
│   │   └── ReservaRepository.ts
│   ├── validators/            # Schemas de validação (Zod)
│   │   └── schemas.ts
│   ├── types/                 # Tipos e interfaces TypeScript
│   │   └── index.ts
│   ├── database/              # Configuração do Prisma
│   │   └── prisma.ts
│   ├── routes/                # Definição de rotas
│   │   └── index.ts
│   └── server.ts              # Ponto de entrada da aplicação
└── package.json
```

## 🔌 API Endpoints

### Hóspedes

- `POST /api/hospedes` - Criar hóspede
- `GET /api/hospedes` - Listar todos os hóspedes
- `GET /api/hospedes/:id` - Buscar hóspede por ID

### Quartos

- `POST /api/quartos` - Criar quarto
- `GET /api/quartos` - Listar todos os quartos
- `GET /api/quartos/disponiveis` - Listar quartos disponíveis
- `GET /api/quartos/:id` - Buscar quarto por ID

### Reservas

- `POST /api/reservas` - Criar reserva
- `GET /api/reservas` - Listar todas as reservas
- `GET /api/reservas/ativas` - Listar reservas ativas
- `GET /api/reservas/:id` - Buscar reserva por ID
- `PUT /api/reservas/:id` - Atualizar reserva
- `PATCH /api/reservas/:id/cancelar` - Cancelar reserva

## 📝 Validações Implementadas

### Hóspede
- Nome e sobrenome: mínimo 2 caracteres
- CPF: validação completa do algoritmo de CPF
- CPF único: verifica se já existe no banco
- E-mail: formato válido

### Reserva
- Quarto deve estar disponível
- Quarto não pode ter reserva ativa
- Data de check-out deve ser posterior ao check-in
- Cálculo automático do valor total baseado em diárias

## 🛡️ Tratamento de Erros

Todas as exceções são tratadas e retornam JSON com:
- Status HTTP apropriado (400, 404, 409, 500)
- Mensagem de erro clara
- Flag de sucesso

Exemplo de erro:
```json
{
  "success": false,
  "error": "CPF já cadastrado no sistema"
}
```

## 🗄️ Modelo de Dados (Prisma)

### Hospede
- id (UUID)
- nome (String)
- sobrenome (String)
- cpf (String, único)
- email (String)
- criadoEm (DateTime)

### Quarto
- id (UUID)
- numero (Int, único)
- tipo (String)
- precoDiaria (Float)
- disponivel (Boolean)
- criadoEm (DateTime)

### Reserva
- id (UUID)
- hospedeId (String FK)
- quartoId (String FK)
- dataCheckIn (DateTime)
- dataCheckOut (DateTime)
- valorTotal (Float)
- status (String: 'ativa', 'cancelada', 'concluida')
- criadoEm (DateTime)
- atualizadoEm (DateTime)

## 🔧 Scripts Disponíveis

```bash
npm run dev           # Modo desenvolvimento com hot reload
npm run build         # Compilar TypeScript para JavaScript
npm start             # Executar versão compilada
npm run prisma:generate  # Gerar cliente Prisma
npm run prisma:migrate   # Executar migrations
npm run prisma:studio    # Abrir Prisma Studio (GUI do banco)
```
