# 📋 Documentação Técnica da API

## Base URL
```
http://localhost:8080/api
```

---

## 🏠 Hóspedes

### 1. Criar Hóspede

**Endpoint:** `POST /hospedes`

**Request Body:**
```json
{
  "nome": "João",
  "sobrenome": "Silva",
  "cpf": "12345678901",
  "email": "joao@email.com"
}
```

**Validações:**
- `nome`: obrigatório, mínimo 2 caracteres, máximo 100
- `sobrenome`: obrigatório, mínimo 2 caracteres, máximo 100
- `cpf`: obrigatório, formato válido (validação algorítmica), único
- `email`: obrigatório, formato válido

**Response (201 Created):**
```json
{
  "id": "uuid-gerado",
  "nome": "João",
  "sobrenome": "Silva",
  "cpf": "12345678901",
  "email": "joao@email.com",
  "criadoEm": "2024-02-11T10:30:00"
}
```

**Erro - CPF Duplicado (409 Conflict):**
```json
{
  "status": 409,
  "message": "CPF já cadastrado no sistema",
  "errors": null,
  "timestamp": "2024-02-11T10:30:00"
}
```

**Erro - Validação (400 Bad Request):**
```json
{
  "status": 400,
  "message": "Erro de validação",
  "errors": {
    "cpf": "CPF inválido",
    "email": "E-mail inválido"
  },
  "timestamp": "2024-02-11T10:30:00"
}
```

---

### 2. Listar Todos os Hóspedes

**Endpoint:** `GET /hospedes`

**Response (200 OK):**
```json
[
  {
    "id": "uuid-1",
    "nome": "João",
    "sobrenome": "Silva",
    "cpf": "12345678901",
    "email": "joao@email.com",
    "criadoEm": "2024-02-11T10:30:00"
  },
  {
    "id": "uuid-2",
    "nome": "Maria",
    "sobrenome": "Santos",
    "cpf": "98765432100",
    "email": "maria@email.com",
    "criadoEm": "2024-02-11T11:00:00"
  }
]
```

---

### 3. Buscar Hóspede por ID

**Endpoint:** `GET /hospedes/{id}`

**Response (200 OK):**
```json
{
  "id": "uuid-do-hospede",
  "nome": "João",
  "sobrenome": "Silva",
  "cpf": "12345678901",
  "email": "joao@email.com",
  "criadoEm": "2024-02-11T10:30:00"
}
```

**Erro - Não Encontrado (404 Not Found):**
```json
{
  "status": 404,
  "message": "Hóspede não encontrado com ID: uuid-invalido",
  "errors": null,
  "timestamp": "2024-02-11T10:30:00"
}
```

---

### 4. Buscar Hóspede por CPF

**Endpoint:** `GET /hospedes/cpf/{cpf}`

**Exemplo:** `GET /hospedes/cpf/12345678901`

**Response:** Igual ao endpoint de busca por ID

---

## 🛏️ Quartos

### 1. Criar Quarto

**Endpoint:** `POST /quartos`

**Request Body:**
```json
{
  "numero": 101,
  "tipo": "Suite Luxo",
  "precoDiaria": 350.00
}
```

**Validações:**
- `numero`: obrigatório, positivo, único
- `tipo`: obrigatório
- `precoDiaria`: obrigatório, positivo

**Response (201 Created):**
```json
{
  "id": "uuid-gerado",
  "numero": 101,
  "tipo": "Suite Luxo",
  "precoDiaria": 350.00,
  "disponivel": true,
  "criadoEm": "2024-02-11T10:30:00"
}
```

**Erro - Número Duplicado (409 Conflict):**
```json
{
  "status": 409,
  "message": "Número de quarto já cadastrado no sistema",
  "errors": null,
  "timestamp": "2024-02-11T10:30:00"
}
```

---

### 2. Listar Todos os Quartos

**Endpoint:** `GET /quartos`

**Response (200 OK):**
```json
[
  {
    "id": "uuid-1",
    "numero": 101,
    "tipo": "Suite Luxo",
    "precoDiaria": 350.00,
    "disponivel": true,
    "criadoEm": "2024-02-11T10:30:00"
  },
  {
    "id": "uuid-2",
    "numero": 102,
    "tipo": "Standard",
    "precoDiaria": 150.00,
    "disponivel": false,
    "criadoEm": "2024-02-11T10:30:00"
  }
]
```

---

### 3. Listar Quartos Disponíveis

**Endpoint:** `GET /quartos/disponiveis`

