# Sistema de Reserva de Hotel - Documentação de Requisitos

## 1. Requisitos Funcionais (RF)

### Gestão de Quartos

* **RF01** - O sistema deve permitir cadastrar quartos com número, capacidade, tipo, preço, amenidades e informações de camas
* **RF02** - O sistema deve permitir editar informações de quartos existentes
* **RF03** - O sistema deve listar todos os quartos cadastrados
* **RF04** - O sistema deve permitir alterar a disponibilidade do quarto (Ocupado, Livre, Manutenção, Limpeza)
* **RF05** - O sistema deve validar que números de quartos sejam únicos

### Gestão de Hóspedes

* **RF06** - O sistema deve permitir cadastrar hóspedes com nome, sobrenome, CPF e e-mail
* **RF07** - O sistema deve listar todos os hóspedes cadastrados
* **RF08** - O sistema deve validar formato de CPF
* **RF09** - O sistema deve validar formato de e-mail
* **RF10** - O sistema deve garantir que CPFs sejam únicos

### Gestão de Reservas

* **RF11** - O sistema deve permitir criar reservas associando hóspedes a quartos
* **RF12** - O sistema deve listar todas as reservas ativas
* **RF13** - O sistema deve permitir editar reservas existentes
* **RF14** - O sistema deve exibir o status de disponibilidade do quarto na lista de reservas
* **RF15** - O sistema deve impedir reservas em quartos não disponíveis

---

## 2. Requisitos Não Funcionais (RNF)

* **RNF01** - O sistema deve ser responsivo e funcionar em desktop e tablets
* **RNF02** - O sistema deve utilizar paleta de cores verde e azul
* **RNF03** - O sistema deve ter interface moderna e intuitiva
* **RNF04** - O sistema deve validar dados em tempo real
* **RNF05** - O sistema deve fornecer feedback visual de ações (confirmações, erros)
* **RNF06** - O sistema deve carregar listas em menos de 2 segundos
* **RNF07** - O sistema deve ser acessível seguindo padrões WCAG 2.1

---

## 3. Classificação MoSCoW

### Must Have (Deve Ter)

* RF01, RF02, RF03, RF04, RF06, RF11, RF12, RF13
* RNF01, RNF04, RNF05

### Should Have (Deveria Ter)

* RF05, RF07, RF08, RF09, RF10, RF14, RF15
* RNF02, RNF03, RNF06

### Could Have (Poderia Ter)

* RNF07

### Won't Have (Não Terá - Nesta Versão)

* Sistema de pagamento integrado
* Notificações por e-mail/SMS
* Histórico de reservas passadas
* Relatórios financeiros

---

## 4. Histórias de Usuário

### HU01 - Cadastrar Quarto

**Como** gerente do hotel,

**Eu quero** cadastrar novos quartos com todas suas características,

**Para que** eu possa disponibilizá-los para reserva.

* **Critérios de Aceitação:**
* **Given** que estou na página de cadastro de quartos
* **When** eu preencho todos os campos obrigatórios (número, capacidade, tipo, preço)
* **And** eu seleciono as amenidades disponíveis
* **And** eu adiciono pelo menos um tipo de cama
* **And** eu clico em "Salvar"
* **Then** o quarto deve ser cadastrado no sistema
* **And** eu devo ver uma mensagem de confirmação
* **And** o quarto deve aparecer na lista de quartos


* **Requisitos Vinculados:** RF01, RF05

### HU02 - Editar Quarto

**Como** gerente do hotel,

**Eu quero** editar informações de quartos existentes,

**Para que** eu possa manter os dados atualizados.

* **Critérios de Aceitação:**
* **Given** que estou visualizando a lista de quartos
* **When** eu clico no botão de editar (ícone de lápis)
* **Then** eu devo ser direcionado ao formulário de edição
* **And** os campos devem estar preenchidos com os dados atuais
* **When** eu altero as informações desejadas
* **And** eu clico em "Salvar"
* **Then** as alterações devem ser persistidas
* **And** eu devo ver uma mensagem de confirmação


