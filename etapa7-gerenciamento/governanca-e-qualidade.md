# KPIs e Critérios de Qualidade - Sistema Hotel Gestão

## 📊 Visão Geral

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    FRAMEWORK DE QUALIDADE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🎯 OBJETIVOS SMART:                                                │
│     • Specific (Específico)                                         │
│     • Measurable (Mensurável)                                       │
│     • Achievable (Alcançável)                                       │
│     • Relevant (Relevante)                                          │
│     • Time-bound (Temporal)                                         │
│                                                                      │
│  📏 CATEGORIAS DE KPI:                                              │
│     1. Desenvolvimento (Velocity, Burndown)                         │
│     2. Qualidade de Código (SonarQube)                              │
│     3. Performance (Latência, Throughput)                           │
│     4. Confiabilidade (Uptime, MTTR)                                │
│     5. Segurança (Vulnerabilidades)                                 │
│     6. Negócio (Reservas, Ocupação)                                 │
│     7. Processo (Lead Time, Cycle Time)                             │
│     8. Experiência do Usuário (NPS, Satisfação)                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

```

---

## 1. 🚀 KPIs de Desenvolvimento

### 1.1 Velocity (Velocidade do Sprint)

**Definição:** Quantidade de story points completados por sprint
**Fórmula:**
`Velocity = Σ Story Points de tasks "Done" no sprint`

**Targets:**

| Métrica | Threshold | Target | Stretch Goal |
| --- | --- | --- | --- |
| **Velocity Sprint** | ≥ 70 pts | 95 pts | 110 pts |
| **Consistência** | ±20% variação | ±10% variação | ±5% variação |
| **Tendência** | Estável | Crescente | +10% por quarter |

**Medição:**

* **Frequência:** Ao final de cada sprint (bi-semanal)
* **Ferramenta:** Jira, GitHub Projects
* **Responsável:** Scrum Master

**Dashboard:**
*Velocity Chart (últimos 6 sprints):*

```text
120 │              ╱●
    │            ╱
100 │        ●─●
    │      ╱
 80 │  ●─●
    │
 60 │
    │
 40 │
    └─────────────────────────► Sprint
      S1  S2  S3  S4  S5  S6

Media: 95 pts
Desvio: ±8 pts (8.4%)
Status: ✅ HEALTHY

```

**Ações se fora do target:**

* **SE** Velocity < 70 pts por 2 sprints:
**ENTÃO:**
[ ] Analisar impedimentos (retrospectiva)
[ ] Revisar estimativas (muito otimistas?)
[ ] Verificar capacidade do time (férias, doença)
[ ] Re-priorizar backlog (focar em Must Have)
* **SE** Velocity > 110 pts consistentemente:
**ENTÃO:**
[ ] Revisar estimativas (muito pessimistas?)
[ ] Aumentar complexidade das tasks
[ ] Adicionar mais valor ao sprint

### 1.2 Sprint Burndown (Queima de Tarefas)

**Definição:** Taxa de completude de story points ao longo do sprint
**Fórmula:**
`Burndown Ideal = Total Points × (1 - Dias Decorridos / Dias Totais)`
`Burndown Real = Total Points - Points Completados`

**Targets:**

| Métrica | Threshold | Target | Stretch Goal |
| --- | --- | --- | --- |
| **Desvio do Ideal** | < 30% | < 15% | < 5% |
| **Work-in-Progress (WIP)** | ≤ 10 tasks | ≤ 6 tasks | ≤ 4 tasks |
| **Completude na última semana** | < 50% | < 30% | < 20% |

**Exemplo de Sprint Saudável vs Problemático:**

```text
SPRINT SAUDÁVEL:                    SPRINT PROBLEMÁTICO:

Story Points                        Story Points
    │                                   │
100 │●                               100 │●────────────────
    │ ╲                                 │              ╲
 80 │  ●                              80 │               ●
    │   ╲                                │                ╲
 60 │    ●                             60 │                 ●
    │     ╲                               │                  ╲
 40 │      ●                            40 │                   ╲
    │       ╲                              │                    ●
 20 │        ●                          20 │                     ●
    │         ●                            │                      ●
  0 │__________●____► Dia              0 │_______________________●
    0   2   4   6   8  10                 0   2   4   6   8  10

✅ Trabalho distribuído              ❌ "Hockey stick" pattern
✅ Progresso constante               ❌ Todo trabalho no final

```

**Medição:**

* **Frequência:** Diária (daily standup)
* **Ferramenta:** Jira Burndown Chart
* **Responsável:** Scrum Master

### 1.3 Code Review Turnaround Time

**Definição:** Tempo médio entre abertura de PR e merge
**Fórmula:**
`Review Time = Merge DateTime - PR Created DateTime`

**Targets:**

| Tipo de PR | Threshold | Target | Stretch Goal |
| --- | --- | --- | --- |
| **Bugfix** | < 8h | < 4h | < 2h |
| **Feature** | < 48h | < 24h | < 12h |
| **Hotfix** | < 2h | < 1h | < 30min |

**Medição:**

```sql
-- Query GitHub API
SELECT 
    AVG(TIMESTAMPDIFF(HOUR, created_at, merged_at)) AS avg_review_hours,
    pr_type
FROM pull_requests
WHERE merged_at IS NOT NULL
  AND created_at > NOW() - INTERVAL 30 DAY
GROUP BY pr_type;

