# 👨‍💻 Guia de Desenvolvimento

## 🏗️ Arquitetura do Sistema

### Princípios SOLID Aplicados

#### 1. Single Responsibility Principle (SRP)
- **Controllers**: Apenas lidam com requisições HTTP
- **Services**: Apenas lógica de negócio
- **Repositories**: Apenas acesso a dados

#### 2. Open/Closed Principle (OCP)
- Uso de interfaces (Repository extends JpaRepository)
- Extensível via herança e composição

#### 3. Liskov Substitution Principle (LSP)
- DTOs podem substituir entidades em contextos apropriados
- Repositories seguem contratos de JpaRepository

#### 4. Interface Segregation Principle (ISP)
- Repositories com métodos específicos para cada necessidade
- DTOs separados para request/response

#### 5. Dependency Inversion Principle (DIP)
- Services dependem de interfaces (Repository)
- Injeção de dependências via `@RequiredArgsConstructor`

---

## 📦 Estrutura de Camadas

```
┌──────────────────────────────────────────────┐
│  CONTROLLER (Camada de Apresentação)         │
│  - Recebe requisições HTTP                   │
│  - Valida entrada (@Valid)                   │
│  - Retorna ResponseEntity<DTO>               │
│  - Não contém lógica de negócio              │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│  SERVICE (Camada de Negócio)                 │
│  - Validações de regras de negócio           │
│  - Conversão Entity ↔ DTO                    │
│  - Coordena operações entre Repositories     │
│  - Gerencia transações (@Transactional)      │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│  REPOSITORY (Camada de Acesso a Dados)       │
│  - Queries customizadas (@Query)             │
│  - Métodos derivados (findBy*, existsBy*)    │
│  - Não contém lógica de negócio              │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│  JPA / HIBERNATE                             │
│  - Mapeamento Object-Relational              │
│  - Geração de SQL                            │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│  H2 DATABASE                                 │
│  - Armazenamento em memória                  │
└──────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de uma Requisição

### Exemplo: Criar Reserva

```java
// 1. Controller recebe a requisição
@PostMapping
public ResponseEntity<ReservaDTO> criar(@Valid @RequestBody ReservaDTO dto) {
    ReservaDTO created = reservaService.criar(dto);  // Chama o Service
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
}

// 2. Service valida e processa
@Transactional
public ReservaDTO criar(ReservaDTO dto) {
    // 2.1. Valida datas
    validarDatas(dto.getDataCheckIn(), dto.getDataCheckOut());
    
    // 2.2. Busca entidades relacionadas
    Hospede hospede = hospedeRepository.findById(dto.getHospedeId())
        .orElseThrow(() -> new ResourceNotFoundException("Hóspede não encontrado"));
    
    Quarto quarto = quartoRepository.findById(dto.getQuartoId())
        .orElseThrow(() -> new ResourceNotFoundException("Quarto não encontrado"));
    
    // 2.3. Valida regras de negócio
    if (!quarto.getDisponivel()) {
        throw new BusinessException("Quarto não está disponível");
    }
    
    // 2.4. Cria e salva a entidade
    Reserva reserva = new Reserva();
    reserva.setHospede(hospede);
    reserva.setQuarto(quarto);
    // ... demais campos
    
    Reserva saved = reservaRepository.save(reserva);
    
    // 2.5. Atualiza quarto
    quartoService.atualizarDisponibilidade(quarto.getId(), false);
    
    // 2.6. Converte para DTO e retorna
    return convertToDTO(saved);
}

