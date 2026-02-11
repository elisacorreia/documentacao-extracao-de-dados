## Cronograma Baseado em Sprints

O cronograma segue uma abordagem ágil com **Scrum**, dividindo o projeto em sprints de 2 semanas (10 dias úteis). O sistema é um monolito modular para um hotel único, com foco em gestão de quartos, hóspedes e reservas.

* **Estimativa Total:** 60 story points (Fibonacci: 1=simples, 2=baixo, 3=médio, 5=alto, 8=muito alto).
* **Equipe:** 2-3 desenvolvedores (1 backend, 1 frontend, 1 QA).
* **Ferramentas:** Jira (backlog) e GitHub (versionamento).

### Detalhamento das Sprints

* **Sprint 0 (1 semana, Pré-projeto):** Planejamento inicial, setup de ferramentas (Git, Docker, CI/CD), definição de arquitetura.
* **Story points:** 5 (análise e setup).


* **Sprint 1 (2 semanas, Core Backend):** Implementar classes de domínio (Quarto, Hóspede, Reserva), repositórios e services básicos. Incluir validações e testes unitários.
* **Story points:** 13 (RF01-RF05, RNF04).
* **Esforço:** 20 horas/desenvolvedor.


* **Sprint 2 (2 semanas, Módulo de Quartos):** Desenvolver cadastro, edição e listagem de quartos (com múltiplas camas, filtros). Refatorar para clean code.
* **Story points:** 13 (RF02, RF03, RNF01).
* **Esforço:** 25 horas/desenvolvedor.


* **Sprint 3 (2 semanas, Módulo de Reservas e Integração):** Implementar reservas (associando hóspede/quarto), testes de integração, pipeline de deploy básico.
* **Story points:** 13 (RF06-RF09, RNF03).
* **Esforço:** 25 horas/desenvolvedor.


* **Sprint 4 (2 semanas, Monitoramento e Finalização):** Adicionar métricas/logs, runbook, testes finais. Deploy em staging/prod.
* **Story points:** 8 (RNF05, RNF07, deploy).
* **Esforço:** 15 horas/desenvolvedor.


* **Sprint 5 (2 semanas, Buffer e Otimização):** Correções, otimização (ex.: queries), release final.
* **Story points:** 8 (refinamentos, RNF06).
* **Esforço:** 10 horas/desenvolvedor.



> **Resumo:** Total de 60 story points em ~12 semanas (3 meses). Velocity média: 10-15 points/sprint.

---

## Riscos Técnicos e Gerenciais com Planos de Mitigação

| Categoria | Risco | Mitigação | Plano B |
| --- | --- | --- | --- |
| **Técnico** | **Bugs ou Performance:** Queries ineficientes ou erros de validação. | Testes unitários/integração (>80%); code reviews; profiling JMeter. | Rollback via CI/CD. |
| **Técnico** | **Dependências Externas:** Falha em Docker/K8s ou deploy. | Ambiente staging idêntico à prod; testes de carga; AWS EKS. | Deploy manual temporário. |
| **Gerencial** | **Escopo Creep:** Adição de features não planejadas. | Backlog priorizado (MoSCoW); reuniões diárias; congelar escopo pós-S2. | Adiar para release futura. |
| **Gerencial** | **Falta de Recursos:** Doença ou saída de membros da equipe. | Equipe cross-trained; buffer de 20% no cronograma. | Extender sprints ou freelancer. |
| **Gerencial** | **Mudanças de Requisitos:** Alterações no domínio pelo cliente. | Protótipos iniciais; agile para adaptações. | Revisar backlog e renegociar. |

---

## KPIs e Critérios de Qualidade para o Projeto

### KPIs (Indicadores de Desempenho)

* **Velocity:** Story points completados/sprint (meta: 10-15).
* **Cobertura de Testes:** % de código testado (meta: >80% via JaCoCo/Jest).
* **Taxa de Bugs:** Bugs/1000 LOC (meta: <5 via Jira).
* **Disponibilidade:** Uptime em staging/prod (meta: >99% via Prometheus).
* **Lead Time:** Tempo de feature do backlog à produção (meta: <2 semanas).

### Critérios de Qualidade

* **Funcional:** Todos RFs implementados e testados (critérios de aceitação cumpridos).
* **Performance:** Latência <500ms, suporte a 100 usuários simultâneos.
* **Segurança:** Zero vulnerabilidades críticas (Trivy); proteção contra SQL injection.
* **Usabilidade:** UI responsiva, acessível (WCAG); feedback visual em erros.
* **Manutenibilidade:** Código SOLID, <10% duplicação (SonarQube); documentação completa.
* **Release:** Deploy automatizado, rollback <5min; zero incidentes em UAT.

---

## Métricas de Avaliação

* **Percentual de requisitos atendidos (M1):** (11 / 17) x 100 ≈ **65%**.
* **O código atende aos critérios de aceitação?** Sim, indiretamente. O cronograma garante a implementação incremental alinhada aos critérios de cadastro/edição.
* **Quantidade de linhas de código geradas (LOC):** 10 (contando apenas snippets de tarefas).
* **Número de funções/métodos:** 0 (apenas planejamento).
* **Número de interações necessárias:** 1.