```

**Alertas:**

```yaml
# .github/workflows/pr-sla.yml
- name: Check PR SLA
  if: github.event.pull_request.created_at
  run: |
    HOURS_OPEN=$(( ($(date +%s) - $(date -d "${{ github.event.pull_request.created_at }}" +%s)) / 3600 ))
    
    if [[ $HOURS_OPEN -gt 24 ]]; then
      curl -X POST $SLACK_WEBHOOK \
        -d "⚠️  PR #${{ github.event.pull_request.number }} aberto há ${HOURS_OPEN}h (SLA: 24h)"
    fi

```

### 1.4 Deployment Frequency

**Definição:** Frequência de deploys em produção

**Targets:**

| Métrica | Threshold | Target | Stretch Goal |
| --- | --- | --- | --- |
| **Deploys/semana** | ≥ 2 | ≥ 5 | ≥ 10 |
| **Lead Time** | < 7 dias | < 3 dias | < 1 dia |
| **Change Failure Rate** | < 15% | < 10% | < 5% |

**Classificação DORA (DevOps Research and Assessment):**

```text
┌─────────────────────────────────────────────────────────┐
│              DORA METRICS - CLASSIFICAÇÃO                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Elite:                                                  │
│    • Deploy Frequency: On-demand (múltiplos por dia)   │
│    • Lead Time: < 1 hora                                │
│    • MTTR: < 1 hora                                     │
│    • Change Failure Rate: < 5%                          │
│                                                          │
│  High:                                                   │
│    • Deploy Frequency: Entre 1x/dia e 1x/semana        │
│    • Lead Time: < 1 dia                                 │
│    • MTTR: < 1 dia                                      │
│    • Change Failure Rate: 5-10%                         │
│                                                          │
│  Medium:  ← NOSSO TARGET INICIAL                        │
│    • Deploy Frequency: 1x/semana a 1x/mês              │
│    • Lead Time: < 1 semana                              │
│    • MTTR: < 1 semana                                   │
│    • Change Failure Rate: 10-15%                        │
│                                                          │
│  Low:                                                    │
│    • Deploy Frequency: < 1x/mês                         │
│    • Lead Time: > 1 semana                              │
│    • MTTR: > 1 semana                                   │
│    • Change Failure Rate: > 15%                         │
│                                                          │
└─────────────────────────────────────────────────────────┘

```

---

## 2. 🎨 KPIs de Qualidade de Código

### 2.1 Code Coverage (Cobertura de Testes)

**Definição:** Porcentagem de código coberto por testes automatizados
**Fórmula:**
`Coverage % = (Linhas Cobertas / Total Linhas) × 100`

**Targets:**

| Tipo | Threshold | Target | Stretch Goal |
| --- | --- | --- | --- |
| **Overall Coverage** | ≥ 70% | ≥ 80% | ≥ 90% |
| **New Code Coverage** | ≥ 80% | ≥ 90% | 100% |
| **Branch Coverage** | ≥ 60% | ≥ 75% | ≥ 85% |
| **Critical Paths** | 100% | 100% | 100% |

**Breakdown por Camada:**

```text
┌─────────────────────────────────────────────────────────┐
│          COBERTURA POR CAMADA (Target)                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Controllers:          ≥ 70%  ██████████░░░░░          │
│  Services (Business):  ≥ 90%  █████████████████░░      │
│  Repositories:         ≥ 60%  ████████████░░░░░░░      │
│  DTOs/Entities:        ≥ 50%  ██████████░░░░░░░░░░     │
│  Utils/Helpers:        ≥ 85%  ██████████████████░      │
│                                                          │
└─────────────────────────────────────────────────────────┘

```

**Medição:**

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.10</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
        <execution>
            <id>check</id>
            <goals>
                <goal>check</goal>
            </goals>
            <configuration>
                <rules>
                    <rule>
                        <element>PACKAGE</element>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.80</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>

```

**Quality Gate:**

```properties
# sonar-project.properties
sonar.coverage.exclusions=**/dto/**,**/config/**,**/Application.java
sonar.test.exclusions=**/test/**

# Quality Gate
sonar.qualitygate.wait=true
sonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml

# Thresholds
sonar.coverage.minimum=80
sonar.coverage.new_code.minimum=90

```

### 2.2 SonarQube Metrics

**Targets Detalhados:**

| Métrica | Threshold | Target | Stretch Goal |
| --- | --- | --- | --- |
| **Blocker Bugs** | ≤ 1 | 0 | 0 |
| **Bugs** | ≤ 10 | ≤ 5 | 0 |
| **Vulnerabilities** | 0 critical | 0 high | 0 medium |
| **Code Smells** | ≤ 100 | ≤ 50 | ≤ 20 |
| **Technical Debt** | ≤ 5 dias | ≤ 2 dias | < 1 dia |
| **Duplicação** | ≤ 5% | ≤ 3% | < 1% |
| **Cognitive Complexity** | ≤ 15 | ≤ 10 | ≤ 7 |
| **Maintainability Rating** | ≥ B | ≥ A | A |
| **Reliability Rating** | ≥ B | ≥ A | A |
| **Security Rating** | ≥ A | A | A |

**SonarQube Quality Gate Configuration:**

```json
// quality-gate.json
{
  "name": "Hotel Gestão Quality Gate",
  "conditions": [
    {
      "metric": "new_coverage",
      "op": "LT",
      "error": "80"
    },
    {
      "metric": "new_duplicated_lines_density",
      "op": "GT",
      "error": "3"
    },
    {
      "metric": "new_violations",
      "op": "GT",
      "error": "0",
      "severity": "BLOCKER"
    },
    {
      "metric": "new_violations",
      "op": "GT",
      "error": "0",
      "severity": "CRITICAL"
    },
    {
      "metric": "new_security_hotspots_reviewed",
      "op": "LT",
      "error": "100"
    },
    {
      "metric": "new_maintainability_rating",
      "op": "GT",
      "error": "1"
    }
  ]
}

```

