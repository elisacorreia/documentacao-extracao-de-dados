# 🎨 Frontend - Sistema de Gestão Hotelaria

Interface moderna em React com TypeScript para o sistema de gestão de hóspedes, quartos e reservas.

## 🚀 Funcionalidades

### ✅ Gestão de Hóspedes
- Cadastro de hóspedes com validação de CPF e e-mail
- Formatação automática de CPF (000.000.000-00)
- Validação em tempo real
- Listagem com busca
- Edição de dados (exceto CPF)

### ✅ Gestão de Quartos
- Cadastro completo de quartos
- 8 tipos de quartos diferentes
- Controle de comodidades (Frigobar, Ar-condicionado, TV, etc.)
- Gerenciamento de camas (Solteiro, Casal Queen, Casal King)
- 4 status de disponibilidade:
  - 🟢 **Livre** - Disponível para reserva
  - 🔴 **Ocupado** - Com hóspede
  - 🟡 **Manutenção** - Em manutenção
  - 🔵 **Limpeza** - Em processo de limpeza
- Dashboard com estatísticas

### ✅ Gestão de Reservas
- Criação de reservas
- Seleção de hóspede e quarto
- Validação de datas
- Cálculo automático do valor total
- Edição de reservas ativas
- Cancelamento de reservas
- Status visual (Ativa, Cancelada, Finalizada)

## 🏗️ Arquitetura Frontend

```
/
├── components/
│   ├── hospedes/
│   │   ├── HospedeForm.tsx     # Formulário de cadastro/edição
│   │   └── HospedeList.tsx     # Listagem de hóspedes
│   ├── quartos/
│   │   ├── QuartoForm.tsx      # Formulário de cadastro/edição
│   │   └── QuartoList.tsx      # Listagem de quartos
│   ├── reservas/
│   │   ├── ReservaForm.tsx     # Formulário de reservas
│   │   └── ReservaList.tsx     # Listagem de reservas
│   ├── layout/
│   │   └── Header.tsx          # Cabeçalho
│   └── ui/                     # Componentes UI (shadcn/ui)
│
├── services/
│   ├── api.ts                  # Configuração do Axios
│   ├── HospedeService.ts       # API de hóspedes
│   ├── QuartoService.ts        # API de quartos (existente)
│   └── ReservaService.ts       # API de reservas
│
├── types/
│   └── index.ts                # TypeScript interfaces
│
├── App.tsx                     # Componente principal com Tabs
├── main.tsx                    # Entry point
└── styles/
    └── globals.css             # Estilos globais (Tailwind)
```

## 🔧 Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização
- **Axios** - Requisições HTTP
- **Sonner** - Notificações toast
- **Lucide React** - Ícones
- **shadcn/ui** - Componentes UI

## 📡 Integração com Backend

O frontend se comunica com o backend Java Spring Boot através da API REST:

### Base URL
```
http://localhost:8080/api
```

### Endpoints utilizados

**Hóspedes:**
- `POST /hospedes` - Criar hóspede
- `GET /hospedes` - Listar todos
- `GET /hospedes/{id}` - Buscar por ID
- `GET /hospedes/cpf/{cpf}` - Buscar por CPF

**Quartos:**
- `POST /quartos` - Criar quarto
- `GET /quartos` - Listar todos
- `GET /quartos/disponiveis` - Listar disponíveis
- `PATCH /quartos/{id}/disponibilidade` - Alterar status

**Reservas:**
- `POST /reservas` - Criar reserva
- `GET /reservas` - Listar todas
- `GET /reservas/ativas` - Listar ativas
- `PUT /reservas/{id}` - Atualizar
- `PATCH /reservas/{id}/cancelar` - Cancelar

## 🎯 Validações Frontend

### Hóspedes
```typescript
// CPF
- Formato: 000.000.000-00
- Validação algorítmica
- Único no sistema (validado pelo backend)

// E-mail
- Formato válido (regex)
- Obrigatório

// Nome/Sobrenome
- Mínimo 2 caracteres
- Obrigatório
```

### Quartos
```typescript
// Número
- Obrigatório
- Único no sistema

// Tipo
- Seleção entre 8 opções predefinidas

// Preço
- Valor numérico positivo
- Obrigatório

// Camas
- Pelo menos 1 cama
- Tipos: Solteiro, Casal Queen, Casal King
```

### Reservas
```typescript
// Hóspede
- Obrigatório
- Deve existir no sistema

// Quarto
- Obrigatório
- Deve estar LIVRE

// Datas
- Check-in não pode ser no passado
- Check-out deve ser posterior ao check-in
- Cálculo automático de diárias
```

## 🎨 Interface do Usuário

### Sistema de Abas (Tabs)

A aplicação utiliza um sistema de abas para organizar as funcionalidades:

1. **Aba Hóspedes** (Azul)
   - Botão "Novo Hóspede"
   - Lista de hóspedes cadastrados
   - Formulário de cadastro/edição

2. **Aba Quartos** (Verde)
   - Botão "Novo Quarto"
   - Lista de quartos com cards visuais
   - Dashboard de disponibilidade
   - Formulário de cadastro/edição

3. **Aba Reservas** (Roxo)
   - Botão "Nova Reserva"
   - Lista de reservas com status
   - Formulário de criação/edição
   - Validação de pré-requisitos

