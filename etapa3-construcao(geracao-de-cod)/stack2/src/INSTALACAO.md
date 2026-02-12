# 📦 Guia de Instalação - Sistema de Gestão Hotelaria

## ⚙️ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **Java Development Kit (JDK) 17 ou superior**
   ```bash
   # Verificar versão do Java
   java -version
   ```
   
   Se não tiver instalado, baixe em: https://adoptium.net/

2. **Apache Maven 3.8 ou superior**
   ```bash
   # Verificar versão do Maven
   mvn -version
   ```
   
   Se não tiver instalado, baixe em: https://maven.apache.org/download.cgi

## 🚀 Passos de Instalação

### 1️⃣ Clonar ou Baixar o Projeto

```bash
# Se estiver usando Git
git clone <url-do-repositorio>
cd gestao-hotelaria
```

### 2️⃣ Compilar o Projeto

```bash
# Limpar e compilar
mvn clean install
```

Este comando irá:
- ✅ Baixar todas as dependências (Spring Boot, H2, Lombok, etc.)
- ✅ Compilar o código Java
- ✅ Executar testes (se houver)
- ✅ Gerar o arquivo JAR executável

### 3️⃣ Executar a Aplicação

```bash
# Opção 1: Via Maven
mvn spring-boot:run

# Opção 2: Via JAR gerado
java -jar target/gestao-hotelaria-1.0.0.jar
```

### 4️⃣ Verificar se a Aplicação está Rodando

Abra o navegador e acesse:

- **API**: http://localhost:8080/api/hospedes
- **Console H2**: http://localhost:8080/h2-console

Se aparecer `[]` (lista vazia) na API, está funcionando! ✅

## 🗄️ Acessar o Console do Banco de Dados H2

1. Acesse: **http://localhost:8080/h2-console**
2. Configure a conexão:
   - **JDBC URL**: `jdbc:h2:mem:hoteldb`
   - **User Name**: `sa`
   - **Password**: (deixe em branco)
3. Clique em **Connect**

Você verá as tabelas:
- `HOSPEDES`
- `QUARTOS`
- `RESERVAS`

## 📊 Dados Iniciais (Seed)

O sistema carrega automaticamente alguns dados de exemplo ao iniciar:

**Quartos criados:**
- Quarto 101 - Standard - R$ 150/dia
- Quarto 102 - Standard Duplo - R$ 200/dia
- Quarto 201 - Suite Executiva - R$ 350/dia
- Quarto 202 - Suite Luxo - R$ 500/dia
- Quarto 301 - Cobertura Premium - R$ 800/dia

**Hóspedes criados:**
- João Silva (CPF: 12345678909)
- Maria Santos (CPF: 98765432100)
- Pedro Oliveira (CPF: 11122233344)

## 🧪 Testar a API

### Usar navegador (para requisições GET)

**Listar quartos disponíveis:**
```
http://localhost:8080/api/quartos/disponiveis
```

**Listar todos os hóspedes:**
```
http://localhost:8080/api/hospedes
```

### Usar cURL (para todas as requisições)

**Criar novo hóspede:**
```bash
curl -X POST http://localhost:8080/api/hospedes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Carlos",
    "sobrenome": "Mendes",
    "cpf": "12345678901",
    "email": "carlos@email.com"
  }'
```

**Criar nova reserva:**
```bash
curl -X POST http://localhost:8080/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "hospedeId": "660e8400-e29b-41d4-a716-446655440001",
    "quartoId": "550e8400-e29b-41d4-a716-446655440001",
    "dataCheckIn": "2024-02-15",
    "dataCheckOut": "2024-02-18"
  }'
```

**Listar reservas ativas:**
```bash
curl http://localhost:8080/api/reservas/ativas
```

### Usar Postman ou Insomnia

Importe as seguintes requisições:

1. **POST** http://localhost:8080/api/hospedes (Body: JSON)
2. **GET** http://localhost:8080/api/hospedes
3. **POST** http://localhost:8080/api/quartos (Body: JSON)
4. **GET** http://localhost:8080/api/quartos/disponiveis
5. **POST** http://localhost:8080/api/reservas (Body: JSON)
6. **GET** http://localhost:8080/api/reservas/ativas

## 🛑 Parar a Aplicação

Pressione `Ctrl + C` no terminal onde a aplicação está rodando.

## ⚠️ Problemas Comuns

### Erro: "Java version not supported"

**Solução:** Instale o JDK 17 ou superior.

### Erro: "mvn: command not found"

**Solução:** Instale o Apache Maven e configure a variável de ambiente PATH.

### Erro: "Port 8080 is already in use"

**Solução:** Outra aplicação está usando a porta 8080. Você pode:
1. Parar a aplicação que está usando a porta 8080
2. Ou alterar a porta no arquivo `src/main/resources/application.properties`:
   ```properties
   server.port=8081
   ```

### Erro ao criar hóspede com CPF duplicado

**Esperado!** Essa é uma regra de negócio. O sistema retorna:
```json
{
  "status": 409,
  "message": "CPF já cadastrado no sistema"
}
```

### Erro ao reservar quarto ocupado

**Esperado!** Essa é uma regra de negócio. O sistema retorna:
```json
{
  "status": 409,
  "message": "Quarto não está disponível para reserva"
}
```

## 📚 Próximos Passos

1. ✅ Teste todas as funcionalidades usando cURL ou Postman
2. ✅ Explore o Console H2 para ver as tabelas e dados
3. ✅ Teste as validações (CPF inválido, e-mail inválido, etc.)
4. ✅ Tente criar reservas para quartos ocupados
5. ✅ Cancele uma reserva e veja o quarto ficar disponível novamente

## 💬 Suporte

Se encontrar problemas, verifique:
1. Logs no console onde a aplicação está rodando
2. Versão do Java e Maven
3. Conexão com o banco H2 no console

---

**Boa sorte! 🚀**
