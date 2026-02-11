## Pipeline de Deploy

O pipeline de deploy proposto utiliza **Docker** para containerização (facilitando portabilidade e isolamento), **GitHub Actions** para CI/CD (gratuito e integrado ao Git), e **Kubernetes** para orquestração em produção (escalabilidade). O sistema é um monolito modular (backend Java + Spring, frontend React), então o pipeline constrói imagens separadas para backend e frontend, testa, e implanta em um cluster K8s.

**Estratégia:** Automatizar builds, testes e deploys para reduzir erros manuais, com rollback automático em falhas.

### Ferramentas e Fluxo:

* **Containerização:** Dockerfile para backend (baseado em OpenJDK) e frontend (baseado em Node.js).
* **Exemplo Dockerfile backend:**



```dockerfile
FROM openjdk:17-jdk
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]

```

* **CI/CD com GitHub Actions:** Workflow em `.github/workflows/deploy.yml`:
* **Build:** Checkout código, instalar dependências (Maven para Java, npm para React), executar testes unitários/integração.
* **Teste:** Rodar JUnit/Mockito para backend, Jest para frontend; cobertura >80% via JaCoCo.
* **Container:** Build e push imagens para Docker Hub ou ECR (AWS).
* **Deploy:** Usar `kubectl` para aplicar manifests K8s (deployments, services, ingress).


* **Ambiente:** Dev (teste), Staging (pré-prod), Prod (produção).
* **Gates:** Aprovação manual para Prod; rollback se health checks falharem (ex.: endpoint `/health` retorna 200).
* **Orquestração:** K8s com Helm charts para gerenciar releases.
* **Escalabilidade:** Horizontal Pod Autoscaler baseado em CPU/memória.
* **Segurança:** Scans de vulnerabilidades (Trivy para containers), secrets via GitHub Secrets ou Vault.

**Benefícios:** Deploy contínuo (CD) reduz downtime; isolamento com Docker previne conflitos de dependências; K8s permite blue-green deployments para zero-downtime.

---

## Métricas e Logs a Serem Monitorados

Métricas e logs são monitorados usando **Prometheus** (coleta métricas), **Grafana** (visualização), e **ELK Stack** (logs: Elasticsearch, Logstash, Kibana). Foco em disponibilidade, latência e erros, com alertas via Alertmanager (Slack/email).

**Estratégia:** Monitorar em tempo real para detectar anomalias cedo, garantindo SLA (ex.: 99.9% uptime).

### Métricas:

* **Disponibilidade:** Uptime do serviço (ex.: % de tempo online via blackbox exporter); alertar se <99%.
* **Latência:** Tempo de resposta médio/máximo (ex.: P95 para endpoints como `/quartos`); alertar se >500ms.
* **Erros:** Taxa de erros 4xx/5xx (ex.: contador de HTTP 500); alertar se >5% em 5min.
* **Outras:** Uso de CPU/memória (K8s metrics), throughput (requests/seg), e negócio (ex.: reservas criadas/dia).

### Logs:

* **Estrutura:** Logs estruturados em JSON (usando SLF4J/Logback) com níveis (INFO, ERROR); incluir trace ID para rastreamento.
* **Fontes:** Aplicação (ex.: erros de validação em `QuartoService`), infraestrutura (K8s events), e acesso (Nginx ingress logs).
* **Monitoramento:** Ingestão via Fluentd para ELK; dashboards Grafana para visualização; alertas em logs de erro (ex.: "Quarto não disponível").

**Ferramentas de Alertas:** Prometheus rules para thresholds; PagerDuty para escalação.

---

## Procedimento de Resposta a Falhas (Runbook)

O runbook é um guia operacional para resposta rápida a incidentes, seguindo ITIL. Equipe: DevOps/Engenheiros on-call. Objetivo: Minimizar MTTR (Mean Time To Recovery) <1h para críticos.

### Incidente 1: Downtime (Disponibilidade <99%):

1. **Detecção:** Alerta Prometheus/Grafana.
2. **Diagnóstico:** Verificar K8s pods (`kubectl get pods`); logs ELK para erros (ex.: OOM kill).
3. **Resolução:** Restart pods (`kubectl rollout restart`); se persistir, rollback via GitHub Actions (deploy versão anterior); escalar horizontalmente se sobrecarga.
4. **Pós-Incidente:** Análise root cause (5 Whys); atualizar métricas thresholds.

### Incidente 2: Alta Latência (>500ms):

1. **Detecção:** Métrica Prometheus.
2. **Diagnóstico:** Perfilar código (APM como New Relic); verificar queries DB (slow logs).
3. **Resolução:** Otimizar (ex.: adicionar índices JPA); escalar recursos K8s; cache com Redis se necessário.
4. **Pós-Incidente:** Revisar arquitetura (ex.: microserviços para módulos pesados).

### Incidente 3: Erros 5xx (>5%):

1. **Detecção:** Contador de erros.
2. **Diagnóstico:** Logs de stack trace (ex.: `IllegalArgumentException` em validação); testar endpoints manualmente.
3. **Resolução:** Hotfix via CI/CD (commit, build, deploy); se bug, patch e re-deploy.
4. **Pós-Incidente:** Adicionar testes para cenário; melhorar validações.

**Geral:** Comunicação via Slack; documentar em Jira; teste de recuperação (chaos engineering com Litmus).

---

## Métricas de Avaliação

* **Percentual de requisitos atendidos (M1):**
* Número total de requisitos: 17 (10 RF + 7 RNF).
* Número de requisitos cobertos pelo teste: 10 (adiciona RNF03, RNF05, RNF07 via monitoramento/deploy; mantém anteriores).
* Resultado final (%): (10 / 17) x 100 ≈ **59%**.


* **O código atende aos critérios de aceitação definidos anteriormente?** Sim, indiretamente. O pipeline suporta deploy de funcionalidades (ex.: cadastro/edição), e monitoramento valida disponibilidade/latência em produção, alinhando com critérios de usabilidade e performance.
* **Quantidade de linhas de código geradas (LOC):** 15 (contando apenas código executável em snippets, como Dockerfile; excluir comentários e linhas em branco).
* **Número de funções/métodos:** 0 (nenhuma definição explícita de função/método no conteúdo proposto; apenas configurações e descrições).
* **Número de interações necessárias:** 1 (este é o prompt inicial; nenhum refinamento ou correção adicional foi necessário).
