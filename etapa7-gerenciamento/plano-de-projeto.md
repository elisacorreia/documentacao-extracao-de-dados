# Cronograma de Implementação - Sistema Hotel Gestão

## 📋 Visão Geral

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    ROADMAP DE IMPLEMENTAÇÃO                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Sprint 0: Setup e Preparação           (1 semana)                  │
│  Sprint 1: Segurança e Fundamentos      (2 semanas)  ← CRÍTICO     │
│  Sprint 2: CRUD Completo                (2 semanas)                 │
│  Sprint 3: Performance e Paginação      (2 semanas)                 │
│  Sprint 4: Observabilidade              (2 semanas)                 │
│  Sprint 5: Testes e Qualidade           (2 semanas)                 │
│  Sprint 6: DevOps e Deploy              (2 semanas)                 │
│  Sprint 7: Documentação e Polimento     (2 semanas)                 │
│                                                                      │
│  TOTAL: 15 semanas (~3.5 meses)                                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

```

## 🎯 Premissas

**Composição do Time**

| Papel | Quantidade | Dedicação | Velocity Sprint |
| --- | --- | --- | --- |
| Backend Dev (Senior) | 1 | 100% | 40 pts / 80h |
| Backend Dev (Pleno) | 1 | 100% | 30 pts / 60h |
| QA Engineer | 1 | 50% | 15 pts / 30h |
| DevOps | 1 | 30% | 10 pts / 20h |
| **Total Capacity** | -- | -- | **95 pts / 190h por sprint** |

**Sprint**

* **Duração:** 2 semanas (10 dias úteis)
* **Velocity estimada:** 95 story points
* **Horas disponíveis:** 190h por sprint
* **Buffer:** 15% para imprevistos

**Story Points (Escala Fibonacci)**

* 1 pt = 2h (Trivial)
* 2 pts = 4h (Simples)
* 3 pts = 6h (Médio-Simples)
* 5 pts = 10h (Médio)
* 8 pts = 16h (Complexo)
* 13 pts = 26h (Muito Complexo)
* 21 pts = 42h (Épico - quebrar em menores)

---

## 🚀 Sprint 0: Setup e Preparação

* **Duração:** 1 semana
* **Objetivo:** Preparar ambiente e ferramentas

**Backlog**

| ID | User Story | Story Points | Horas | Responsável |
| --- | --- | --- | --- | --- |
| S0-1 | Setup de repositório Git (branches, protections) | 2 | 4h | DevOps |
| S0-2 | Configurar CI/CD pipeline básico | 5 | 10h | DevOps |
| S0-3 | Setup ambiente de desenvolvimento local | 3 | 6h | Backend Sr |
| S0-4 | Configurar SonarQube | 3 | 6h | DevOps |
| S0-5 | Criar estrutura de testes (JUnit, Mockito) | 5 | 10h | Backend Sr |
| S0-6 | Definir padrões de código (Checkstyle, PMD) | 2 | 4h | Backend Sr |
| S0-7 | Setup Jira/Confluence/Wiki | 2 | 4h | DevOps |
| S0-8 | Kickoff meeting e alinhamento | 1 | 2h | Todos |
| **TOTAL** |  | **23 pts** | **46h** |  |

**Entregáveis**

* ✅ Repositório configurado
* ✅ Pipeline CI rodando
* ✅ Ambiente local funcionando
* ✅ Documentação inicial

---

## 🔴 Sprint 1: Segurança e Fundamentos (CRÍTICO)

* **Duração:** 2 semanas
* **Objetivo:** Corrigir vulnerabilidades críticas e estabelecer base sólida

**Epic: Segurança**

| ID | User Story | Descrição | SP | Horas | Dev |
| --- | --- | --- | --- | --- | --- |
| SEC-001 | Configurar CORS restrito | Substituir `origins="*"` por whitelist configurável | 3 | 6h | Backend Sr |
| SEC-002 | Implementar validação de entrada | Adicionar `@Pattern`, `@Valid` em todos endpoints | 5 | 10h | Backend Sr |
| SEC-003 | Sanitização de CPF | Remover caracteres especiais, validar formato | 3 | 6h | Backend Pl |
| SEC-004 | Rate Limiting | Implementar Bucket4j (100 req/min por IP) | 8 | 16h | Backend Sr |
| SEC-005 | Security Headers | Helmet.js equivalent (CSP, X-Frame-Options) | 3 | 6h | Backend Pl |
| SEC-006 | Audit logging | Logs de ações sensíveis (LGPD compliant) | 5 | 10h | Backend Sr |

**Epic: Configuração Global**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| CFG-001 | Externalizar configurações (application.yml por ambiente) | 3 | 6h | Backend Sr |
| CFG-002 | Secrets management (AWS Secrets Manager) | 5 | 10h | DevOps |
| CFG-003 | Configuração de profiles (dev, staging, prod) | 2 | 4h | Backend Pl |

**Epic: Testes Críticos**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| TEST-001 | Testes unitários de validação de segurança | 5 | 10h | QA + Backend Pl |
| TEST-002 | Testes de integração de CORS | 3 | 6h | QA |

**Sprint 1 - Resumo**

* Total Story Points: 45 pts
* Total Horas: 90h
* Capacity: 95 pts / 190h
* Buffer: 50 pts / 100h (para riscos)
* Status: ✅ DENTRO DA CAPACIDADE

**Definition of Done (DoD)**

* Código revisado (PR aprovado)
* Testes unitários com cobertura > 80%
* Testes de integração passando
* SonarQube sem issues críticos
* Documentação atualizada
* Deploy em ambiente de DEV ok

---

## 🟢 Sprint 2: CRUD Completo

* **Duração:** 2 semanas
* **Objetivo:** Implementar operações completas de CRUD para todas entidades

**Epic: Hóspedes - CRUD Completo**

| ID | User Story | Aceitação | SP | Horas | Dev |
| --- | --- | --- | --- | --- | --- |
| HSP-001 | PUT /api/v1/hospedes/{id} | Atualizar hóspede completo | 5 | 10h | Backend Pl |
| HSP-002 | PATCH /api/v1/hospedes/{id} | Atualizar campos parciais | 5 | 10h | Backend Pl |
| HSP-003 | DELETE /api/v1/hospedes/{id} | Deletar (com validação de reservas) | 5 | 10h | Backend Sr |
| HSP-004 | GET /api/v1/hospedes/buscar | Busca por nome (like) | 3 | 6h | Backend Pl |
| HSP-005 | Testes unitários (CRUD completo) | Cobertura > 90% | 8 | 16h | Backend Pl + QA |

**Epic: Quartos - CRUD Completo**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| QRT-001 | PUT /api/v1/quartos/{id} | Atualizar quarto | 5 | 10h |
| QRT-002 | DELETE /api/v1/quartos/{id} | Deletar (com validação) | 5 | 10h |
| QRT-003 | Filtros avançados (status, tipo, preço) | Query params | 5 | 10h |
| QRT-004 | Testes unitários | Cobertura > 90% | 8 | 16h |

**Epic: Reservas - CRUD Completo**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| RSV-001 | PUT /api/v1/reservas/{id} | Atualizar reserva | 8 | 16h |
| RSV-002 | DELETE /api/v1/reservas/{id} (cancelar) | Liberar quarto | 5 | 10h |
| RSV-003 | GET /api/v1/reservas/hospede/{id} | Listar por hóspede | 3 | 6h |
| RSV-004 | Testes de integração (fluxo completo) | End-to-end | 8 | 16h |

**Sprint 2 - Resumo**

* Total Story Points: 73 pts
* Total Horas: 146h
* Capacity: 95 pts / 190h

⚠️ ACIMA DA CAPACIDADE!
Ajuste: Mover RSV-004 para Sprint 3

**Ajustado:**

* Total: 65 pts / 130h
* Status: ✅ DENTRO DA CAPACIDADE

---

## 🟡 Sprint 3: Performance e Paginação

* **Duração:** 2 semanas
* **Objetivo:** Otimizar performance e escalabilidade

**Epic: Paginação**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| PAG-001 | Paginação em GET /api/v1/hospedes | Pageable, Page<> | 5 | 10h |
| PAG-002 | Paginação em GET /api/v1/quartos | Pageable, Page<> | 3 | 6h |
| PAG-003 | Paginação em GET /api/v1/reservas | Pageable, Page<> | 5 | 10h |
| PAG-004 | Ordenação customizável | Sort params | 3 | 6h |
| PAG-005 | Testes de paginação | Validar limites, offset | 5 | 10h |

**Epic: Cache**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| CHE-001 | Configurar Caffeine Cache | Setup + config | 3 | 6h |
| CHE-002 | Cache em GET /hospedes/{id} | @Cacheable | 2 | 4h |
| CHE-003 | Cache em GET /quartos/{id} | @Cacheable | 2 | 4h |
| CHE-004 | Cache eviction em PUT/DELETE | @CacheEvict | 3 | 6h |
| CHE-005 | Métricas de cache (hit rate) | Micrometer | 5 | 10h |

**Epic: Otimização de Queries**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| OPT-001 | Adicionar índices no banco | CPF, email, data_entrada | 3 | 6h |
| OPT-002 | Otimizar N+1 queries | @EntityGraph, JOIN FETCH | 8 | 16h |
| OPT-003 | Projeções JPA | DTOs otimizados | 5 | 10h |
| OPT-004 | Testes de performance | JMeter (1000 req/s) | 8 | 16h |

**Epic: Pendências Sprint 2**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| RSV-004 | Testes integração reservas (movido Sprint 2) | 8 | 16h | QA |

**Sprint 3 - Resumo**

* Total Story Points: 68 pts
* Total Horas: 136h
* Capacity: 95 pts / 190h

⚠️ LIGEIRAMENTE ACIMA

Ajuste: Mover OPT-004 para Sprint 4

**Ajustado:**

* Total: 60 pts / 120h
* Status: ✅ DENTRO DA CAPACIDADE

---

## 📊 Sprint 4: Observabilidade

* **Duração:** 2 semanas
* **Objetivo:** Implementar monitoramento, logs e métricas

**Epic: Métricas**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| MET-001 | Configurar Micrometer + Prometheus | Setup | 5 | 10h |
| MET-002 | Métricas customizadas (reservas criadas) | Counters | 3 | 6h |
| MET-003 | Métricas de negócio (taxa ocupação) | Gauges | 5 | 10h |
| MET-004 | Timers (@Timed em endpoints) | Latência | 3 | 6h |
| MET-005 | Dashboard Grafana básico | Painéis | 8 | 16h |

**Epic: Logs Estruturados**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| LOG-001 | Configurar Logback JSON | logback-spring.xml | 3 | 6h |
| LOG-002 | MDC (requestId, userId, traceId) | Interceptor | 5 | 10h |
| LOG-003 | Logs de auditoria | Separate appender | 3 | 6h |
| LOG-004 | Mascaramento de PII (CPF, email) | Utility methods | 3 | 6h |
| LOG-005 | Setup Loki + Promtail | Log aggregation | 8 | 16h |

**Epic: Distributed Tracing**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| TRC-001 | Configurar Jaeger | Setup | 5 | 10h |
| TRC-002 | Instrumentação automática | Micrometer Tracing | 5 | 10h |
| TRC-003 | Propagação de trace context | Headers | 3 | 6h |

**Epic: Alertas**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| ALR-001 | Configurar AlertManager | Setup | 5 | 10h |
| ALR-002 | Regras de alerta críticas | ServiceDown, HighErrorRate | 5 | 10h |
| ALR-003 | Integração Slack | Webhooks | 2 | 4h |

**Epic: Pendências Sprint 3**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| OPT-004 | Testes de performance JMeter (movido) | 8 | 16h | QA |

**Sprint 4 - Resumo**

* Total Story Points: 70 pts
* Total Horas: 140h
* Capacity: 95 pts / 190h

⚠️ LIGEIRAMENTE ACIMA

Ajuste: Mover TRC-003 para Sprint 5

**Ajustado:**

* Total: 67 pts / 134h
* Status: ✅ DENTRO DA CAPACIDADE

---

## ✅ Sprint 5: Testes e Qualidade

* **Duração:** 2 semanas
* **Objetivo:** Aumentar cobertura de testes e qualidade de código

**Epic: Testes Unitários**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| TST-001 | Testes unitários HospedeService (completo) | 8 | 16h | Backend Pl + QA |
| TST-002 | Testes unitários QuartoService (completo) | 8 | 16h | Backend Pl + QA |
| TST-003 | Testes unitários ReservaService (completo) | 13 | 26h | Backend Sr + QA |
| TST-004 | Testes de validação (Bean Validation) | 5 | 10h | QA |

**Epic: Testes de Integração**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| INT-001 | Testes integração fluxo completo (Runbook RB-001) | 8 | 16h | QA |
| INT-002 | Testes de cenários de erro (4xx, 5xx) | 5 | 10h | QA |
| INT-003 | Testes de concorrência (reserva simultânea) | 8 | 16h | Backend Sr |

**Epic: Qualidade de Código**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| QUA-001 | Refatoração baseada em SonarQube | Code smells | 8 | 16h |
| QUA-002 | Documentação JavaDoc completa | Todas classes públicas | 5 | 10h |
| QUA-003 | OpenAPI/Swagger completo | Annotations | 5 | 10h |

**Epic: Pendências Sprint 4**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| TRC-003 | Propagação trace context (movido) | 3 | 6h | Backend Sr |

**Sprint 5 - Resumo**

* Total Story Points: 76 pts
* Total Horas: 152h
* Capacity: 95 pts / 190h

⚠️ ACIMA DA CAPACIDADE!

Ajuste: Mover QUA-001 e QUA-002 para Sprint 7 (polimento)

**Ajustado:**

* Total: 63 pts / 126h
* Status: ✅ DENTRO DA CAPACIDADE

---

## 🚀 Sprint 6: DevOps e Deploy

* **Duração:** 2 semanas
* **Objetivo:** Automatizar deploy e preparar produção

**Epic: Docker**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| DOC-001 | Dockerfile multi-stage otimizado | Build + runtime | 5 | 10h |
| DOC-002 | docker-compose.yml (dev, staging, prod) | 3 ambientes | 5 | 10h |
| DOC-003 | Health checks Docker | HEALTHCHECK | 2 | 4h |
| DOC-004 | Otimização de imagem (< 200MB) | Alpine, layers | 3 | 6h |

**Epic: CI/CD Pipeline**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| CIC-001 | Pipeline completo GitHub Actions | Build, test, deploy | 13 | 26h |
| CIC-002 | Security scan (Trivy, Snyk) | Vulnerabilities | 5 | 10h |
| CIC-003 | Deploy automático DEV | On push develop | 3 | 6h |
| CIC-004 | Deploy manual PROD | Approval required | 5 | 10h |

**Epic: Kubernetes (Opcional - se necessário)**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| K8S-001 | Manifests K8s (Deployment, Service) | YAML files | 8 | 16h |
| K8S-002 | ConfigMaps e Secrets | Externalized config | 3 | 6h |
| K8S-003 | HorizontalPodAutoscaler | Auto-scaling | 5 | 10h |
| K8S-004 | Ingress + TLS | HTTPS | 5 | 10h |

**Epic: Runbooks**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| RUN-001 | Runbook RB-001 (ServiceDown) | Procedimento completo | 5 | 10h |
| RUN-002 | Runbook RB-002 (HighErrorRate) | Procedimento completo | 3 | 6h |
| RUN-003 | Scripts de rollback | Automação | 5 | 10h |

**Sprint 6 - Resumo**

* Total Story Points: 70 pts (sem K8s) ou 91 pts (com K8s)
* Total Horas: 140h (sem K8s) ou 182h (com K8s)

Decisão: Implementar K8s apenas se necessário (escala)

**SEM K8s:**

* Total: 70 pts / 140h
* Status: ✅ DENTRO DA CAPACIDADE

**COM K8s:**

* Total: 91 pts / 182h
* Status: ⚠️ ACIMA (dividir em 2 sprints)

---

## 📚 Sprint 7: Documentação e Polimento

* **Duração:** 2 semanas
* **Objetivo:** Finalizar documentação e melhorias finais

**Epic: Documentação**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| DOC-001 | README.md completo | Setup, quickstart | 3 | 6h |
| DOC-002 | Guia de contribuição (CONTRIBUTING.md) | Standards | 2 | 4h |
| DOC-003 | Arquitetura (ARCHITECTURE.md) | Diagramas | 5 | 10h |
| DOC-004 | API documentation (Swagger UI) | Hosted docs | 3 | 6h |
| DOC-005 | Runbooks completos (todos) | RB-001 a RB-013 | 8 | 16h |

**Epic: Polimento (Pendências)**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| QUA-001 | Refatoração SonarQube (movido Sprint 5) |  | 8 | 16h |
| QUA-002 | JavaDoc completo (movido Sprint 5) |  | 5 | 10h |

**Epic: Features Adicionais (Nice to Have)**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| FEA-001 | Versionamento de API (/v1/, /v2/) | Múltiplas versões | 5 | 10h |
| FEA-002 | GraphQL endpoint (opcional) | Alternative API | 13 | 26h |
| FEA-003 | Webhooks (notificações reserva) | Event-driven | 8 | 16h |
| FEA-004 | Relatórios (reservas por período) | PDF export | 8 | 16h |

**Epic: UAT e Homologação**

| ID | User Story | SP | Horas | Dev |
| --- | --- | --- | --- | --- |
| UAT-001 | Testes de aceitação com stakeholders | Validação | 5 | 10h |
| UAT-002 | Correções de bugs encontrados | Fixes | 8 | 16h |
| UAT-003 | Deploy em ambiente de produção | Go-live | 5 | 10h |

**Sprint 7 - Resumo**

* **Essencial (Documentação + Polimento):** Total: 39 pts / 78h
* **Com Features Adicionais:** Total: 73 pts / 146h
* **Com UAT:** Total: 57 pts / 114h
* **Recomendado (Doc + Polimento + UAT):**
* Total: 57 pts / 114h
* Status: ✅ DENTRO DA CAPACIDADE



---

## 📊 Resumo Geral do Projeto

**Distribuição de Story Points por Sprint**

| Sprint | Story Points | Horas | Principais Entregas |
| --- | --- | --- | --- |
| Sprint 0 | 23 | 46h | Setup, CI/CD básico |
| Sprint 1 | 45 | 90h | Segurança, CORS, Validação |
| Sprint 2 | 65 | 130h | CRUD completo |
| Sprint 3 | 60 | 120h | Paginação, Cache, Performance |
| Sprint 4 | 67 | 134h | Métricas, Logs, Alertas |
| Sprint 5 | 63 | 126h | Testes (80%+ cobertura) |
| Sprint 6 | 70 | 140h | Docker, CI/CD, Deploy |
| Sprint 7 | 57 | 114h | Documentação, UAT, Go-live |
| **TOTAL** | **450 pts** | **900h** | **Sistema completo em produção** |

**Gráfico de Burn-down Planejado**

```text
Story Points Restantes

