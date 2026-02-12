# 🏨 Sistema de Gestão Hotelaria - Java Spring Boot

Sistema completo de gestão hoteleira desenvolvido com **Java 17**, **Spring Boot 3.2**, **Spring Data JPA** e **H2 Database**.

## 🎯 Funcionalidades

### ✅ Gestão de Hóspedes
- Cadastro com validação de CPF (@CPF) e e-mail (@Email)
- CPF único no sistema (validação de duplicidade)
- Listagem de todos os hóspedes
- Busca por ID e CPF

### ✅ Gestão de Quartos
- Cadastro de quartos com número único
- Tipos variados (Standard, Suite, etc.)
- Controle de disponibilidade (boolean)
- Listagem de quartos disponíveis e ocupados
- Definição de preço por diária

### ✅ Gestão de Reservas
- Criação de reservas (hóspede + quarto)
- **Validação automática de disponibilidade**
- Impede reserva de quarto ocupado
- Cálculo automático do valor total
- Listagem de reservas ativas
- Edição de datas de reservas
- Cancelamento de reservas

## 🏗️ Arquitetura

### Camadas (Spring Pattern)

```
┌─────────────────────────────────────┐
│         CONTROLLER                  │  ← REST API (@RestController)
├─────────────────────────────────────┤
│         SERVICE                     │  ← Lógica de Negócio (@Service)
├─────────────────────────────────────┤
│         REPOSITORY                  │  ← Acesso aos Dados (JPA)
├─────────────────────────────────────┤
│         JPA / HIBERNATE             │  ← ORM
├─────────────────────────────────────┤
│         H2 DATABASE                 │  ← Banco em Memória
└─────────────────────────────────────┘
```

### Tecnologias Utilizadas

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data JPA** (persistência)
- **Hibernate Validator** (Bean Validation)
- **H2 Database** (banco em memória)
- **Lombok** (redução de boilerplate)
- **Maven** (gerenciamento de dependências)

## 🚀 Como Executar

### Pré-requisitos

- Java 17+ instalado
- Maven 3.8+ instalado

### Executar a Aplicação

```bash
# 1. Compilar o projeto
mvn clean install

# 2. Executar a aplicação
mvn spring-boot:run
```

A aplicação estará disponível em: **http://localhost:8080**

### Acessar o Console H2

1. Navegue até: **http://localhost:8080/h2-console**
2. Configure a conexão:
   - **JDBC URL**: `jdbc:h2:mem:hoteldb`
   - **User Name**: `sa`
   - **Password**: (deixe em branco)
3. Clique em **Connect**

## 📡 API Endpoints

### Hóspedes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/hospedes` | Criar novo hóspede |
| GET | `/api/hospedes` | Listar todos os hóspedes |
| GET | `/api/hospedes/{id}` | Buscar hóspede por ID |
| GET | `/api/hospedes/cpf/{cpf}` | Buscar hóspede por CPF |

**Exemplo - POST /api/hospedes:**
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
| GET | `/api/quartos/{id}` | Buscar quarto por ID |

**Exemplo - POST /api/quartos:**
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
| GET | `/api/reservas/{id}` | Buscar reserva por ID |
| PUT | `/api/reservas/{id}` | Atualizar reserva |
| PATCH | `/api/reservas/{id}/cancelar` | Cancelar reserva |

**Exemplo - POST /api/reservas:**
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
✅ Nome e sobrenome: mínimo 2 caracteres  
✅ CPF: formato válido (validação algorítmica)  
✅ CPF: **único no sistema** (impede duplicação)  
✅ E-mail: formato válido

### Validações de Quarto
✅ Número: deve ser positivo e único  
✅ Tipo: obrigatório  
✅ Preço da diária: deve ser positivo  
✅ Disponibilidade: controlada automaticamente

### Validações de Reserva
✅ Hóspede deve existir  
✅ Quarto deve existir  
✅ **Quarto deve estar disponível** (disponivel == true)  
✅ Não pode haver outra reserva ativa para o mesmo quarto  
✅ Check-out deve ser posterior ao check-in  
✅ Check-in não pode ser no passado  
✅ Valor total calculado automaticamente (diárias × preço)

### Tratamento de Erros (@ControllerAdvice)

**Erro 400 - Validação (Bean Validation):**
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

**Erro 409 - CPF Duplicado:**
```json
{
  "status": 409,
  "message": "CPF já cadastrado no sistema",
  "errors": null,
  "timestamp": "2024-02-11T10:30:00"
}
```

**Erro 409 - Quarto Ocupado:**
```json
{
  "status": 409,
  "message": "Quarto não está disponível para reserva",
  "errors": null,
  "timestamp": "2024-02-11T10:30:00"
}
```