**Exemplo de Report:**

```text
┌─────────────────────────────────────────────────────────┐
│            SONARQUBE QUALITY REPORT                      │
│            Sprint 5 - 2025-03-15                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Overall Rating:              A    ✅                   │
│  Coverage:                    82%  ✅ (target: 80%)    │
│  Duplicação:                  2.1% ✅ (target: <3%)    │
│  Bugs:                        3    ✅ (target: <5)     │
│  Vulnerabilities:             0    ✅                   │
│  Code Smells:                 47   ✅ (target: <50)    │
│  Technical Debt:              1.5d ✅ (target: <2d)    │
│                                                          │
│  Quality Gate:                PASSED ✅                 │
│                                                          │
│  Tendência (vs Sprint 4):     📈 +5% coverage          │
│                               📉 -12 code smells        │
│                                                          │
└─────────────────────────────────────────────────────────┘

```

### 2.3 Cyclomatic Complexity

**Definição:** Complexidade dos métodos (número de caminhos independentes)

**Targets:**

| Escopo | Threshold | Target | Stretch Goal |
| --- | --- | --- | --- |
| **Método** | ≤ 10 | ≤ 7 | ≤ 5 |
| **Classe** | ≤ 50 | ≤ 30 | ≤ 20 |
| **Pacote** | ≤ 200 | ≤ 150 | ≤ 100 |

**Exemplo de Refatoração:**

```java
// ❌ ANTES - Complexity: 12
public ReservaDTO criar(ReservaDTO dto) {
    if (dto.getHospedeId() == null) {
        throw new BusinessException("Hóspede obrigatório");
    }
    if (dto.getQuartoId() == null) {
        throw new BusinessException("Quarto obrigatório");
    }
    Hospede hospede = hospedeRepository.findById(dto.getHospedeId())
        .orElseThrow(() -> new ResourceNotFoundException("Hóspede não encontrado"));
    Quarto quarto = quartoRepository.findById(dto.getQuartoId())
        .orElseThrow(() -> new ResourceNotFoundException("Quarto não encontrado"));
    if (quarto.getStatus() != StatusQuarto.DISPONIVEL) {
        throw new BusinessException("Quarto não disponível");
    }
    if (dto.getDataSaida().isBefore(dto.getDataEntrada())) {
        throw new BusinessException("Data inválida");
    }
    // ... mais lógica
}

// ✅ DEPOIS - Complexity: 3 (extraiu validações)
public ReservaDTO criar(ReservaDTO dto) {
    validarReserva(dto);
    
    Hospede hospede = buscarHospede(dto.getHospedeId());
    Quarto quarto = buscarQuartoDisponivel(dto.getQuartoId());
    
    return criarReserva(dto, hospede, quarto);
}

private void validarReserva(ReservaDTO dto) {
    validarCamposObrigatorios(dto);
    validarDatas(dto);
}

private void validarCamposObrigatorios(ReservaDTO dto) {
    if (dto.getHospedeId() == null) {
        throw new BusinessException("Hóspede obrigatório");
    }
    if (dto.getQuartoId() == null) {
        throw new BusinessException("Quarto obrigatório");
    }
}

// ... métodos auxiliares

```

---

## 3. ⚡ KPIs de Performance

### 3.1 Response Time (Tempo de Resposta)

**Definição:** Tempo de resposta das requisições HTTP

**Targets:**

| Percentil | Threshold | Target | Stretch Goal |
| --- | --- | --- | --- |
| **P50 (Mediana)** | < 200ms | < 100ms | < 50ms |
| **P95** | < 1s | < 500ms | < 200ms |
| **P99** | < 2s | < 1s | < 500ms |
| **P99.9** | < 5s | < 2s | < 1s |

**Breakdown por Endpoint:**

```text
┌─────────────────────────────────────────────────────────┐
│          LATÊNCIA POR ENDPOINT (P95)                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  GET  /hospedes           120ms  ████░░░░░░  ✅        │
│  POST /hospedes           250ms  ████████░░  ✅        │
│  GET  /hospedes/{id}       45ms  ██░░░░░░░░  ✅        │
│  GET  /quartos            150ms  █████░░░░░  ✅        │
│  POST /reservas           420ms  ████████████ ⚠️        │
│  GET  /reservas/hospede   180ms  ██████░░░░  ✅        │
│                                                          │
│  Status: 1 endpoint acima de 400ms (investigar)         │
│                                                          │
└─────────────────────────────────────────────────────────┘

```

**SLIs (Service Level Indicators):**

```text
SLI de Latência = 
    (Requisições com latência < target) / Total Requisições × 100

Exemplo:
  95% das requisições devem ter latência < 500ms
  
  Se em 1000 requisições:
    - 970 tiveram < 500ms
    - 30 tiveram > 500ms
  
  SLI = 970/1000 × 100 = 97% ✅ (target: 95%)

```

**Medição com Prometheus:**

```promql
# P95 latência global
histogram_quantile(0.95, 
  sum(rate(http_server_requests_seconds_bucket[5m])) by (le)
)

# P95 por endpoint
histogram_quantile(0.95, 
  sum(rate(http_server_requests_seconds_bucket[5m])) by (uri, le)
)

# Requisições lentas (> 1s)
sum(rate(http_server_requests_seconds_bucket{le="1"}[5m])) by (uri)

```

