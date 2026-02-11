# Documentação Técnica - Sistema de Reserva de Hotel (Java + Spring Boot)

## 1. Arquitetura e Princípios Aplicados

### 1.1 Stack Tecnológica

**Backend:**
- Java 17
- Spring Boot 3.2.0
- Spring Data JPA (ORM)
- Spring Validation (Bean Validation)
- H2 Database (in-memory)
- Lombok (redução de boilerplate)
- Maven (gerenciamento de dependências)

**Arquitetura:**
- Arquitetura em Camadas (Layered Architecture)
- REST API com padrão RESTful
- Domain-Driven Design (DDD) principles

---

### 1.2 Princípios SOLID Aplicados

#### **S - Single Responsibility Principle (Responsabilidade Única)**

**Decisão de Implementação:**
```java
// ✅ Cada classe tem uma única responsabilidade

// Domain Entity - apenas lógica de domínio
public class Quarto {
    // Campos, validações e comportamentos de negócio
}

// Repository - apenas persistência
public interface QuartoRepository extends JpaRepository<Quarto, UUID> {
    // Queries de acesso a dados
}

// Service - apenas lógica de aplicação
@Service
public class QuartoService {
    // Orquestração e regras de negócio de alto nível
}

// Controller - apenas exposição HTTP
@RestController
public class QuartoController {
    // Endpoints REST
}
```

**Justificativa:**
- Facilita manutenção (mudança em persistência não afeta domínio)
- Melhora testabilidade (cada camada pode ser testada isoladamente)
- Aumenta coesão do código

---

#### **O - Open/Closed Principle (Aberto/Fechado)**

**Decisão de Implementação:**
```java
// ✅ Repository é interface (aberta para extensão)
public interface QuartoRepository extends JpaRepository<Quarto, UUID> {
    // Novos métodos podem ser adicionados sem modificar implementação
    Optional<Quarto> findByNumero(Integer numero);
    
    // Spring Data JPA gera implementação automaticamente
}

// ✅ Enums podem ser estendidos sem alterar código existente
public enum TipoQuarto {
    BASICO("Básico"),
    MODERNO("Moderno"),
    LUXO("Luxo");
    // Novos tipos podem ser adicionados
}
```

**Justificativa:**
- Spring Data JPA permite adicionar queries sem implementação manual
- Novos tipos podem ser adicionados aos enums sem quebrar código
- Value Objects (CPF, Email) são fechados para modificação (imutáveis)

---

#### **L - Liskov Substitution Principle (Substituição de Liskov)**

**Decisão de Implementação:**
```java
// ✅ JpaRepository pode ser substituído por qualquer implementação
@Service
public class QuartoService {
    // Depende da interface, não da implementação
    private final QuartoRepository quartoRepository;
    
    // Poderia ser trocado por:
    // - InMemoryQuartoRepository (testes)
    // - MongoQuartoRepository (NoSQL)
    // - CachedQuartoRepository (com cache)
}
```

**Justificativa:**
- Interface JPA permite diferentes implementações
- Facilita testes (mocks)
- Possibilita troca de tecnologia de persistência

---

#### **I - Interface Segregation Principle (Segregação de Interface)**

**Decisão de Implementação:**
```java
// ✅ Repositórios específicos (não uma interface genérica)
public interface QuartoRepository extends JpaRepository<Quarto, UUID> {
    // Apenas métodos relacionados a Quarto
}

public interface HospedeRepository extends JpaRepository<Hospede, UUID> {
    // Apenas métodos relacionados a Hospede
}

// ✅ DTOs específicos para cada operação
public class CriarQuartoDTO { }  // Campos obrigatórios
public class AtualizarQuartoDTO { }  // Campos opcionais
```

**Justificativa:**
- Interfaces focadas evitam implementações desnecessárias
- DTOs específicos tornam contratos explícitos
- Melhor validação (Bean Validation específica)

