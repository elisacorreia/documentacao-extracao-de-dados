# 📘 Documentação Técnica - Sistema de Gestão Hoteleira

## 🎯 Visão Geral

Sistema Full Stack desenvolvido em **TypeScript** para gerenciamento de hóspedes e reservas de hotel, seguindo princípios **SOLID** e **Clean Architecture**.

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

#### Backend
- **Runtime:** Node.js 18+
- **Linguagem:** TypeScript 5.x
- **Framework Web:** Express 4.x
- **ORM:** Prisma 5.x
- **Validação:** Zod 3.x
- **Banco de Dados:** SQLite (dev) / PostgreSQL (prod)

#### Frontend
- **Framework:** React 18.x
- **Linguagem:** TypeScript 5.x
- **HTTP Client:** Axios
- **Estilização:** Tailwind CSS
- **Build Tool:** Vite

### Arquitetura em Camadas (Backend)

```
┌────────────────────────────────────────────────────────────┐
│                    HTTP REQUEST                            │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│                    CONTROLLERS                             │
│  Responsabilidades:                                        │
│  • Receber requisições HTTP                                │
│  • Validar entrada (formato básico)                        │
│  • Chamar Services apropriados                             │
│  • Formatar respostas HTTP                                 │
│  • Tratamento de exceções                                  │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│                     SERVICES                               │
│  Responsabilidades:                                        │
│  • Lógica de negócio                                       │
│  • Validações com Zod                                      │
│  • Orquestração de múltiplos repositories                  │
│  • Cálculos e transformações                               │
│  • Lançamento de exceções de negócio                       │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│                   REPOSITORIES                             │
│  Responsabilidades:                                        │
│  • Acesso ao banco de dados                                │
│  • CRUD operations                                         │
│  • Queries complexas                                       │
│  • Abstração do Prisma                                     │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│                  PRISMA ORM                                │
│  Responsabilidades:                                        │
│  • Type-safe database access                               │
│  • Migrations                                              │
│  • Query builder                                           │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│                    DATABASE                                │
└────────────────────────────────────────────────────────────┘
```

## 🔑 Decisões Arquiteturais

### 1. Por que Arquitetura em Camadas?

**Vantagens:**
- ✅ **Separação de Responsabilidades** (Single Responsibility Principle)
- ✅ **Testabilidade:** Cada camada pode ser testada isoladamente
- ✅ **Manutenibilidade:** Mudanças em uma camada não afetam outras
- ✅ **Escalabilidade:** Fácil adicionar novas funcionalidades
- ✅ **Reutilização:** Services podem ser usados por múltiplos controllers

**Exemplo Prático:**
```typescript
// ❌ SEM arquitetura em camadas (tudo no controller)
app.post('/hospedes', async (req, res) => {
  const cpf = req.body.cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return res.status(400).json({error: 'CPF inválido'});
  
  const existe = await prisma.hospede.findUnique({where: {cpf}});
  if (existe) return res.status(409).json({error: 'CPF já existe'});
  
  const hospede = await prisma.hospede.create({data: req.body});
  res.json(hospede);
});

// ✅ COM arquitetura em camadas
// Controller (camada de apresentação)
controller.create = async (req, res) => {
  const hospede = await hospedeService.create(req.body);
  res.status(201).json({success: true, data: hospede});
};

// Service (camada de negócio)
service.create = async (data) => {
  const validated = createHospedeSchema.parse(data); // Zod
  if (await repository.existsByCPF(validated.cpf)) {
    throw new AppError('CPF já existe', 409);
  }
  return await repository.create(validated);
};

// Repository (camada de dados)
repository.create = async (data) => {
  return await prisma.hospede.create({data});
};
```

### 2. Por que Prisma como ORM?

**Vantagens:**
- ✅ **Type-safety:** Autocomplete e verificação em tempo de compilação
- ✅ **Migrations:** Versionamento do schema do banco
- ✅ **Prisma Studio:** GUI visual para o banco
- ✅ **Query builder:** Queries complexas de forma simples

**Exemplo:**
```typescript
// Type-safe - TypeScript sabe exatamente o que está disponível
const hospede = await prisma.hospede.findUnique({
  where: { id: '123' },
  include: { reservas: true } // Autocomplete funciona aqui
});

// hospede.nome ✅ (TypeScript sabe que existe)
// hospede.xyz ❌ (TypeScript detecta erro)
```

### 3. Por que Zod para Validação?

**Vantagens:**
- ✅ **Type inference:** Inferência automática de tipos TypeScript
- ✅ **Runtime validation:** Valida dados em execução
- ✅ **Mensagens customizadas:** Controle total sobre erros
- ✅ **Composição:** Reutilização de schemas

**Exemplo:**
```typescript
const createHospedeSchema = z.object({
  nome: z.string().min(2, 'Nome muito curto'),
  cpf: z.string().refine(validarCPF, 'CPF inválido'),
  email: z.string().email('E-mail inválido')
});

// Type inference automático
type CreateHospedeDTO = z.infer<typeof createHospedeSchema>;
// CreateHospedeDTO = { nome: string; cpf: string; email: string }
```

### 4. Por que React com Hooks?

**Vantagens:**
- ✅ **Simplicidade:** Sem classes, apenas funções
- ✅ **Reusabilidade:** Custom hooks compartilham lógica
- ✅ **Performance:** Re-renders otimizados
- ✅ **Composição:** Componentes pequenos e focados

