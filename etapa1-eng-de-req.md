Abaixo, apresento uma análise completa do sistema de reserva para um único hotel, com base no domínio de aplicação descrito. Como Engenheiro de Software, considerei as funcionalidades especificadas nos módulos (Gestão de Quartos, Gestão de Hóspedes e Gestão de Reserva), inferindo funcionalidades implícitas necessárias para um sistema coeso (por exemplo, a capacidade de fazer e editar reservas, já que a lista de reservas inclui um botão de edição). O sistema é web-based, com paleta de cores verde e azul e componentes modernos (como Material-UI ou similares para React/Vue).

Estruturei a resposta da seguinte forma:

1. **Requisitos Funcionais (RF):** Listados com base nas funcionalidades descritas.
2. **Requisitos Não Funcionais (RNF):** Focados em aspectos técnicos e de qualidade.
3. **Classificação MoSCoW:** Aplicada a cada RF e RNF.
4. **Histórias de Usuário:** Criadas no formato padrão.
5. **Critérios de Aceitação:** No formato Gherkin (Given-When-Then).
6. **Casos de Uso Principais:** Definidos com atores e fluxos.
7. **Vinculação de Requisitos às Histórias de Usuário:** Tabela de mapeamento.

---

## Requisitos Funcionais (RF)

* **RF01:** O sistema deve permitir o cadastro de quartos com os campos: Número do quarto, Capacidade, Tipo (Básico, Moderno, Luxo), Preço por diária, Há Frigobar, Há café da manhã incluso, Há Ar-condicionado, Há TV, e uma sessão "Camas" com Tipo de cama (Solteiro, Casal King, Casal Queen).
* **MoSCoW:** Must have.


* **RF02:** O sistema deve permitir a listagem de quartos com as colunas: Número do quarto, Tipo do quarto, Preço por diária, Disponibilidade (Ocupado, Livre, Manutenção, Limpeza), e um botão para editar o quarto.
* **MoSCoW:** Must have.


* **RF03:** O sistema deve permitir a edição de quartos existentes (via botão de lápis na lista).
* **MoSCoW:** Must have.


* **RF04:** O sistema deve permitir o cadastro de hóspedes com os campos: Nome, Sobrenome, CPF, Email.
* **MoSCoW:** Must have.


* **RF05:** O sistema deve permitir a listagem de hóspedes com as colunas: Nome, Sobrenome, CPF.
* **MoSCoW:** Must have.


* **RF06:** O sistema deve permitir a listagem de reservas (associadas a quartos) com as colunas: Número do quarto, Tipo do quarto, Nome do Hóspede, Disponibilidade (como chip), e um botão para editar a reserva.
* **MoSCoW:** Must have.


* **RF07:** O sistema deve permitir fazer uma reserva, associando um hóspede a um quarto disponível (inferido da lista de reservas).
* **MoSCoW:** Must have.


* **RF08:** O sistema deve permitir editar uma reserva existente (via botão de lápis na lista).
* **MoSCoW:** Must have.


* **RF09:** O sistema deve validar a disponibilidade de quartos antes de permitir reservas (evitando conflitos).
* **MoSCoW:** Should have.


* **RF10:** O sistema deve permitir a exclusão de quartos, hóspedes ou reservas (se não houver dependências ativas).
* **MoSCoW:** Could have.



---

## Requisitos Não Funcionais (RNF)

* **RNF01:** O sistema deve ter uma interface web responsiva, utilizando paleta de cores verde e azul, com componentes modernos (ex.: botões, selects, checkboxes e chips estilizados).
* **MoSCoW:** Must have.


* **RNF02:** O sistema deve ser usável, com navegação intuitiva e feedback visual (ex.: mensagens de sucesso/erro).
* **MoSCoW:** Must have.


* **RNF03:** O sistema deve ter tempo de resposta inferior a 2 segundos para operações CRUD (Create, Read, Update, Delete).
* **MoSCoW:** Should have.