---

#### **D - Dependency Inversion Principle (Inversão de Dependência)**

**Decisão de Implementação:**
```java
// ✅ Service depende de abstração (interface), não de implementação
@Service
@RequiredArgsConstructor  // Lombok gera construtor com final fields
public class QuartoService {
    // Dependência é injetada (Injeção de Dependência via construtor)
    private final QuartoRepository quartoRepository;
    
    // Service nunca instancia repository diretamente
    // Spring gerencia o ciclo de vida
}

// ✅ Controller depende de abstração (Service), não de Repository
@RestController
@RequiredArgsConstructor
public class QuartoController {
    private final QuartoService quartoService;
    // Controller não conhece detalhes de persistência
}
```

**Justificativa:**
- Spring IoC gerencia dependências automaticamente
- Facilita testes (injeção de mocks)
- Desacoplamento entre camadas

---

### 1.3 Clean Code - Decisões Críticas

#### **1.3.1 Nomenclatura Clara e Consistente**

```java
// ✅ CORRETO - Verbos para métodos, substantivos para classes
public class Quarto {
    public void alterarDisponibilidade(Disponibilidade nova) { }
    public boolean podeSerReservado() { }
    public BigDecimal calcularValorTotal(int diarias) { }
}

// ❌ EVITADO - Nomes genéricos ou ambíguos
// public void change() { }
// public boolean check() { }
```

**Justificativa:**
- Código autodocumentado
- Reduz necessidade de comentários
- Facilita compreensão por novos desenvolvedores

---

#### **1.3.2 Imutabilidade de Value Objects**

```java
// ✅ Value Object imutável (encapsulamento total)
@Embeddable
@NoArgsConstructor(access = AccessLevel.PROTECTED)  // JPA requer
public class CPF {
    private String valor;  // Sem setter
    
    // Único acesso é via factory method
    public static CPF criar(String cpf) {
        // Validação + criação
    }
}
```

**Justificativa:**
- Previne bugs (CPF não pode ser alterado acidentalmente)
- Thread-safe por natureza
- Alinhado com DDD (Value Objects são imutáveis)

---

#### **1.3.3 Validação em Múltiplas Camadas**

```java
// Camada 1: Bean Validation (DTO)
public class CriarQuartoDTO {
    @NotNull(message = "Número é obrigatório")
    @Min(value = 1, message = "Número deve ser maior que zero")
    private Integer numero;
}

// Camada 2: Regras de Negócio (Service)
@Service
public class QuartoService {
    public QuartoResponseDTO criarQuarto(CriarQuartoDTO dto) {
        if (quartoRepository.existsByNumero(dto.getNumero())) {
            throw new BusinessException("Número já existe");
        }
    }
}

// Camada 3: Validação de Domínio (Entity)
public class Quarto {
    public void validar() {
        if (numero == null || numero <= 0) {
            throw new IllegalArgumentException("Número inválido");
        }
    }
}
```

**Justificativa:**
- **DTO**: Valida entrada HTTP (primeiras verificações)
- **Service**: Valida regras de aplicação (unicidade, consistência)
- **Entity**: Valida invariantes de domínio (sempre válida)

---

#### **1.3.4 Tratamento Centralizado de Exceções**

```java
// ✅ Global Exception Handler (aspecto transversal)
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
        ResourceNotFoundException ex, HttpServletRequest request) {
        // Retorna 404 com mensagem padronizada
    }
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRule(
        BusinessException ex, HttpServletRequest request) {
        // Retorna 400 com mensagem de regra de negócio
    }
}
```

**Justificativa:**
- Evita try-catch repetitivos em controllers
- Respostas de erro padronizadas (formato único)
- Centraliza logging e monitoramento

---

#### **1.3.5 Lombok para Redução de Boilerplate**