**Response (200 OK):**
```json
[
  {
    "id": "uuid-1",
    "numero": 101,
    "tipo": "Suite Luxo",
    "precoDiaria": 350.00,
    "disponivel": true,
    "criadoEm": "2024-02-11T10:30:00"
  }
]
```

---

### 4. Buscar Quarto por ID

**Endpoint:** `GET /quartos/{id}`

**Response:** Similar ao endpoint de listagem

---

## 📅 Reservas

### 1. Criar Reserva

**Endpoint:** `POST /reservas`

**Request Body:**
```json
{
  "hospedeId": "uuid-do-hospede",
  "quartoId": "uuid-do-quarto",
  "dataCheckIn": "2024-02-15",
  "dataCheckOut": "2024-02-18"
}
```

**Validações:**
- `hospedeId`: obrigatório, deve existir
- `quartoId`: obrigatório, deve existir
- `dataCheckIn`: obrigatório, não pode ser no passado
- `dataCheckOut`: obrigatório, deve ser posterior ao check-in
- Quarto deve estar disponível (disponivel == true)
- Não pode haver outra reserva ativa para o mesmo quarto

**Response (201 Created):**
```json
{
  "id": "uuid-gerado",
  "hospedeId": "uuid-do-hospede",
  "quartoId": "uuid-do-quarto",
  "dataCheckIn": "2024-02-15",
  "dataCheckOut": "2024-02-18",
  "valorTotal": 1050.00,
  "status": "ATIVA",
  "criadoEm": "2024-02-11T10:30:00",
  "atualizadoEm": "2024-02-11T10:30:00",
  "hospedeNome": "João Silva",
  "quartoNumero": 101
}
```

**Observação:** O `valorTotal` é calculado automaticamente:
```
valorTotal = (dataCheckOut - dataCheckIn) × precoDiaria
Exemplo: 3 dias × R$ 350 = R$ 1.050
```

**Erro - Quarto Não Disponível (409 Conflict):**
```json
{
  "status": 409,
  "message": "Quarto não está disponível para reserva",
  "errors": null,
  "timestamp": "2024-02-11T10:30:00"
}
```

**Erro - Reserva Ativa Existente (409 Conflict):**
```json
{
  "status": 409,
  "message": "Já existe uma reserva ativa para este quarto",
  "errors": null,
  "timestamp": "2024-02-11T10:30:00"
}
```

**Erro - Datas Inválidas (409 Conflict):**
```json
{
  "status": 409,
  "message": "Data de check-out deve ser posterior à data de check-in",
  "errors": null,
  "timestamp": "2024-02-11T10:30:00"
}
```

---

### 2. Listar Todas as Reservas

**Endpoint:** `GET /reservas`

**Response (200 OK):**
```json
[
  {
    "id": "uuid-1",
    "hospedeId": "uuid-do-hospede",
    "quartoId": "uuid-do-quarto",
    "dataCheckIn": "2024-02-15",
    "dataCheckOut": "2024-02-18",
    "valorTotal": 1050.00,
    "status": "ATIVA",
    "criadoEm": "2024-02-11T10:30:00",
    "atualizadoEm": "2024-02-11T10:30:00",
    "hospedeNome": "João Silva",
    "quartoNumero": 101
  },
  {
    "id": "uuid-2",
    "hospedeId": "uuid-do-hospede-2",
    "quartoId": "uuid-do-quarto-2",
    "dataCheckIn": "2024-02-20",
    "dataCheckOut": "2024-02-22",
    "valorTotal": 400.00,
    "status": "CANCELADA",
    "criadoEm": "2024-02-11T11:00:00",
    "atualizadoEm": "2024-02-11T12:00:00",
    "hospedeNome": "Maria Santos",
    "quartoNumero": 102
  }
]
```

---

### 3. Listar Reservas Ativas

**Endpoint:** `GET /reservas/ativas`

**Response (200 OK):**
```json
[
  {
    "id": "uuid-1",
    "hospedeId": "uuid-do-hospede",
    "quartoId": "uuid-do-quarto",
    "dataCheckIn": "2024-02-15",
    "dataCheckOut": "2024-02-18",
    "valorTotal": 1050.00,
    "status": "ATIVA",
    "criadoEm": "2024-02-11T10:30:00",
    "atualizadoEm": "2024-02-11T10:30:00",
    "hospedeNome": "João Silva",
    "quartoNumero": 101
  }
]
```

---

### 4. Buscar Reserva por ID

**Endpoint:** `GET /reservas/{id}`

**Response:** Similar ao endpoint de listagem

