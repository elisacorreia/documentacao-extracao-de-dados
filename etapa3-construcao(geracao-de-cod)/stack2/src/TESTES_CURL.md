# 🧪 Testes com cURL

Este documento contém exemplos práticos de requisições para testar toda a API.

---

## 🏠 HÓSPEDES

### ✅ Criar Hóspede (Sucesso)

```bash
curl -X POST http://localhost:8080/api/hospedes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João",
    "sobrenome": "Silva",
    "cpf": "12345678901",
    "email": "joao.silva@email.com"
  }'
```

**Resposta esperada (201 Created):**
```json
{
  "id": "uuid-gerado",
  "nome": "João",
  "sobrenome": "Silva",
  "cpf": "12345678901",
  "email": "joao.silva@email.com",
  "criadoEm": "2024-02-11T10:30:00"
}
```

---

### ❌ Tentar Criar Hóspede com CPF Duplicado

```bash
# Primeiro, execute o comando acima para criar o hóspede
# Depois, tente criar novamente com o mesmo CPF:

curl -X POST http://localhost:8080/api/hospedes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria",
    "sobrenome": "Santos",
    "cpf": "12345678901",
    "email": "maria@email.com"
  }'
```

**Resposta esperada (409 Conflict):**
```json
{
  "status": 409,
  "message": "CPF já cadastrado no sistema",
  "errors": null,
  "timestamp": "2024-02-11T10:35:00"
}
```

---

### ❌ Tentar Criar Hóspede com CPF Inválido

```bash
curl -X POST http://localhost:8080/api/hospedes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Pedro",
    "sobrenome": "Oliveira",
    "cpf": "00000000000",
    "email": "pedro@email.com"
  }'
```

**Resposta esperada (400 Bad Request):**
```json
{
  "status": 400,
  "message": "Erro de validação",
  "errors": {
    "cpf": "CPF inválido"
  },
  "timestamp": "2024-02-11T10:40:00"
}
```

---

### ❌ Tentar Criar Hóspede com E-mail Inválido

```bash
curl -X POST http://localhost:8080/api/hospedes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Carlos",
    "sobrenome": "Mendes",
    "cpf": "98765432100",
    "email": "email-invalido"
  }'
```

**Resposta esperada (400 Bad Request):**
```json
{
  "status": 400,
  "message": "Erro de validação",
  "errors": {
    "email": "E-mail inválido"
  },
  "timestamp": "2024-02-11T10:45:00"
}
```

---

### 📋 Listar Todos os Hóspedes

```bash
curl http://localhost:8080/api/hospedes
```

**Resposta esperada (200 OK):**
```json
[
  {
    "id": "uuid-1",
    "nome": "João",
    "sobrenome": "Silva",
    "cpf": "12345678901",
    "email": "joao.silva@email.com",
    "criadoEm": "2024-02-11T10:30:00"
  },
  {
    "id": "uuid-2",
    "nome": "Maria",
    "sobrenome": "Santos",
    "cpf": "98765432100",
    "email": "maria.santos@email.com",
    "criadoEm": "2024-02-11T11:00:00"
  }
]
```

---

### 🔍 Buscar Hóspede por ID

```bash
# Substitua {uuid} pelo ID retornado na criação
curl http://localhost:8080/api/hospedes/{uuid}
```

---

### 🔍 Buscar Hóspede por CPF

```bash
curl http://localhost:8080/api/hospedes/cpf/12345678901
```

---

## 🛏️ QUARTOS

### ✅ Criar Quarto (Sucesso)

```bash
curl -X POST http://localhost:8080/api/quartos \
  -H "Content-Type: application/json" \
  -d '{
    "numero": 101,
    "tipo": "Suite Luxo",
    "precoDiaria": 350.00
  }'
```