**Erro 404 - Recurso Não Encontrado:**
```json
{
  "status": 404,
  "message": "Hóspede não encontrado com ID: ...",
  "errors": null,
  "timestamp": "2024-02-11T10:30:00"
}
```

## 📂 Estrutura do Projeto

```
src/main/java/com/hotel/
├── GestaoHotelariaApplication.java    # Classe principal
├── controller/                         # Controllers REST
│   ├── HospedeController.java
│   ├── QuartoController.java
│   └── ReservaController.java
├── service/                            # Lógica de negócio
│   ├── HospedeService.java
│   ├── QuartoService.java
│   └── ReservaService.java
├── repository/                         # Acesso aos dados (JPA)
│   ├── HospedeRepository.java
│   ├── QuartoRepository.java
│   └── ReservaRepository.java
├── entity/                             # Entidades JPA
│   ├── Hospede.java
│   ├── Quarto.java
│   └── Reserva.java
├── dto/                                # Data Transfer Objects
│   ├── HospedeDTO.java
│   ├── QuartoDTO.java
│   └── ReservaDTO.java
└── exception/                          # Tratamento de exceções
    ├── BusinessException.java
    ├── ResourceNotFoundException.java
    └── GlobalExceptionHandler.java

src/main/resources/
└── application.properties              # Configurações
```

## 🧪 Testando a Aplicação

### Usando cURL

**1. Criar um quarto:**
```bash
curl -X POST http://localhost:8080/api/quartos \
  -H "Content-Type: application/json" \
  -d '{
    "numero": 101,
    "tipo": "Suite Luxo",
    "precoDiaria": 350.00
  }'
```

**2. Criar um hóspede:**
```bash
curl -X POST http://localhost:8080/api/hospedes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João",
    "sobrenome": "Silva",
    "cpf": "12345678901",
    "email": "joao@email.com"
  }'
```

**3. Criar uma reserva:**
```bash
curl -X POST http://localhost:8080/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "hospedeId": "uuid-retornado",
    "quartoId": "uuid-retornado",
    "dataCheckIn": "2024-02-15",
    "dataCheckOut": "2024-02-18"
  }'
```

**4. Listar quartos disponíveis:**
```bash
curl http://localhost:8080/api/quartos/disponiveis
```

**5. Listar reservas ativas:**
```bash
curl http://localhost:8080/api/reservas/ativas
```

## 💡 Decisões Técnicas

### Por que Spring Data JPA?
- Reduz código boilerplate (queries automáticas)
- Type-safe
- Integração perfeita com Hibernate

### Por que Bean Validation?
- Validação declarativa com anotações
- Validações reutilizáveis
- Mensagens de erro claras e customizáveis

### Por que H2 Database?
- Banco em memória (ideal para desenvolvimento)
- Configuração zero
- Console web integrado

### Por que Lombok?
- Reduz drasticamente o boilerplate
- Getters, setters, construtores automáticos
- Código mais limpo e legível

### Por que @ControllerAdvice?
- Tratamento de exceções centralizado
- Respostas de erro padronizadas
- Separação de responsabilidades

## 📝 Anotações Importantes

### Entidades
- `@Entity` - Marca a classe como entidade JPA
- `@Table` - Define o nome da tabela
- `@Id` - Define a chave primária
- `@GeneratedValue` - Geração automática de ID (UUID)
- `@Column(unique = true)` - Garante unicidade (CPF, número do quarto)
- `@ManyToOne` - Relacionamento muitos-para-um
- `@PrePersist` / `@PreUpdate` - Hooks do ciclo de vida

### Validações
- `@CPF` - Valida CPF (Hibernate Validator)
- `@Email` - Valida formato de e-mail
- `@NotBlank` - Campo não pode ser vazio
- `@NotNull` - Campo não pode ser nulo
- `@Size` - Define tamanho mínimo/máximo
- `@Positive` - Número deve ser positivo

### Controllers
- `@RestController` - Marca como controller REST
- `@RequestMapping` - Define o path base
- `@GetMapping` / `@PostMapping` / `@PutMapping` / `@PatchMapping` - Define métodos HTTP
- `@Valid` - Ativa validação Bean Validation
- `@RequestBody` - Mapeia corpo da requisição para objeto
- `@PathVariable` - Extrai variável da URL

### Services
- `@Service` - Marca como service Spring
- `@Transactional` - Controle de transações
- `@Transactional(readOnly = true)` - Otimiza queries de leitura

## 📄 Licença

MIT

---

**Desenvolvido com ☕ usando Java e Spring Boot**