### Notificações

O sistema usa **Sonner** para feedback visual:

```typescript
// Sucesso
toast.success('Hóspede cadastrado com sucesso!');

// Erro
toast.error('Erro ao salvar hóspede');
```

### Estados de Loading

Todos os componentes exibem estado de carregamento:

```tsx
{isLoading ? (
  <div className="bg-white rounded-lg shadow-md p-8 text-center">
    <p className="text-gray-500">Carregando...</p>
  </div>
) : (
  // Conteúdo
)}
```

## 🔄 Fluxo de Uso

### 1. Cadastrar Hóspedes
```
1. Aba "Hóspedes"
2. Botão "Novo Hóspede"
3. Preencher formulário (Nome, Sobrenome, CPF, E-mail)
4. Validação em tempo real
5. Clique em "Cadastrar"
6. Toast de sucesso
7. Retorna para lista
```

### 2. Cadastrar Quartos
```
1. Aba "Quartos"
2. Botão "Novo Quarto"
3. Preencher dados básicos (Número, Tipo, Capacidade, Preço)
4. Selecionar comodidades
5. Adicionar camas
6. Clique em "Cadastrar"
7. Toast de sucesso
8. Dashboard atualizado
```

### 3. Criar Reserva
```
1. Aba "Reservas"
2. Verificar pré-requisitos (hóspede + quarto disponível)
3. Botão "Nova Reserva"
4. Selecionar hóspede
5. Selecionar quarto (apenas LIVRES aparecem)
6. Definir datas (check-in / check-out)
7. Visualizar valor estimado
8. Clique em "Criar Reserva"
9. Backend valida disponibilidade
10. Quarto automaticamente vira OCUPADO
11. Toast de sucesso
```

### 4. Cancelar Reserva
```
1. Aba "Reservas"
2. Encontrar reserva ATIVA
3. Botão "Cancelar"
4. Confirmar ação
5. Status muda para CANCELADA
6. Quarto automaticamente vira LIVRE
7. Toast de sucesso
```

## 🛡️ Tratamento de Erros

### Erros de Validação (Frontend)
```typescript
// Exibidos abaixo dos campos
{errors.cpf && <p className="text-sm text-red-500">{errors.cpf}</p>}
```

### Erros de API (Backend)
```typescript
// Interceptor do Axios captura e formata
try {
  await api.post('/hospedes', data);
} catch (error) {
  // Exibe mensagem do backend
  setApiError(error.message);
}
```

### Mensagens Comuns

| Erro | Mensagem |
|------|----------|
| CPF duplicado | "CPF já cadastrado no sistema" |
| Quarto ocupado | "Quarto não está disponível para reserva" |
| Datas inválidas | "Data de check-out deve ser posterior ao check-in" |
| Check-in passado | "Data de check-in não pode ser no passado" |
| Servidor offline | "Servidor não está respondendo. Verifique se o backend está rodando." |

## 📱 Responsividade

O design é totalmente responsivo:

- **Mobile** (< 768px): 1 coluna, menus colapsados
- **Tablet** (768px - 1024px): 2 colunas
- **Desktop** (> 1024px): Grid completo, sidebar visível

## 🎨 Paleta de Cores

```css
/* Status de Quartos */
--livre: #10b981 (green)
--ocupado: #ef4444 (red)
--manutencao: #f59e0b (yellow)
--limpeza: #3b82f6 (blue)

/* Botões de Ação */
--hospedes: #3b82f6 (blue)
--quartos: #10b981 (green)
--reservas: #8b5cf6 (purple)

/* Status de Reservas */
--ativa: #10b981 (green)
--cancelada: #ef4444 (red)
--finalizada: #3b82f6 (blue)
```

## 🚦 Como Executar

### 1. Certifique-se que o backend está rodando
```bash
cd backend
mvn spring-boot:run
# Backend deve estar em http://localhost:8080
```

### 2. O frontend já está pronto
O Figma Make já gerencia a execução automaticamente.

## 🔍 Debug

### Ver requisições no Console
```typescript
// Em services/api.ts
api.interceptors.request.use((config) => {
  console.log('Request:', config.method, config.url, config.data);
  return config;
});
```

### Ver erros detalhados
```typescript
// Abra o Developer Tools (F12)
// Vá em "Console" para ver logs
// Vá em "Network" para ver requisições HTTP
```

## 📊 Componentes Reutilizáveis

### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Conteúdo
  </CardContent>
</Card>
```

### Button
```tsx
<Button variant="default">Primário</Button>
<Button variant="outline">Secundário</Button>
<Button variant="destructive">Excluir</Button>
```

### Badge
```tsx
<Badge className="bg-green-100 text-green-800">Ativa</Badge>
<Badge className="bg-red-100 text-red-800">Cancelada</Badge>
```

## 🎓 Próximos Passos

1. ✅ Sistema completo de Hóspedes, Quartos e Reservas
2. 📝 Adicionar filtros e busca
3. 📊 Dashboard com gráficos
4. 📄 Relatórios e exportação
5. 🔐 Sistema de autenticação
6. 🌐 Internacionalização (i18n)

---

**Desenvolvido com React + TypeScript + Tailwind CSS** 🚀