**Resposta esperada (201 Created):**
```json
{
  "id": "uuid-gerado",
  "numero": 101,
  "tipo": "Suite Luxo",
  "precoDiaria": 350.00,
  "disponivel": true,
  "criadoEm": "2024-02-11T10:50:00"
}
```

---

### ✅ Criar Vários Quartos

```bash
# Quarto Standard
curl -X POST http://localhost:8080/api/quartos \
  -H "Content-Type: application/json" \
  -d '{
    "numero": 102,
    "tipo": "Standard",
    "precoDiaria": 150.00
  }'

# Quarto Standard Duplo
curl -X POST http://localhost:8080/api/quartos \
  -H "Content-Type: application/json" \
  -d '{
    "numero": 103,
    "tipo": "Standard Duplo",
    "precoDiaria": 200.00
  }'

# Suite Executiva
curl -X POST http://localhost:8080/api/quartos \
  -H "Content-Type: application/json" \
  -d '{
    "numero": 201,
    "tipo": "Suite Executiva",
    "precoDiaria": 400.00
  }'

# Cobertura Premium
curl -X POST http://localhost:8080/api/quartos \
  -H "Content-Type: application/json" \
  -d '{
    "numero": 301,
    "tipo": "Cobertura Premium",
    "precoDiaria": 800.00
  }'
```

---

### ❌ Tentar Criar Quarto com Número Duplicado

```bash
curl -X POST http://localhost:8080/api/quartos \
  -H "Content-Type: application/json" \
  -d '{
    "numero": 101,
    "tipo": "Standard",
    "precoDiaria": 150.00
  }'
```

**Resposta esperada (409 Conflict):**
```json
{
  "status": 409,
  "message": "Número de quarto já cadastrado no sistema",
  "errors": null,
  "timestamp": "2024-02-11T11:00:00"
}
```

---

### 📋 Listar Todos os Quartos

```bash
curl http://localhost:8080/api/quartos
```

---

### 📋 Listar Apenas Quartos Disponíveis

```bash
curl http://localhost:8080/api/quartos/disponiveis
```

---

### 🔍 Buscar Quarto por ID

```bash
curl http://localhost:8080/api/quartos/{uuid}
```

---

## 📅 RESERVAS

### ✅ Criar Reserva (Sucesso)

```bash
# IMPORTANTE: Substitua os UUIDs pelos valores reais retornados nas criações anteriores
curl -X POST http://localhost:8080/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "hospedeId": "uuid-do-hospede",
    "quartoId": "uuid-do-quarto",
    "dataCheckIn": "2024-02-15",
    "dataCheckOut": "2024-02-18"
  }'
```

**Resposta esperada (201 Created):**
```json
{
  "id": "uuid-gerado",
  "hospedeId": "uuid-do-hospede",
  "quartoId": "uuid-do-quarto",
  "dataCheckIn": "2024-02-15",
  "dataCheckOut": "2024-02-18",
  "valorTotal": 1050.00,
  "status": "ATIVA",
  "criadoEm": "2024-02-11T11:10:00",
  "atualizadoEm": "2024-02-11T11:10:00",
  "hospedeNome": "João Silva",
  "quartoNumero": 101
}
```

**Observação:** O `valorTotal` é calculado automaticamente:
- 3 dias (18 - 15) × R$ 350 = R$ 1.050

---

### ❌ Tentar Criar Reserva em Quarto Ocupado

```bash
# Tente criar outra reserva no mesmo quarto do exemplo anterior
curl -X POST http://localhost:8080/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "hospedeId": "outro-uuid-de-hospede",
    "quartoId": "uuid-do-quarto-ocupado",
    "dataCheckIn": "2024-02-16",
    "dataCheckOut": "2024-02-20"
  }'
```

**Resposta esperada (409 Conflict):**
```json
{
  "status": 409,
  "message": "Quarto não está disponível para reserva",
  "errors": null,
  "timestamp": "2024-02-11T11:15:00"
}
```

---

### ❌ Tentar Criar Reserva com Check-out Antes do Check-in