---

### 5. Atualizar Reserva

**Endpoint:** `PUT /reservas/{id}`

**Request Body:**
```json
{
  "hospedeId": "uuid-do-hospede",
  "quartoId": "uuid-do-quarto",
  "dataCheckIn": "2024-02-16",
  "dataCheckOut": "2024-02-19"
}
```

**Observações:**
- Apenas as datas podem ser atualizadas
- O hóspede e quarto permanecem os mesmos
- O valor total é recalculado automaticamente

**Response (200 OK):**
```json
{
  "id": "uuid-da-reserva",
  "hospedeId": "uuid-do-hospede",
  "quartoId": "uuid-do-quarto",
  "dataCheckIn": "2024-02-16",
  "dataCheckOut": "2024-02-19",
  "valorTotal": 1050.00,
  "status": "ATIVA",
  "criadoEm": "2024-02-11T10:30:00",
  "atualizadoEm": "2024-02-11T14:00:00",
  "hospedeNome": "João Silva",
  "quartoNumero": 101
}
```

---

### 6. Cancelar Reserva

**Endpoint:** `PATCH /reservas/{id}/cancelar`

**Observações:**
- Altera o status da reserva para `CANCELADA`
- Libera o quarto (disponivel = true)
- Apenas reservas com status `ATIVA` podem ser canceladas

**Response (204 No Content)**

**Erro - Reserva Já Cancelada (409 Conflict):**
```json
{
  "status": 409,
  "message": "Apenas reservas ativas podem ser canceladas",
  "errors": null,
  "timestamp": "2024-02-11T10:30:00"
}
```

---

## 📊 Status de Reserva

| Status | Descrição |
|--------|-----------|
| `ATIVA` | Reserva confirmada, quarto ocupado |
| `CANCELADA` | Reserva cancelada, quarto liberado |
| `FINALIZADA` | Reserva concluída (check-out realizado) |

---

## 🔄 Fluxo Completo de Uso

### Cenário 1: Criar Reserva com Sucesso

```bash
# 1. Criar um quarto
POST /api/quartos
{
  "numero": 101,
  "tipo": "Suite Luxo",
  "precoDiaria": 350.00
}
# Resposta: { "id": "quarto-uuid", "disponivel": true }

# 2. Criar um hóspede
POST /api/hospedes
{
  "nome": "João",
  "sobrenome": "Silva",
  "cpf": "12345678901",
  "email": "joao@email.com"
}
# Resposta: { "id": "hospede-uuid" }

# 3. Criar uma reserva
POST /api/reservas
{
  "hospedeId": "hospede-uuid",
  "quartoId": "quarto-uuid",
  "dataCheckIn": "2024-02-15",
  "dataCheckOut": "2024-02-18"
}
# Resposta: { "id": "reserva-uuid", "status": "ATIVA", "valorTotal": 1050.00 }

# 4. Verificar quarto ficou ocupado
GET /api/quartos/quarto-uuid
# Resposta: { "disponivel": false }
```

### Cenário 2: Tentativa de Reserva em Quarto Ocupado

```bash
# 1. Tentar criar outra reserva no mesmo quarto
POST /api/reservas
{
  "hospedeId": "outro-hospede-uuid",
  "quartoId": "quarto-uuid",
  "dataCheckIn": "2024-02-16",
  "dataCheckOut": "2024-02-20"
}
# Resposta: 409 Conflict
# { "message": "Quarto não está disponível para reserva" }
```

### Cenário 3: Cancelar Reserva

```bash
# 1. Cancelar a reserva
PATCH /api/reservas/reserva-uuid/cancelar
# Resposta: 204 No Content

# 2. Verificar quarto ficou disponível
GET /api/quartos/quarto-uuid
# Resposta: { "disponivel": true }

# 3. Verificar status da reserva
GET /api/reservas/reserva-uuid
# Resposta: { "status": "CANCELADA" }
```

---

## 🛡️ Códigos de Status HTTP

| Código | Significado | Quando Ocorre |
|--------|-------------|---------------|
| 200 | OK | Requisição bem-sucedida (GET, PUT) |
| 201 | Created | Recurso criado com sucesso (POST) |
| 204 | No Content | Operação bem-sucedida sem retorno (DELETE, PATCH) |
| 400 | Bad Request | Erro de validação (Bean Validation) |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito de regra de negócio (CPF duplicado, quarto ocupado) |
| 500 | Internal Server Error | Erro interno do servidor |

---

**Última atualização:** 11/02/2024