### 3.2 Throughput (Taxa de Requisições)

**Definição:** Número de requisições processadas por segundo

**Targets:**

| Métrica | Threshold | Target | Stretch Goal |
| --- | --- | --- | --- |
| **Throughput (req/s)** | ≥ 100 | ≥ 500 | ≥ 1000 |
| **Concurrent Users** | ≥ 50 | ≥ 200 | ≥ 500 |
| **Max Response Time @ Target Load** | < 2s | < 1s | < 500ms |

**Load Testing Results (JMeter):**

```text
┌─────────────────────────────────────────────────────────┐
│               LOAD TEST REPORT                           │
│               Target: 500 req/s                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Configuração:                                          │
│    • Duração: 10 minutos                                │
│    • Ramp-up: 2 minutos                                 │
│    • Threads: 200                                       │
│                                                          │
│  Resultados:                                            │
│    • Throughput alcançado: 487 req/s     ⚠️  97%       │
│    • Latência média: 340ms               ✅             │
│    • P95: 620ms                          ✅ (<1s)      │
│    • P99: 1.2s                           ✅ (<2s)      │
│    • Taxa de erro: 0.3%                  ✅ (<1%)      │
│                                                          │
│  CPU Usage:        68%  ██████████████░░░░              │
│  Memory Usage:     72%  ███████████████░░░              │
│  DB Connections:   45/50 ████████████████████░          │
│                                                          │
│  Status: ⚠️  PASS (porém próximo do limite)            │
│  Recomendação: Escalar para 3 instâncias               │
│                                                          │
└─────────────────────────────────────────────────────────┘

```

**Script JMeter (exemplo):**

```xml
<jmeterTestPlan version="1.2">
  <hashTree>
    <TestPlan>
      <stringProp name="TestPlan.comments">
        Load Test - Sistema Hotel Gestão
        Target: 500 req/s
      </stringProp>
    </TestPlan>
    <hashTree>
      <ThreadGroup>
        <stringProp name="ThreadGroup.num_threads">200</stringProp>
        <stringProp name="ThreadGroup.ramp_time">120</stringProp>
        <stringProp name="ThreadGroup.duration">600</stringProp>
        <boolProp name="ThreadGroup.scheduler">true</boolProp>
      </ThreadGroup>
      <hashTree>
        <HTTPSamplerProxy>
          <stringProp name="HTTPSampler.domain">hotel-gestao.com</stringProp>
          <stringProp name="HTTPSampler.path">/api/v1/hospedes</stringProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
        </HTTPSamplerProxy>
        
        <HTTPSamplerProxy>
          <stringProp name="HTTPSampler.domain">hotel-gestao.com</stringProp>
          <stringProp name="HTTPSampler.path">/api/v1/reservas</stringProp>
          <stringProp name="HTTPSampler.method">POST</stringProp>
          <boolProp name="HTTPSampler.postBodyRaw">true</boolProp>
          <elementProp name="HTTPsampler.Arguments">
            <collectionProp name="Arguments.arguments">
              <stringProp>{
                "hospedeId": "...",
                "quartoId": "...",
                "dataEntrada": "2025-04-01",
                "dataSaida": "2025-04-05"
              }</stringProp>
            </collectionProp>
          </elementProp>
        </HTTPSamplerProxy>
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>

```

### 3.3 Resource Utilization (Uso de Recursos)

**Targets:**

| Recurso | Threshold | Target | Alerta |
| --- | --- | --- | --- |
| **CPU (médio)** | < 70% | < 50% | > 80% |
| **CPU (pico)** | < 90% | < 75% | > 95% |
| **Memória (heap)** | < 80% | < 65% | > 90% |
| **DB Connections** | < 80% pool | < 60% pool | > 90% pool |
| **Disk I/O** | < 80% | < 60% | > 90% |

**Alertas Prometheus:**

```yaml
# prometheus/alerts.yml
- alert: HighCPUUsage
  expr: rate(process_cpu_seconds_total[5m]) * 100 > 70
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "CPU alto: {{ $value }}%"
    
- alert: HighMemoryUsage
  expr: (jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}) * 100 > 80
  for: 5m
  labels:
    severity: warning

```

---

## 4. 🛡️ KPIs de Confiabilidade

### 4.1 Availability (Disponibilidade)

**Definição:** Porcentagem de tempo que o sistema está operacional
**Fórmula:**
`Availability % = (Uptime / Total Time) × 100`

**SLA Targets:**

| Tier | Uptime % | Downtime/Mês | Downtime/Ano |
| --- | --- | --- | --- |
| **Basic** | 99.0% | 7h 18min | 3.65 dias |
| **Standard** | 99.5% | 3h 39min | 1.83 dias |
| **Premium** | 99.9% | 43.8 min | 8.76 horas |
| **Elite** | 99.99% | 4.38 min | 52.6 minutos |

**Nosso Target:** 99.9% (Premium)

**Cálculo Real:**

```text
Janeiro 2025:
  Total Time: 31 dias × 24h × 60min = 44,640 minutos
  Downtime: 
    • Incidente #1: 15 min (manutenção planejada)
    • Incidente #2: 28 min (bug crítico)
  Total Downtime: 43 minutos
  
  Availability = ((44,640 - 43) / 44,640) × 100 = 99.904% ✅
  
  Status: DENTRO DO SLA (99.9%)
  Margem: 0.004% (~1.77 min/mês)

```

**Medição:**

```promql
# Uptime (últimos 30 dias)
avg_over_time(up{job="hotel-backend"}[30d]) * 100

# Availability por instância
avg(up{job="hotel-backend"}) by (instance) * 100

```