// 3. Repository executa a query
// Spring Data JPA gera automaticamente:
// INSERT INTO reservas (id, hospede_id, quarto_id, ...) VALUES (?, ?, ?, ...)
```

---

## 🎯 Convenções de Código

### Nomenclatura

**Entidades (Entity):**
```java
@Entity
@Table(name = "nome_tabela")  // snake_case
public class NomeEntidade {   // PascalCase
    @Column(name = "nome_campo")  // snake_case
    private TipoDado nomeCampo;   // camelCase
}
```

**DTOs:**
```java
public class NomeDTO {  // Sempre termina com "DTO"
    private TipoDado campo;  // camelCase
}
```

**Services:**
```java
@Service
public class NomeService {  // Sempre termina com "Service"
    public DTORetorno nomeMetodo(DTOEntrada dto) {  // camelCase
        // lógica
    }
}
```

**Controllers:**
```java
@RestController
@RequestMapping("/api/recurso")  // kebab-case, plural
public class NomeController {  // Sempre termina com "Controller"
    @GetMapping  // GET /api/recurso
    @PostMapping  // POST /api/recurso
    @PutMapping("/{id}")  // PUT /api/recurso/{id}
}
```

**Repositories:**
```java
@Repository
public interface NomeRepository extends JpaRepository<Entidade, TipoId> {
    // Métodos derivados seguem convenção findBy*, existsBy*, etc.
    boolean existsByCampo(Tipo valor);
    Optional<Entidade> findByCampo(Tipo valor);
}
```

---

## 🛠️ Boas Práticas Implementadas

### 1. Validação em Múltiplas Camadas

**Camada Controller (Bean Validation):**
```java
@PostMapping
public ResponseEntity<DTO> criar(@Valid @RequestBody DTO dto) {
    // @Valid aciona validações: @NotBlank, @Email, @CPF, etc.
}
```

**Camada Service (Regras de Negócio):**
```java
if (repository.existsByCpf(dto.getCpf())) {
    throw new BusinessException("CPF já cadastrado");
}
```

### 2. Transações

**ReadOnly para consultas:**
```java
@Transactional(readOnly = true)
public List<DTO> listarTodos() {
    // Otimiza performance, não permite modificações
}
```

**Transacional para modificações:**
```java
@Transactional
public DTO criar(DTO dto) {
    // Garante atomicidade (tudo ou nada)
    // Rollback automático em caso de exceção
}
```

### 3. Tratamento de Exceções Centralizado

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handle(BusinessException ex) {
        // Retorna erro padronizado
    }
}
```

### 4. Separação Entity ↔ DTO

**Por que não expor Entity diretamente?**
- ✅ Segurança (não expõe estrutura interna)
- ✅ Flexibilidade (DTO pode ter campos diferentes)
- ✅ Versionamento (mudanças na Entity não quebram API)

```java
// ❌ NÃO FAZER
@PostMapping
public ResponseEntity<Hospede> criar(@RequestBody Hospede hospede) {
    return ResponseEntity.ok(repository.save(hospede));
}

// ✅ FAZER
@PostMapping
public ResponseEntity<HospedeDTO> criar(@Valid @RequestBody HospedeDTO dto) {
    HospedeDTO created = service.criar(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
}
```

### 5. Uso de Optional

```java
// ✅ FAZER
Hospede hospede = repository.findById(id)
    .orElseThrow(() -> new ResourceNotFoundException("Não encontrado"));

// ❌ NÃO FAZER
Hospede hospede = repository.findById(id).get();  // Pode lançar NoSuchElementException
```

---

## 📝 Anotações Importantes

### JPA / Hibernate

| Anotação | Uso |
|----------|-----|
| `@Entity` | Marca classe como entidade JPA |
| `@Table(name = "...")` | Define nome da tabela |
| `@Id` | Define chave primária |
| `@GeneratedValue` | Geração automática de ID |
| `@Column` | Configura coluna (nullable, unique, length) |
| `@ManyToOne` | Relacionamento N:1 |
| `@OneToMany` | Relacionamento 1:N |
| `@PrePersist` | Executado antes de INSERT |
| `@PreUpdate` | Executado antes de UPDATE |
| `@Enumerated` | Mapeia enum para String ou Ordinal |

### Bean Validation

| Anotação | Validação |
|----------|-----------|
| `@NotNull` | Campo não pode ser null |
| `@NotBlank` | String não pode ser vazia |
| `@Email` | Valida formato de e-mail |
| `@CPF` | Valida CPF (Hibernate Validator) |
| `@Size(min, max)` | Tamanho mínimo/máximo |
| `@Positive` | Número deve ser positivo |
| `@Min(valor)` | Valor mínimo |
| `@Max(valor)` | Valor máximo |

### Spring

| Anotação | Uso |
|----------|-----|
| `@RestController` | Controller REST (JSON) |
| `@Service` | Service (lógica de negócio) |
| `@Repository` | Repository (acesso a dados) |
| `@Transactional` | Controle de transações |
| `@RequiredArgsConstructor` | Lombok: construtor com campos final |
| `@Data` | Lombok: getters, setters, toString, equals, hashCode |
| `@NoArgsConstructor` | Lombok: construtor sem argumentos |
| `@AllArgsConstructor` | Lombok: construtor com todos os campos |