* **RNF04:** O sistema deve ser seguro, com validação de entrada (ex.: CPF único, email válido) e proteção contra injeção SQL.
* **MoSCoW:** Must have.


* **RNF05:** O sistema deve suportar até 100 usuários simultâneos sem degradação significativa.
* **MoSCoW:** Should have.


* **RNF06:** O sistema deve ser compatível com navegadores modernos (Chrome, Firefox, Edge) e dispositivos móveis.
* **MoSCoW:** Could have.


* **RNF07:** O sistema deve ter logs de auditoria para operações críticas (ex.: reservas).
* **MoSCoW:** Could have.



---

## Histórias de Usuário

Como ator principal, considerei o **Recepcionista** (usuário do hotel responsável por gerenciar quartos, hóspedes e reservas).

### 1. Cadastrar Quarto

**Como** Recepcionista, **eu quero** cadastrar um quarto **para que** possa adicionar novos quartos ao inventário do hotel.

* **Critérios de Aceitação:**
* **Given:** O recepcionista está na tela de cadastro de quartos.
* **When:** Ele preenche todos os campos obrigatórios (Número, Capacidade, Tipo, Preço, etc.) e clica em "Salvar".
* **Then:** O quarto é salvo no sistema, uma mensagem de sucesso é exibida, e o quarto aparece na lista de quartos.



### 2. Listar Quartos

**Como** Recepcionista, **eu quero** listar quartos **para que** possa visualizar e gerenciar o inventário disponível.

* **Critérios de Aceitação:**
* **Given:** O recepcionista acessa a tela de listagem de quartos.
* **When:** Ele carrega a página.
* **Then:** A lista é exibida com as colunas especificadas, incluindo disponibilidade e botão de edição.



### 3. Editar Quarto

**Como** Recepcionista, **eu quero** editar um quarto **para que** possa atualizar informações como preço ou comodidades.

* **Critérios de Aceitação:**
* **Given:** O recepcionista está na lista de quartos e clica no botão de edição de um quarto específico.
* **When:** Ele altera os campos e clica em "Salvar".
* **Then:** As alterações são salvas, uma mensagem de sucesso é exibida, e a lista é atualizada.



### 4. Cadastrar Hóspede

**Como** Recepcionista, **eu quero** cadastrar um hóspede **para que** possa registrar novos clientes no sistema.

* **Critérios de Aceitação:**
* **Given:** O recepcionista está na tela de cadastro de hóspedes.
* **When:** Ele preenche os campos (Nome, Sobrenome, CPF, Email) e clica em "Salvar".
* **Then:** O hóspede é salvo, uma mensagem de sucesso é exibida, e o hóspede aparece na lista de hóspedes.



### 5. Listar Hóspedes

**Como** Recepcionista, **eu quero** listar hóspedes **para que** possa consultar clientes registrados.

* **Critérios de Aceitação:**
* **Given:** O recepcionista acessa a tela de listagem de hóspedes.
* **When:** Ele carrega a página.
* **Then:** A lista é exibida com as colunas Nome, Sobrenome e CPF.



### 6. Listar Reservas

**Como** Recepcionista, **eu quero** listar reservas **para que** possa visualizar quartos ocupados e gerenciar reservas ativas.

* **Critérios de Aceitação:**
* **Given:** O recepcionista acessa a tela de listagem de reservas.
* **When:** Ele carrega a página.
* **Then:** A lista é exibida com as colunas Número do quarto, Tipo, Nome do Hóspede, Disponibilidade (como chip) e botão de edição.



### 7. Fazer Reserva

**Como** Recepcionista, **eu quero** fazer uma reserva **para que** possa associar um hóspede a um quarto disponível.

* **Critérios de Aceitação:**
* **Given:** O recepcionista seleciona um quarto livre e um hóspede cadastrado.
* **When:** Ele confirma a reserva (ex.: selecionando datas implícitas, se aplicável).
* **Then:** A reserva é criada, o status do quarto muda para "Ocupado", e uma mensagem de sucesso é exibida.