### 4.2 MTTR (Mean Time To Recover)

**Definição:** Tempo médio para recuperar de um incidente
**Fórmula:**
`MTTR = Σ (Tempo de Resolução) / Número de Incidentes`

**Targets:**

| Severidade | Threshold | Target | Stretch Goal |
| --- | --- | --- | --- |
| **P1 (Crítico)** | < 4h | < 2h | < 1h |
| **P2 (Alto)** | < 24h | < 8h | < 4h |
| **P3 (Médio)** | < 72h | < 48h | < 24h |
| **P4 (Baixo)** | < 1 semana | < 3 dias | < 1 dia |

**Breakdown de MTTR:**

```text
MTTR = MTTD + MTTI + MTTF

Onde:
  MTTD = Mean Time To Detect (tempo para detectar)
  MTTI = Mean Time To Investigate (tempo para investigar)
  MTTF = Mean Time To Fix (tempo para corrigir)

Exemplo Incidente P1:
  13:00 - Problema ocorre
  13:05 - Alert disparado (MTTD: 5 min) ✅
  13:15 - Causa raiz identificada (MTTI: 10 min) ✅
  13:45 - Fix deployed (MTTF: 30 min) ✅
  
  MTTR = 5 + 10 + 30 = 45 minutos ✅ (target: <2h)

```

**Dashboard:**

```text
┌─────────────────────────────────────────────────────────┐
│               MTTR DASHBOARD (Q1 2025)                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Total Incidentes: 8                                    │
│                                                          │
│  P1 (Críticos): 2                                       │
│    • Inc-001: 45 min  ✅                                │
│    • Inc-005: 1h 20min ✅                               │
│    MTTR P1: 52.5 min ✅ (target: <2h)                  │
│                                                          │
│  P2 (Altos): 3                                          │
│    • Inc-002: 3h       ✅                               │
│    • Inc-004: 6h       ✅                               │
│    • Inc-007: 10h      ⚠️  (acima de 8h)               │
│    MTTR P2: 6.3h ✅ (target: <8h)                      │
│                                                          │
│  P3 (Médios): 3                                         │
│    MTTR P3: 18h ✅ (target: <48h)                      │
│                                                          │
│  Tendência: 📉 -15% vs Q4 2024                         │
│                                                          │
└─────────────────────────────────────────────────────────┘

```

### 4.3 Error Rate (Taxa de Erro)

**Definição:** Porcentagem de requisições que resultam em erro
**Fórmula:**
`Error Rate % = (Requisições 5xx / Total Requisições) × 100`

**Targets:**

| Métrica | Threshold | Target | Stretch Goal |
| --- | --- | --- | --- |
| **5xx Error Rate** | < 1% | < 0.1% | < 0.01% |
| **4xx Error Rate** | < 10% | < 5% | < 2% |
| **Timeout Rate** | < 0.5% | < 0.1% | < 0.01% |

**SLO (Service Level Objective):**

```text
SLO de Confiabilidade:
  99.9% das requisições devem retornar 2xx/3xx (sucesso)
  
  Em 1 mês com 10 milhões de requisições:
    Máximo de erros permitidos: 10.000 (0.1%)
  
  Error Budget: 10.000 erros/mês
  
  Se ultrapassar error budget:
    ENTÃO pausar novas features até estabilizar

```

**Medição:**

```promql
# Taxa de erro 5xx
(
  sum(rate(http_server_requests_total{status=~"5.."}[5m])) 
  / 
  sum(rate(http_server_requests_total[5m]))
) * 100

# Top 5 erros
topk(5, 
  sum(rate(http_server_requests_total{status=~"5.."}[5m])) by (uri, status)
)

```

---

## 5. 🔒 KPIs de Segurança

### 5.1 Vulnerability Management

**Targets:**

| Severidade | SLA Detecção | SLA Correção | Threshold |
| --- | --- | --- | --- |
| **Critical** | < 24h | < 48h | 0 |
| **High** | < 72h | < 7 dias | ≤ 2 |
| **Medium** | < 1 semana | < 30 dias | ≤ 10 |
| **Low** | < 2 semanas | < 90 dias | ≤ 50 |

**Security Scan Frequency:**

* **Daily:**
✅ Dependency check (OWASP, Snyk)
✅ Container scan (Trivy)
* **Weekly:**
✅ SAST (Static Application Security Testing)
✅ Secret scanning (GitGuardian)
* **Monthly:**
✅ DAST (Dynamic Application Security Testing)
✅ Penetration testing (manual)
* **Quarterly:**
✅ External security audit
✅ Compliance review (LGPD)

**Dashboard:**

```text
┌─────────────────────────────────────────────────────────┐
│            SECURITY DASHBOARD (Março 2025)               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Vulnerabilities:                                       │
│    Critical:  0  ✅                                     │
│    High:      1  ⚠️  (CVE-2025-1234 - em correção)     │
│    Medium:    5  ✅                                     │
│    Low:      12  ✅                                     │
│                                                          │
│  Overdue Fixes:                                         │
│    Critical: 0 ✅                                       │
│    High:     0 ✅ (1 dentro do SLA - 3 dias restantes) │
│                                                          │
│  Compliance:                                            │
│    OWASP Top 10:     100% ✅                           │
│    LGPD:              98% ✅ (2 itens pendentes)       │
│    PCI-DSS:          N/A                                │
│                                                          │
│  Last Pen Test: 2025-02-15 ✅                          │
│  Next Pen Test: 2025-05-15                              │
│                                                          │
└─────────────────────────────────────────────────────────┘

```