450 │●
    │ ╲
400 │  ╲
    │   ●
350 │    ╲
    │     ╲
300 │      ●
    │       ╲
250 │        ╲
    │         ●
200 │          ╲
    │           ╲
150 │            ●
    │             ╲
100 │              ╲
    │               ●
 50 │                ╲
    │                 ●
  0 │__________________●________________► Tempo
    S0  S1  S2  S3  S4  S5  S6  S7

    ● Planejado (ideal)

```

**Distribuição de Esforço por Área**

```text
┌─────────────────────────────────────────────────────────┐
│            DISTRIBUIÇÃO DE ESFORÇO (900h)                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Desenvolvimento (Backend)      360h  ████████████████  │
│  Testes (Unit + Integration)    180h  ███████           │
│  DevOps (Infra + Deploy)        180h  ███████           │
│  Documentação                    90h   ███              │
│  Segurança & Compliance          45h   ██               │
│  UAT & Homologação               45h   ██               │
│                                                          │
└─────────────────────────────────────────────────────────┘

```

---

## 🎯 Priorização MoSCoW

**Must Have (Obrigatório para Go-live)**

| Épico | Story Points | Status |
| --- | --- | --- |
| Segurança (CORS, Validação) | 45 | Sprint 1 ✅ |
| CRUD Completo | 65 | Sprint 2 ✅ |
| Paginação | 21 | Sprint 3 ✅ |
| Observabilidade Básica | 40 | Sprint 4 ✅ |
| Testes (> 70% cobertura) | 50 | Sprint 5 ✅ |
| CI/CD + Deploy | 50 | Sprint 6 ✅ |
| **Total Must Have** | **271 pts** | **~54h** |

**Should Have (Importante, mas não bloqueante)**

| Épico | Story Points |
| --- | --- |
| Cache | 15 |
| Otimização Queries | 16 |
| Distributed Tracing | 13 |
| Runbooks Completos | 16 |
| **Total Should Have** | **60 pts** |

**Could Have (Desejável)**

| Épico | Story Points |
| --- | --- |
| Testes Performance (JMeter) | 8 |
| Kubernetes (se necessário) | 21 |
| Refatoração SonarQube | 8 |
| **Total Could Have** | **37 pts** |

**Won't Have (Não nesta release)**

| Feature | Motivo |
| --- | --- |
| GraphQL | Pode ser adicionado v2.0 |
| Webhooks | Não há demanda atual |
| Relatórios PDF | Backend pode fornecer dados, frontend gera |

---

## ⚠️ Riscos e Mitigação

**Riscos Identificados**

| # | Risco | Probabilidade | Impacto | Mitigação | Dono |
| --- | --- | --- | --- | --- | --- |
| R1 | Dependência de time reduzido | Alta | Alto | Buffer de 15% em cada sprint | PO |
| R2 | Complexidade de testes de integração subestimada | Média | Médio | Alocar QA desde Sprint 1 | Tech Lead |
| R3 | Problemas de infraestrutura (AWS, K8s) | Média | Alto | DevOps part-time desde Sprint 0 | DevOps |
| R4 | Mudança de requisitos | Baixa | Alto | Freeze de requisitos pós-Sprint 3 | PO |
| R5 | Bugs críticos em produção | Média | Crítico | Testes automatizados + Runbooks | Todos |
| R6 | Atraso em aprovações (UAT) | Média | Médio | Stakeholders envolvidos desde Sprint 5 | PO |

**Plano de Contingência**

* SE story points > capacity por 2 sprints consecutivos:
* ENTÃO:
1. Remover "Could Have" do backlog
2. Re-priorizar com PO
3. Adicionar 1 sprint extra (buffer)




* SE bug crítico em produção:
* ENTÃO:
1. Pausar sprint atual
2. Ativar "Runbook RB-XXX"
3. Hotfix + deploy emergencial
4. Retomar sprint com ajuste de velocity




* SE membro do time sai:
* ENTÃO:
1. Reduzir velocity em 30-40%
2. Re-priorizar Must Have
3. Estender timeline em 2 sprints





---

## 📅 Milestones e Releases

**Release Plan**

```text
┌─────────────────────────────────────────────────────────┐
│                    RELEASE PLAN                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  v0.1.0 - Alpha (Sprint 2)                              │
│    └─► CRUD básico funcionando                         │
│    └─► Deploy em DEV                                   │
│                                                          │
│  v0.5.0 - Beta (Sprint 4)                               │
│    └─► Performance + Observabilidade                   │
│    └─► Deploy em STAGING                               │
│    └─► Testes com usuários internos                    │
│                                                          │
│  v1.0.0 - GA (Sprint 7)                                 │
│    └─► Todos Must Have + Should Have                   │
│    └─► Testes completos (>80% cobertura)               │
│    └─► Deploy em PRODUCTION                            │
│    └─► Go-live oficial                                 │
│                                                          │
│  v1.1.0 - Post-launch (Sprint 8+)                       │
│    └─► Features adicionais (Could Have)                │
│    └─► Melhorias baseadas em feedback                  │
│                                                          │
└─────────────────────────────────────────────────────────┘

