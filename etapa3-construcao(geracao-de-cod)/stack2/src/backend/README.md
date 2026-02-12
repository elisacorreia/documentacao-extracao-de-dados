# Sistema de Reserva de Hotel - Instruções de Execução

## Pré-requisitos

- **Java 17** ou superior
- **Maven 3.8+** (ou usar Maven Wrapper incluído)
- **IDE**: IntelliJ IDEA, Eclipse ou VS Code com extensão Java

## Como Executar

### Opção 1: Via Maven

```bash
# Navegar até o diretório backend
cd backend

# Compilar o projeto
mvn clean install

# Executar a aplicação
mvn spring-boot:run
```

### Opção 2: Via JAR

```bash
# Compilar e gerar JAR
mvn clean package

# Executar o JAR
java -jar target/reserva-system-1.0.0.jar
```

### Opção 3: Via IDE

1. Abrir o projeto no IntelliJ IDEA ou Eclipse
2. Localizar a classe `HotelReservaApplication.java`
3. Clicar com botão direito → Run

## Acessar a Aplicação

- **API REST**: http://localhost:8080/api/quartos
- **H2 Console**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:hoteldb`
  - Username: `sa`
  - Password: (deixar em branco)

## Testar a API

### Criar Quarto

```bash
curl -X POST http://localhost:8080/api/quartos \
  -H "Content-Type: application/json" \
  -d '{
    "numero": 101,
    "capacidade": 2,
    "tipo": "LUXO",
    "precoPorDiaria": 350.00,
    "temFrigobar": true,
    "temCafeDaManha": true,
    "temArCondicionado": true,
    "temTV": true,
    "camas": ["CASAL_KING"]
  }'
```

### Listar Quartos

```bash
curl http://localhost:8080/api/quartos
```

### Atualizar Disponibilidade

```bash
curl -X PATCH "http://localhost:8080/api/quartos/{id}/disponibilidade?disponibilidade=OCUPADO"
```

## Estrutura do Banco de Dados

O banco H2 é criado automaticamente ao iniciar a aplicação com as seguintes tabelas:

- `quartos` - Dados dos quartos
- `camas` - Camas de cada quarto
- `hospedes` - Cadastro de hóspedes
- `reservas` - Reservas realizadas

## Troubleshooting

### Erro: Port 8080 already in use
```bash
# Mudar a porta no application.properties
server.port=8081
```

### Erro: Java version
```bash
# Verificar versão do Java
java -version

# Deve ser 17 ou superior
```

### Erro de compilação
```bash
# Limpar cache do Maven
mvn clean

# Recompilar
mvn install -U
```