### 5.2 Security Incidents

**Targets:**

| Métrica | Target |
| --- | --- |
| **Security Incidents/Mês** | 0 |
| **Time to Detect Breach** | < 1h |
| **Time to Contain Breach** | < 4h |
| **Data Breach** | 0 (zero tolerance) |

**Incident Response Time:**

```text
┌─────────────────────────────────────────────────────────┐
│           SECURITY INCIDENT RESPONSE SLA                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Detection → Triage:           < 15 min                 │
│  Triage → Escalation:          < 30 min                 │
│  Escalation → Containment:     < 2h                     │
│  Containment → Eradication:    < 24h                    │
│  Eradication → Recovery:       < 48h                    │
│  Recovery → Post-Mortem:       < 1 semana               │
│                                                          │
│  Total MTTR (Security): < 72h                           │
│                                                          │
└─────────────────────────────────────────────────────────┘

```

---

## 6. 📈 KPIs de Negócio

### 6.1 Taxa de Conversão (Reservas)

**Definição:** % de tentativas que resultam em reserva confirmada
**Fórmula:**
`Conversion Rate = (Reservas Confirmadas / Tentativas de Reserva) × 100`

**Targets:**

| Métrica | Threshold | Target | Stretch Goal |
| --- | --- | --- | --- |
| **Conversion Rate** | ≥ 60% | ≥ 75% | ≥ 85% |
| **Abandonment Rate** | ≤ 40% | ≤ 25% | ≤ 15% |
| **Time to Book (avg)** | < 5 min | < 3 min | < 2 min |

**Funnel de Conversão:**

```text
1000 Visitantes
   │
   ├─► 700 Buscam quartos (70%)
   │     │
   │     ├─► 500 Encontram quarto disponível (71%)
   │     │     │
   │     │     ├─► 400 Iniciam reserva (80%)
   │     │     │     │
   │     │     │     ├─► 320 Completam dados (80%)
   │     │     │     │     │
   │     │     │     │     ├─► 280 Confirmam reserva (87.5%)
   │     │     │     │     │
   │     │     │     │     └─► 40 Abandonam (12.5%)
   │     │     │     │
   │     │     │     └─► 80 Abandonam (20%)
   │     │     │
   │     │     └─► 100 Não encontram disponibilidade
   │     │
   │     └─► 200 Não buscam (30%)
   │
   └─► 300 Não interagem (30%)

Conversion Rate Final: 280/1000 = 28%

Onde estamos perdendo:
  1. 30% não interagem (UX issue?)
  2. 29% não encontram disponível (inventário?)
  3. 12% abandonam no checkout (performance? complexidade?)

```

### 6.2 Taxa de Ocupação

**Definição:** % de quartos ocupados
**Fórmula:**
`Occupancy Rate = (Quartos Ocupados / Total Quartos) × 100`

**Targets:**

| Período | Threshold | Target | Stretch Goal |
| --- | --- | --- | --- |
| **Alta Temporada** | ≥ 70% | ≥ 85% | ≥ 95% |
| **Média Temporada** | ≥ 50% | ≥ 65% | ≥ 75% |
| **Baixa Temporada** | ≥ 30% | ≥ 45% | ≥ 60% |

**Medição em Tempo Real:**

```java
@Service
public class MetricasNegocioService {
    
    @Scheduled(fixedRate = 300000) // 5 minutos
    public void atualizarTaxaOcupacao() {
        long totalQuartos = quartoRepository.count();
        long quartosOcupados = quartoRepository.countByStatus(StatusQuarto.OCUPADO);
        
        double taxaOcupacao = (quartosOcupados * 100.0) / totalQuartos;
        
        // Publicar métrica no Prometheus
        Gauge.builder("quartos.taxa_ocupacao", () -> taxaOcupacao)
            .description("Taxa de ocupação dos quartos (%)")
            .register(meterRegistry);
        
        // Alertar se abaixo do threshold
        if (taxaOcupacao < 30.0) {
            alertService.enviar("Taxa de ocupação baixa: " + taxaOcupacao + "%");
        }
    }
}

```

---

## 7. ⏱️ KPIs de Processo

### 7.1 Lead Time & Cycle Time

**Definições:**

* `Lead Time` = Tempo desde criação da issue até deploy em produção
* `Cycle Time` = Tempo desde início do desenvolvimento até deploy
* `Lead Time = Wait Time + Cycle Time`

**Targets:**

| Métrica | Threshold | Target | Stretch Goal |
| --- | --- | --- | --- |
| **Lead Time** | < 14 dias | < 7 dias | < 3 dias |
| **Cycle Time** | < 7 dias | < 3 dias | < 1 dia |
| **Wait Time** | < 7 dias | < 4 dias | < 2 dias |

**Medição Jira/GitHub:**

```javascript
// Script para calcular Lead Time
const issues = await jira.getIssuesClosedLastMonth();

const leadTimes = issues.map(issue => {
  const created = new Date(issue.fields.created);
  const resolved = new Date(issue.fields.resolutiondate);
  const leadTimeDays = (resolved - created) / (1000 * 60 * 60 * 24);
  return leadTimeDays;
});

const avgLeadTime = leadTimes.reduce((a, b) => a + b) / leadTimes.length;
const p50LeadTime = percentile(leadTimes, 0.5);
const p95LeadTime = percentile(leadTimes, 0.95);

console.log(`Lead Time Médio: ${avgLeadTime.toFixed(1)} dias`);
console.log(`Lead Time P50: ${p50LeadTime.toFixed(1)} dias`);
console.log(`Lead Time P95: ${p95LeadTime.toFixed(1)} dias`);

// Output:
// Lead Time Médio: 5.2 dias ✅
// Lead Time P50: 4.1 dias ✅
// Lead Time P95: 9.8 dias ⚠️  (acima de 7d)

```