### 8. Editar Reserva

**Como** Recepcionista, **eu quero** editar uma reserva **para que** possa alterar detalhes como hóspede ou datas.

* **Critérios de Aceitação:**
* **Given:** O recepcionista está na lista de reservas e clica no botão de edição de uma reserva específica.
* **When:** Ele altera os detalhes e clica em "Salvar".
* **Then:** As alterações são salvas, o status do quarto é atualizado se necessário, e uma mensagem de sucesso é exibida.



---

## Casos de Uso Principais

### Caso de Uso: Cadastrar Quarto

* **Atores:** Recepcionista.
* **Pré-condições:** O recepcionista está logado no sistema e tem permissões para gerenciar quartos.
* **Fluxo Principal:** O recepcionista acessa a tela de cadastro, preenche os campos e salva.
* **Pós-condições:** O quarto é adicionado ao banco de dados e aparece na lista.

### Caso de Uso: Listar Quartos

* **Atores:** Recepcionista.
* **Pré-condições:** Pelo menos um quarto cadastrado no sistema.
* **Fluxo Principal:** O recepcionista acessa a tela de listagem.
* **Pós-condições:** A lista é exibida com os dados atuais.

### Caso de Uso: Editar Quarto

* **Atores:** Recepcionista.
* **Pré-condições:** O quarto existe e não está em reserva ativa.
* **Fluxo Principal:** O recepcionista seleciona o quarto na lista, edita e salva.
* **Pós-condições:** As alterações são persistidas.

### Caso de Uso: Cadastrar Hóspede

* **Atores:** Recepcionista.
* **Pré-condições:** O recepcionista está logado.
* **Fluxo Principal:** O recepcionista acessa a tela de cadastro, preenche os campos e salva.
* **Pós-condições:** O hóspede é adicionado ao banco de dados.

### Caso de Uso: Listar Hóspedes

* **Atores:** Recepcionista.
* **Pré-condições:** Pelo menos um hóspede cadastrado.
* **Fluxo Principal:** O recepcionista acessa a tela de listagem.
* **Pós-condições:** A lista é exibida.

### Caso de Uso: Fazer Reserva

* **Atores:** Recepcionista.
* **Pré-condições:** Quarto livre e hóspede cadastrado.
* **Fluxo Principal:** O recepcionista seleciona quarto e hóspede, confirma a reserva.
* **Pós-condições:** A reserva é criada, status do quarto muda para "Ocupado".

### Caso de Uso: Editar Reserva

* **Atores:** Recepcionista.
* **Pré-condições:** Reserva existente.
* **Fluxo Principal:** O recepcionista edita detalhes na lista e salva.
* **Pós-condições:** As alterações são persistidas.

---

## Vinculação de Requisitos às Histórias de Usuário

| Requisito | Histórias de Usuário Vinculadas |
| --- | --- |
| RF01 | 1 (Cadastrar Quarto) |
| RF02 | 2 (Listar Quartos) |
| RF03 | 3 (Editar Quarto) |
| RF04 | 4 (Cadastrar Hóspede) |
| RF05 | 5 (Listar Hóspedes) |
| RF06 | 6 (Listar Reservas) |
| RF07 | 7 (Fazer Reserva) |
| RF08 | 8 (Editar Reserva) |
| RF09 | 7 e 8 (Fazer/Editar Reserva, com validação implícita) |
| RF10 | Nenhuma (não coberta diretamente pelas histórias iniciais) |
| RNF01-RNF07 | Todas as histórias (aplicam-se transversalmente) |

Essa análise fornece uma base sólida para desenvolvimento, priorizando funcionalidades essenciais (Must have) para um MVP. Se precisar de diagramas UML, protótipos ou refinamentos, posso expandir!