---

## 🧪 Como Adicionar Novas Funcionalidades

### Exemplo: Adicionar campo "telefone" ao Hóspede

**1. Atualizar a Entity:**
```java
@Entity
public class Hospede {
    // ... campos existentes
    
    @Column(length = 20)
    private String telefone;
}
```

**2. Atualizar o DTO:**
```java
public class HospedeDTO {
    // ... campos existentes
    
    @Pattern(regexp = "\\d{10,11}", message = "Telefone inválido")
    private String telefone;
}
```

**3. Atualizar conversões no Service:**
```java
private HospedeDTO convertToDTO(Hospede hospede) {
    return new HospedeDTO(
        hospede.getId(),
        hospede.getNome(),
        hospede.getSobrenome(),
        hospede.getCpf(),
        hospede.getEmail(),
        hospede.getTelefone(),  // NOVO
        hospede.getCriadoEm()
    );
}

private Hospede convertToEntity(HospedeDTO dto) {
    // ... código existente
    hospede.setTelefone(dto.getTelefone());  // NOVO
    return hospede;
}
```

**4. Reiniciar a aplicação:**
- Hibernate criará automaticamente a coluna `telefone` (DDL auto-update)

---

## 🔍 Debugging

### Ver SQL Gerado

No `application.properties`:
```properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.SQL=DEBUG
```

Console mostrará:
```sql
Hibernate: 
    insert 
    into
        hospedes (cpf, email, nome, sobrenome, criado_em, id) 
    values
        (?, ?, ?, ?, ?, ?)
```

### Acessar Console H2

1. http://localhost:8080/h2-console
2. Executar queries SQL manualmente:
```sql
SELECT * FROM hospedes;
SELECT * FROM quartos WHERE disponivel = true;
SELECT * FROM reservas WHERE status = 'ATIVA';
```

---

## 📊 Diagramas

### Diagrama de Classes (Entidades)

```
┌─────────────────┐
│    Hospede      │
├─────────────────┤
│ - id: UUID      │
│ - nome: String  │
│ - sobrenome     │
│ - cpf: String   │
│ - email         │
└─────────────────┘
         △
         │ 1
         │
         │ *
┌─────────────────┐      *     ┌─────────────────┐
│    Reserva      │ ──────────▷ │    Quarto       │
├─────────────────┤      1      ├─────────────────┤
│ - id: UUID      │             │ - id: UUID      │
│ - hospede       │             │ - numero: int   │
│ - quarto        │             │ - tipo: String  │
│ - dataCheckIn   │             │ - precoDiaria   │
│ - dataCheckOut  │             │ - disponivel    │
│ - valorTotal    │             └─────────────────┘
│ - status        │
└─────────────────┘
```

---

## 🎓 Conceitos Avançados

### Propagação de Transações

```java
@Transactional(propagation = Propagation.REQUIRED)  // Padrão
// Usa transação existente ou cria nova

@Transactional(propagation = Propagation.REQUIRES_NEW)
// Sempre cria nova transação (suspende a atual)
```

### Isolamento de Transações

```java
@Transactional(isolation = Isolation.READ_COMMITTED)
// Evita leitura de dados não confirmados
```

### Queries Customizadas

```java
@Repository
public interface ReservaRepository extends JpaRepository<Reserva, UUID> {
    
    // Query derivada (Spring gera automaticamente)
    List<Reserva> findByStatus(StatusReserva status);
    
    // Query customizada (JPQL)
    @Query("SELECT r FROM Reserva r WHERE r.hospede.cpf = :cpf")
    List<Reserva> buscarPorCpfHospede(@Param("cpf") String cpf);
    
    // Query nativa (SQL puro)
    @Query(value = "SELECT * FROM reservas WHERE valor_total > ?1", nativeQuery = true)
    List<Reserva> buscarReservasCaras(BigDecimal valorMinimo);
}
```

---

## 📚 Recursos de Aprendizado

- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Spring Data JPA Docs](https://spring.io/projects/spring-data-jpa)
- [Hibernate Validator Docs](https://hibernate.org/validator/)
- [Lombok Docs](https://projectlombok.org/)

---

**Boa codificação! 🚀**
