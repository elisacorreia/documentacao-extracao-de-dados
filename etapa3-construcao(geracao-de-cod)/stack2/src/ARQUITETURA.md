# 🏗️ Arquitetura do Sistema

## 📐 Visão Geral

O sistema de Gestão Hotelaria foi desenvolvido seguindo os princípios **SOLID** e o padrão arquitetural de **Camadas** (Layered Architecture), amplamente utilizado em aplicações Spring Boot.

---

## 🎯 Camadas da Aplicação

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                   │
│                        (Controller)                         │
│                                                             │
│  • Recebe requisições HTTP                                  │
│  • Valida entrada com Bean Validation (@Valid)              │
│  • Retorna ResponseEntity<DTO>                              │
│  • NÃO contém lógica de negócio                             │
│                                                             │
│  Anotações: @RestController, @RequestMapping,               │
│             @GetMapping, @PostMapping, @Valid               │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
                            ↓ ↑ DTO
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE NEGÓCIO                        │
│                        (Service)                            │
│                                                             │
│  • Implementa regras de negócio                             │
│  • Valida lógica complexa (CPF duplicado, quarto ocupado)   │
│  • Coordena operações entre múltiplos Repositories          │
│  • Converte Entity ↔ DTO                                    │
│  • Gerencia transações (@Transactional)                     │
│                                                             │
│  Anotações: @Service, @Transactional                        │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
                            ↓ ↑ Entity
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                  CAMADA DE ACESSO A DADOS                   │
│                       (Repository)                          │
│                                                             │
│  • Acesso ao banco de dados via JPA                         │
│  • Queries customizadas (@Query)                            │
│  • Métodos derivados (findBy*, existsBy*)                   │
│  • NÃO contém lógica de negócio                             │
│                                                             │
│  Anotações: @Repository, extends JpaRepository              │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
                            ↓ ↑ SQL
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                    HIBERNATE / JPA                          │
│                                                             │
│  • ORM (Object-Relational Mapping)                          │
│  • Geração de SQL                                           │
│  • Gerenciamento de entidades                               │
│  • Cache de primeiro nível                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                      H2 DATABASE                            │
│                   (Banco em Memória)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de uma Requisição Completa

### Exemplo: POST /api/reservas (Criar Reserva)

```
1. CLIENTE (Postman/cURL)
   ↓
   POST http://localhost:8080/api/reservas
   Body: {"hospedeId": "...", "quartoId": "...", "dataCheckIn": "...", "dataCheckOut": "..."}
   ↓
   
2. CONTROLLER (ReservaController)
   ↓
   @PostMapping
   public ResponseEntity<ReservaDTO> criar(@Valid @RequestBody ReservaDTO dto)
   ↓
   - Valida DTO com Bean Validation
   - Se inválido → Retorna 400 Bad Request
   - Se válido → Chama Service
   ↓
   
3. SERVICE (ReservaService)
   ↓
   @Transactional
   public ReservaDTO criar(ReservaDTO dto)
   ↓
   - Valida regras de negócio:
     a) Datas válidas?
     b) Hóspede existe?
     c) Quarto existe?
     d) Quarto disponível?
     e) Sem reserva ativa?
   - Se alguma validação falhar → Lança BusinessException (409 Conflict)
   - Se OK → Cria entidade Reserva
   - Salva no Repository
   - Atualiza disponibilidade do quarto
   - Converte Entity → DTO
   ↓
   
4. REPOSITORY (ReservaRepository)
   ↓
   Reserva save(Reserva reserva)
   ↓
   - Delega para JPA
   ↓
   
5. JPA/HIBERNATE
   ↓
   - Gera SQL:
     INSERT INTO reservas (id, hospede_id, quarto_id, ...) VALUES (?, ?, ?, ...)
   - Executa no banco
   ↓
   
6. H2 DATABASE
   ↓
   - Persiste os dados
   - Retorna confirmação
   ↓
   
7. RESPOSTA AO CLIENTE
   ↓
   HTTP 201 Created
   Body: {
     "id": "uuid-gerado",
     "hospedeId": "...",
     "quartoId": "...",
     "valorTotal": 1050.00,
     "status": "ATIVA",
     ...
   }
```

---

## 📊 Diagrama de Entidades (Entity Relationship)

