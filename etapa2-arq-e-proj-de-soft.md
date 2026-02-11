## Proposta de Arquitetura para o Sistema de Reserva de Hotel

Com base no domínio de aplicação descrito (um sistema web simples para gestão de quartos, hóspedes e reservas em um único hotel), proponho uma **arquitetura monolítica modular** organizada em camadas. Essa abordagem divide o sistema em módulos funcionais (ex.: gestão de quartos, gestão de hóspedes e gestão de reservas) dentro de uma única aplicação, utilizando o padrão de camadas para separar responsabilidades (ex.: apresentação, lógica de negócio e dados).

### Justificativa da Escolha

* **Desempenho:** Um monolito evita a latência de rede inerente aos microserviços, o que é crucial para operações rápidas como listagens e edições em um sistema de pequeno porte. Para um hotel único, as operações CRUD (Create, Read, Update, Delete) são leves e não justificam a complexidade de comunicação entre serviços.
* **Escalabilidade:** O sistema não requer escalabilidade horizontal massiva (ex.: milhares de usuários simultâneos), pois atende a um único hotel. Escalabilidade vertical (aumentar recursos do servidor) é suficiente e mais simples. Se o hotel crescer ou o sistema se expandir para múltiplos hotéis, a arquitetura pode evoluir para microserviços sem refatoração total, mantendo os módulos como base.
* **Manutenção:** Um monolito modular facilita o desenvolvimento, teste e deploy em uma base de código única, reduzindo overhead de infraestrutura (ex.: orquestração de containers). É ideal para equipes pequenas e sistemas com baixa complexidade, permitindo iterações rápidas. Microserviços seriam overkill aqui, introduzindo complexidade desnecessária em comunicação, consistência de dados e monitoramento.

Essa arquitetura segue princípios como SOLID e Clean Architecture, com separação de camadas para promover coesão e baixo acoplamento.

---

### Decisões Arquiteturais Críticas

#### Tecnologias Principais:

* **Frontend:** React.js com Material-UI (para componentes modernos, paleta verde/azul e responsividade).
* **Backend:** Node.js com Express.js (para APIs RESTful leves e rápidas).
* **Banco de Dados:** PostgreSQL (relacional, para consistência em relacionamentos como Reserva-Quarto-Hóspede; suporta transações ACID).
* **Autenticação:** JWT (JSON Web Tokens) para sessões simples, com roles básicas (ex.: Recepcionista).
* **Hospedagem e Deploy:** AWS EC2 ou Heroku para simplicidade; CI/CD com GitHub Actions para automação de testes e deploy.

#### Estrutura de Camadas:

1. **Camada de Apresentação (Frontend):** Interface web com componentes React para formulários, listas e navegação.
2. **Camada de Aplicação (Backend):** Controladores REST para endpoints (ex.: /quartos, /hospedes, /reservas), validando entradas e orquestrando lógica.
3. **Camada de Domínio (Lógica de Negócio):** Serviços e regras de negócio (ex.: validação de disponibilidade de quartos).
4. **Camada de Infraestrutura (Dados):** Repositórios para acesso ao banco, com ORM como Sequelize para abraçagem.

#### Segurança e Validação:

Validação de entrada no backend (ex.: CPF único via regex e consulta ao banco); proteção contra SQL injection via ORM; logs de auditoria para reservas.

#### Integração e Comunicação:

APIs REST síncronas entre frontend e backend; nenhum serviço externo crítico (ex.: pagamentos), mas preparado para integrações futuras (ex.: email para confirmações).

#### Testabilidade:

Testes unitários (Jest para backend, React Testing Library para frontend) e integração para APIs.

---

### Diagrama de Componentes (Texto/UML)

Descrevo o diagrama em formato textual (ASCII) para simplicidade, representando componentes principais e suas interações.

