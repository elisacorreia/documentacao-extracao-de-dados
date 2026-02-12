# Estratégia de Cobertura de Testes - Sistema de Gestão Hotelaria

## 1. Visão Geral da Estratégia

A estratégia segue a **Pirâmide de Testes** (Test Pyramid), combinando diferentes níveis de teste para garantir qualidade com eficiência:



[Image of testing pyramid]


                    ▲
                   ╱ ╲
                  ╱   ╲         Testes E2E (Manuais)
                 ╱─────╲        • Poucos, caros, lentos
                ╱       ╲       
               ╱─────────╲      Testes de Integração
              ╱           ╲     • Moderados, médio custo
             ╱─────────────╲    • ReservaIntegrationTest
            ╱               ╲   
           ╱─────────────────╲  Testes Unitários
          ╱___________________╲ • Muitos, baratos, rápidos
                                • QuartoServiceTest

---

## 2. Nível 1: Testes Unitários (QuartoServiceTest)

### 🎯 Objetivo
Testar a **lógica de negócio isolada** da camada de serviço, sem dependências externas (banco de dados, controllers, etc.).

### 📦 O que cobre

**Cadastro de Quarto (5 testes)**
* ✅ `deveCadastrarQuartoComSucesso()`
    * Validar fluxo completo positivo
    * Verificar mapeamento DTO → Entity → DTO
    * Confirmar que `save()` foi chamado
* ✅ `deveLancarExcecaoAoCadastrarQuartoComNumeroDuplicado()`
    * Validar regra de negócio: número único
    * Confirmar que `BusinessException` é lançada
    * Garantir que `save()` NÃO foi chamado
* ✅ `deveCadastrarQuartoComStatusDisponivelPorPadrao()`
    * Validar valor default quando campo omitido
    * Testar comportamento de campos opcionais
* ✅ `deveCadastrarQuartoComTodosTiposValidos()`
    * Validar todos os enums: SOLTEIRO, CASAL, SUITE
    * Garantir que todos os tipos funcionam
* ✅ `deveCadastrarQuartoComPrecoDiariaValido()`
    * Validar tipo BigDecimal
    * Testar precisão de valores monetários

**Edição de Quarto (7 testes)**
* ✅ `deveEditarQuartoComSucesso()`
    * Validar fluxo completo de atualização
    * Verificar que `findById()` encontra o quarto
    * Confirmar que `save()` foi chamado com dados atualizados
* ✅ `deveLancarExcecaoAoEditarQuartoInexistente()`
    * Validar `ResourceNotFoundException`
    * Garantir que `save()` NÃO foi chamado
* ✅ `deveLancarExcecaoAoEditarQuartoComNumeroJaExistente()`
    * Validar `existsByNumeroAndIdNot()`
    * Impedir atualização para número duplicado
* ✅ `devePermitirEditarQuartoMantendoMesmoNumero()`
    * Validar que pode editar outros campos sem mudar número
    * Testar lógica de "IdNot" no repository
* ✅ `deveEditarApenasCamposInformados()`
    * Validar atualização parcial
    * Garantir que campos não enviados permanecem inalterados
* ✅ `deveEditarStatusDoQuartoCorretamente()`
    * Testar mudança de status
    * Validar enum `StatusQuarto`
* ✅ (Implícito) Validar cálculo e persistência

### 🔧 Técnicas Utilizadas

| Técnica | Descrição | Exemplo |
| :--- | :--- | :--- |
| **Mocking** | Simular dependências (Repository) | `@Mock QuartoRepository` |
| **Injeção** | Injetar mocks no service | `@InjectMocks QuartoService` |
| **Arrange-Act-Assert** | Estrutura clara de teste | `setUp()` → `service.method()` → `assertions` |
| **Verify** | Confirmar interações | `verify(repository, times(1)).save()` |
| **AssertJ** | Assertions fluentes | `assertThat(result).isNotNull()` |

✅ **Vantagens:** ⚡ Rápidos | 💰 Baratos | 🎯 Focados | 🔄 Repetíveis | 🐛 Debug fácil  
❌ **Limitações:** Não testam banco real | Não validam SQL | Não cobrem controllers | Não testam transações

---

## 3. Nível 2: Testes de Integração (ReservaIntegrationTest)

### 🎯 Objetivo
Testar o **fluxo completo end-to-end** através de todas as camadas da aplicação, com banco de dados real.

### 📦 O que cobre

**Fluxo Completo - Cenários de Sucesso (5 testes)**
* ✅ `fluxoCompletoReservaComSucesso()`
    * **PASSO 1: POST /api/quartos** (Controller → Service → Repository → H2)
    * **PASSO 2: POST /api/hospedes** (Bean Validation @CPF, @Email → Repository)
    * **PASSO 3: POST /api/reservas** (FKs, Regra Disponibilidade, Cálculo Valor, **UPDATE status OCUPADO**)
    * **PASSO 4: GET /api/quartos/{id}** (Verificar status OCUPADO)
    * **PASSO 5: Validações no banco** (count == 1)