**Exemplo:**
```typescript
// Componente funcional com hooks
const HospedeForm = () => {
  const [formData, setFormData] = useState<CreateHospedeDTO>({...});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    setLoading(true);
    await hospedeService.create(formData);
    setLoading(false);
  };

  return <form onSubmit={handleSubmit}>...</form>;
};
```

## 📋 Fluxo de Dados

### Exemplo: Criar Reserva

```
┌─────────────────────────────────────────────────────────────┐
│  1. FRONTEND                                                │
│     User preenche formulário e clica "Criar Reserva"       │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  2. SERVICE (Frontend)                                      │
│     axios.post('/api/reservas', data)                       │
└─────────────────────────────────────────────────────────────┘
                         ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│  3. CONTROLLER (Backend)                                    │
│     • Recebe POST /api/reservas                             │
│     • Extrai req.body                                       │
│     • Chama reservaService.create(data)                     │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  4. SERVICE (Backend)                                       │
│     • Valida dados com Zod                                  │
│     • Verifica se hóspede existe                            │
│     • Verifica se quarto existe                             │
│     • Verifica se quarto está disponível ✓                  │
│     • Calcula valor total (diárias × preço)                 │
│     • Chama reservaRepository.create()                      │
│     • Chama quartoRepository.updateDisponibilidade()        │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  5. REPOSITORY (Backend)                                    │
│     • prisma.reserva.create({data, include: {...}})         │
│     • prisma.quarto.update({where: {id}, data: {...}})      │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  6. DATABASE                                                │
│     • INSERT INTO reservas (...)                            │
│     • UPDATE quartos SET disponivel = false WHERE id = ...  │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  7. RESPONSE                                                │
│     • Repository retorna Reserva                            │
│     • Service retorna Reserva                               │
│     • Controller retorna HTTP 201                           │
│       {success: true, data: {...}}                          │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  8. FRONTEND                                                │
│     • Axios recebe response                                 │
│     • Mostra mensagem de sucesso                            │
│     • Atualiza lista de reservas                            │
└─────────────────────────────────────────────────────────────┘
```

## 🛡️ Validações Implementadas

### Validações de Entrada (Zod)

```typescript
// CPF: Validação completa do algoritmo
cpf: z.string().refine(validarCPF, 'CPF inválido')

// E-mail: Formato válido
email: z.string().email('E-mail inválido')

// Datas: Formato ISO ou YYYY-MM-DD
dataCheckIn: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
```

### Validações de Negócio (Services)

```typescript
// CPF único
if (await repository.existsByCPF(cpf)) {
  throw new AppError('CPF já cadastrado', 409);
}

// Quarto disponível
if (!quarto.disponivel) {
  throw new AppError('Quarto não disponível', 400);
}

// Datas válidas
if (checkOut <= checkIn) {
  throw new AppError('Check-out deve ser posterior ao check-in', 400);
}
```

## 🔐 Tratamento de Erros

### Hierarquia de Exceções

```typescript
// AppError: Exceções de negócio
class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

// Controller intercepta e formata
catch (error) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message
    });
  } else if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: error.errors
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Erro interno'
    });
  }
}
```

## 📊 Modelo de Dados

### Relacionamentos

```
┌─────────────┐          ┌─────────────┐
│   Hospede   │          │   Quarto    │
├─────────────┤          ├─────────────┤
│ id          │          │ id          │
│ nome        │          │ numero      │
│ sobrenome   │          │ tipo        │
│ cpf (único) │          │ precoDiaria │
│ email       │          │ disponivel  │
└─────────────┘          └─────────────┘
       │                        │
       │                        │
       │   ┌─────────────┐     │
       └──→│   Reserva   │←────┘
           ├─────────────┤
           │ id          │
           │ hospedeId   │ (FK)
           │ quartoId    │ (FK)
           │ dataCheckIn │
           │ dataCheckOut│
           │ valorTotal  │
           │ status      │
           └─────────────┘
```

### Cardinalidades

- Um **Hospede** pode ter **muitas Reservas** (1:N)
- Um **Quarto** pode ter **muitas Reservas** (1:N)
- Uma **Reserva** pertence a **um Hospede** (N:1)
- Uma **Reserva** pertence a **um Quarto** (N:1)

## 🎨 Interface do Usuário

### Componentes React

```
App.tsx
├── HospedeForm.tsx      (Formulário de cadastro)
├── HospedeList.tsx      (Listagem com tabela)
├── ReservaForm.tsx      (Formulário com validações)
└── ReservaList.tsx      (Cards com edição inline)
```

### Estado e Props

```typescript
// Props tipadas
interface HospedeFormProps {
  onSuccess?: () => void;
}

// Estado tipado
const [hospedes, setHospedes] = useState<Hospede[]>([]);
const [loading, setLoading] = useState<boolean>(false);
```

## 🚀 Performance

### Backend
- ✅ **Conexão única** com banco (Prisma Client singleton)
- ✅ **Eager loading** com `include` (evita N+1 queries)
- ✅ **Índices** em campos únicos (CPF, número do quarto)

### Frontend
- ✅ **React.memo** para componentes que não mudam
- ✅ **useCallback** para funções passadas como props
- ✅ **Debounce** em inputs de busca (futuro)

## 📝 Próximas Melhorias

1. **Autenticação JWT**
2. **Paginação** nas listagens
3. **Filtros avançados** (por data, status, etc)
4. **Testes automatizados** (Jest + React Testing Library)
5. **Cache** com Redis
6. **WebSockets** para atualizações em tempo real
7. **Docker** para deployment
8. **CI/CD** com GitHub Actions

---

**Desenvolvido seguindo Clean Architecture e princípios SOLID**