---

## 8. 😊 KPIs de Experiência do Usuário

### 8.1 System Usability Scale (SUS)

**Definição:** Questionário padrão de 10 perguntas (escala 1-5)
**Target:** SUS Score ≥ 70 (Good), ≥ 80 (Excellent)

**Escala:**

```text
┌─────────────────────────────────────────────────────────┐
│                  SUS SCORE SCALE                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   0  ────────────────────────────────────────  100      │
│   │                                              │       │
│   │                                              │       │
│   ├──────┬──────┬──────┬──────┬──────┬──────────┤       │
│   0     25     50     68     80     90        100       │
│         │      │      │      │      │           │       │
│      Worst  Poor   OK  Good  Great  Excellent Best      │
│                                                          │
│   Nosso Target: ≥ 70 (Good)                             │
│   Stretch Goal: ≥ 80 (Great)                            │
│                                                          │
└─────────────────────────────────────────────────────────┘

```

**Questionário:**

1. Eu acho que gostaria de usar este sistema frequentemente
2. Eu achei o sistema desnecessariamente complexo (inverso)
3. Eu achei o sistema fácil de usar
4. Eu acho que precisaria de ajuda técnica para usar este sistema (inverso)
5. Eu achei que as várias funções neste sistema foram bem integradas
6. Eu achei que havia muita inconsistência neste sistema (inverso)
7. Eu imagino que a maioria das pessoas aprenderia a usar este sistema rapidamente
8. Eu achei o sistema muito complicado de usar (inverso)
9. Eu me senti muito confiante usando o sistema
10. Eu precisei aprender muitas coisas antes de continuar usando este sistema (inverso)

**Cálculo:**
`Score = ((Σ perguntas ímpares - 5) + (25 - Σ perguntas pares)) × 2.5`

### 8.2 Net Promoter Score (NPS)

**Definição:** "Em uma escala de 0-10, o quanto você recomendaria este sistema?"
**Fórmula:**
`NPS = % Promotores (9-10) - % Detratores (0-6)`

**Targets:**

| Score | Classificação | Target |
| --- | --- | --- |
| **-100 a 0** | Precisa melhorar |  |
| **-0 a 30** | Razoável |  |
| **-30 a 70** | Bom | ✅ Nosso target |
| **70 a 100** | Excelente | Stretch goal |

**Exemplo:**
100 usuários responderam:

* 60 deram 9-10 (Promotores)
* 30 deram 7-8 (Neutros)
* 10 deram 0-6 (Detratores)

`NPS = (60% - 10%) = 50 ✅ (Good)`

---

## 📋 Quality Gates (Portões de Qualidade)

### Sprint Quality Gate

Para considerar sprint "Done", TODOS os critérios devem ser atendidos:

✅ **CÓDIGO:**
[ ] Velocity ≥ 85% do planejado
[ ] Code coverage ≥ 80%
[ ] SonarQube Quality Gate: PASSED
[ ] 0 bugs críticos/altos
[ ] 0 vulnerabilidades críticas

✅ **TESTES:**
[ ] Todos testes unitários passando
[ ] Todos testes de integração passando
[ ] Smoke tests em staging: OK

✅ **PERFORMANCE:**
[ ] P95 latência < 1s
[ ] Load test: 500 req/s sem degradação

✅ **SEGURANÇA:**
[ ] Dependency scan: 0 critical
[ ] Container scan: 0 high/critical
[ ] Secrets não commitados

✅ **DOCUMENTAÇÃO:**
[ ] README atualizado
[ ] OpenAPI atualizado
[ ] Runbooks atualizados (se aplicável)

✅ **DEPLOY:**
[ ] CI/CD pipeline: verde
[ ] Deploy em staging: sucesso
[ ] Health checks: OK

**SE** algum critério falhar:
**ENTÃO** sprint NÃO é considerado "Done"
**E** deve ser resolvido antes de fechar

### Release Quality Gate (Go/No-Go)

Para aprovar release para produção:

✅ **FUNCIONAL (Must Have = 100%):**
[ ] Todas features Must Have implementadas
[ ] UAT aprovado por stakeholders
[ ] Smoke tests em staging: OK

✅ **NÃO-FUNCIONAL:**
[ ] Performance: Load test 500 req/s ✅
[ ] Availability: SLA 99.9% em staging ✅
[ ] Security: 0 vulnerabilidades críticas ✅
[ ] Compatibility: Testado em Chrome, Firefox, Safari ✅

✅ **QUALIDADE:**
[ ] Code coverage ≥ 80%
[ ] SonarQube: Rating A
[ ] 0 bugs P1/P2 abertos
[ ] Technical debt < 2 dias

✅ **OPERACIONAL:**
[ ] Runbooks completos e testados
[ ] Rollback testado
[ ] Monitoring/alerting: ativo
[ ] On-call: definido

✅ **COMPLIANCE:**
[ ] LGPD: 100% compliant
[ ] Security audit: aprovado
[ ] Logs: PII mascarado

✅ **COMUNICAÇÃO:**
[ ] Release notes publicadas
[ ] Stakeholders notificados
[ ] Clientes comunicados (se breaking change)

**DECISÃO GO/NO-GO:**