```java
// ✅ COM Lombok (limpo e conciso)
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class Quarto {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    // Lombok gera automaticamente:
    // - Getters para todos os campos
    // - Construtor sem argumentos (protected)
    // - equals() e hashCode() baseado em id
}

// ❌ SEM Lombok (verboso)
public class Quarto {
    private UUID id;
    
    public UUID getId() { return id; }
    protected Quarto() {}
    
    @Override
    public boolean equals(Object o) {
        // 15+ linhas de código boilerplate
    }
    
    @Override
    public int hashCode() {
        // 3+ linhas
    }
}
```

**Justificativa:**
- Reduz código em ~40% (menos linhas = menos bugs)
- Facilita leitura (foca em lógica de negócio)
- IDE-friendly (autocompletion funciona normalmente)

---

### 1.4 Padrões de Projeto Implementados

#### **Repository Pattern (Spring Data JPA)**

```java
// ✅ Interface declara operações de persistência
@Repository
public interface QuartoRepository extends JpaRepository<Quarto, UUID> {
    
    // Query methods gerados automaticamente por Spring Data
    Optional<Quarto> findByNumero(Integer numero);
    boolean existsByNumero(Integer numero);
    List<Quarto> findByDisponibilidade(Disponibilidade disp);
    
    // ⭐ Spring Data JPA:
    // - Implementa automaticamente baseado no nome do método
    // - Não precisa escrever SQL/JPQL manualmente
    // - Type-safe (compilador detecta erros)
}
```

**Benefícios:**
- Abstração completa da camada de dados
- Zero código SQL (Spring gera automaticamente)
- Facilita troca de banco de dados

---

#### **Data Transfer Object (DTO) Pattern**

```java
// ✅ DTO para entrada (Request)
public class CriarQuartoDTO {
    @NotNull
    private Integer numero;
    @NotEmpty
    private List<TipoCama> camas;
    // Sem lógica de negócio, apenas dados
}

// ✅ DTO para saída (Response)
public class QuartoResponseDTO {
    private UUID id;
    private Integer numero;
    private Disponibilidade disponibilidade;
    
    // Factory method para conversão
    public static QuartoResponseDTO fromEntity(Quarto quarto) {
        return QuartoResponseDTO.builder()
            .id(quarto.getId())
            .numero(quarto.getNumero())
            .build();
    }
}
```

**Benefícios:**
- Desacopla API da estrutura interna (Entity)
- Controla exatamente o que é exposto
- Permite evoluir Entity sem quebrar API

---

#### **Service Layer Pattern**

```java
// ✅ Service orquestra operações complexas
@Service
@Transactional  // Garante ACID
public class QuartoService {
    
    private final QuartoRepository repository;
    
    public QuartoResponseDTO criarQuarto(CriarQuartoDTO dto) {
        // 1. Validação de regra de negócio
        verificarNumeroUnico(dto.getNumero());
        
        // 2. Construção da entidade
        Quarto quarto = construirQuarto(dto);
        
        // 3. Validação de domínio
        quarto.validar();
        
        // 4. Persistência
        Quarto salvo = repository.save(quarto);
        
        // 5. Conversão para DTO
        return QuartoResponseDTO.fromEntity(salvo);
    }
}
```

**Benefícios:**
- Centraliza lógica de aplicação
- Gerencia transações automaticamente
- Coordena múltiplas operações

---

#### **Factory Method (Value Objects)**

```java
// ✅ CPF usa Factory Method
public class CPF {
    private String valor;
    
    // Construtor privado (não pode instanciar diretamente)
    private CPF(String valor) {
        this.valor = valor;
    }
    
    // Factory method com validação
    public static CPF criar(String cpf) {
        String limpo = cpf.replaceAll("\\D", "");
        
        if (!validar(limpo)) {
            throw new IllegalArgumentException("CPF inválido");
        }
        
        return new CPF(limpo);
    }
    
    private static boolean validar(String cpf) {
        // Algoritmo de validação de CPF
    }
}

// ⭐ Uso:
CPF cpf = CPF.criar("123.456.789-00");  // ✅ Válido
CPF cpf = CPF.criar("000.000.000-00");  // ❌ Lança exceção
```