```
┌─────────────────────────────────────────────┐
│                 HOSPEDE                     │
├─────────────────────────────────────────────┤
│ 🔑 id: UUID (PK)                            │
│ nome: String (NOT NULL)                     │
│ sobrenome: String (NOT NULL)                │
│ cpf: String (UNIQUE, NOT NULL)              │ ◀─┐
│ email: String (NOT NULL)                    │   │
│ criadoEm: LocalDateTime                     │   │
└─────────────────────────────────────────────┘   │
                                                  │
                    ┌─────────────────────────────┘
                    │ 1
                    │
                    │ *
┌─────────────────────────────────────────────┐
│                 RESERVA                     │
├─────────────────────────────────────────────┤
│ 🔑 id: UUID (PK)                            │
│ 🔗 hospede_id: UUID (FK → HOSPEDE)          │
│ 🔗 quarto_id: UUID (FK → QUARTO)            │
│ dataCheckIn: LocalDate                      │
│ dataCheckOut: LocalDate                     │
│ valorTotal: BigDecimal                      │
│ status: Enum (ATIVA, CANCELADA, FINALIZADA) │
│ criadoEm: LocalDateTime                     │
│ atualizadoEm: LocalDateTime                 │
└─────────────────────────────────────────────┘
                    │ *
                    │
                    │ 1
                    └─────────────────────────────┐
                                                  │
                                                  ▼
┌─────────────────────────────────────────────┐
│                 QUARTO                      │
├─────────────────────────────────────────────┤
│ 🔑 id: UUID (PK)                            │
│ numero: Integer (UNIQUE, NOT NULL)          │
│ tipo: String (NOT NULL)                     │
│ precoDiaria: BigDecimal (NOT NULL)          │
│ disponivel: Boolean (DEFAULT TRUE)          │
│ criadoEm: LocalDateTime                     │
└─────────────────────────────────────────────┘

Legenda:
🔑 = Chave Primária (Primary Key)
🔗 = Chave Estrangeira (Foreign Key)
```

---

## 🧩 Componentes do Sistema

### 1. Entidades (Entity)

**Responsabilidade:** Representar as tabelas do banco de dados

```java
@Entity
@Table(name = "hospedes")
public class Hospede {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(unique = true)
    private String cpf;
    
    // ... outros campos
}
```

**Características:**
- Mapeadas com JPA (@Entity, @Table, @Column)
- Relacionamentos (@ManyToOne, @OneToMany)
- Hooks de ciclo de vida (@PrePersist, @PreUpdate)

---

### 2. DTOs (Data Transfer Objects)

**Responsabilidade:** Transferir dados entre camadas e para o cliente

```java
public class HospedeDTO {
    private UUID id;
    
    @CPF
    private String cpf;
    
    @Email
    private String email;
    
    // ... outros campos com validações
}
```

**Características:**
- Validações com Bean Validation (@NotBlank, @Email, @CPF)
- Estrutura independente da Entity
- Usado em requisições e respostas

**Por que usar DTOs?**
- ✅ Segurança (não expõe estrutura interna)
- ✅ Flexibilidade (campos diferentes da Entity)
- ✅ Versionamento (mudanças na Entity não quebram API)

---

### 3. Repositories

**Responsabilidade:** Acesso aos dados

```java
@Repository
public interface HospedeRepository extends JpaRepository<Hospede, UUID> {
    boolean existsByCpf(String cpf);
    Optional<Hospede> findByCpf(String cpf);
}
```

**Características:**
- Estendem JpaRepository
- Métodos derivados (findBy*, existsBy*, countBy*)
- Queries customizadas (@Query)

---

### 4. Services

**Responsabilidade:** Lógica de negócio

```java
@Service
@RequiredArgsConstructor
public class HospedeService {
    private final HospedeRepository repository;
    
    @Transactional
    public HospedeDTO criar(HospedeDTO dto) {
        // Valida CPF duplicado
        if (repository.existsByCpf(dto.getCpf())) {
            throw new BusinessException("CPF já cadastrado");
        }
        
        // Converte, salva e retorna
        Hospede hospede = convertToEntity(dto);
        Hospede saved = repository.save(hospede);
        return convertToDTO(saved);
    }
}
```

**Características:**
- Implementam regras de negócio
- Coordenam operações entre Repositories
- Gerenciam transações (@Transactional)
- Convertem Entity ↔ DTO

---

### 5. Controllers

**Responsabilidade:** Expor API REST

```java
@RestController
@RequestMapping("/api/hospedes")
@RequiredArgsConstructor
public class HospedeController {
    private final HospedeService service;
    
    @PostMapping
    public ResponseEntity<HospedeDTO> criar(@Valid @RequestBody HospedeDTO dto) {
        HospedeDTO created = service.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
```

**Características:**
- Expõem endpoints REST
- Validam entrada (@Valid)
- Retornam ResponseEntity<DTO>
- NÃO contêm lógica de negócio

---

### 6. Exception Handling