* ✅ **GO:** Se TODOS os critérios atendidos
* ❌ **NO-GO:** Se QUALQUER critério crítico falhar
* ⚠️ **GO COM RESTRIÇÕES:** Se apenas critérios não-críticos falharem

---

## 📊 Dashboard Consolidado

**Executive Dashboard (Semanal)**

```text
┌─────────────────────────────────────────────────────────────────────┐
│            HOTEL GESTÃO - EXECUTIVE DASHBOARD                        │
│            Semana 15 - Sprint 4 - 2025-04-01                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🎯 OBJETIVOS DO SPRINT:                            STATUS          │
│    • Implementar observabilidade completa           ✅ 90%         │
│    • Adicionar cache Caffeine                       ✅ 100%        │
│    • Otimizar queries N+1                           🔄 75%         │
│                                                                      │
│  📊 DESENVOLVIMENTO:                                                │
│    Velocity:           85 pts / 95 pts              ✅ 89%         │
│    Burndown:           On track                     ✅             │
│    PRs aguardando:     2                            ✅ (<5)        │
│    Bloqueios:          0                            ✅             │
│                                                                      │
│  🎨 QUALIDADE:                                                      │
│    Code Coverage:      82%                          ✅ (>80%)      │
│    SonarQube:          A                            ✅             │
│    Bugs Críticos:      0                            ✅             │
│    Tech Debt:          1.8 dias                     ✅ (<2d)       │
│                                                                      │
│  ⚡ PERFORMANCE:                                                    │
│    P95 Latência:       420ms                        ✅ (<500ms)    │
│    Throughput:         487 req/s                    ⚠️  (target 500)│
│    CPU Médio:          68%                          ✅ (<70%)      │
│    Memory:             72%                          ✅ (<80%)      │
│                                                                      │
│  🛡️ CONFIABILIDADE:                                                │
│    Uptime (7 dias):    99.95%                       ✅ (>99.9%)    │
│    Error Rate:         0.08%                        ✅ (<0.1%)     │
│    MTTR:               45 min                       ✅ (<2h)       │
│    Incidents:          1 (P3)                       ✅             │
│                                                                      │
│  🔒 SEGURANÇA:                                                      │
│    Vulnerabilities:    0 critical, 1 high           ⚠️             │
│    Overdue Fixes:      0                            ✅             │
│    Last Scan:          2025-03-31                   ✅             │
│                                                                      │
│  📈 NEGÓCIO:                                                        │
│    Taxa Ocupação:      67%                          ✅ (>65%)      │
│    Reservas/dia:       43                           ✅             │
│    Conversion Rate:    76%                          ✅ (>75%)      │
│                                                                      │
│  💰 ORÇAMENTO:                                                      │
│    Gasto:              R$ 380k / R$ 566k            ✅ 67%         │
│    Projeção Final:     R$ 555k                      ✅ (2% abaixo) │
│                                                                      │
│  ⚠️  ALERTAS:                                                       │
│    • Throughput 3% abaixo do target (investigar)                   │
│    • 1 vulnerabilidade High pendente (SLA: 4 dias restantes)       │
│                                                                      │
│  ✅ CONQUISTAS DA SEMANA:                                          │
│    • Cache implementado (melhoria de 40% em latência)              │
│    • 0 bugs críticos pela 3ª semana consecutiva                    │
│    • Uptime acima de 99.9% por 30 dias                             │
│                                                                      │
│  📅 PRÓXIMA SEMANA:                                                │
│    • Finalizar otimização de queries                               │
│    • Começar Sprint 5 (Testes e Qualidade)                         │
│    • Corrigir vulnerabilidade High                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

OVERALL HEALTH: 🟢 SAUDÁVEL (92/100)

```

---

## 🎯 Conclusão e Próximos Passos

**Resumo de Targets**

| Categoria | KPIs Definidos | Ferramentas |
| --- | --- | --- |
| Desenvolvimento | 4 | Jira, GitHub |
| Qualidade de Código | 3 | SonarQube, JaCoCo |
| Performance | 3 | Prometheus, JMeter |
| Confiabilidade | 3 | Grafana, PagerDuty |
| Segurança | 2 | Snyk, Trivy |
| Negócio | 2 | Custom metrics |
| Processo | 1 | Jira |
| UX | 2 | Surveys |
| **TOTAL** | **20 KPIs** | - |

**Cronograma de Implementação**

* **Sprint 0-1:** Setup de ferramentas
[ ] Jira/GitHub Projects configurado
[ ] SonarQube integrado ao CI/CD
[ ] Prometheus + Grafana instalado
* **Sprint 2-3:** Métricas básicas
[ ] Velocity tracking
[ ] Code coverage
[ ] Performance monitoring (P95, throughput)
* **Sprint 4-5:** Métricas avançadas
[ ] Business metrics (ocupação, conversão)
[ ] Security scanning automático
[ ] Dashboards Grafana completos
* **Sprint 6-7:** Refinamento
[ ] Alertas configurados
[ ] Quality gates implementados
[ ] Executive dashboard finalizado

**Revisão de KPIs**

* **Weekly:** Tech Lead + Scrum Master
* Review de desenvolvimento (velocity, burndown)
* Ações imediatas para desvios


* **Bi-weekly:** Sprint Review
* Apresentação de todos KPIs aos stakeholders
* Decisão go/no-go para release


* **Monthly:** Executive Review
* Tendências de longo prazo
* Ajustes de targets (se necessário)
* ROI de qualidade


* **Quarterly:** Strategic Review
* Benchmark com mercado
* Novos KPIs (se necessário)
* Lessons learned



**KPIs não são estáticos - evoluem com o projeto!** 📊