* ✅ `fluxoMultiplasReservasQuartosDiferentes()`
    * Testar concorrência e isolamento entre quartos
* ✅ `fluxoCancelarReservaLiberaQuarto()`
    * Validar que status volta para DISPONIVEL (fluxo reverso)
* ✅ `fluxoCalcularValorTotalReserva()`
    * Validar cálculo: (dias × diária) em contexto real
* ✅ `fluxoListarReservasPorHospede()`
    * Validar queries de consulta JPA

**Fluxo Completo - Cenários de Erro (6 testes)**
* ❌ `erroNaoDevePermitirReservaEmQuartoOcupado()` (Double booking/Rollback)
* ❌ `erroNaoDevePermitirReservaComHospedeInexistente()` (FK/404)
* ❌ `erroNaoDevePermitirReservaComQuartoInexistente()` (FK/404)
* ❌ `erroNaoDevePermitirReservaComDataInvalida()` (Saída < Entrada / 400)
* ❌ `erroNaoDevePermitirCPFDuplicado()` (Constraint UNIQUE)
* ❌ `erroNaoDevePermitirReservaEmQuartoManutencao()` (Regra de status)

### 🔧 Técnicas Utilizadas

| Técnica | Descrição | Uso |
| :--- | :--- | :--- |
| **@SpringBootTest** | Carrega contexto completo | Todas as camadas ativas |
| **@AutoConfigureMockMvc** | Injeta MockMvc | Simular requisições HTTP |
| **H2 In-Memory** | Banco real em memória | `jdbc:h2:mem:testdb` |
| **@Transactional** | Rollback automático | Isola cada teste |
| **MockMvc** | Testar controllers | `.perform(post("/api/..."))` |
| **jsonPath** | Validar resposta JSON | `.andExpect(jsonPath("$.id"))` |

---

## 4. Comparação: Unitário vs Integração

| Aspecto | Testes Unitários | Testes de Integração |
| :--- | :--- | :--- |
| **Escopo** | Uma classe (Service) | Todo o sistema (Controller→DB) |
| **Dependências** | Mockadas (@Mock) | Reais (Spring Context) |
| **Banco de Dados** | Não usa | H2 in-memory |
| **Velocidade** | < 100ms por teste | 1-3s por teste |
| **Quantidade** | Muitos (12 testes) | Moderado (11 testes) |

---

## 5. Cobertura Total Combinada



### 📊 Mapa de Cobertura
* **CONTROLLER:** ✅ Integração (HTTP Status, JSON, @Valid)
* **SERVICE:** ✅ Unitário + Integração (Lógica, Cálculos, Regras)
* **REPOSITORY:** ✅ Integração (Queries SQL, Constraints, Transações)
* **DATABASE:** ✅ Integração (Schema, Integridade)

### 📋 Funcionalidades Cobertas
| Funcionalidade | Unitário | Integração | Cobertura Total |
| :--- | :--- | :--- | :--- |
| Cadastro/Edição Quarto | ✅ 12 testes | ✅ Implícito | 100% |
| Cadastro Hóspede | ⚪ Não | ✅ 2 testes | 80% |
| Criação Reserva | ⚪ Não | ✅ 8 testes | 90% |
| Mudança de Status | ✅ 1 teste | ✅ 3 testes | 100% |

---

## 6. Boas Práticas Aplicadas

* ✨ **Nomenclatura Clara:** `deveCadastrarQuartoComSucesso()` em vez de `test1()`.
* 📝 **Pattern AAA:** Arrange (preparar), Act (executar), Assert (validar).
* 🎯 **Um Conceito por Teste:** Cada teste valida uma regra específica.
* 🔒 **Isolamento:** Uso de `@BeforeEach` e `@Transactional` para estado limpo.

---

## 7. Estratégia de Execução (Pipeline CI/CD)

1. **DESENVOLVEDOR:** `mvn test` (Unitários) -> ⚡ < 5s
2. **PULL REQUEST:** `mvn verify` (Unit + Integ) -> ⏱️ ~30s
3. **DEPLOY STAGING:** Testes E2E -> 🐌 ~5 min
4. **PRODUÇÃO ✅**

---

## 8. Gaps e Próximos Passos (Sugestões)
* ✴️ `HospedeServiceTest` e `ReservaServiceTest` (Unitários)
* ✴️ Busca com paginação e filtros (Integração)
* ✴️ Análise de performance (JMeter/Gatling)

### 📈 Métricas de Qualidade (Estimadas)
* **TOTAL ESTIMADO:** 78% ██████████░░░

---

## 9. Resumo Executivo

| Nível | Foco | Quantidade | Velocidade | Custo |
| :--- | :--- | :--- | :--- | :--- |
| **Unitário** | Lógica isolada | 12 testes | ⚡⚡⚡ | 💰 |
| **Integração** | Fluxo end-to-end | 11 testes | ⚡⚡ | 💰💰 |
| **E2E** | Interface (UI) | 🚫 Não impl. | 🐌 | 💰💰💰 |

**Conclusão:** A estratégia combina **velocidade** com **realismo**, garantindo que as regras críticas de reserva funcionem corretamente em produção. 🚀