**Benefícios:**
- Garante que objetos são criados válidos
- Encapsula lógica de validação
- Previne estados inválidos

---

## 2. Estrutura de Pacotes (Package Structure)

```
com.hotel.reserva
├── HotelReservaApplication.java          # Main class Spring Boot
│
├── domain/
│   ├── entities/                         # Entidades JPA (Aggregate Roots)
│   │   ├── Quarto.java                   # Entity + Aggregate Root
│   │   ├── Cama.java                     # Entity (parte do aggregate Quarto)
│   │   ├── Hospede.java                  # Entity + Aggregate Root
│   │   └── Reserva.java                  # Entity + Aggregate Root
│   │
│   ├── valueobjects/                     # Value Objects (imutáveis)
│   │   ├── CPF.java                      # VO com validação
│   │   └── Email.java                    # VO com validação
│   │
│   └── enums/                            # Enumerações
│       ├── TipoQuarto.java
│       ├── TipoCama.java
│       ├── Disponibilidade.java
│       └── StatusReserva.java
│
├── repositories/                         # Camada de Persistência
│   ├── QuartoRepository.java             # Interface Spring Data JPA
│   ├── HospedeRepository.java
│   └── ReservaRepository.java
│
├── services/                             # Camada de Aplicação
│   └── QuartoService.java                # Lógica de negócio de alto nível
│
├── controllers/                          # Camada de Apresentação (API REST)
│   └── QuartoController.java             # Endpoints HTTP
│
├── dto/                                  # Data Transfer Objects
│   ├── CriarQuartoDTO.java               # Request DTO
│   ├── AtualizarQuartoDTO.java           # Request DTO
│   └── QuartoResponseDTO.java            # Response DTO
│
├── exceptions/                           # Tratamento de Exceções
│   ├── ResourceNotFoundException.java
│   ├── BusinessException.java
│   ├── ErrorResponse.java
│   └── GlobalExceptionHandler.java       # @RestControllerAdvice
│
└── config/                               # Configurações
    └── WebConfig.java                    # CORS, etc.
```

---

## 3. Decisões Arquiteturais Críticas

### **3.1 Por que H2 Database?**

**Decisão:** Usar banco de dados H2 em memória

**Justificativa:**
- Simplicidade: Não requer instalação de banco externo
- Velocidade: Execução rápida de testes
- Portabilidade: Funciona em qualquer ambiente (dev, CI/CD)
- Fácil evolução: Trocar por PostgreSQL/MySQL requer apenas mudar dependência

**Produção:**
```properties
# Trocar para PostgreSQL em produção:
spring.datasource.url=jdbc:postgresql://localhost:5432/hoteldb
spring.datasource.driver-class-name=org.postgresql.Driver
```

---

### **3.2 Por que UUID em vez de Long?**

**Decisão:** Usar `UUID` como ID das entidades

```java
@Id
@GeneratedValue(strategy = GenerationType.UUID)
private UUID id;
```

**Justificativa:**
- **Unicidade global**: IDs únicos mesmo em sistemas distribuídos
- **Segurança**: IDs não sequenciais (evita enumeração)
- **Merge de bancos**: Facilita replicação e sincronização
- **Microsserviços**: Preparado para arquitetura distribuída

**Trade-off:**
- ❌ UUID é maior que Long (128 bits vs 64 bits)
- ✅ Mas o benefício de segurança e escalabilidade compensa

---

### **3.3 Por que @Transactional no Service?**

**Decisão:** Anotar métodos de serviço com `@Transactional`