```text
+-------------------+       +-------------------+       +-------------------+
|   Frontend        |       |   Backend         |       |   Database        |
|   (React.js)      |<----->|   (Node.js)       |<----->|   (PostgreSQL)    |
+-------------------+       +-------------------+       +-------------------+
| - UI Components   |       | - Controllers     |       | - Tables:         |
|   (Forms, Lists)  |       |   (REST APIs)     |       |   - Quartos       |
| - State Mgmt      |       | - Services        |       |   - Hospedes      |
|   (Redux)         |       |   (Business Logic)|       |   - Reservas      |
+-------------------+       +-------------------+       +-------------------+
          |                           |                           |
          | (HTTP Requests)           | (ORM Queries)             |
          v                           v                           v
+-------------------+       +-------------------+       +-------------------+
|   User (Browser)  |       |   Auth Middleware |       |   External APIs   |
|                   |       |   (JWT)           |       |   (Future: Email) |
+-------------------+       +-------------------+       +-------------------+

```

**Interações:** O Frontend envia requisições HTTP para o Backend, que processa via Controllers e Services, acessando o Database via Repositórios. Middleware de autenticação protege endpoints.

---

### Diagrama de Classes Principal

Foco nas classes centrais: Quarto, Hóspede e Reserva. Incluo atributos, métodos básicos e relacionamentos.

```text
+-------------------+       +-------------------+       +-------------------+
|      Quarto       |       |     Hospede       |       |     Reserva       |
+-------------------+       +-------------------+       +-------------------+
| - numero: int     |       | - nome: string    |       | - id: int         |
| - capacidade: int |       | - sobrenome: str  |       | - dataInicio: date|
| - tipo: enum      |       | - cpf: string     |       | - dataFim: date   |
| - precoDiaria: flt|       | - email: string   |       | - status: enum    |
| - frigobar: bool  |       +-------------------+       +-------------------+
| - cafeIncluso: bool|      | +cadastrar()      |       | +criar()          |
| - arCondicionado: b|      | +listar()         |       | +editar()         |
| - tv: bool        |       +-------------------+       | +cancelar()       |
| - camas: list<Tipo>|      | 1..* |       |                   |
| - disponibilidade: e|      +-------------------+       |                   |
+-------------------+       |                   |       +-------------------+
| +cadastrar()      |       |                   |       | 1                 |
| +editar()         |       |                   |       |                   |
| +listar()         |       +-------------------+       +-------------------+
+-------------------+       |                   |       |                   |
| 1..* |       |                   |       |                   |
+-------------------+       +-------------------+       +-------------------+
          |                           |                           |
          v                           v                           v
+-------------------+       +-------------------+       +-------------------+
| Relacionamentos:  |       | Reserva tem 1     |       | Quarto tem 0..1   |
| Quarto 1..1 ----> |       | Hospede           |       | Reserva           |
| Reserva           |       |                   |       |                   |
+-------------------+       +-------------------+       +-------------------+

```

* **Relacionamentos:** Um Quarto pode ter 0 ou 1 Reserva ativa (para evitar conflitos). Uma Reserva pertence a 1 Hospede e 1 Quarto. Métodos representam operações CRUD básicas.

---

### Padrões de Projeto Aplicáveis e Justificativas

1. **MVC (Model-View-Controller):** Separa a interface (View: React components), lógica (Controller: Express routes) e dados (Model: classes como Quarto). **Justificativa:** Promove manutenibilidade ao isolar mudanças na UI sem afetar a lógica de negócio.
2. **Repository:** Abstrai o acesso a dados (ex.: QuartoRepository para queries no PostgreSQL). **Justificativa:** Facilita testes (mock do repositório) e troca de banco sem alterar a lógica de negócio, melhorando escalabilidade.
3. **Factory:** Para criação de objetos complexos (ex.: Factory para instanciar Reserva com validações). **Justificativa:** Centraliza lógica de criação, reduzindo duplicação e facilitando manutenção.
4. **Observer:** Para notificações (ex.: notificar mudanças em disponibilidade de quartos). **Justificativa:** Permite extensibilidade (ex.: enviar emails futuros) sem acoplar componentes, melhorando desempenho em eventos assíncronos.
5. **Singleton:** Para instâncias únicas (ex.: conexão com banco). **Justificativa:** Garante eficiência de recursos em um monolito, evitando múltiplas conexões desnecessárias.

Esses padrões são escolhidos por serem leves e adequados a um monolito, promovendo código limpo e reutilizável sem overhead excessivo. Se o sistema crescer, padrões como CQRS podem ser considerados para separação de comandos e queries.