```

**Datas Estimadas (Início: 2025-02-01)**

| Milestone | Data Alvo | Entregas |
| --- | --- | --- |
| Kickoff | 2025-02-01 | Sprint 0 completo |
| Security Hardening | 2025-02-15 | Sprint 1 completo |
| Alpha (v0.1.0) | 2025-03-15 | CRUD + Segurança |
| Beta (v0.5.0) | 2025-04-15 | Performance + Observabilidade |
| Release Candidate | 2025-05-01 | Testes completos |
| GA (v1.0.0) | 2025-05-15 | Produção |

---

## 📋 Cerimônias Scrum

**Sprint Planning**

* **Quando:** Primeiro dia do sprint
* **Duração:** 4 horas
* **Participantes:** Todo o time + PO
* **Saídas:** Sprint backlog, commitments

**Daily Standup**

* **Quando:** Todos os dias, 9h
* **Duração:** 15 minutos
* **Formato:**
* O que fiz ontem?
* O que farei hoje?
* Há impedimentos?



**Sprint Review**

* **Quando:** Último dia do sprint
* **Duração:** 2 horas
* **Participantes:** Time + stakeholders
* **Demo:** Features implementadas

**Sprint Retrospective**

* **Quando:** Após Sprint Review
* **Duração:** 1.5 horas
* **Formato:** Start, Stop, Continue

**Refinement**

* **Quando:** Meio do sprint
* **Duração:** 2 horas
* **Objetivo:** Preparar backlog do próximo sprint

---

## 🎯 Definition of Done (DoD) Global

✅ **Código:**

* [ ] PR criado e revisado (2+ aprovações)
* [ ] Sem conflitos de merge
* [ ] Segue padrões de código (Checkstyle pass)
* [ ] SonarQube sem issues críticos/altos

✅ **Testes:**

* [ ] Testes unitários com cobertura > 80%
* [ ] Testes de integração passando
* [ ] Sem testes ignorados/pulados

✅ **Documentação:**

* [ ] JavaDoc atualizado
* [ ] OpenAPI atualizado
* [ ] README atualizado (se necessário)

✅ **Deploy:**

* [ ] Build de CI passando
* [ ] Deploy automático em DEV ok
* [ ] Health checks passando

✅ **Segurança:**

* [ ] Sem vulnerabilidades críticas (Snyk)
* [ ] Validação de entrada implementada
* [ ] Logs não expõem PII

✅ **Aceitação:**

* [ ] Critérios de aceitação validados
* [ ] PO aprovou

---

## 📊 Métricas de Acompanhamento

**KPIs por Sprint**

| Métrica | Target | Tracking |
| --- | --- | --- |
| Velocity | 95 pts/sprint | Burn-down chart |
| Cobertura de Testes | > 80% | SonarQube |
| Code Smells | < 50 | SonarQube |
| Bugs em Prod | 0 críticos | Jira |
| Deploy Success Rate | > 95% | CI/CD logs |
| MTTR (Mean Time to Recover) | < 1h | Incident tracking |

**Relatórios Semanais**

```text
┌─────────────────────────────────────────────────────────┐
│              WEEKLY SPRINT REPORT                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Sprint: 3/7                                            │
│  Período: 2025-03-01 a 2025-03-15                       │
│                                                          │
│  ✅ Completed: 45 pts (75%)                             │
│  🔄 In Progress: 10 pts (17%)                           │
│  📋 To Do: 5 pts (8%)                                   │
│                                                          │
│  🎯 On Track: YES                                       │
│  ⚠️  Risks: None                                        │
│  🐛 Bugs: 2 (low priority)                              │
│                                                          │
│  Next Week Focus:                                       │
│    • Complete pagination                                │
│    • Start cache implementation                         │
│                                                          │
└─────────────────────────────────────────────────────────┘