```bash
curl -X POST http://localhost:8080/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "hospedeId": "uuid-do-hospede",
    "quartoId": "uuid-do-quarto",
    "dataCheckIn": "2024-02-18",
    "dataCheckOut": "2024-02-15"
  }'
```

**Resposta esperada (409 Conflict):**
```json
{
  "status": 409,
  "message": "Data de check-out deve ser posterior à data de check-in",
  "errors": null,
  "timestamp": "2024-02-11T11:20:00"
}
```

---

### ❌ Tentar Criar Reserva com Check-in no Passado

```bash
curl -X POST http://localhost:8080/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "hospedeId": "uuid-do-hospede",
    "quartoId": "uuid-do-quarto",
    "dataCheckIn": "2023-01-01",
    "dataCheckOut": "2023-01-05"
  }'
```

**Resposta esperada (409 Conflict):**
```json
{
  "status": 409,
  "message": "Data de check-in não pode ser no passado",
  "errors": null,
  "timestamp": "2024-02-11T11:25:00"
}
```

---

### 📋 Listar Todas as Reservas

```bash
curl http://localhost:8080/api/reservas
```

---

### 📋 Listar Apenas Reservas Ativas

```bash
curl http://localhost:8080/api/reservas/ativas
```

---

### 🔍 Buscar Reserva por ID

```bash
curl http://localhost:8080/api/reservas/{uuid}
```

---

### ✏️ Atualizar Reserva (Alterar Datas)

```bash
curl -X PUT http://localhost:8080/api/reservas/{uuid-da-reserva} \
  -H "Content-Type: application/json" \
  -d '{
    "hospedeId": "uuid-do-hospede",
    "quartoId": "uuid-do-quarto",
    "dataCheckIn": "2024-02-16",
    "dataCheckOut": "2024-02-19"
  }'
```

**Resposta esperada (200 OK):**
```json
{
  "id": "uuid-da-reserva",
  "hospedeId": "uuid-do-hospede",
  "quartoId": "uuid-do-quarto",
  "dataCheckIn": "2024-02-16",
  "dataCheckOut": "2024-02-19",
  "valorTotal": 1050.00,
  "status": "ATIVA",
  "criadoEm": "2024-02-11T11:10:00",
  "atualizadoEm": "2024-02-11T11:30:00",
  "hospedeNome": "João Silva",
  "quartoNumero": 101
}
```

---

### ❌ Cancelar Reserva

```bash
curl -X PATCH http://localhost:8080/api/reservas/{uuid-da-reserva}/cancelar
```

**Resposta esperada (204 No Content)**

**Após cancelamento:**
- Status da reserva muda para `CANCELADA`
- Quarto fica disponível novamente (`disponivel = true`)

**Verificar que o quarto ficou disponível:**
```bash
curl http://localhost:8080/api/quartos/{uuid-do-quarto}
```

Resposta mostrará `"disponivel": true`

---

### ❌ Tentar Cancelar Reserva Já Cancelada

```bash
# Execute o comando de cancelamento novamente
curl -X PATCH http://localhost:8080/api/reservas/{uuid-da-reserva}/cancelar
```

**Resposta esperada (409 Conflict):**
```json
{
  "status": 409,
  "message": "Apenas reservas ativas podem ser canceladas",
  "errors": null,
  "timestamp": "2024-02-11T11:40:00"
}
```

---

## 🔄 Fluxo Completo de Testes

Execute os comandos nesta ordem para um teste completo:

```bash
# 1️⃣ CRIAR QUARTOS
curl -X POST http://localhost:8080/api/quartos \
  -H "Content-Type: application/json" \
  -d '{"numero": 101, "tipo": "Suite Luxo", "precoDiaria": 350.00}'

curl -X POST http://localhost:8080/api/quartos \
  -H "Content-Type: application/json" \
  -d '{"numero": 102, "tipo": "Standard", "precoDiaria": 150.00}'

# 2️⃣ CRIAR HÓSPEDES
curl -X POST http://localhost:8080/api/hospedes \
  -H "Content-Type: application/json" \
  -d '{"nome": "João", "sobrenome": "Silva", "cpf": "12345678901", "email": "joao@email.com"}'

curl -X POST http://localhost:8080/api/hospedes \
  -H "Content-Type: application/json" \
  -d '{"nome": "Maria", "sobrenome": "Santos", "cpf": "98765432100", "email": "maria@email.com"}'

# 3️⃣ LISTAR HÓSPEDES E QUARTOS (copie os UUIDs retornados)
curl http://localhost:8080/api/hospedes
curl http://localhost:8080/api/quartos/disponiveis

# 4️⃣ CRIAR RESERVA (substitua os UUIDs)
curl -X POST http://localhost:8080/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "hospedeId": "COLE-UUID-HOSPEDE-AQUI",
    "quartoId": "COLE-UUID-QUARTO-AQUI",
    "dataCheckIn": "2024-02-15",
    "dataCheckOut": "2024-02-18"
  }'

# 5️⃣ LISTAR RESERVAS ATIVAS
curl http://localhost:8080/api/reservas/ativas

# 6️⃣ VERIFICAR QUARTO FICOU OCUPADO
curl http://localhost:8080/api/quartos/disponiveis
# O quarto reservado não deve aparecer nesta lista

# 7️⃣ TENTAR RESERVAR QUARTO OCUPADO (deve dar erro)
curl -X POST http://localhost:8080/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "hospedeId": "OUTRO-UUID-HOSPEDE",
    "quartoId": "UUID-DO-QUARTO-OCUPADO",
    "dataCheckIn": "2024-02-16",
    "dataCheckOut": "2024-02-20"
  }'

# 8️⃣ CANCELAR RESERVA (substitua o UUID)
curl -X PATCH http://localhost:8080/api/reservas/COLE-UUID-RESERVA-AQUI/cancelar

# 9️⃣ VERIFICAR QUARTO FICOU DISPONÍVEL NOVAMENTE
curl http://localhost:8080/api/quartos/disponiveis
# O quarto deve aparecer novamente na lista
```

---

## 📊 Testes de Validação

### CPFs Válidos para Teste
```
12345678909
98765432100
11122233344
55544433322
```

### CPFs Inválidos (devem retornar erro)
```
00000000000
11111111111
12345678900
```

### E-mails Válidos
```
joao@email.com
maria.santos@gmail.com
pedro_oliveira@empresa.com.br
```

### E-mails Inválidos (devem retornar erro)
```
email-invalido
@semdominio.com
usuario@
```

---

## 🎯 Checklist de Testes

- [ ] Criar hóspede com sucesso
- [ ] Tentar criar hóspede com CPF duplicado (erro 409)
- [ ] Tentar criar hóspede com CPF inválido (erro 400)
- [ ] Tentar criar hóspede com e-mail inválido (erro 400)
- [ ] Listar todos os hóspedes
- [ ] Buscar hóspede por ID
- [ ] Buscar hóspede por CPF
- [ ] Criar quarto com sucesso
- [ ] Tentar criar quarto com número duplicado (erro 409)
- [ ] Listar todos os quartos
- [ ] Listar quartos disponíveis
- [ ] Criar reserva com sucesso
- [ ] Verificar cálculo automático do valor total
- [ ] Verificar quarto ficou ocupado após reserva
- [ ] Tentar reservar quarto ocupado (erro 409)
- [ ] Tentar criar reserva com datas inválidas (erro 409)
- [ ] Listar reservas ativas
- [ ] Atualizar datas de uma reserva
- [ ] Cancelar reserva
- [ ] Verificar quarto ficou disponível após cancelamento
- [ ] Tentar cancelar reserva já cancelada (erro 409)

---

**Última atualização:** 11/02/2024