```java
@Service
public class QuartoService {
    
    @Transactional  // Garante ACID
    public QuartoResponseDTO criarQuarto(CriarQuartoDTO dto) {
        // Múltiplas operações de banco são atômicas
    }
    
    @Transactional(readOnly = true)  // Otimização para leitura
    public List<QuartoResponseDTO> listarTodos() {
        // Apenas leitura, permite otimizações do BD
    }
}
```

**Justificativa:**
- **Atomicidade**: Rollback automático em caso de erro
- **Consistência**: Garante que todas operações sejam concluídas ou nenhuma
- **Performance**: `readOnly=true` permite otimizações (não trava tabelas)

---

### **3.4 Por que Bean Validation nos DTOs?**

**Decisão:** Usar Jakarta Bean Validation (JSR 380)

```java
public class CriarQuartoDTO {
    
    @NotNull(message = "Número é obrigatório")
    @Min(value = 1, message = "Deve ser maior que zero")
    private Integer numero;
    
    @NotEmpty(message = "Deve ter pelo menos uma cama")
    private List<TipoCama> camas;
}
```

**Justificativa:**
- **Declarativo**: Validação expressa em anotações (não em código)
- **Reutilizável**: Mesmas regras em diferentes endpoints
- **Automático**: Spring valida antes de chamar controller
- **Padronizado**: JSR 380 é padrão Java EE/Jakarta

---

### **3.5 Por que @RestControllerAdvice?**

**Decisão:** Centralizar tratamento de exceções

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(...) {
        // Retorna 404 com formato padronizado
    }
}
```

**Justificativa:**
- **DRY**: Evita try-catch repetidos em cada controller
- **Consistência**: Todos erros têm mesmo formato de resposta
- **Manutenibilidade**: Mudanças centralizadas
- **AOP**: Aspecto transversal (cross-cutting concern)

---

## 4. API REST Endpoints

### **Módulo de Gestão de Quartos**

| Método | Endpoint | Descrição | Request Body | Response |
|--------|----------|-----------|--------------|----------|
| POST | `/api/quartos` | Criar quarto | `CriarQuartoDTO` | 201 + `QuartoResponseDTO` |
| GET | `/api/quartos` | Listar todos | - | 200 + `List<QuartoResponseDTO>` |
| GET | `/api/quartos/{id}` | Buscar por ID | - | 200 + `QuartoResponseDTO` |
| PUT | `/api/quartos/{id}` | Atualizar quarto | `AtualizarQuartoDTO` | 200 + `QuartoResponseDTO` |
| PATCH | `/api/quartos/{id}/disponibilidade` | Alterar disponibilidade | Query param | 200 + `QuartoResponseDTO` |
| GET | `/api/quartos/disponibilidade/{status}` | Listar por status | - | 200 + `List<QuartoResponseDTO>` |
| DELETE | `/api/quartos/{id}` | Deletar quarto | - | 204 No Content |

### **Exemplo de Request/Response**

**POST `/api/quartos`**

Request:
```json
{
  "numero": 101,
  "capacidade": 2,
  "tipo": "LUXO",
  "precoPorDiaria": 350.00,
  "temFrigobar": true,
  "temCafeDaManha": true,
  "temArCondicionado": true,
  "temTV": true,
  "camas": ["CASAL_KING"]
}
```

Response (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "numero": 101,
  "capacidade": 2,
  "tipo": "LUXO",
  "precoPorDiaria": 350.00,
  "temFrigobar": true,
  "temCafeDaManha": true,
  "temArCondicionado": true,
  "temTV": true,
  "disponibilidade": "LIVRE",
  "camas": ["CASAL_KING"],
  "criadoEm": "2024-02-11T10:30:00",
  "atualizadoEm": "2024-02-11T10:30:00"
}
```

**Error Response (400 Bad Request):**
```json
{
  "timestamp": "2024-02-11T10:30:00",
  "status": 400,
  "error": "Business Rule Violation",
  "message": "Já existe um quarto com este número",
  "path": "/api/quartos"
}
```