```

---

## ✅ Checklist de Go-live

**Sprint 7 - Semana 2 (Go-live Checklist)**

📋 **CÓDIGO:**

* [ ] Todos PRs merged em main
* [ ] Tag v1.0.0 criada
* [ ] Changelog.md atualizado

🧪 **TESTES:**

* [ ] Cobertura > 80% (verificar SonarQube)
* [ ] Todos testes passando (CI verde)
* [ ] Testes de carga executados (> 1000 req/s)
* [ ] UAT aprovado por stakeholders

🚀 **DEPLOY:**

* [ ] Deploy em staging ok
* [ ] Smoke tests em staging passaram
* [ ] Runbooks validados
* [ ] Rollback testado

📊 **OBSERVABILIDADE:**

* [ ] Dashboards Grafana funcionando
* [ ] Alertas configurados e testados
* [ ] Logs estruturados validados
* [ ] Distributed tracing ativo

🔒 **SEGURANÇA:**

* [ ] Security scan sem vulnerabilidades críticas
* [ ] CORS configurado corretamente
* [ ] Secrets em AWS Secrets Manager
* [ ] Rate limiting ativo

📚 **DOCUMENTAÇÃO:**

* [ ] README.md completo
* [ ] Swagger UI acessível
* [ ] Runbooks completos (RB-001 a RB-013)
* [ ] Arquitetura documentada

👥 **TIME:**

* [ ] On-call definido (próximas 48h)
* [ ] Stakeholders comunicados
* [ ] Clientes notificados (se aplicável)

🎯 **GO/NO-GO DECISION:**

* [ ] PO aprova: ____
* [ ] Tech Lead aprova: ____
* [ ] DevOps aprova: ____
* ✅ **GO FOR LAUNCH:** _____

---

## 🎓 Lições Aprendidas (Template)

Ao final de cada sprint, documentar:

1. **O QUE FUNCIONOU BEM:**
* Exemplo: Pair programming acelerou onboarding


2. **O QUE PODE MELHORAR:**
* Exemplo: Estimativas de testes foram subestimadas


3. **AÇÕES PARA PRÓXIMO SPRINT:**
* Exemplo: Adicionar 20% buffer em tasks de testes



---

## 🚀 Conclusão

* **Cronograma Total:** 15 semanas (3.5 meses)
* **Esforço Total:** 450 story points / 900 horas
* **Investimento:** ~R$ 180.000 (considerando custo médio de R$ 200/hora)
* **ROI Esperado:** Sistema completo, seguro, escalável e mantível

**Próximo Passo:** Aprovação do PO e início do Sprint 0! 🎯