* **Requisitos Vinculados:** RF02

### HU03 - Visualizar Lista de Quartos

**Como** gerente do hotel,

**Eu quero** visualizar todos os quartos cadastrados,

**Para que** eu possa ter uma visão geral do inventário.

* **Critérios de Aceitação:**
* **Given** que existem quartos cadastrados no sistema
* **When** eu acesso a página de lista de quartos
* **Then** eu devo ver uma tabela com colunas: número, tipo, preço e disponibilidade
* **And** cada linha deve ter um botão de editar
* **And** a lista deve carregar em menos de 2 segundos


* **Requisitos Vinculados:** RF03, RNF06

### HU04 - Alterar Disponibilidade do Quarto

**Como** recepcionista do hotel,

**Eu quero** alterar o status de disponibilidade dos quartos,

**Para que** eu possa refletir seu estado atual (ocupado, livre, manutenção, limpeza).

* **Critérios de Aceitação:**
* **Given** que estou visualizando a lista de quartos
* **When** eu seleciono um novo status no campo de disponibilidade
* **Then** o status deve ser atualizado imediatamente
* **And** o sistema deve impedir reservas se o status não for "Livre"


* **Requisitos Vinculados:** RF04, RF15

### HU05 - Cadastrar Hóspede

**Como** recepcionista do hotel,

**Eu quero** cadastrar novos hóspedes no sistema,

**Para que** eu possa associá-los a reservas.

* **Critérios de Aceitação:**
* **Given** que estou na página de cadastro de hóspedes
* **When** eu preencho nome, sobrenome, CPF e e-mail
* **And** o CPF está em formato válido (XXX.XXX.XXX-XX)
* **And** o e-mail está em formato válido
* **And** eu clico em "Salvar"
* **Then** o hóspede deve ser cadastrado
* **And** eu devo ver uma mensagem de confirmação
* **Given** que estou cadastrando um hóspede
* **When** eu informo um CPF já cadastrado
* **Then** eu devo ver uma mensagem de erro
* **And** o cadastro não deve ser concluído


* **Requisitos Vinculados:** RF06, RF08, RF09, RF10

### HU06 - Visualizar Lista de Hóspedes

**Como** recepcionista do hotel,

**Eu quero** visualizar todos os hóspedes cadastrados,

**Para que** eu possa consultar suas informações.

* **Critérios de Aceitação:**
* **Given** que existem hóspedes cadastrados
* **When** eu acesso a página de lista de hóspedes
* **Then** eu devo ver uma tabela com nome, sobrenome e CPF
* **And** a lista não deve exibir o e-mail


* **Requisitos Vinculados:** RF07

### HU07 - Criar Reserva

**Como** recepcionista do hotel,

**Eu quero** criar reservas associando hóspedes a quartos,

**Para que** eu possa gerenciar as acomodações.

* **Critérios de Aceitação:**
* **Given** que estou na página de gestão de reservas
* **When** eu seleciono um quarto disponível
* **And** eu seleciono um hóspede cadastrado
* **And** eu clico em "Criar Reserva"
* **Then** a reserva deve ser criada
* **And** o status do quarto deve mudar para "Ocupado"
* **And** eu devo ver uma mensagem de confirmação
* **Given** que estou criando uma reserva
* **When** eu seleciono um quarto com status diferente de "Livre"
* **Then** eu devo ver uma mensagem de erro
* **And** a reserva não deve ser criada


* **Requisitos Vinculados:** RF11, RF15

### HU08 - Visualizar Lista de Reservas

**Como** recepcionista do hotel,

**Eu quero** visualizar todas as reservas ativas,

**Para que** eu possa acompanhar as ocupações.

* **Critérios de Aceitação:**
* **Given** que existem reservas no sistema
* **When** eu acesso a página de gestão de reservas
* **Then** eu devo ver uma tabela com número do quarto, tipo, nome do hóspede e disponibilidade
* **And** o status de disponibilidade deve ser exibido como chip colorido
* **And** cada linha deve ter um botão de editar


