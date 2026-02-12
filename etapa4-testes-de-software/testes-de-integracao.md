# Testes de Integração - Fluxo Completo de Reserva

Aqui estão os testes de integração para o fluxo completo: **Cadastro de Hóspede → Criação de Reserva → Atualização de Disponibilidade do Quarto**

## ReservaIntegrationTest.java

```java
package com.hotel.gestao.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.gestao.dto.HospedeDTO;
import com.hotel.gestao.dto.QuartoDTO;
import com.hotel.gestao.dto.ReservaDTO;
import com.hotel.gestao.entity.StatusQuarto;
import com.hotel.gestao.entity.StatusReserva;
import com.hotel.gestao.entity.TipoQuarto;
import com.hotel.gestao.repository.HospedeRepository;
import com.hotel.gestao.repository.QuartoRepository;
import com.hotel.gestao.repository.ReservaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Testes de Integração - Fluxo Completo de Reserva")
class ReservaIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private HospedeRepository hospedeRepository;

    @Autowired
    private QuartoRepository quartoRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @BeforeEach
    void setUp() {
        // Limpar banco de dados antes de cada teste
        reservaRepository.deleteAll();
        hospedeRepository.deleteAll();
        quartoRepository.deleteAll();
    }

    // ==================== FLUXO COMPLETO - CENÁRIOS DE SUCESSO ====================

    @Test
    @DisplayName("Fluxo completo: Cadastrar hóspede → Criar reserva → Verificar quarto ocupado")
    void fluxoCompletoReservaComSucesso() throws Exception {
        // PASSO 1: Cadastrar Quarto
        QuartoDTO quartoDTO = criarQuartoDTO("101", TipoQuarto.SOLTEIRO, new BigDecimal("150.00"));
        
        MvcResult resultadoQuarto = mockMvc.perform(post("/api/quartos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(quartoDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.numero").value("101"))
                .andExpect(jsonPath("$.status").value("DISPONIVEL"))
                .andReturn();

        QuartoDTO quartoCadastrado = objectMapper.readValue(
                resultadoQuarto.getResponse().getContentAsString(), QuartoDTO.class);
        Long quartoId = quartoCadastrado.getId();

        // PASSO 2: Cadastrar Hóspede
        HospedeDTO hospedeDTO = criarHospedeDTO("João Silva", "123.456.789-00", "joao@email.com");
        
        MvcResult resultadoHospede = mockMvc.perform(post("/api/hospedes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(hospedeDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("João Silva"))
                .andExpect(jsonPath("$.cpf").value("123.456.789-00"))
                .andReturn();

        HospedeDTO hospedeCadastrado = objectMapper.readValue(
                resultadoHospede.getResponse().getContentAsString(), HospedeDTO.class);
        Long hospedeId = hospedeCadastrado.getId();

        // PASSO 3: Criar Reserva
        ReservaDTO reservaDTO = criarReservaDTO(
                hospedeId, 
                quartoId, 
                LocalDate.now().plusDays(1), 
                LocalDate.now().plusDays(5)
        );

        MvcResult resultadoReserva = mockMvc.perform(post("/api/reservas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reservaDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.hospedeId").value(hospedeId))
                .andExpect(jsonPath("$.quartoId").value(quartoId))
                .andExpect(jsonPath("$.status").value("CONFIRMADA"))
                .andExpect(jsonPath("$.valorTotal").exists())
                .andReturn();

        ReservaDTO reservaCriada = objectMapper.readValue(
                resultadoReserva.getResponse().getContentAsString(), ReservaDTO.class);

        // PASSO 4: Verificar que o quarto foi marcado como OCUPADO
        mockMvc.perform(get("/api/quartos/{id}", quartoId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(quartoId))
                .andExpect(jsonPath("$.numero").value("101"))
                .andExpect(jsonPath("$.status").value("OCUPADO"));

        // PASSO 5: Verificar que a reserva existe no banco
        mockMvc.perform(get("/api/reservas/{id}", reservaCriada.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(reservaCriada.getId()))
                .andExpect(jsonPath("$.status").value("CONFIRMADA"));

        // Validações adicionais no banco de dados
        assertThat(reservaRepository.count()).isEqualTo(1);
        assertThat(hospedeRepository.count()).isEqualTo(1);
        assertThat(quartoRepository.count()).isEqualTo(1);
    }

    @Test
    @DisplayName("Fluxo: Múltiplos hóspedes podem fazer reservas em quartos diferentes")
    void fluxoMultiplasReservasQuartosDiferentes() throws Exception {
        // Cadastrar 2 quartos
        QuartoDTO quarto1 = criarQuartoDTO("101", TipoQuarto.SOLTEIRO, new BigDecimal("150.00"));
        QuartoDTO quarto2 = criarQuartoDTO("102", TipoQuarto.CASAL, new BigDecimal("200.00"));

        Long quarto1Id = cadastrarQuarto(quarto1);
        Long quarto2Id = cadastrarQuarto(quarto2);

        // Cadastrar 2 hóspedes
        HospedeDTO hospede1 = criarHospedeDTO("João Silva", "123.456.789-00", "joao@email.com");
        HospedeDTO hospede2 = criarHospedeDTO("Maria Santos", "987.654.321-00", "maria@email.com");

        Long hospede1Id = cadastrarHospede(hospede1);
        Long hospede2Id = cadastrarHospede(hospede2);

        // Criar 2 reservas simultâneas em quartos diferentes
        ReservaDTO reserva1 = criarReservaDTO(hospede1Id, quarto1Id, 
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(5));
        ReservaDTO reserva2 = criarReservaDTO(hospede2Id, quarto2Id, 
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(5));

        mockMvc.perform(post("/api/reservas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reserva1)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/reservas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reserva2)))
                .andExpect(status().isCreated());

        // Verificar que ambos os quartos estão ocupados
        mockMvc.perform(get("/api/quartos/{id}", quarto1Id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OCUPADO"));

        mockMvc.perform(get("/api/quartos/{id}", quarto2Id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OCUPADO"));

        assertThat(reservaRepository.count()).isEqualTo(2);
    }

    @Test
    @DisplayName("Fluxo: Cancelar reserva deve liberar o quarto")
    void fluxoCancelarReservaLiberaQuarto() throws Exception {
        // Cadastrar quarto e hóspede
        Long quartoId = cadastrarQuarto(criarQuartoDTO("101", TipoQuarto.SOLTEIRO, new BigDecimal("150.00")));
        Long hospedeId = cadastrarHospede(criarHospedeDTO("João Silva", "123.456.789-00", "joao@email.com"));

        // Criar reserva
        ReservaDTO reservaDTO = criarReservaDTO(hospedeId, quartoId, 
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(5));

        MvcResult resultado = mockMvc.perform(post("/api/reservas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reservaDTO)))
                .andExpect(status().isCreated())
                .andReturn();

        ReservaDTO reservaCriada = objectMapper.readValue(
                resultado.getResponse().getContentAsString(), ReservaDTO.class);

        // Verificar que quarto está ocupado
        mockMvc.perform(get("/api/quartos/{id}", quartoId))
                .andExpect(jsonPath("$.status").value("OCUPADO"));

        // Cancelar reserva
        mockMvc.perform(put("/api/reservas/{id}/cancelar", reservaCriada.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELADA"));

        // Verificar que quarto voltou a estar disponível
        mockMvc.perform(get("/api/quartos/{id}", quartoId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DISPONIVEL"));
    }

    @Test
    @DisplayName("Fluxo: Calcular valor total da reserva corretamente")
    void fluxoCalcularValorTotalReserva() throws Exception {
        // Cadastrar quarto com diária de R$ 200.00
        Long quartoId = cadastrarQuarto(criarQuartoDTO("101", TipoQuarto.SUITE, new BigDecimal("200.00")));
        Long hospedeId = cadastrarHospede(criarHospedeDTO("João Silva", "123.456.789-00", "joao@email.com"));

        // Criar reserva de 5 dias (5 x 200 = 1000)
        LocalDate dataEntrada = LocalDate.now().plusDays(1);
        LocalDate dataSaida = LocalDate.now().plusDays(6); // 5 diárias

        ReservaDTO reservaDTO = criarReservaDTO(hospedeId, quartoId, dataEntrada, dataSaida);

        mockMvc.perform(post("/api/reservas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reservaDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.valorTotal").value(1000.00));
    }

    // ==================== FLUXO COMPLETO - CENÁRIOS DE ERRO ====================

    @Test
    @DisplayName("Erro: Não deve permitir reserva em quarto já ocupado")
    void erroNaoDevePermitirReservaEmQuartoOcupado() throws Exception {
        // Cadastrar quarto e 2 hóspedes
        Long quartoId = cadastrarQuarto(criarQuartoDTO("101", TipoQuarto.SOLTEIRO, new BigDecimal("150.00")));
        Long hospede1Id = cadastrarHospede(criarHospedeDTO("João Silva", "123.456.789-00", "joao@email.com"));
        Long hospede2Id = cadastrarHospede(criarHospedeDTO("Maria Santos", "987.654.321-00", "maria@email.com"));

        // Primeira reserva (sucesso)
        ReservaDTO reserva1 = criarReservaDTO(hospede1Id, quartoId, 
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(5));

        mockMvc.perform(post("/api/reservas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reserva1)))
                .andExpect(status().isCreated());

        // Segunda reserva no mesmo quarto (deve falhar)
        ReservaDTO reserva2 = criarReservaDTO(hospede2Id, quartoId, 
                LocalDate.now().plusDays(2), LocalDate.now().plusDays(6));

        mockMvc.perform(post("/api/reservas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reserva2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Quarto não está disponível")));

        // Verificar que apenas 1 reserva foi criada
        assertThat(reservaRepository.count()).isEqualTo(1);
    }

    @Test
    @DisplayName("Erro: Não deve permitir reserva com hóspede inexistente")
    void erroNaoDevePermitirReservaComHospedeInexistente() throws Exception {
        Long quartoId = cadastrarQuarto(criarQuartoDTO("101", TipoQuarto.SOLTEIRO, new BigDecimal("150.00")));
        Long hospedeIdInexistente = 9999L;

        ReservaDTO reservaDTO = criarReservaDTO(hospedeIdInexistente, quartoId, 
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(5));

        mockMvc.perform(post("/api/reservas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reservaDTO)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value(containsString("Hóspede não encontrado")));

        assertThat(reservaRepository.count()).isZero();
    }

    @Test
    @DisplayName("Erro: Não deve permitir reserva com quarto inexistente")
    void erroNaoDevePermitirReservaComQuartoInexistente() throws Exception {
        Long hospedeId = cadastrarHospede(criarHospedeDTO("João Silva", "123.456.789-00", "joao@email.com"));
        Long quartoIdInexistente = 9999L;

        ReservaDTO reservaDTO = criarReservaDTO(hospedeId, quartoIdInexistente, 
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(5));

        mockMvc.perform(post("/api/reservas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reservaDTO)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value(containsString("Quarto não encontrado")));

        assertThat(reservaRepository.count()).isZero();
    }

    @Test
    @DisplayName("Erro: Não deve permitir reserva com data de saída anterior à entrada")
    void erroNaoDevePermitirReservaComDataInvalida() throws Exception {
        Long quartoId = cadastrarQuarto(criarQuartoDTO("101", TipoQuarto.SOLTEIRO, new BigDecimal("150.00")));
        Long hospedeId = cadastrarHospede(criarHospedeDTO("João Silva", "123.456.789-00", "joao@email.com"));

        // Data de saída ANTES da data de entrada
        ReservaDTO reservaDTO = criarReservaDTO(hospedeId, quartoId, 
                LocalDate.now().plusDays(5), LocalDate.now().plusDays(1));

        mockMvc.perform(post("/api/reservas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reservaDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Data de saída deve ser posterior")));

        assertThat(reservaRepository.count()).isZero();
    }

    @Test
    @DisplayName("Erro: Não deve permitir cadastrar hóspede com CPF duplicado")
    void erroNaoDevePermitirCPFDuplicado() throws Exception {
        HospedeDTO hospede1 = criarHospedeDTO("João Silva", "123.456.789-00", "joao@email.com");
        
        // Primeiro cadastro (sucesso)
        mockMvc.perform(post("/api/hospedes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(hospede1)))
                .andExpect(status().isCreated());

        // Segundo cadastro com mesmo CPF (deve falhar)
        HospedeDTO hospede2 = criarHospedeDTO("Maria Santos", "123.456.789-00", "maria@email.com");
        
        mockMvc.perform(post("/api/hospedes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(hospede2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("CPF já cadastrado")));

        assertThat(hospedeRepository.count()).isEqualTo(1);
    }

    @Test
    @DisplayName("Erro: Não deve permitir reserva em quarto em manutenção")
    void erroNaoDevePermitirReservaEmQuartoManutencao() throws Exception {
        // Cadastrar quarto em manutenção
        QuartoDTO quartoDTO = criarQuartoDTO("101", TipoQuarto.SOLTEIRO, new BigDecimal("150.00"));
        quartoDTO.setStatus(StatusQuarto.MANUTENCAO);
        
        Long quartoId = cadastrarQuarto(quartoDTO);
        Long hospedeId = cadastrarHospede(criarHospedeDTO("João Silva", "123.456.789-00", "joao@email.com"));

        ReservaDTO reservaDTO = criarReservaDTO(hospedeId, quartoId, 
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(5));

        mockMvc.perform(post("/api/reservas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reservaDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Quarto não está disponível")));

        assertThat(reservaRepository.count()).isZero();
    }

    @Test
    @DisplayName("Fluxo: Listar todas as reservas de um hóspede específico")
    void fluxoListarReservasPorHospede() throws Exception {
        Long quartoId = cadastrarQuarto(criarQuartoDTO("101", TipoQuarto.SOLTEIRO, new BigDecimal("150.00")));
        Long hospedeId = cadastrarHospede(criarHospedeDTO("João Silva", "123.456.789-00", "joao@email.com"));

        // Criar reserva
        ReservaDTO reservaDTO = criarReservaDTO(hospedeId, quartoId, 
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(5));

        mockMvc.perform(post("/api/reservas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reservaDTO)))
                .andExpect(status().isCreated());

        // Listar reservas do hóspede
        mockMvc.perform(get("/api/reservas/hospede/{hospedeId}", hospedeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].hospedeId").value(hospedeId));
    }

    // ==================== MÉTODOS AUXILIARES ====================

    private HospedeDTO criarHospedeDTO(String nome, String cpf, String email) {
        HospedeDTO dto = new HospedeDTO();
        dto.setNome(nome);
        dto.setCpf(cpf);
        dto.setEmail(email);
        dto.setTelefone("(11) 98765-4321");
        return dto;
    }

    private QuartoDTO criarQuartoDTO(String numero, TipoQuarto tipo, BigDecimal preco) {
        QuartoDTO dto = new QuartoDTO();
        dto.setNumero(numero);
        dto.setTipo(tipo);
        dto.setPrecoDiaria(preco);
        dto.setStatus(StatusQuarto.DISPONIVEL);
        dto.setDescricao("Quarto confortável");
        return dto;
    }

    private ReservaDTO criarReservaDTO(Long hospedeId, Long quartoId, 
                                       LocalDate dataEntrada, LocalDate dataSaida) {
        ReservaDTO dto = new ReservaDTO();
        dto.setHospedeId(hospedeId);
        dto.setQuartoId(quartoId);
        dto.setDataEntrada(dataEntrada);
        dto.setDataSaida(dataSaida);
        return dto;
    }

    private Long cadastrarHospede(HospedeDTO hospedeDTO) throws Exception {
        MvcResult resultado = mockMvc.perform(post("/api/hospedes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(hospedeDTO)))
                .andExpect(status().isCreated())
                .andReturn();

        HospedeDTO cadastrado = objectMapper.readValue(
                resultado.getResponse().getContentAsString(), HospedeDTO.class);
        return cadastrado.getId();
    }

    private Long cadastrarQuarto(QuartoDTO quartoDTO) throws Exception {
        MvcResult resultado = mockMvc.perform(post("/api/quartos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(quartoDTO)))
                .andExpect(status().isCreated())
                .andReturn();

        QuartoDTO cadastrado = objectMapper.readValue(
                resultado.getResponse().getContentAsString(), QuartoDTO.class);
        return cadastrado.getId();
    }
}
application-test.properties
Properties
# Configuração para ambiente de teste
spring.application.name=hotel-gestao-test

# H2 Database - In-Memory para testes
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# H2 Console (opcional para debug)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# Logging
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
Estrutura dos Testes de Integração
Cenários de Sucesso (5 testes):

✅ Fluxo completo - Cadastrar hóspede → Criar reserva → Verificar quarto ocupado

✅ Múltiplas reservas - Vários hóspedes em quartos diferentes

✅ Cancelar reserva - Liberar quarto ao cancelar

✅ Cálculo de valor - Validar cálculo correto do valor total

✅ Listar reservas - Buscar reservas por hóspede

Cenários de Erro (6 testes):

❌ Quarto ocupado - Não permitir dupla reserva

❌ Hóspede inexistente - Validar FK de hóspede

❌ Quarto inexistente - Validar FK de quarto

❌ Datas inválidas - Data saída < entrada

❌ CPF duplicado - Validar unicidade de CPF

❌ Quarto em manutenção - Não permitir reserva

Cobertura de Teste
Os testes cobrem:

✅ Integração completa entre Controller → Service → Repository

✅ Banco de dados H2 em memória

✅ Transações com rollback automático

✅ Validações de negócio (Bean Validation + regras customizadas)

✅ Tratamento de exceções (@ControllerAdvice)

✅ Relacionamentos JPA (FK entre entidades)

✅ Cálculos de negócio (valor total da reserva)

✅ Mudanças de estado (status do quarto)

Como executar
Bash
# Executar todos os testes de integração
mvn test -Dtest=ReservaIntegrationTest

# Executar com perfil de teste
mvn test -Dspring.profiles.active=test

# Executar teste específico
mvn test -Dtest=ReservaIntegrationTest#fluxoCompletoReservaComSucesso

# Com relatório de cobertura
mvn clean verify
Diagrama do Fluxo Testado
┌─────────────────────────────────────────────────────────────┐ │ FLUXO DE INTEGRAÇÃO │ ├─────────────────────────────────────────────────────────────┤ │ │ │ 1. POST /api/hospedes │ │ ├─► Validar CPF único │ │ ├─► Validar @Email │ │ └─► Salvar no banco H2 │ │ Status: 201 Created │ │ │ │ 2. POST /api/quartos │ │ ├─► Validar número único │ │ ├─► Status inicial: DISPONIVEL │ │ └─► Salvar no banco H2 │ │ Status: 201 Created │ │ │ │ 3. POST /api/reservas │ │ ├─► Validar hóspede existe (FK) │ │ ├─► Validar quarto existe (FK) │ │ ├─► Validar quarto DISPONIVEL │ │ ├─► Validar datas (saída > entrada) │ │ ├─► Calcular valor total │ │ ├─► Criar reserva (status: CONFIRMADA) │ │ └─► Atualizar quarto para OCUPADO ⭐ │ │ Status: 201 Created │ │ │ │ 4. GET /api/quartos/{id} │ │ └─► Verificar status: OCUPADO ✓ │ │ Status: 200 OK │ │ │ │ 5. PUT /api/reservas/{id}/cancelar │ │ ├─► Atualizar reserva: CANCELADA │ │ └─► Liberar quarto: DISPONIVEL ⭐ │ │ Status: 200 OK │ │ │ └─────────────────────────────────────────────────────────────┘

Os testes estão prontos para validar toda a integração do sistema! 🎯🏨