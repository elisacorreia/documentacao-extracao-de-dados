# 🚀 Guia de Instalação e Execução

## Pré-requisitos

- Node.js 18+ instalado ([Download aqui](https://nodejs.org/))
- npm (vem com Node.js)

## 📋 Passo a Passo

### 1️⃣ Backend (Servidor)

```bash
# Entre na pasta do servidor
cd server

# Instale as dependências
npm install

# Gere o cliente Prisma
npm run prisma:generate

# Execute as migrations do banco de dados
npm run prisma:migrate

# (Opcional) Popule o banco com dados de exemplo
npm run seed

# Inicie o servidor
npm run dev
```

✅ **Servidor rodando em:** `http://localhost:3001`

Você verá no terminal:
```
🚀 Servidor rodando na porta 3001
📍 API: http://localhost:3001/api
💚 Health: http://localhost:3001/health
```

### 2️⃣ Frontend (Interface)

**Em outro terminal**, na raiz do projeto:

```bash
# Instale as dependências (se ainda não instalou)
npm install

# Inicie a aplicação React
npm run dev
```

✅ **Interface rodando em:** `http://localhost:5173`

Você verá no terminal:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## 🎉 Pronto!

Abra seu navegador em `http://localhost:5173` e comece a usar o sistema!

## 🔧 Comandos Úteis

### Backend

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Ver banco de dados visualmente
npm run prisma:studio

# Resetar banco e popular com dados
npm run prisma:migrate
npm run seed
```

### Frontend

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

## 🐛 Problemas Comuns

### Porta 3001 já está em uso

```bash
# Mate o processo usando a porta
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3001 | xargs kill -9
```

### Erro ao conectar com o servidor

1. Verifique se o backend está rodando
2. Confirme que a porta é 3001
3. Verifique o console do navegador para erros

### Banco de dados corrompido

```bash
cd server
rm -rf prisma/dev.db prisma/migrations
npm run prisma:migrate
npm run seed
```

## 📊 Testando a Aplicação

1. **Cadastre quartos** na aba "Gestão de Quartos"
   - Use o formulário ou execute o seed para criar quartos automaticamente
2. **Cadastre hóspedes** na aba "Gestão de Hóspedes"
3. Vá para **"Gestão de Reservas"**
4. Crie uma **nova reserva** selecionando hóspede e quarto
5. Veja a **lista de reservas ativas**
6. **Edite** ou **cancele** uma reserva

## 🎯 Validações que Serão Testadas

- ✅ Tente cadastrar um hóspede com **CPF inválido** → Verá erro
- ✅ Tente cadastrar **CPF duplicado** → "CPF já cadastrado no sistema"
- ✅ Tente cadastrar quarto com **número duplicado** → "Número de quarto já cadastrado"
- ✅ Tente reservar um **quarto ocupado** → "Quarto não está disponível"
- ✅ Tente criar reserva com **check-out antes do check-in** → Erro de validação

## 📱 Interface

A interface possui:
- **3 abas principais**: Hóspedes, Quartos e Reservas
- **Formulários** à esquerda, **listagens** à direita
- **Feedback visual** para todas as ações
- **Validação em tempo real**
- **Cards visuais** para quartos com ícones por tipo
- **Estatísticas** de disponibilidade

## 🎨 Personalização

Quer adicionar mais quartos? Edite `server/prisma/seed.ts` e execute:

```bash
cd server
npm run seed
```

---

**Desenvolvido com ❤️ usando TypeScript, Node.js e React**