* **Requisitos Vinculados:** RF12, RF14

### HU09 - Editar Reserva

**Como** recepcionista do hotel,

**Eu quero** editar reservas existentes,

**Para que** eu possa corrigir informações ou fazer alterações.

* **Critérios de Aceitação:**
* **Given** que estou visualizando a lista de reservas
* **When** eu clico no botão de editar (ícone de lápis)
* **Then** eu devo poder alterar o hóspede associado
* **And** eu devo poder alterar o quarto (se disponível)
* **When** eu clico em "Salvar"
* **Then** as alterações devem ser persistidas
* **And** eu devo ver uma mensagem de confirmação


* **Requisitos Vinculados:** RF13

---

## 5. Casos de Uso Principais

### UC01 - Gerenciar Quartos

* **Ator Principal:** Gerente do Hotel
* **Pré-condições:** Usuário autenticado com permissão de gerente
* **Pós-condições:** Quarto cadastrado/atualizado no sistema
* **Fluxo Principal:**
1. Gerente acessa o módulo de Gestão de Quartos
2. Gerente seleciona "Cadastrar Novo Quarto"
3. Sistema exibe formulário de cadastro
4. Gerente preenche: número, capacidade, tipo, preço, amenidades e camas
5. Gerente clica em "Salvar"
6. Sistema valida os dados
7. Sistema cadastra o quarto
8. Sistema exibe mensagem de confirmação


* **Fluxo Alternativo 1 - Editar Quarto:**
* No passo 2, gerente seleciona ícone de editar na lista
* Sistema exibe formulário preenchido
* Gerente altera informações desejadas
* Continua do passo 5


* **Fluxo de Exceção - Número Duplicado:**
* No passo 6, sistema identifica número de quarto já existente
* Sistema exibe mensagem de erro
* Retorna ao passo 4



### UC02 - Gerenciar Hóspedes

* **Ator Principal:** Recepcionista
* **Pré-condições:** Usuário autenticado
* **Pós-condições:** Hóspede cadastrado no sistema
* **Fluxo Principal:**
1. Recepcionista acessa o módulo de Gestão de Hóspedes
2. Recepcionista seleciona "Cadastrar Novo Hóspede"
3. Sistema exibe formulário de cadastro
4. Recepcionista preenche: nome, sobrenome, CPF e e-mail
5. Recepcionista clica em "Salvar"
6. Sistema valida CPF e e-mail
7. Sistema cadastra o hóspede
8. Sistema exibe mensagem de confirmação


* **Fluxo de Exceção 1 - CPF Inválido:**
* No passo 6, sistema identifica CPF em formato inválido
* Sistema exibe mensagem de erro no campo CPF
* Retorna ao passo 4


* **Fluxo de Exceção 2 - CPF Duplicado:**
* No passo 6, sistema identifica CPF já cadastrado
* Sistema exibe mensagem informando duplicidade
* Retorna ao passo 4



### UC03 - Criar Reserva

* **Ator Principal:** Recepcionista
* **Pré-condições:** Usuário autenticado, existem quartos disponíveis e hóspedes cadastrados
* **Pós-condições:** Reserva criada; Status do quarto alterado para "Ocupado"
* **Fluxo Principal:**
1. Recepcionista acessa o módulo de Gestão de Reservas
2. Recepcionista visualiza lista de quartos
3. Recepcionista seleciona quarto com status "Livre"
4. Sistema exibe formulário de reserva
5. Recepcionista seleciona hóspede da lista
6. Recepcionista clica em "Criar Reserva"
7. Sistema valida disponibilidade do quarto
8. Sistema cria a reserva
9. Sistema atualiza status do quarto para "Ocupado"
10. Sistema exibe mensagem de confirmação