**Responsabilidade:** Tratamento centralizado de exceções

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handle(BusinessException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ErrorResponse(409, ex.getMessage(), ...));
    }
}
```

**Características:**
- Centraliza tratamento de erros
- Retorna respostas padronizadas
- Mapeia exceções para HTTP status

---

## 🔒 Validações em Múltiplas Camadas

### Camada 1: Bean Validation (Controller)

```java
@PostMapping
public ResponseEntity<DTO> criar(@Valid @RequestBody DTO dto) {
    // @Valid aciona validações:
    // - @NotBlank, @Email, @CPF, @Size, etc.
}
```

**Validações:**
- Formato de CPF
- Formato de e-mail
- Campos obrigatórios
- Tamanho de strings
- Valores numéricos positivos

**Resposta em caso de erro:** 400 Bad Request

---

### Camada 2: Regras de Negócio (Service)

```java
@Transactional
public DTO criar(DTO dto) {
    // Validação de negócio:
    if (repository.existsByCpf(dto.getCpf())) {
        throw new BusinessException("CPF já cadastrado");
    }
}
```

**Validações:**
- CPF duplicado
- Quarto ocupado
- Datas inválidas
- Relacionamentos inexistentes

**Resposta em caso de erro:** 409 Conflict

---

### Camada 3: Constraints do Banco (Entity)

```java
@Entity
public class Hospede {
    @Column(unique = true)  // Constraint no banco
    private String cpf;
}
```

**Validações:**
- UNIQUE constraints
- NOT NULL constraints
- Foreign Key constraints

---

## 🔄 Gerenciamento de Transações

### @Transactional

```java
@Service
public class ReservaService {
    
    // Transação de leitura (otimizada)
    @Transactional(readOnly = true)
    public List<ReservaDTO> listarTodas() {
        return repository.findAll()...;
    }
    
    // Transação de escrita (com rollback automático)
    @Transactional
    public ReservaDTO criar(ReservaDTO dto) {
        // Se qualquer exceção for lançada,
        // TODAS as operações serão revertidas (rollback)
        
        Reserva reserva = repository.save(...);  // OP 1
        quartoService.atualizarDisponibilidade(...);  // OP 2
        
        // Se OP 2 falhar, OP 1 é revertida automaticamente
        return convertToDTO(reserva);
    }
}
```

**Propagação de Transações:**

| Tipo | Descrição |
|------|-----------|
| `REQUIRED` (padrão) | Usa transação existente ou cria nova |
| `REQUIRES_NEW` | Sempre cria nova transação |
| `SUPPORTS` | Usa transação se existir, senão executa sem |
| `NOT_SUPPORTED` | Sempre executa sem transação |

---

## 🎨 Padrões de Design Utilizados

### 1. Repository Pattern
- Abstrai acesso aos dados
- Interface entre lógica de negócio e persistência

### 2. DTO Pattern
- Transferência de dados entre camadas
- Desacoplamento entre API e modelo de domínio

### 3. Dependency Injection
- Inversão de controle via Spring
- `@RequiredArgsConstructor` (Lombok)

### 4. Layered Architecture
- Separação em camadas
- Controller → Service → Repository

### 5. Builder Pattern
- Lombok (@Builder)
- Construção fluente de objetos

---

## 📈 Escalabilidade e Manutenibilidade

### ✅ Vantagens da Arquitetura Atual

1. **Separação de Responsabilidades**
   - Fácil localizar e corrigir bugs
   - Mudanças isoladas em cada camada

2. **Testabilidade**
   - Cada camada pode ser testada isoladamente
   - Mocks facilitados pela injeção de dependências

3. **Reutilização**
   - Services podem ser usados por múltiplos Controllers
   - Repositories compartilhados entre Services

4. **Manutenibilidade**
   - Código organizado e previsível
   - Convenções claras de nomenclatura

5. **Extensibilidade**
   - Fácil adicionar novos endpoints
   - Fácil adicionar novas validações

---

## 🔮 Evoluções Futuras

### 1. Autenticação e Autorização
```java
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/{id}")
public void deletar(@PathVariable UUID id) { ... }
```

### 2. Cache
```java
@Cacheable("quartos")
public List<QuartoDTO> listarDisponiveis() { ... }
```

### 3. Paginação
```java
public Page<HospedeDTO> listar(Pageable pageable) {
    return repository.findAll(pageable).map(this::convertToDTO);
}
```

### 4. Auditoria
```java
@Entity
@EntityListeners(AuditingEntityListener.class)
public class Hospede {
    @CreatedBy
    private String criadoPor;
    
    @LastModifiedBy
    private String modificadoPor;
}
```

### 5. Eventos
```java
@Service
public class ReservaService {
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    public ReservaDTO criar(ReservaDTO dto) {
        // ... lógica
        eventPublisher.publishEvent(new ReservaCriadaEvent(reserva));
    }
}
```

---

## 📚 Referências

- [Spring Boot Reference Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Data JPA Documentation](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Layered Architecture Pattern](https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/)

---

**Última atualização:** 11/02/2024