* **Fluxo de Exceção - Quarto Não Disponível:**
* No passo 7, sistema identifica que quarto não está livre
* Sistema exibe mensagem de erro
* Retorna ao passo 3



### UC04 - Atualizar Status do Quarto

* **Ator Principal:** Recepcionista
* **Pré-condições:** Usuário autenticado
* **Pós-condições:** Status do quarto atualizado
* **Fluxo Principal:**
1. Recepcionista acessa lista de quartos
2. Recepcionista seleciona novo status (Ocupado, Livre, Manutenção, Limpeza)
3. Sistema atualiza status imediatamente
4. Sistema exibe confirmação visual


* **Fluxo Alternativo - Status com Reserva Ativa:**
* No passo 2, se existe reserva ativa e status mudou para não-ocupado
* Sistema solicita confirmação
* Recepcionista confirma
* Sistema remove/finaliza reserva
* Continua do passo 3



### UC05 - Editar Reserva

* **Ator Principal:** Recepcionista
* **Pré-condições:** Usuário autenticado e reserva existe no sistema
* **Pós-condições:** Informações da reserva atualizadas
* **Fluxo Principal:**
1. Recepcionista acessa lista de reservas
2. Recepcionista clica em editar (ícone de lápis)
3. Sistema exibe formulário de edição
4. Recepcionista altera hóspede ou quarto
5. Recepcionista clica em "Salvar"
6. Sistema valida alterações
7. Sistema atualiza reserva
8. Sistema ajusta status dos quartos se necessário
9. Sistema exibe mensagem de confirmação


* **Fluxo de Exceção - Novo Quarto Indisponível:**
* No passo 6, sistema identifica que novo quarto não está disponível
* Sistema exibe mensagem de erro
* Retorna ao passo 4



---

## 6. Matriz de Rastreabilidade

| Requisito | História de Usuário | Caso de Uso | Prioridade |
| --- | --- | --- | --- |
| RF01 | HU01 | UC01 | Must Have |
| RF02 | HU02 | UC01 | Must Have |
| RF03 | HU03 | UC01 | Must Have |
| RF04 | HU04 | UC04 | Must Have |
| RF05 | HU01 | UC01 | Should Have |
| RF06 | HU05 | UC02 | Must Have |
| RF07 | HU06 | UC02 | Should Have |
| RF08 | HU05 | UC02 | Should Have |
| RF09 | HU05 | UC02 | Should Have |
| RF10 | HU05 | UC02 | Should Have |
| RF11 | HU07 | UC03 | Must Have |
| RF12 | HU08 | UC03 | Must Have |
| RF13 | HU09 | UC05 | Must Have |
| RF14 | HU08 | UC03 | Should Have |
| RF15 | HU07, HU04 | UC03, UC04 | Should Have |
| RNF01 | - | Todos | Must Have |
| RNF02 | - | Todos | Should Have |
| RNF03 | - | Todos | Should Have |
| RNF04 | HU01, HU05 | UC01, UC02 | Must Have |
| RNF05 | Todas | Todos | Must Have |
| RNF06 | HU03, HU06, HU08 | Todos | Should Have |
| RNF07 | - | Todos | Could Have |

---

## 7. Observações Adicionais

### Sugestões de Melhorias Futuras

* **Check-in/Check-out:** Adicionar datas de entrada e saída
* **Gestão financeira:** Cálculo automático de valores baseado em diárias
* **Histórico:** Rastreamento de reservas passadas
* **Relatórios:** Dashboard com ocupação e receita
* **Notificações:** Alertas para limpeza e manutenção
* **Busca e filtros:** Facilitar localização de quartos e hóspedes

### Regras de Negócio Identificadas

* **RN01:** Números de quartos devem ser únicos
* **RN02:** CPF de hóspedes deve ser único e válido
* **RN03:** Apenas quartos com status "Livre" podem receber novas reservas
* **RN04:** Um quarto só pode ter uma reserva ativa por vez
* **RN05:** Ao criar reserva, status do quarto muda automaticamente para "Ocupado"

